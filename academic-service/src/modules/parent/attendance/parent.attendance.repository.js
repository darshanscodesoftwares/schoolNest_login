const pool = require('../../../config/db');
const authPool = require('../../../config/auth-db');

const getParentProfileWithChildren = async ({ schoolId, parentId }) => {
  // Step 1: Get parent info from auth_db
  const parentQuery = {
    text: `SELECT name, email FROM users WHERE id = $1 AND school_id = $2`,
    values: [parentId, schoolId]
  };
  const parentResult = await authPool.query(parentQuery);
  if (parentResult.rows.length === 0) return null;

  const parent_name = parentResult.rows[0].name;

  // Step 2: Get children from students table
  const studentsQuery = {
    text: `SELECT
             s.id AS student_id,
             s.name AS student_name,
             s.roll_no,
             c.name AS class_name,
             c.section AS class_section
           FROM students s
           LEFT JOIN classes c ON s.class_id = c.id
           WHERE s.school_id = $1 AND s.parent_id = $2
           ORDER BY s.name ASC`,
    values: [schoolId, parentId]
  };
  const studentsResult = await pool.query(studentsQuery);

  // Step 3: For each student, try to get contact + address info from admission form
  const children = await Promise.all(
    studentsResult.rows.map(async (student) => {
      // Try to find admission record by matching school_id (and other criteria if available)
      const admissionQuery = {
        text: `SELECT
                 ci.student_email,
                 ci.student_phone,
                 ai.current_street,
                 ai.current_city,
                 ai.current_state,
                 ai.current_pincode
               FROM students_admission sa
               LEFT JOIN contact_information ci ON sa.id = ci.student_id AND ci.school_id = $1
               LEFT JOIN address_information ai ON sa.id = ai.student_id AND ai.school_id = $1
               WHERE sa.school_id = $1
               LIMIT 1`,
        values: [schoolId]
      };
      const admissionResult = await pool.query(admissionQuery);
      const admission = admissionResult.rows[0] || {};

      return {
        student_id: student.student_id,
        student_name: student.student_name,
        roll_no: student.roll_no,
        class_name: student.class_name,
        class_section: student.class_section,
        student_email: admission.student_email || null,
        student_phone: admission.student_phone || null,
        current_street: admission.current_street || null,
        current_city: admission.current_city || null,
        current_state: admission.current_state || null,
        current_pincode: admission.current_pincode || null
      };
    })
  );

  return {
    parent_name,
    children
  };
};

const getStudentsByParent = async ({ schoolId, parentId }) => {
  const query = {
    text: `SELECT id AS student_id, name, roll_no, class_id
           FROM students
           WHERE school_id = $1 AND parent_id = $2
           ORDER BY name ASC`,
    values: [schoolId, parentId]
  };
  const { rows } = await pool.query(query);
  return rows;
};

const verifyStudentBelongsToParent = async ({ studentId, parentId, schoolId }) => {
  const query = {
    text: `SELECT id FROM students
           WHERE id = $1 AND parent_id = $2 AND school_id = $3`,
    values: [studentId, parentId, schoolId]
  };
  const { rows } = await pool.query(query);
  return rows[0] || null;
};

const getAttendanceSummary = async ({ schoolId, studentId }) => {
  const query = {
    text: `SELECT status, COUNT(*)::int AS count
           FROM attendance
           WHERE school_id = $1 AND student_id = $2
           GROUP BY status`,
    values: [schoolId, studentId]
  };
  const { rows } = await pool.query(query);
  return rows;
};

const getMonthlyAttendance = async ({ schoolId, studentId, month }) => {
  const query = {
    text: `SELECT date, status
           FROM attendance
           WHERE school_id = $1 AND student_id = $2
             AND DATE_TRUNC('month', date) = DATE_TRUNC('month', $3::date)
           ORDER BY date`,
    values: [schoolId, studentId, `${month}-01`]
  };
  const { rows } = await pool.query(query);
  return rows;
};

const getRecentAttendance = async ({ schoolId, studentId }) => {
  const query = {
    text: `SELECT date, status
           FROM attendance
           WHERE school_id = $1 AND student_id = $2
           ORDER BY date DESC
           LIMIT 7`,
    values: [schoolId, studentId]
  };
  const { rows } = await pool.query(query);
  return rows;
};

module.exports = {
  getParentProfileWithChildren,
  getStudentsByParent,
  verifyStudentBelongsToParent,
  getAttendanceSummary,
  getMonthlyAttendance,
  getRecentAttendance
};
