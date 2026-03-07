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

const getTimetableByClass = async ({ schoolId, classId }) => {
  const query = {
    text: `SELECT day_of_week, period_number, subject
           FROM timetable
           WHERE school_id = $1 AND class_id = $2
           ORDER BY
             CASE day_of_week
               WHEN 'Monday' THEN 1
               WHEN 'Tuesday' THEN 2
               WHEN 'Wednesday' THEN 3
               WHEN 'Thursday' THEN 4
               WHEN 'Friday' THEN 5
             END,
             period_number`,
    values: [schoolId, classId]
  };
  const { rows } = await pool.query(query);
  return rows;
};

module.exports = {
  getStudentByParent,
  getTimetableByClass
};
