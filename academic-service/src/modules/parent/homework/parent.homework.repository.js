const pool = require('../../../config/db');

// Returns all children of a parent (supports multi-child parents)
const getStudentsByParent = async ({ schoolId, parentId }) => {
  const query = {
    text: `
      SELECT id AS student_id, class_id, name
      FROM students
      WHERE school_id = $1 AND parent_id = $2
    `,
    values: [schoolId, parentId]
  };

  const { rows } = await pool.query(query);
  return rows;
};

// Tab: 'today' | 'upcoming' (parent has no 'completed' view)
const getHomeworkForClass = async ({ schoolId, classId, tab }) => {
  const dateConditions = {
    today: 'h.due_date = CURRENT_DATE',
    upcoming: 'h.due_date > CURRENT_DATE'
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
        h.due_date,
        h.attachment_url,
        h.created_at
      FROM homework h
      JOIN classes c ON c.id = h.class_id AND c.school_id = h.school_id
      WHERE h.school_id = $1
        AND h.class_id = $2
        AND ${dateConditions[tab] || dateConditions.today}
      ORDER BY h.due_date ASC, h.created_at DESC
    `,
    values: [schoolId, classId]
  };

  const { rows } = await pool.query(query);
  return rows;
};

module.exports = {
  getStudentsByParent,
  getHomeworkForClass
};
