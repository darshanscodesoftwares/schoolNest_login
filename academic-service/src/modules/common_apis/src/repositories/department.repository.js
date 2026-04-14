const pool = require('../config/db');

// Get all departments
const getAllDepartments = async () => {
  try {
    const query = `
      SELECT
        id,
        department_name,
        order_number,
        created_at
      FROM departments
      ORDER BY order_number ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get department by ID
const getDepartmentById = async (departmentId) => {
  try {
    const query = `
      SELECT
        id,
        department_name,
        order_number,
        created_at
      FROM departments
      WHERE id = $1
    `;
    const result = await pool.query(query, [departmentId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Create a new department
const createDepartment = async (departmentName) => {
  try {
    // Get the next order number automatically
    const maxOrderResult = await pool.query('SELECT MAX(order_number) as max_order FROM departments');
    const nextOrder = (maxOrderResult.rows[0].max_order || 0) + 1;

    const query = `
      INSERT INTO departments (department_name, order_number, created_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING id, department_name, order_number, created_at
    `;
    const result = await pool.query(query, [departmentName, nextOrder]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Update a department
const updateDepartment = async (departmentId, departmentName) => {
  try {
    const query = `
      UPDATE departments
      SET department_name = $1
      WHERE id = $2
      RETURNING id, department_name, order_number, created_at
    `;
    const result = await pool.query(query, [departmentName, departmentId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Delete a department
const deleteDepartment = async (departmentId) => {
  try {
    const query = `
      DELETE FROM departments
      WHERE id = $1
      RETURNING id, department_name, order_number
    `;
    const result = await pool.query(query, [departmentId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
