const pool = require('../../../config/db');

const listActive = async () => {
  const { rows } = await pool.query({
    text: `SELECT id, section_name, order_number, is_default
           FROM section_templates
           WHERE is_active = true
           ORDER BY order_number ASC`
  });
  return rows;
};

module.exports = { listActive };
