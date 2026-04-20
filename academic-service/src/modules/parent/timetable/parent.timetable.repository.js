const pool = require('../../../config/db');

const getStudentByParent = async ({ studentId, parentId, schoolId }) => {
  const query = {
    text: `SELECT id, class_id, name
           FROM students
           WHERE id = $1 AND parent_id = $2 AND school_id = $3`,
    values: [studentId, parentId, schoolId]
  };
  const { rows } = await pool.query(query);
  return rows[0] || null;
};

const getTimetableByClass = async ({ schoolId, classId, day }) => {
  const query = {
    text: `SELECT day_of_week, period_number, subject, start_time, end_time
           FROM timetable
           WHERE school_id = $1 AND class_id = $2 AND day_of_week = $3
           ORDER BY start_time ASC`,
    values: [schoolId, classId, day]
  };
  const { rows } = await pool.query(query);
  return rows;
};

module.exports = {
  getStudentByParent,
  getTimetableByClass
};
