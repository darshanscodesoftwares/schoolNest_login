const pool = require('../../../config/db');

// Get student(s) belonging to this parent
const getStudentsByParent = async ({ schoolId, parentId }) => {
  const { rows } = await pool.query({
    text: `
      SELECT s.id AS student_id, s.name, s.roll_no, c.name AS class_name, c.section
      FROM students s
      JOIN classes c ON c.id = s.class_id AND c.school_id = s.school_id
      WHERE s.school_id = $1 AND s.parent_id = $2
    `,
    values: [schoolId, parentId]
  });
  return rows;
};

// Apply leave for a student
const createLeaveRequest = async ({ schoolId, studentId, fromDate, toDate, reason, message }) => {
  const { rows } = await pool.query({
    text: `
      INSERT INTO leave_requests (school_id, student_id, from_date, to_date, reason, message, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
      RETURNING
        id,
        TO_CHAR(from_date, 'YYYY-MM-DD') AS from_date,
        TO_CHAR(to_date, 'YYYY-MM-DD') AS to_date,
        reason,
        message,
        status,
        created_at
    `,
    values: [schoolId, studentId, fromDate, toDate, reason, message || null]
  });
  return rows[0];
};

// Leave history for parent's child/children
const getLeaveHistory = async ({ schoolId, studentIds }) => {
  const { rows } = await pool.query({
    text: `
      SELECT
        lr.id,
        s.name AS student_name,
        s.roll_no,
        c.name AS class_name,
        c.section,
        TO_CHAR(lr.from_date, 'YYYY-MM-DD') AS from_date,
        TO_CHAR(lr.to_date, 'YYYY-MM-DD') AS to_date,
        lr.reason,
        lr.message,
        lr.status,
        lr.created_at
      FROM leave_requests lr
      JOIN students s ON s.id = lr.student_id
      JOIN classes c ON c.id = s.class_id
      WHERE lr.school_id = $1
        AND lr.student_id = ANY($2)
      ORDER BY lr.created_at DESC
    `,
    values: [schoolId, studentIds]
  });
  return rows;
};

module.exports = {
  getStudentsByParent,
  createLeaveRequest,
  getLeaveHistory
};
