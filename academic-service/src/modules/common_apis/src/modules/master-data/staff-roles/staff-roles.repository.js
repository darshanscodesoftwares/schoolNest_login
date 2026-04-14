const pool = require('../../../config/db');

// Get all staff roles
const getAllStaffRoles = async () => {
  try {
    const query = `
      SELECT *
      FROM others_staff_roles
      ORDER BY order_number ASC, other_staff_role ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get staff role by ID
const getStaffRoleById = async (staffRoleId) => {
  try {
    const query = `
      SELECT *
      FROM others_staff_roles
      WHERE id = $1
    `;
    const result = await pool.query(query, [staffRoleId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get total count
const getTotalStaffRolesCount = async () => {
  try {
    const query = `
      SELECT COUNT(*) as total
      FROM others_staff_roles
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
      FROM others_staff_roles
    `;
    const result = await pool.query(query);
    return parseInt(result.rows[0].max_order, 10);
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Create staff role
const createStaffRole = async (staffRoleData) => {
  try {
    const { other_staff_role, order_number } = staffRoleData;

    const query = `
      INSERT INTO others_staff_roles (other_staff_role, order_number)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await pool.query(query, [
      other_staff_role,
      order_number || 0
    ]);

    return result.rows[0];
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Update staff role
const updateStaffRole = async (staffRoleId, updateData) => {
  try {
    const updates = [];
    const values = [staffRoleId];
    let paramIndex = 1;

    const allowedFields = ['other_staff_role', 'order_number'];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        paramIndex++;
        updates.push(`${field} = $${paramIndex}`);
        values.push(updateData[field]);
      }
    }

    if (updates.length === 0) {
      return await getStaffRoleById(staffRoleId);
    }

    updates.push(`updated_at = NOW()`);
    const query = `
      UPDATE others_staff_roles
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

// Delete staff role
const deleteStaffRole = async (staffRoleId) => {
  try {
    const query = `
      DELETE FROM others_staff_roles
      WHERE id = $1
      RETURNING id, other_staff_role
    `;
    const result = await pool.query(query, [staffRoleId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

module.exports = {
  getAllStaffRoles,
  getStaffRoleById,
  getTotalStaffRolesCount,
  getMaxOrderNumber,
  createStaffRole,
  updateStaffRole,
  deleteStaffRole
};
