const pool = require('../config/db');

// Get all classes
const getAllClasses = async () => {
  try {
    const query = `
      SELECT
        id,
        class_name,
        order_number,
        created_at
      FROM classes
      ORDER BY order_number ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get class by ID
const getClassById = async (classId) => {
  try {
    const query = `
      SELECT
        id,
        class_name,
        order_number,
        created_at
      FROM classes
      WHERE id = $1
    `;
    const result = await pool.query(query, [classId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Create a new class
const createClass = async (className) => {
  try {
    // Get the next order number automatically
    const maxOrderResult = await pool.query('SELECT MAX(order_number) as max_order FROM classes');
    const nextOrder = (maxOrderResult.rows[0].max_order || 0) + 1;

    const query = `
      INSERT INTO classes (class_name, order_number, created_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING id, class_name, order_number, created_at
    `;
    const result = await pool.query(query, [className, nextOrder]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Update a class
const updateClass = async (classId, className) => {
  try {
    const query = `
      UPDATE classes
      SET class_name = $1
      WHERE id = $2
      RETURNING id, class_name, order_number, created_at
    `;
    const result = await pool.query(query, [className, classId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Delete a class
const deleteClass = async (classId) => {
  try {
    const query = `
      DELETE FROM classes
      WHERE id = $1
      RETURNING id, class_name, order_number
    `;
    const result = await pool.query(query, [classId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
};
