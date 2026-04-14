const pool = require('../../../config/db');

const getClassByTeacher = async ({ schoolId, classId, teacherId }) => {
  const query = {
    text: `
      SELECT id, name, section, subject
      FROM classes
      WHERE school_id = $1 AND id = $2 AND teacher_id = $3
      LIMIT 1
    `,
    values: [schoolId, classId, teacherId]
  };

  const { rows } = await pool.query(query);
  return rows[0] || null;
};

const createHomework = async ({ schoolId, classId, teacherId, subject, title, description, dueDate, attachmentUrl }) => {
  const query = {
    text: `
      INSERT INTO homework (school_id, class_id, teacher_id, subject, title, description, due_date, attachment_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, school_id, class_id, teacher_id, subject, title, description, TO_CHAR(due_date, 'YYYY-MM-DD') AS due_date, attachment_url, created_at
    `,
    values: [schoolId, classId, teacherId, subject, title, description, dueDate, attachmentUrl || null]
  };

  const { rows } = await pool.query(query);
  return rows[0];
};

// Tab: 'today' | 'upcoming' | 'completed'
// Scoped to teacher's own homework across all their classes
const getHomeworkByTab = async ({ schoolId, teacherId, tab }) => {
  const dateConditions = {
    today: 'h.due_date = CURRENT_DATE',
    upcoming: 'h.due_date > CURRENT_DATE',
    completed: 'h.due_date < CURRENT_DATE'
  };

  const query = {
    text: `
      SELECT
        h.id,
        h.class_id,
        c.name AS class_name,
        c.section,
        h.subject,
        h.title,
        h.description,
        TO_CHAR(h.due_date, 'YYYY-MM-DD') AS due_date,
        h.attachment_url,
        h.created_at
      FROM homework h
      JOIN classes c ON c.id = h.class_id AND c.school_id = h.school_id
      WHERE h.school_id = $1
        AND h.teacher_id = $2
        AND ${dateConditions[tab]}
      ORDER BY h.due_date ASC, h.created_at DESC
    `,
    values: [schoolId, teacherId]
  };

  const { rows } = await pool.query(query);
  return rows;
};

// For timetable class detail screen — get homework for a specific class
const getHomeworkByClass = async ({ schoolId, classId, tab }) => {
  const dateConditions = {
    today: 'due_date = CURRENT_DATE',
    upcoming: 'due_date > CURRENT_DATE',
    completed: 'due_date < CURRENT_DATE'
  };

  const query = {
    text: `
      SELECT id, class_id, teacher_id, subject, title, description, TO_CHAR(due_date, 'YYYY-MM-DD') AS due_date, attachment_url, created_at
      FROM homework
      WHERE school_id = $1
        AND class_id = $2
        AND ${dateConditions[tab] || dateConditions.today}
      ORDER BY due_date ASC, created_at DESC
    `,
    values: [schoolId, classId]
  };

  const { rows } = await pool.query(query);
  return rows;
};

module.exports = {
  getClassByTeacher,
  createHomework,
  getHomeworkByTab,
  getHomeworkByClass
};
