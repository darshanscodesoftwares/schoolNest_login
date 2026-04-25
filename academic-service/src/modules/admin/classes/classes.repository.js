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
           GROUP BY sc.id, sc.class_name, sc.template_id
           ORDER BY sc.class_name ASC`,
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

const createClassWithSectionsTxn = async ({ schoolId, classTemplateId, className, sectionTemplates }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const upsert = await client.query({
      text: `INSERT INTO school_classes (school_id, class_name, template_id)
             VALUES ($1, $2, $3)
             ON CONFLICT (school_id, class_name)
             DO UPDATE SET template_id = COALESCE(school_classes.template_id, EXCLUDED.template_id),
                           updated_at  = NOW()
             RETURNING id, class_name, template_id`,
      values: [schoolId, className, classTemplateId]
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
  const { rowCount } = await pool.query({
    text: `DELETE FROM school_classes
           WHERE school_id = $1 AND id = $2`,
    values: [schoolId, classId]
  });
  return rowCount > 0;
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
  attachSection,
  detachSection,
  deleteClass,
  getSchoolClassById
};
