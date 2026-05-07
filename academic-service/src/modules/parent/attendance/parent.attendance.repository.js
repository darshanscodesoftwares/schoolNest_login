const pool = require('../../../config/db');

const getParentProfileWithChildren = async ({ schoolId, parentId }) => {
  const query = {
    text: `SELECT
             u.name AS parent_name,
             u.email AS parent_email,
             s.id AS student_id,
             s.name AS student_name,
             s.roll_no,
             c.name AS class_name,
             c.section AS class_section
           FROM auth_db.users u
           LEFT JOIN students s ON u.id = s.parent_id AND s.school_id = $1
           LEFT JOIN classes c ON s.class_id = c.id
           WHERE u.id = $2 AND u.school_id = $1
           ORDER BY s.name ASC`,
    values: [schoolId, parentId]
  };

  const { rows } = await pool.query(query);

  // Aggregate data: parent info + array of children
  if (rows.length === 0) return null;

  const parentData = {
    parent_name: rows[0].parent_name,
    parent_email: rows[0].parent_email,
    children: rows
      .filter(row => row.student_id) // Only rows with student data
      .map(row => ({
        student_id: row.student_id,
        student_name: row.student_name,
        roll_no: row.roll_no,
        class_name: row.class_name,
        class_section: row.class_section
      }))
  };

  return parentData;
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
