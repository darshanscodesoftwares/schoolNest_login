const pool = require('../../../config/db');

// Get all license types
const getAllLicenseTypes = async () => {
  try {
    const query = `
      SELECT *
      FROM license_types
      ORDER BY order_number ASC, license_name ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get license type by ID
const getLicenseTypeById = async (licenseTypeId) => {
  try {
    const query = `
      SELECT *
      FROM license_types
      WHERE id = $1
    `;
    const result = await pool.query(query, [licenseTypeId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get total count
const getTotalLicenseTypesCount = async () => {
  try {
    const query = `
      SELECT COUNT(*) as total
      FROM license_types
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
      FROM license_types
    `;
    const result = await pool.query(query);
    return parseInt(result.rows[0].max_order, 10);
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Create license type
const createLicenseType = async (licenseTypeData) => {
  try {
    const { license_name, order_number } = licenseTypeData;

    const query = `
      INSERT INTO license_types (license_name, order_number)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await pool.query(query, [
      license_name,
      order_number || 0
    ]);

    return result.rows[0];
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Update license type
const updateLicenseType = async (licenseTypeId, updateData) => {
  try {
    const updates = [];
    const values = [licenseTypeId];
    let paramIndex = 1;

    const allowedFields = ['license_name', 'order_number'];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        paramIndex++;
        updates.push(`${field} = $${paramIndex}`);
        values.push(updateData[field]);
      }
    }

    if (updates.length === 0) {
      return await getLicenseTypeById(licenseTypeId);
    }

    updates.push(`updated_at = NOW()`);
    const query = `
      UPDATE license_types
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

// Delete license type
const deleteLicenseType = async (licenseTypeId) => {
  try {
    const query = `
      DELETE FROM license_types
      WHERE id = $1
      RETURNING id, license_name
    `;
    const result = await pool.query(query, [licenseTypeId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

module.exports = {
  getAllLicenseTypes,
  getLicenseTypeById,
  getTotalLicenseTypesCount,
  getMaxOrderNumber,
  createLicenseType,
  updateLicenseType,
  deleteLicenseType
};
