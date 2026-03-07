const pool = require('../../../config/db');

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

const getActiveStatuses = async ({ schoolId }) => {
  const query = {
    text: `
      SELECT
        id,
        code,
        label,
        color
      FROM attendance_statuses
      WHERE school_id = $1
        AND is_active = true
      ORDER BY id ASC
    `,
    values: [schoolId]
  };

  const { rows } = await pool.query(query);
  return rows;
};

const getAttendanceByDateRange = async ({ schoolId, classId, fromDate, toDate }) => {
  const query = {
    text: `
      SELECT a.id, a.date, a.student_id, a.status, s.name, s.roll_no
      FROM attendance a
      JOIN students s ON s.id = a.student_id AND s.school_id = a.school_id
      WHERE a.school_id = $1 AND a.class_id = $2 AND a.date BETWEEN $3 AND $4
      ORDER BY a.date ASC, s.roll_no ASC
    `,
    values: [schoolId, classId, fromDate, toDate]
  };

  const { rows } = await pool.query(query);
  return rows;
};

const getStudentByTeacher = async ({ schoolId, studentId, teacherId }) => {
  const query = {
    text: `
      SELECT s.id AS student_id, s.name, s.roll_no, s.class_id
      FROM students s
      JOIN classes c ON c.id = s.class_id AND c.school_id = s.school_id
      WHERE s.school_id = $1 AND s.id = $2 AND c.teacher_id = $3
      LIMIT 1
    `,
    values: [schoolId, studentId, teacherId]
  };

  const { rows } = await pool.query(query);
  return rows[0] || null;
};

const getStudentAttendanceSummary = async ({ schoolId, studentId }) => {
  const query = {
    text: `
      SELECT status, COUNT(*) AS count
      FROM attendance
      WHERE school_id = $1 AND student_id = $2
      GROUP BY status
    `,
    values: [schoolId, studentId]
  };

  const { rows } = await pool.query(query);
  return rows;
};

const getMonthlyAttendanceReport = async ({ schoolId, classId, month }) => {
  const query = {
    text: `
      SELECT
        s.id AS student_id,
        s.name,
        s.roll_no,
        COUNT(a.id) AS total_marked,
        COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END) AS present,
        COUNT(CASE WHEN a.status = 'ABSENT' THEN 1 END) AS absent,
        COUNT(CASE WHEN a.status = 'LATE' THEN 1 END) AS late,
        COUNT(CASE WHEN a.status = 'HALF_DAY' THEN 1 END) AS half_day
      FROM students s
      LEFT JOIN attendance a
        ON a.student_id = s.id
        AND a.school_id = s.school_id
        AND DATE_TRUNC('month', a.date) = DATE_TRUNC('month', $3::date)
      WHERE s.school_id = $1 AND s.class_id = $2
      GROUP BY s.id, s.name, s.roll_no
      ORDER BY s.roll_no ASC
    `,
    values: [schoolId, classId, month]
  };

  const { rows } = await pool.query(query);
  return rows;
};

const getAttendanceById = async ({ schoolId, recordId }) => {
  const query = {
    text: `
      SELECT id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at
      FROM attendance
      WHERE id = $1 AND school_id = $2
      LIMIT 1
    `,
    values: [recordId, schoolId]
  };

  const { rows } = await pool.query(query);
  return rows[0] || null;
};

const updateAttendanceStatus = async ({ schoolId, recordId, status }) => {
  const query = {
    text: `
      UPDATE attendance
      SET status = $3, updated_at = NOW()
      WHERE id = $1 AND school_id = $2
      RETURNING id, student_id, class_id, date, status, updated_at
    `,
    values: [recordId, schoolId, status]
  };

  const { rows } = await pool.query(query);
  return rows[0] || null;
};

const deleteAttendanceById = async ({ schoolId, recordId }) => {
  const query = {
    text: `
      DELETE FROM attendance
      WHERE id = $1 AND school_id = $2
      RETURNING id, student_id, date, status
    `,
    values: [recordId, schoolId]
  };

  const { rows } = await pool.query(query);
  return rows[0] || null;
};

module.exports = {
  getTeacherClasses,
  getClassByTeacher,
  getStudentsByClass,
  getAttendanceByClassAndDate,
  getApprovedLeaveByClassAndDate,
  deleteAttendanceByClassAndDate,
  bulkInsertAttendance,
  getActiveStatuses,
  getAttendanceByDateRange,
  getStudentByTeacher,
  getStudentAttendanceSummary,
  getMonthlyAttendanceReport,
  getAttendanceById,
  updateAttendanceStatus,
  deleteAttendanceById
};
