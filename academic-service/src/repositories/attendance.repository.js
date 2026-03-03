const pool = require('../config/db');

const getTeacherClasses = async ({ schoolId, teacherId }) => {
  const query = {
    text: `
      SELECT
        id AS class_id,
        name AS class_name,
        section,
        subject
      FROM classes
      WHERE school_id = $1
        AND teacher_id = $2
      ORDER BY name, section
    `,
    values: [schoolId, teacherId]
  };

  const { rows } = await pool.query(query);
  return rows;
};

const getClassByTeacher = async ({ schoolId, classId, teacherId }) => {
  const query = {
    text: `
      SELECT id
      FROM classes
      WHERE school_id = $1
        AND id = $2
        AND teacher_id = $3
      LIMIT 1
    `,
    values: [schoolId, classId, teacherId]
  };

  const { rows } = await pool.query(query);
  return rows[0] || null;
};

const getStudentsByClass = async ({ schoolId, classId }) => {
  const query = {
    text: `
      SELECT
        id AS student_id,
        roll_no,
        name
      FROM students
      WHERE school_id = $1
        AND class_id = $2
      ORDER BY roll_no ASC, name ASC
    `,
    values: [schoolId, classId]
  };

  const { rows } = await pool.query(query);
  return rows;
};

const getAttendanceByClassAndDate = async ({ schoolId, classId, date }) => {
  const query = {
    text: `
      SELECT
        student_id,
        status
      FROM attendance
      WHERE school_id = $1
        AND class_id = $2
        AND date = $3
    `,
    values: [schoolId, classId, date]
  };

  const { rows } = await pool.query(query);
  return rows;
};

const getApprovedLeaveByClassAndDate = async ({ schoolId, classId, date }) => {
  const query = {
    text: `
      SELECT DISTINCT lr.student_id
      FROM leave_requests lr
      INNER JOIN students s
        ON s.id = lr.student_id
       AND s.school_id = lr.school_id
      WHERE lr.school_id = $1
        AND s.class_id = $2
        AND lr.status = 'APPROVED'
        AND $3::date BETWEEN lr.from_date AND lr.to_date
    `,
    values: [schoolId, classId, date]
  };

  const { rows } = await pool.query(query);
  return rows;
};

const deleteAttendanceByClassAndDate = async ({ client, schoolId, classId, date }) => {
  const query = {
    text: `
      DELETE FROM attendance
      WHERE school_id = $1
        AND class_id = $2
        AND date = $3
    `,
    values: [schoolId, classId, date]
  };

  await client.query(query);
};

const bulkInsertAttendance = async ({ client, entries }) => {
  if (!entries.length) return;

  const placeholders = [];
  const values = [];

  entries.forEach((entry, index) => {
    const offset = index * 6;
    placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`);
    values.push(
      entry.school_id,
      entry.class_id,
      entry.student_id,
      entry.teacher_id,
      entry.date,
      entry.status
    );
  });

  const query = {
    text: `
      INSERT INTO attendance (
        school_id,
        class_id,
        student_id,
        teacher_id,
        date,
        status
      ) VALUES ${placeholders.join(', ')}
    `,
    values
  };

  await client.query(query);
};

module.exports = {
  getTeacherClasses,
  getClassByTeacher,
  getStudentsByClass,
  getAttendanceByClassAndDate,
  getApprovedLeaveByClassAndDate,
  deleteAttendanceByClassAndDate,
  bulkInsertAttendance
};
