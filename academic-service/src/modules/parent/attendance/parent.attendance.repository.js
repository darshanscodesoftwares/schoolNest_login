const pool = require('../../../config/db');

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
  getStudentsByParent,
  verifyStudentBelongsToParent,
  getAttendanceSummary,
  getMonthlyAttendance,
  getRecentAttendance
};
