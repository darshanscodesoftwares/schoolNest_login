const pool = require('../config/db');
const academicPool = require('../config/academic-db');

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

/**
 * Find teacher by primary phone (across all schools)
 * Queries academic_db teacher_records table for school auto-discovery
 * Normalizes both stored and input phone numbers for flexible matching
 *
 * @param {string} primary_phone - Teacher's phone number (normalized, 10 digits)
 * @returns {Array} Array of teacher records from all schools
 */
const findTeachersByPhone = async (primary_phone) => {
  const query = {
    text: `
      SELECT
        id,
        school_id,
        first_name,
        primary_phone,
        primary_email
      FROM teacher_records
      WHERE
        -- Match exact normalized phone (remove +91, spaces, hyphens)
        REGEXP_REPLACE(primary_phone, '[^0-9]', '', 'g') LIKE '%' || $1 || '%'
        OR
        -- Also try direct match in case already normalized
        primary_phone = $1
    `,
    values: [primary_phone]
  };

  try {
    const result = await academicPool.query(query);
    return result.rows || [];
  } catch (error) {
    console.error('Database error in findTeachersByPhone:', error.message);
    throw error;
  }
};

/**
 * Find teacher by ID and school_id
 * Queries academic_db teacher_records table
 *
 * @param {string} teacher_id - Teacher UUID (from teacher_records.id)
 * @param {number} school_id - School ID for tenant isolation
 * @returns {Object|null} Teacher object or null if not found
 */
const findTeacherById = async (teacher_id, school_id) => {
  const query = {
    text: `
      SELECT
        id,
        school_id,
        first_name,
        primary_phone,
        primary_email,
        gender,
        date_of_birth
      FROM teacher_records
      WHERE id = $1 AND school_id = $2
      LIMIT 1
    `,
    values: [teacher_id, school_id]
  };

  try {
    const result = await academicPool.query(query);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Database error in findTeacherById:', error.message);
    throw error;
  }
};

module.exports = { findUserByEmail, blacklistToken, cleanupExpiredTokens, findTeachersByPhone, findTeacherById };
