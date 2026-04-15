const pool = require("../../../../config/db");
const { commonApiGet } = require("../../../../utils/common-api.client");

// Helper function to fetch class name from common API or local database
const getClassName = async (classId) => {
  try {
    // First, try to get from common API
    const response = await commonApiGet(`/api/v1/classes/${classId}`, null);

    if (response && response.success && response.data) {
      return response.data.class_name || null;
    }

    // If API fails, verify class exists in classes_assign table
    const dbQuery = {
      text: `SELECT DISTINCT class_id FROM classes_assign WHERE class_id = $1::uuid LIMIT 1`,
      values: [classId],
    };
    const dbResult = await pool.query(dbQuery);

    if (dbResult.rows[0]) {
      return classId;  // Return the class_id as fallback
    }

    return null;
  } catch (error) {
    return null;
  }
};

const composeRepository = {
  // Create announcement
  createAnnouncement: async (school_id, announcement_data, status = 'Draft') => {
    const { created_by, sender_id, sender_name, sender_role, title, message, is_important, audience, audience_type, scope } = announcement_data;

    // Use created_by if available, otherwise use sender_id
    const createdBy = created_by || sender_id;
    const audienceValue = audience || audience_type;
    const audienceTypeValue = audience_type || (audience ? ({'Teachers': 'all_teachers', 'Parents': 'parent', 'Both': 'all_both'}[audience] || 'all_both') : 'all_both');
    const senderName = sender_name || "Admin";
    const senderRole = sender_role || "ADMIN";

    const query = {
      text: `INSERT INTO announcements
              (school_id, created_by, sender_id, sender_name, sender_role, title, message, audience, audience_type, scope, is_important, status)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
              RETURNING *`,
      values: [
        school_id,
        createdBy,
        createdBy, // sender_id gets same value as created_by
        senderName,
        senderRole,
        title,
        message,
        audienceValue || 'Both',
        audienceTypeValue,
        scope || 'Whole School',
        is_important !== undefined ? is_important : false,
        status
      ],
    };

    try {
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      if (error.code === '42703' || error.code === '23502') {
        // Fallback: Try with minimal columns
        try {
          const fallbackQuery = {
            text: `INSERT INTO announcements
                    (school_id, created_by, sender_id, sender_name, sender_role, title, message, audience_type, is_important, status)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    RETURNING *`,
            values: [
              school_id,
              createdBy,
              createdBy, // sender_id gets same value as created_by
              senderName,
              senderRole,
              title,
              message,
              audienceTypeValue,
              is_important !== undefined ? is_important : false,
              status
            ],
          };
          const result = await pool.query(fallbackQuery);
          return result.rows[0];
        } catch (error2) {
          throw error2;
        }
      } else {
        throw error;
      }
    }
  },

  // Get all teachers (active) for "Teachers, Whole School" scope
  getAllTeachers: async (school_id) => {
    const query = {
      text: `SELECT id as teacher_id FROM teacher_records
              WHERE school_id = $1 AND employment_status = 'Active'`,
      values: [school_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Get teachers by class assignment ID for "Teachers, By Class" scope
  getTeachersByClass: async (school_id, class_id) => {
    const query = {
      text: `SELECT DISTINCT teacher_id FROM classes_assign
              WHERE school_id = $1 AND class_id = $2::uuid`,
      values: [school_id, class_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Get parents by class ID for "Parents, By Class" scope
  getParentsByClass: async (school_id, class_id) => {
    const query = {
      text: `SELECT DISTINCT pgi.id as parent_id
              FROM parent_guardian_information pgi
              WHERE pgi.school_id = $1
              AND pgi.student_id IN (
                SELECT ai.student_id
                FROM academic_information ai
                INNER JOIN classes_assign ca ON ca.class_id = ai.class_id AND ca.section_name = ai.section
                WHERE ca.school_id = $1 AND ca.class_id = $2::uuid
              )`,
      values: [school_id, class_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Get specific teachers by teacher_ids array for "Teachers, Specific Users" scope
  getSpecificTeachers: async (school_id, teacher_ids) => {
    // Validate input
    if (!Array.isArray(teacher_ids) || teacher_ids.length === 0) {
      return [];
    }

    const query = {
      text: `SELECT id as teacher_id FROM teacher_records
              WHERE school_id = $1
              AND id = ANY($2::uuid[])
              AND employment_status = 'Active'
              ORDER BY first_name ASC`,
      values: [school_id, teacher_ids],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Get specific parents by parent_ids array for "Parents, Specific Users" scope
  getSpecificParents: async (school_id, parent_ids) => {
    // Validate input
    if (!Array.isArray(parent_ids) || parent_ids.length === 0) {
      return [];
    }

    const query = {
      text: `SELECT
              id as parent_id,
              COALESCE(father_full_name, mother_full_name, guardian_full_name) as parent_full_name
              FROM parent_guardian_information
              WHERE school_id = $1
              AND id = ANY($2::uuid[])
              ORDER BY COALESCE(father_full_name, mother_full_name, guardian_full_name) ASC`,
      values: [school_id, parent_ids],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Get all parents for "Parents, Whole School" scope
  getAllParents: async (school_id) => {
    const query = {
      text: `SELECT id as parent_id FROM parent_guardian_information
              WHERE school_id = $1`,
      values: [school_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Insert multiple recipients in bulk
  insertRecipients: async (recipients) => {
    if (recipients.length === 0) return [];

    const values = recipients.map((_, idx) => {
      const offset = idx * 7;
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`;
    }).join(',');

    const flatValues = recipients.flatMap(r => [
      r.school_id,
      r.announcement_id,
      r.recipient_type,
      r.recipient_id,
      r.teacher_id || null,
      r.parent_id || null,
      r.class_id || null,
    ]);

    const query = {
      text: `INSERT INTO announcement_recipients
              (school_id, announcement_id, recipient_type, recipient_id, teacher_id, parent_id, class_id)
              VALUES ${values}
              RETURNING *`,
      values: flatValues,
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Create history entry
  createHistory: async (school_id, announcement_id, total_recipients) => {
    const query = {
      text: `INSERT INTO announcement_history
              (school_id, announcement_id, total_recipients, status)
              VALUES ($1, $2, $3, 'Sent')
              RETURNING *`,
      values: [school_id, announcement_id, total_recipients],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },


  // Get all announcements for school with teacher and parent names
  getAllAnnouncements: async (school_id) => {
    const query = {
      text: `SELECT
              a.id,
              a.school_id,
              a.title,
              a.message,
              a.is_important,
              a.status,
              a.audience,
              a.audience_type,
              a.scope,
              (SELECT DISTINCT ar3.class_id FROM announcement_recipients ar3 WHERE ar3.announcement_id = a.id AND ar3.class_id IS NOT NULL LIMIT 1) AS class_id,
              a.created_at,
              COUNT(DISTINCT ar.id) AS recipient_count,
              COUNT(DISTINCT ar.id) FILTER (WHERE ar.recipient_type = 'Teacher') AS teacher_count,
              COUNT(DISTINCT ar.id) FILTER (WHERE ar.recipient_type = 'Parent') AS parent_count,
              COALESCE(STRING_AGG(DISTINCT tr.first_name, ', ') FILTER (WHERE ar.recipient_type = 'Teacher'), NULL) AS teacher_names,
              COALESCE((
                SELECT STRING_AGG(
                  COALESCE(pgi.father_full_name, pgi.mother_full_name, pgi.guardian_full_name),
                  ', '
                )
                FROM announcement_recipients ar2
                LEFT JOIN parent_guardian_information pgi ON ar2.recipient_id = pgi.id::text
                WHERE ar2.announcement_id = a.id
                  AND ar2.recipient_type = 'Parent'
                  AND (pgi.father_full_name IS NOT NULL OR pgi.mother_full_name IS NOT NULL OR pgi.guardian_full_name IS NOT NULL)
              ), NULL) AS parent_names
            FROM announcements a
            LEFT JOIN announcement_recipients ar ON a.id = ar.announcement_id
            LEFT JOIN teacher_records tr ON ar.recipient_id = tr.id::text AND ar.recipient_type = 'Teacher'
            WHERE a.school_id = $1
            GROUP BY a.id, a.school_id, a.title, a.message, a.is_important, a.status, a.audience, a.audience_type, a.scope, a.created_at
            ORDER BY a.created_at DESC`,
      values: [school_id],
    };
    const result = await pool.query(query);

    // Enrich with class names, teacher_ids, parent_ids for announcements
    const enrichedRows = await Promise.all(
      result.rows.map(async (announcement) => {
        const enriched = { ...announcement };

        // Fetch teacher_ids and parent_ids from announcement_recipients
        const recipientsQuery = {
          text: `SELECT
                  ARRAY_AGG(DISTINCT teacher_id) FILTER (WHERE teacher_id IS NOT NULL) AS teacher_ids,
                  ARRAY_AGG(DISTINCT parent_id) FILTER (WHERE parent_id IS NOT NULL) AS parent_ids
                 FROM announcement_recipients
                 WHERE announcement_id = $1`,
          values: [announcement.id],
        };
        const recipientsResult = await pool.query(recipientsQuery);
        enriched.teacher_ids = (recipientsResult.rows[0] && recipientsResult.rows[0].teacher_ids) || [];
        enriched.parent_ids = (recipientsResult.rows[0] && recipientsResult.rows[0].parent_ids) || [];

        // Enrich with class details for "By Class" scope announcements
        if (announcement.scope === 'By Class' && announcement.class_id) {
          const classId = announcement.class_id;

          // Try to fetch actual class name from common API
          const className = await getClassName(classId);

          // Fetch section from classes_assign table (if exists)
          const classDetailsQuery = {
            text: `SELECT ca.id as class_assign_id, ca.section_name
                   FROM classes_assign ca
                   WHERE ca.class_id = $1::uuid
                   LIMIT 1`,
            values: [classId],
          };
          const classDetailsResult = await pool.query(classDetailsQuery);

          let sectionName = '';
          if (classDetailsResult.rows[0]) {
            sectionName = classDetailsResult.rows[0].section_name;
          }

          // Build display name
          const displayName = className
            ? sectionName ? `${className}-${sectionName}` : className
            : `${classId.substring(0, 8)}${sectionName ? '-' + sectionName : ''}`;

          enriched.class_name = displayName;
          enriched.section_name = sectionName || null;
        }

        return enriched;
      })
    );

    return enrichedRows;
  },

  // Get announcement by ID
  getAnnouncementById: async (announcement_id, school_id) => {
    const query = {
      text: `SELECT a.* FROM announcements a
              WHERE a.id = $1 AND a.school_id = $2`,
      values: [announcement_id, school_id],
    };
    const result = await pool.query(query);

    if (!result.rows[0]) {
      return null;
    }

    const announcement = result.rows[0];

    // Fetch teacher_ids and parent_ids from announcement_recipients
    const recipientsQuery = {
      text: `SELECT
              ARRAY_AGG(DISTINCT teacher_id) FILTER (WHERE teacher_id IS NOT NULL) AS teacher_ids,
              ARRAY_AGG(DISTINCT parent_id) FILTER (WHERE parent_id IS NOT NULL) AS parent_ids
             FROM announcement_recipients
             WHERE announcement_id = $1`,
      values: [announcement_id],
    };
    const recipientsResult = await pool.query(recipientsQuery);
    announcement.teacher_ids = (recipientsResult.rows[0] && recipientsResult.rows[0].teacher_ids) || [];
    announcement.parent_ids = (recipientsResult.rows[0] && recipientsResult.rows[0].parent_ids) || [];

    // Enrich with class details if "By Class" scope
    if (announcement.scope === 'By Class' && announcement.class_id) {
      const classId = announcement.class_id;

      // Try to fetch actual class name from common API
      const className = await getClassName(classId);

      // Fetch section from classes_assign table (if exists)
      const classDetailsQuery = {
        text: `SELECT ca.id as class_assign_id, ca.section_name
               FROM classes_assign ca
               WHERE ca.class_id = $1::uuid
               LIMIT 1`,
        values: [classId],
      };
      const classDetailsResult = await pool.query(classDetailsQuery);

      let sectionName = '';
      if (classDetailsResult.rows[0]) {
        sectionName = classDetailsResult.rows[0].section_name;
      }

      // Build display name
      const displayName = className
        ? sectionName ? `${className}-${sectionName}` : className
        : `${classId.substring(0, 8)}${sectionName ? '-' + sectionName : ''}`;

      announcement.class_name = displayName;
      announcement.section_name = sectionName || null;
    }

    return announcement;
  },

  // Get announcement recipients with teacher/parent names
  getAnnouncementRecipients: async (announcement_id, school_id) => {
    const query = {
      text: `SELECT
              ar.id,
              ar.school_id,
              ar.announcement_id,
              ar.recipient_type,
              ar.recipient_id,
              ar.parent_id,
              ar.class_id,
              ar.read_at,
              ar.is_deleted,
              ar.created_at,
              CASE
                WHEN ar.recipient_type = 'Teacher' THEN tr.first_name
                WHEN ar.recipient_type = 'Parent' THEN pgi.guardian_full_name
                ELSE NULL
              END AS recipient_name
            FROM announcement_recipients ar
            LEFT JOIN teacher_records tr ON ar.recipient_id = tr.id::text AND ar.recipient_type = 'Teacher'
            LEFT JOIN parent_guardian_information pgi ON ar.recipient_id = pgi.id::text AND ar.recipient_type = 'Parent'
            WHERE ar.announcement_id = $1::uuid AND ar.school_id = $2
            ORDER BY ar.created_at DESC`,
      values: [announcement_id, school_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Update announcement recipient count
  updateRecipientCount: async (announcement_id, count) => {
    const query = {
      text: `UPDATE announcements
              SET recipient_count = $1
              WHERE id = $2
              RETURNING *`,
      values: [count, announcement_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Delete single announcement by ID
  deleteAnnouncement: async (announcement_id, school_id) => {
    const query = {
      text: `DELETE FROM announcements
              WHERE id = $1 AND school_id = $2
              RETURNING id`,
      values: [announcement_id, school_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Delete all announcements for a school
  deleteAllAnnouncements: async (school_id) => {
    const query = {
      text: `DELETE FROM announcements
              WHERE school_id = $1`,
      values: [school_id],
    };
    const result = await pool.query(query);
    return result.rowCount;
  },

  // Get all classes for dropdown
  getAllClasses: async (school_id) => {
    const query = {
      text: `SELECT ca.id, ca.class_id, ca.section_name
              FROM classes_assign ca
              WHERE ca.school_id = $1
              ORDER BY ca.class_id, ca.section_name`,
      values: [school_id],
    };
    const result = await pool.query(query);

    // Enrich with class names from common API
    const enriched = await Promise.all(
      result.rows.map(async (row) => {
        const className = await getClassName(row.class_id);
        return {
          id: row.class_id,
          class_name: `${className || 'Unknown'} - ${row.section_name}`,
          name: className || 'Unknown',
          section: row.section_name,
        };
      })
    );

    return enriched;
  },

  // Update announcement (only for Draft status) and change to Sent
  updateAnnouncement: async (school_id, announcement_id, announcement_data) => {
    const { audience, title, message, is_important } = announcement_data;
    const query = {
      text: `UPDATE announcements
              SET audience = $1, title = $2, message = $3, is_important = $4, status = 'Sent'
              WHERE id = $5 AND school_id = $6
              RETURNING *`,
      values: [audience || null, title, message, is_important !== undefined ? is_important : false, announcement_id, school_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },
};

module.exports = composeRepository;
