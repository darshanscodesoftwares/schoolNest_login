const pool = require('../config/db');

/**
 * Find user by email and join with roles table
 * @param {string} email - User email
 * @returns {Object|null} User object with role name, or null if not found
 */
const findUserByEmail = async (email) => {
  const query = {
    text: `
      SELECT
        u.id,
        u.school_id,
        u.name,
        u.email,
        u.password_hash,
        r.name AS role
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.email = $1
      LIMIT 1
    `,
    values: [email]
  };

  try {
    const result = await pool.query(query);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Database error in findUserByEmail:', error.message);
    throw error;
  }
};

module.exports = { findUserByEmail };
