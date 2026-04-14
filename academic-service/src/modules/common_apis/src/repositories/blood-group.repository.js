const pool = require('../config/db');

// Get all blood groups
const getAllBloodGroups = async () => {
  try {
    const query = `
      SELECT
        id,
        blood_group,
        order_number,
        created_at
      FROM blood_groups
      ORDER BY order_number ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get blood group by ID
const getBloodGroupById = async (bloodGroupId) => {
  try {
    const query = `
      SELECT
        id,
        blood_group,
        order_number,
        created_at
      FROM blood_groups
      WHERE id = $1
    `;
    const result = await pool.query(query, [bloodGroupId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Create a new blood group
const createBloodGroup = async (bloodGroup) => {
  try {
    // Get the next order number automatically
    const maxOrderResult = await pool.query('SELECT MAX(order_number) as max_order FROM blood_groups');
    const nextOrder = (maxOrderResult.rows[0].max_order || 0) + 1;

    const query = `
      INSERT INTO blood_groups (blood_group, order_number, created_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING id, blood_group, order_number, created_at
    `;
    const result = await pool.query(query, [bloodGroup, nextOrder]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Update a blood group
const updateBloodGroup = async (bloodGroupId, bloodGroup) => {
  try {
    const query = `
      UPDATE blood_groups
      SET blood_group = $1
      WHERE id = $2
      RETURNING id, blood_group, order_number, created_at
    `;
    const result = await pool.query(query, [bloodGroup, bloodGroupId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Delete a blood group
const deleteBloodGroup = async (bloodGroupId) => {
  try {
    const query = `
      DELETE FROM blood_groups
      WHERE id = $1
      RETURNING id, blood_group, order_number
    `;
    const result = await pool.query(query, [bloodGroupId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

module.exports = {
  getAllBloodGroups,
  getBloodGroupById,
  createBloodGroup,
  updateBloodGroup,
  deleteBloodGroup
};
