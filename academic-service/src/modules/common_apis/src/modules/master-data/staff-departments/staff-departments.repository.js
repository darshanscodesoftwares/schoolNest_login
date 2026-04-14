const pool = require('../../../config/db');

// Get all staff departments
const getAllStaffDepartments = async () => {
  try {
    const query = `
      SELECT *
      FROM others_staff_departments
      ORDER BY order_number ASC, other_staff_departments ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get staff department by ID
const getStaffDepartmentById = async (staffDepartmentId) => {
  try {
    const query = `
      SELECT *
      FROM others_staff_departments
      WHERE id = $1
    `;
    const result = await pool.query(query, [staffDepartmentId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get total count
const getTotalStaffDepartmentsCount = async () => {
  try {
    const query = `
      SELECT COUNT(*) as total
      FROM others_staff_departments
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
      FROM others_staff_departments
    `;
    const result = await pool.query(query);
    return parseInt(result.rows[0].max_order, 10);
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Create staff department
const createStaffDepartment = async (staffDepartmentData) => {
  try {
    const { other_staff_departments, order_number } = staffDepartmentData;

    const query = `
      INSERT INTO others_staff_departments (other_staff_departments, order_number)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await pool.query(query, [
      other_staff_departments,
      order_number || 0
    ]);

    return result.rows[0];
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Update staff department
const updateStaffDepartment = async (staffDepartmentId, updateData) => {
  try {
    const updates = [];
    const values = [staffDepartmentId];
    let paramIndex = 1;

    const allowedFields = ['other_staff_departments', 'order_number'];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        paramIndex++;
        updates.push(`${field} = $${paramIndex}`);
        values.push(updateData[field]);
      }
    }

    if (updates.length === 0) {
      return await getStaffDepartmentById(staffDepartmentId);
    }

    updates.push(`updated_at = NOW()`);
    const query = `
      UPDATE others_staff_departments
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

// Delete staff department
const deleteStaffDepartment = async (staffDepartmentId) => {
  try {
    const query = `
      DELETE FROM others_staff_departments
      WHERE id = $1
      RETURNING id, other_staff_departments
    `;
    const result = await pool.query(query, [staffDepartmentId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

module.exports = {
  getAllStaffDepartments,
  getStaffDepartmentById,
  getTotalStaffDepartmentsCount,
  getMaxOrderNumber,
  createStaffDepartment,
  updateStaffDepartment,
  deleteStaffDepartment
};
