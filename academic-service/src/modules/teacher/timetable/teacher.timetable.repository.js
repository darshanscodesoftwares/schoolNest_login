const pool = require('../../../config/db');

// Get all periods for a teacher on a specific day
const getTimetableByDay = async ({ schoolId, teacherId, day }) => {
  const query = {
    text: `
      SELECT
        t.id,
        t.class_id,
        c.name AS class_name,
        c.section,
        t.day_of_week,
        t.period_number,
        t.subject,
        t.start_time,
        t.end_time
      FROM timetable t
      JOIN classes c ON c.id = t.class_id AND c.school_id = t.school_id
      WHERE t.school_id = $1
        AND t.teacher_id = $2
        AND t.day_of_week = $3
      ORDER BY t.start_time ASC
    `,
    values: [schoolId, teacherId, day]
  };

  const { rows } = await pool.query(query);
  return rows;
};

// Get next upcoming class based on current time + today's day
const getNextClass = async ({ schoolId, teacherId, day, currentTime }) => {
  const query = {
    text: `
      SELECT
        t.id,
        t.class_id,
        c.name AS class_name,
        c.section,
        t.subject,
        t.period_number,
        t.start_time,
        t.end_time
      FROM timetable t
      JOIN classes c ON c.id = t.class_id AND c.school_id = t.school_id
      WHERE t.school_id = $1
        AND t.teacher_id = $2
        AND t.day_of_week = $3
        AND t.start_time > $4::time
      ORDER BY t.start_time ASC
      LIMIT 1
    `,
    values: [schoolId, teacherId, day, currentTime]
  };

  const { rows } = await pool.query(query);
  return rows[0] || null;
};

// Get class summary for class detail screen header
const getClassSummary = async ({ schoolId, classId, teacherId }) => {
  const query = {
    text: `
      SELECT
        c.id,
        c.name AS class_name,
        c.section,
        c.subject,
        COUNT(s.id)::int AS student_count
      FROM classes c
      LEFT JOIN students s ON s.class_id = c.id AND s.school_id = c.school_id
      WHERE c.school_id = $1
        AND c.id = $2
        AND c.teacher_id = $3
      GROUP BY c.id, c.name, c.section, c.subject
    `,
    values: [schoolId, classId, teacherId]
  };

  const { rows } = await pool.query(query);
  return rows[0] || null;
};

// Get last attendance record + last homework for a class
const getRecentActivity = async ({ schoolId, classId }) => {
  const attendanceQuery = {
    text: `
      SELECT
        date,
        COUNT(*) FILTER (WHERE status = 'PRESENT') AS present_count,
        COUNT(*) AS total_count
      FROM attendance
      WHERE school_id = $1 AND class_id = $2
      GROUP BY date
      ORDER BY date DESC
      LIMIT 1
    `,
    values: [schoolId, classId]
  };

  const homeworkQuery = {
    text: `
      SELECT title, subject, TO_CHAR(due_date, 'YYYY-MM-DD') AS due_date, created_at
      FROM homework
      WHERE school_id = $1 AND class_id = $2
      ORDER BY created_at DESC
      LIMIT 1
    `,
    values: [schoolId, classId]
  };

  const [attendanceResult, homeworkResult] = await Promise.all([
    pool.query(attendanceQuery),
    pool.query(homeworkQuery)
  ]);

  return {
    last_attendance: attendanceResult.rows[0] || null,
    last_homework: homeworkResult.rows[0] || null
  };
};

module.exports = {
  getTimetableByDay,
  getNextClass,
  getClassSummary,
  getRecentActivity
};
