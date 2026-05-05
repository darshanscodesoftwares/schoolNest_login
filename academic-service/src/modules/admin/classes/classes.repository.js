const pool = require('../../../config/db');

const getClassTemplate = async (classTemplateId) => {
  const { rows } = await pool.query({
    text: `SELECT id, class_name, order_number
           FROM class_templates
           WHERE id = $1 AND is_active = true`,
    values: [classTemplateId]
  });
  return rows[0] || null;
};

const listActiveSectionTemplatesOrdered = async () => {
  const { rows } = await pool.query({
    text: `SELECT id, section_name, order_number, is_default
           FROM section_templates
           WHERE is_active = true
           ORDER BY order_number ASC`
  });
  return rows;
};

const listClasses = async (schoolId) => {
  const { rows } = await pool.query({
    text: `SELECT sc.id, sc.class_name, sc.template_id,
                  COALESCE(COUNT(cs.id), 0)::int AS section_count
           FROM school_classes sc
           LEFT JOIN class_sections cs ON cs.class_id = sc.id AND cs.school_id = sc.school_id
           WHERE sc.school_id = $1
           GROUP BY sc.id, sc.class_name, sc.template_id, sc.order_number
           ORDER BY sc.order_number ASC, sc.class_name ASC`,
    values: [schoolId]
  });
  return rows;
};

const listSections = async ({ schoolId, classId }) => {
  const { rows } = await pool.query({
    text: `SELECT cs.id, cs.section_template_id, cs.section_name, st.is_default
           FROM class_sections cs
           JOIN section_templates st ON st.id = cs.section_template_id
           WHERE cs.school_id = $1 AND cs.class_id = $2
           ORDER BY st.order_number ASC`,
    values: [schoolId, classId]
  });
  return rows;
};

const getClassSectionWithTemplate = async ({ schoolId, classId, classSectionId }) => {
  const { rows } = await pool.query({
    text: `SELECT cs.id, cs.section_template_id, cs.section_name, st.is_default
           FROM class_sections cs
           JOIN section_templates st ON st.id = cs.section_template_id
           WHERE cs.school_id = $1 AND cs.class_id = $2 AND cs.id = $3`,
    values: [schoolId, classId, classSectionId]
  });
  return rows[0] || null;
};

const createClassWithSectionsTxn = async ({ schoolId, classTemplateId, className, orderNumber, sectionTemplates }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const upsert = await client.query({
      text: `INSERT INTO school_classes (school_id, class_name, template_id, order_number)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (school_id, class_name)
             DO UPDATE SET template_id  = COALESCE(school_classes.template_id, EXCLUDED.template_id),
                           order_number = EXCLUDED.order_number,
                           updated_at   = NOW()
             RETURNING id, class_name, template_id`,
      values: [schoolId, className, classTemplateId, orderNumber ?? 0]
    });
    const cls = upsert.rows[0];

    for (const tpl of sectionTemplates) {
      await client.query({
        text: `INSERT INTO class_sections (school_id, class_id, section_template_id, section_name)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (school_id, class_id, section_template_id) DO NOTHING`,
        values: [schoolId, cls.id, tpl.id, tpl.section_name]
      });
    }

    const sectionsResult = await client.query({
      text: `SELECT cs.id, cs.section_template_id, cs.section_name, st.is_default
             FROM class_sections cs
             JOIN section_templates st ON st.id = cs.section_template_id
             WHERE cs.school_id = $1 AND cs.class_id = $2
             ORDER BY st.order_number ASC`,
      values: [schoolId, cls.id]
    });

    await client.query('COMMIT');
    return { class: cls, sections: sectionsResult.rows };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const listClassTemplatesByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];
  const { rows } = await pool.query({
    text: `SELECT id, class_name, order_number
           FROM class_templates
           WHERE id = ANY($1::uuid[]) AND is_active = true`,
    values: [ids]
  });
  return rows;
};

