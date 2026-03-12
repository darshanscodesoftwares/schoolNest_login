const pool = require('../../../config/db');

// tab: 'all' | 'important'
const getAnnouncementsForParent = async ({ schoolId, parentId, tab }) => {
  const importantFilter = tab === 'important' ? 'AND a.is_important = true' : '';

  const query = {
    text: `
      SELECT
        a.id,
        a.sender_name,
        a.sender_role,
        c.name AS class_name,
        c.section,
        a.title,
        a.message,
        a.is_important,
        a.created_at,
        ar.is_read
      FROM announcements a
      JOIN announcement_recipients ar ON ar.announcement_id = a.id
      LEFT JOIN classes c ON c.id = a.class_id
      WHERE a.school_id = $1
        AND ar.recipient_id = $2
        ${importantFilter}
      ORDER BY a.created_at DESC
    `,
    values: [schoolId, parentId]
  };

  const { rows } = await pool.query(query);
  return rows;
};

const getAnnouncementById = async ({ schoolId, announcementId, parentId }) => {
  const query = {
    text: `
      SELECT
        a.id,
        a.sender_name,
        a.sender_role,
        c.name AS class_name,
        c.section,
        a.title,
        a.message,
        a.is_important,
        a.created_at,
        ar.is_read
      FROM announcements a
      JOIN announcement_recipients ar ON ar.announcement_id = a.id AND ar.recipient_id = $3
      LEFT JOIN classes c ON c.id = a.class_id
      WHERE a.school_id = $1 AND a.id = $2
    `,
    values: [schoolId, announcementId, parentId]
  };

  const { rows } = await pool.query(query);
  return rows[0] || null;
};

const markAsRead = async ({ schoolId, announcementId, parentId }) => {
  await pool.query({
    text: `
      UPDATE announcement_recipients
      SET is_read = true, read_at = NOW()
      WHERE announcement_id = $1 AND recipient_id = $2 AND school_id = $3 AND is_read = false
    `,
    values: [announcementId, parentId, schoolId]
  });
};

module.exports = {
  getAnnouncementsForParent,
  getAnnouncementById,
  markAsRead
};
