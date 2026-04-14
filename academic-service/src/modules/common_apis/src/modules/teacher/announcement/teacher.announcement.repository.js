const pool = require('../../../config/db');

const getClassByTeacher = async ({ schoolId, classId, teacherId }) => {
  const query = {
    text: `
      SELECT id, name, section
      FROM classes
      WHERE school_id = $1 AND id = $2 AND teacher_id = $3
      LIMIT 1
    `,
    values: [schoolId, classId, teacherId]
  };
  const { rows } = await pool.query(query);
  return rows[0] || null;
};

// Get all distinct parent_ids for a class
const getParentsByClass = async ({ schoolId, classId }) => {
  const query = {
    text: `
      SELECT DISTINCT parent_id
      FROM students
      WHERE school_id = $1 AND class_id = $2 AND parent_id IS NOT NULL
    `,
    values: [schoolId, classId]
  };
  const { rows } = await pool.query(query);
  return rows.map((r) => r.parent_id);
};

// Get parent_ids for specific student_ids
const getParentsByStudents = async ({ schoolId, studentIds }) => {
  const query = {
    text: `
      SELECT DISTINCT parent_id
      FROM students
      WHERE school_id = $1 AND id = ANY($2) AND parent_id IS NOT NULL
    `,
    values: [schoolId, studentIds]
  };
  const { rows } = await pool.query(query);
  return rows.map((r) => r.parent_id);
};

// Transactional create: insert announcement + recipients atomically
const createAnnouncement = async ({ schoolId, senderId, senderName, senderRole, classId, audienceType, title, message, isImportant, recipientIds }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const annResult = await client.query({
      text: `
        INSERT INTO announcements (school_id, sender_id, sender_name, sender_role, class_id, audience_type, title, message, is_important, recipient_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, school_id, sender_name, sender_role, class_id, audience_type, title, message, is_important, recipient_count, created_at
      `,
      values: [schoolId, senderId, senderName, senderRole, classId || null, audienceType, title || null, message, isImportant, recipientIds.length]
    });

    const announcement = annResult.rows[0];

    if (recipientIds.length > 0) {
      const placeholders = recipientIds.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(', ');
      const values = recipientIds.flatMap((id) => [announcement.id, id, schoolId]);
      await client.query({
        text: `INSERT INTO announcement_recipients (announcement_id, recipient_id, school_id) VALUES ${placeholders} ON CONFLICT DO NOTHING`,
        values
      });
    }

    await client.query('COMMIT');
    return announcement;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// tab: 'sent' | 'inbox'
const getAnnouncementsByTab = async ({ schoolId, userId, tab }) => {
  let query;

  if (tab === 'sent') {
    query = {
      text: `
        SELECT
          a.id, a.sender_name, a.sender_role,
          c.name AS class_name, c.section,
          a.audience_type, a.title, a.message,
          a.is_important, a.recipient_count, a.created_at
        FROM announcements a
        LEFT JOIN classes c ON c.id = a.class_id
        WHERE a.school_id = $1 AND a.sender_id = $2
        ORDER BY a.created_at DESC
      `,
      values: [schoolId, userId]
    };
  } else {
    // inbox: teacher is a recipient
    query = {
      text: `
        SELECT
          a.id, a.sender_name, a.sender_role,
          a.title, a.message, a.is_important,
          a.created_at, ar.is_read
        FROM announcements a
        JOIN announcement_recipients ar ON ar.announcement_id = a.id
        WHERE a.school_id = $1 AND ar.recipient_id = $2
        ORDER BY a.created_at DESC
      `,
      values: [schoolId, userId]
    };
  }

  const { rows } = await pool.query(query);
  return rows;
};

const getAnnouncementById = async ({ schoolId, announcementId }) => {
  const query = {
    text: `
      SELECT
        a.id, a.sender_id, a.sender_name, a.sender_role,
        c.name AS class_name, c.section,
        a.audience_type, a.title, a.message,
        a.is_important, a.recipient_count, a.created_at
      FROM announcements a
      LEFT JOIN classes c ON c.id = a.class_id
      WHERE a.school_id = $1 AND a.id = $2
    `,
    values: [schoolId, announcementId]
  };
  const { rows } = await pool.query(query);
  return rows[0] || null;
};

const markAsRead = async ({ schoolId, announcementId, recipientId }) => {
  await pool.query({
    text: `
      UPDATE announcement_recipients
      SET is_read = true, read_at = NOW()
      WHERE announcement_id = $1 AND recipient_id = $2 AND school_id = $3 AND is_read = false
    `,
    values: [announcementId, recipientId, schoolId]
  });
};

module.exports = {
  getClassByTeacher,
  getParentsByClass,
  getParentsByStudents,
  createAnnouncement,
  getAnnouncementsByTab,
  getAnnouncementById,
  markAsRead
};
