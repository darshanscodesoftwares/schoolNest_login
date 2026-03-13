const pool = require('../../../config/db');

// Get class_ids owned by teacher
const getClassesByTeacher = async ({ schoolId, teacherId }) => {
  const { rows } = await pool.query({
    text: `
      SELECT id AS class_id, name, section
      FROM classes
      WHERE school_id = $1 AND teacher_id = $2
    `,
    values: [schoolId, teacherId]
  });
  return rows;
};

// Get leave requests for teacher's classes filtered by status tab
const getLeaveRequests = async ({ schoolId, classIds, status }) => {
  const { rows } = await pool.query({
    text: `
      SELECT
        lr.id,
        s.name AS student_name,
        s.roll_no,
        c.name AS class_name,
        c.section,
        lr.reason,
        lr.message,
        TO_CHAR(lr.from_date, 'YYYY-MM-DD') AS from_date,
        TO_CHAR(lr.to_date, 'YYYY-MM-DD') AS to_date,
        lr.status,
        lr.created_at
      FROM leave_requests lr
      JOIN students s ON s.id = lr.student_id
      JOIN classes c ON c.id = s.class_id
      WHERE lr.school_id = $1
        AND s.class_id = ANY($2)
        AND lr.status = $3
      ORDER BY lr.created_at DESC
    `,
    values: [schoolId, classIds, status]
  });
  return rows;
};

// Get counts per status for a teacher's classes
const getLeaveCountsByStatus = async ({ schoolId, classIds }) => {
  const { rows } = await pool.query({
    text: `
      SELECT lr.status, COUNT(*) AS count
      FROM leave_requests lr
      JOIN students s ON s.id = lr.student_id
      WHERE lr.school_id = $1 AND s.class_id = ANY($2)
      GROUP BY lr.status
    `,
    values: [schoolId, classIds]
  });
  return rows;
};

// Get a single leave request (verify it belongs to teacher's class)
const getLeaveById = async ({ schoolId, leaveId, classIds }) => {
  const { rows } = await pool.query({
    text: `
      SELECT lr.id, lr.student_id, s.class_id
      FROM leave_requests lr
      JOIN students s ON s.id = lr.student_id
      WHERE lr.school_id = $1 AND lr.id = $2 AND s.class_id = ANY($3)
    `,
    values: [schoolId, leaveId, classIds]
  });
  return rows[0] || null;
};

// Update status (APPROVED or REJECTED)
const updateLeaveStatus = async ({ leaveId, status }) => {
  const { rows } = await pool.query({
    text: `
      UPDATE leave_requests
      SET status = $2
      WHERE id = $1
      RETURNING
        id,
        TO_CHAR(from_date, 'YYYY-MM-DD') AS from_date,
        TO_CHAR(to_date, 'YYYY-MM-DD') AS to_date,
        reason,
        status
    `,
    values: [leaveId, status]
  });
  return rows[0];
};

module.exports = {
  getClassesByTeacher,
  getLeaveRequests,
  getLeaveCountsByStatus,
  getLeaveById,
  updateLeaveStatus
};