// bulkSaveStructureTxn — additive only.
// For each class template id:
//   - if a school_classes row already exists for (school_id, class_name): skip
//     entirely (do NOT touch its sections — those are managed per-class via
//     attach/detach endpoints).
//   - if it does not exist: insert it AND attach the given section templates.
// This guarantees existing classes' sections are never wiped by a bulk save,
// which is what the UI's "add new classes" flow needs.
const bulkSaveStructureTxn = async ({ schoolId, classTemplates, sectionTemplates }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = [];
    for (const cTpl of classTemplates) {
      // Insert only when missing — ON CONFLICT DO NOTHING returns 0 rows on conflict.
      const insert = await client.query({
        text: `INSERT INTO school_classes (school_id, class_name, template_id, order_number)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (school_id, class_name) DO NOTHING
               RETURNING id, class_name, template_id, order_number`,
        values: [schoolId, cTpl.class_name, cTpl.id, (cTpl.order_number == null ? 0 : cTpl.order_number)]
      });

      let cls;
      let isNew;
      if (insert.rows.length > 0) {
        cls = insert.rows[0];
        isNew = true;
      } else {
        // Already existed — fetch the row so we can return it, but skip section attach.
        const existing = await client.query({
          text: `SELECT id, class_name, template_id, order_number
                 FROM school_classes
                 WHERE school_id = $1 AND class_name = $2`,
          values: [schoolId, cTpl.class_name]
        });
        cls = existing.rows[0];
        isNew = false;
      }

      // Only attach sections to brand-new classes.
      if (isNew) {
        for (const sTpl of sectionTemplates) {
          await client.query({
            text: `INSERT INTO class_sections (school_id, class_id, section_template_id, section_name)
                   VALUES ($1, $2, $3, $4)
                   ON CONFLICT (school_id, class_id, section_template_id) DO NOTHING`,
            values: [schoolId, cls.id, sTpl.id, sTpl.section_name]
          });

          // Mirror into the legacy `sections` table so older endpoints
          // (Exams form's /admin/lookups/sections, etc.) still see the
          // school's sections without each call site having to migrate to
          // the class_sections model. Per-school dedupe by section_name.
          await client.query({
            text: `INSERT INTO sections (school_id, section_name)
                   VALUES ($1, $2)
                   ON CONFLICT (school_id, section_name) DO NOTHING`,
            values: [schoolId, sTpl.section_name]
          });
        }
      }

      const sectionsResult = await client.query({
        text: `SELECT cs.id, cs.section_template_id, cs.section_name, st.is_default
               FROM class_sections cs
               JOIN section_templates st ON st.id = cs.section_template_id
               WHERE cs.school_id = $1 AND cs.class_id = $2
               ORDER BY st.order_number ASC`,
        values: [schoolId, cls.id]
      });

      result.push({ class: cls, sections: sectionsResult.rows, created: isNew });
    }

    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const attachSection = async ({ schoolId, classId, sectionTemplateId, sectionName }) => {
  const { rows } = await pool.query({
    text: `INSERT INTO class_sections (school_id, class_id, section_template_id, section_name)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (school_id, class_id, section_template_id) DO NOTHING
           RETURNING id, section_template_id, section_name`,
    values: [schoolId, classId, sectionTemplateId, sectionName]
  });
  return rows[0] || null;
};

const detachSection = async ({ schoolId, classId, classSectionId }) => {
  await pool.query({
    text: `DELETE FROM class_sections
           WHERE school_id = $1 AND class_id = $2 AND id = $3`,
    values: [schoolId, classId, classSectionId]
  });
};

const deleteClass = async ({ schoolId, classId }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear nullable FK references that don't have ON DELETE CASCADE
    await client.query({
      text: `UPDATE student_enquiries SET class_id = NULL
             WHERE school_id = $1 AND class_id = $2`,
      values: [schoolId, classId]
    });
    await client.query({
      text: `UPDATE academic_information SET class_id = NULL
             WHERE school_id = $1 AND class_id = $2`,
      values: [schoolId, classId]
    });

    // Remove exam_details rows (NOT NULL FK, can't set null)
    await client.query({
      text: `DELETE FROM exam_details
             WHERE school_id = $1 AND class_id = $2`,
      values: [schoolId, classId]
    });

    // Now delete the class (cascades to class_sections, classes_assign, subject_class_assign)
    const { rowCount } = await client.query({
      text: `DELETE FROM school_classes
             WHERE school_id = $1 AND id = $2`,
      values: [schoolId, classId]
    });

    await client.query('COMMIT');
    return rowCount > 0;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const getSchoolClassById = async ({ schoolId, classId }) => {
  const { rows } = await pool.query({
    text: `SELECT id, class_name, template_id
           FROM school_classes
           WHERE school_id = $1 AND id = $2`,
    values: [schoolId, classId]
  });
  return rows[0] || null;
};

module.exports = {
  getClassTemplate,
  listActiveSectionTemplatesOrdered,
  listClasses,
  listSections,
  getClassSectionWithTemplate,
  createClassWithSectionsTxn,
  listClassTemplatesByIds,
  bulkSaveStructureTxn,
  attachSection,
  detachSection,
  deleteClass,
  getSchoolClassById
};
