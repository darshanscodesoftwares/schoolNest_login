const pool = require('../../../config/db');

const listActive = async () => {
  const { rows } = await pool.query({
    text: `SELECT id, class_name, order_number
           FROM class_templates
           WHERE is_active = true
           ORDER BY order_number ASC`
  });
  return rows;
};

module.exports = { listActive };
