const pool = require("../../../../config/db");

const templatesRepository = {
  // Create announcement template
  createTemplate: async (school_id, template_data) => {
    const { title, message } = template_data;

    const query = {
      text: `INSERT INTO announcement_templates (school_id, title, message)
             VALUES ($1, $2, $3)
             RETURNING *`,
      values: [school_id, title, message],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  // Get all templates for school
  getAllTemplates: async (school_id) => {
    const query = {
      text: `SELECT * FROM announcement_templates
             WHERE school_id = $1
             ORDER BY created_at DESC`,
      values: [school_id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  // Get template by ID
  getTemplateById: async (school_id, template_id) => {
    const query = {
      text: `SELECT * FROM announcement_templates
             WHERE id = $1 AND school_id = $2`,
      values: [template_id, school_id],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  // Update template
  updateTemplate: async (school_id, template_id, template_data) => {
    const { title, message } = template_data;

    const query = {
      text: `UPDATE announcement_templates
             SET title = COALESCE($1, title),
                 message = COALESCE($2, message),
                 updated_at = NOW()
             WHERE id = $3 AND school_id = $4
             RETURNING *`,
      values: [title, message, template_id, school_id],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  // Delete template
  deleteTemplate: async (school_id, template_id) => {
    const query = {
      text: `DELETE FROM announcement_templates
             WHERE id = $1 AND school_id = $2
             RETURNING *`,
      values: [template_id, school_id],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },
};

module.exports = templatesRepository;
