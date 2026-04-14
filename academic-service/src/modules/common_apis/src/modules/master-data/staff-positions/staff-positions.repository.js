const pool = require('../../../config/db');

// Get all staff positions
const getAllStaffPositions = async () => {
  try {
    const query = `
      SELECT *
      FROM others_staff_positions
      ORDER BY order_number ASC, other_staff_positions ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get staff position by ID
const getStaffPositionById = async (staffPositionId) => {
  try {
    const query = `
      SELECT *
      FROM others_staff_positions
      WHERE id = $1
    `;
    const result = await pool.query(query, [staffPositionId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get total count
const getTotalStaffPositionsCount = async () => {
  try {
    const query = `
      SELECT COUNT(*) as total
      FROM others_staff_positions
    `;
    const result = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get max order number (for auto-increment)
const getMaxOrderNumber = async () => {
  try {
    const query = `
      SELECT COALESCE(MAX(order_number), 0) as max_order
      FROM others_staff_positions
    `;
    const result = await pool.query(query);
    return parseInt(result.rows[0].max_order, 10);
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Create staff position
const createStaffPosition = async (staffPositionData) => {
  try {
    const { other_staff_positions, order_number } = staffPositionData;

    const query = `
      INSERT INTO others_staff_positions (other_staff_positions, order_number)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await pool.query(query, [
      other_staff_positions,
      order_number || 0
    ]);

    return result.rows[0];
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Update staff position
const updateStaffPosition = async (staffPositionId, updateData) => {
  try {
    const updates = [];
    const values = [staffPositionId];
    let paramIndex = 1;

    const allowedFields = ['other_staff_positions', 'order_number'];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        paramIndex++;
        updates.push(`${field} = $${paramIndex}`);
        values.push(updateData[field]);
      }
    }

    if (updates.length === 0) {
      return await getStaffPositionById(staffPositionId);
    }

    updates.push(`updated_at = NOW()`);
    const query = `
      UPDATE others_staff_positions
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Delete staff position
const deleteStaffPosition = async (staffPositionId) => {
  try {
    const query = `
      DELETE FROM others_staff_positions
      WHERE id = $1
      RETURNING id, other_staff_positions
    `;
    const result = await pool.query(query, [staffPositionId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

module.exports = {
  getAllStaffPositions,
  getStaffPositionById,
  getTotalStaffPositionsCount,
  getMaxOrderNumber,
  createStaffPosition,
  updateStaffPosition,
  deleteStaffPosition
};
