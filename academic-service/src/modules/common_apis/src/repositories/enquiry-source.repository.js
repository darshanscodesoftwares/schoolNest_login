const pool = require('../config/db');

// Get all enquiry sources
const getAllEnquirySources = async () => {
  try {
    const query = `
      SELECT
        id,
        source_name,
        order_number,
        created_at
      FROM enquiry_sources
      ORDER BY order_number ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get enquiry source by ID
const getEnquirySourceById = async (sourceId) => {
  try {
    const query = `
      SELECT
        id,
        source_name,
        order_number,
        created_at
      FROM enquiry_sources
      WHERE id = $1
    `;
    const result = await pool.query(query, [sourceId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Create a new enquiry source
const createEnquirySource = async (sourceName) => {
  try {
    // Get the next order number automatically
    const maxOrderResult = await pool.query('SELECT MAX(order_number) as max_order FROM enquiry_sources');
    const nextOrder = (maxOrderResult.rows[0].max_order || 0) + 1;

    const query = `
      INSERT INTO enquiry_sources (source_name, order_number, created_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING id, source_name, order_number, created_at
    `;
    const result = await pool.query(query, [sourceName, nextOrder]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Update an enquiry source
const updateEnquirySource = async (sourceId, sourceName) => {
  try {
    const query = `
      UPDATE enquiry_sources
      SET source_name = $1
      WHERE id = $2
      RETURNING id, source_name, order_number, created_at
    `;
    const result = await pool.query(query, [sourceName, sourceId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Delete an enquiry source
const deleteEnquirySource = async (sourceId) => {
  try {
    const query = `
      DELETE FROM enquiry_sources
      WHERE id = $1
      RETURNING id, source_name, order_number
    `;
    const result = await pool.query(query, [sourceId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

module.exports = {
  getAllEnquirySources,
  getEnquirySourceById,
  createEnquirySource,
  updateEnquirySource,
  deleteEnquirySource
};
