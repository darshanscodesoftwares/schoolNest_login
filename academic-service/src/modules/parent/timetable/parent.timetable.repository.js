const pool = require('../../../config/db');

const getStudentByParent = async ({ studentId, parentId, schoolId }) => {
  const query = {
    text: `SELECT s.id, s.name, c.name AS class_name, c.section
           FROM students s
           JOIN classes c ON c.id = s.class_id AND c.school_id = s.school_id
           WHERE s.id = $1 AND s.parent_id = $2 AND s.school_id = $3`,
    values: [studentId, parentId, schoolId]
  };
  const { rows } = await pool.query(query);
  return rows[0] || null;
};

const getTimetableByClass = async ({ schoolId, className, section, day }) => {
  const query = {
    text: `SELECT day_of_week, period_number, subject, start_time, end_time
           FROM timetable
           WHERE school_id = $1 AND class_name = $2 AND section = $3
             AND day_of_week = $4 AND status = 'PUBLISHED'
           ORDER BY start_time ASC`,
    values: [schoolId, className, section, day]
  };
  const { rows } = await pool.query(query);
  return rows;
};

module.exports = {
  getStudentByParent,
  getTimetableByClass
};
