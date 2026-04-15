const pool = require("../../../config/db");

const sectionsRepository = {
  // Get all unique sections for a school and class
  getSectionsByClassAndSchool: async (school_id, class_id) => {
    const query = {
      text: `SELECT DISTINCT ca.section_name, s.id AS section_id
             FROM classes_assign ca
             LEFT JOIN sections s ON s.school_id = ca.school_id AND s.section_name = ca.section_name
             WHERE ca.school_id = $1 AND ca.class_id = $2::uuid
             ORDER BY ca.section_name ASC`,
      values: [school_id, class_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Get all sections for a school across all classes
  getAllSectionsBySchool: async (school_id) => {
    const query = {
      text: `SELECT DISTINCT s.id, s.section_name
             FROM sections s
             WHERE s.school_id = $1
             ORDER BY s.section_name ASC`,
      values: [school_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Get all classes and sections for a school (for dropdown data)
  getClassesSectionsBySchool: async (school_id) => {
    const query = {
      text: `SELECT DISTINCT ca.class_id, ca.section_name, s.id AS section_id
             FROM classes_assign ca
             LEFT JOIN sections s ON s.school_id = ca.school_id AND s.section_name = ca.section_name
             WHERE ca.school_id = $1
             ORDER BY ca.class_id, ca.section_name ASC`,
      values: [school_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Check if a section exists for a school and class
  sectionExists: async (school_id, class_id, section_name) => {
    const query = {
      text: `SELECT id FROM classes_assign
             WHERE school_id = $1 AND class_id = $2::uuid AND section_name = $3
             LIMIT 1`,
      values: [school_id, class_id, section_name],
    };
    const result = await pool.query(query);
    return result.rows.length > 0;
  },
};

module.exports = sectionsRepository;
