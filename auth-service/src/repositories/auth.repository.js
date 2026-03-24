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

/**
 * Insert a token into the blacklist (idempotent — double-logout is safe).
 * @param {string} userId
 * @param {number} issuedAt  - JWT iat claim (Unix epoch seconds)
 * @param {Date}   expiresAt - JS Date derived from JWT exp claim
 */
const blacklistToken = async (userId, issuedAt, expiresAt) => {
  const query = {
    text: `
      INSERT INTO token_blacklist (user_id, issued_at, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, issued_at) DO NOTHING
    `,
    values: [userId, issuedAt, expiresAt]
  };
  try {
    await pool.query(query);
  } catch (error) {
    console.error('Database error in blacklistToken:', error.message);
    throw error;
  }
};

/**
 * Delete all blacklist entries whose token has already naturally expired.
 * Called as fire-and-forget on each logout to keep the table small.
 * @returns {number} count of deleted rows
 */
const cleanupExpiredTokens = async () => {
  try {
    const result = await pool.query(
      `DELETE FROM token_blacklist WHERE expires_at < NOW()`
    );
    return result.rowCount;
  } catch (error) {
    console.error('Database error in cleanupExpiredTokens:', error.message);
    throw error;
  }
};

module.exports = { findUserByEmail, blacklistToken, cleanupExpiredTokens };
