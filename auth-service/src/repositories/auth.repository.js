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
 *
 * @param {string} primary_phone - Teacher's phone number
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
      WHERE REPLACE(primary_phone, ' ', '') = REPLACE($1, ' ', '')
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

/**
 * Find parent by phone number from admission data.
 * Searches parent_guardian_information (father_phone / mother_phone) —
 * the phone given during the child's admission.
 *
 * A parent with 2-3 children will have multiple parent_guardian_information
 * rows (one per admission) but the SAME email → same auth_db user.
 * We deduplicate by email so the result is one auth user regardless of
 * how many children they have. After OTP login, the parent API returns
 * all children linked via students.parent_id.
 */
const findParentsByPhone = async (phone) => {
  try {
    const normalizedPhone = phone.replace(/[\s\-\+]/g, '').replace(/^91/, '');

    // Find all admissions where this phone is father or mother
    const parentInfoRes = await academicPool.query(
      `SELECT DISTINCT ON (COALESCE(father_email, mother_email))
              father_full_name, father_email, father_phone,
              mother_full_name, mother_email, mother_phone, school_id
       FROM parent_guardian_information
       WHERE REPLACE(REPLACE(REPLACE(father_phone, ' ', ''), '-', ''), '+91', '') = $1
          OR REPLACE(REPLACE(REPLACE(mother_phone, ' ', ''), '-', ''), '+91', '') = $1
       ORDER BY COALESCE(father_email, mother_email), school_id`,
      [normalizedPhone]
    );

    if (parentInfoRes.rows.length === 0) return [];

    // Resolve each unique parent email to an auth_db user
    const results = [];
    for (const row of parentInfoRes.rows) {
      var parentEmail = row.father_email || row.mother_email;
      var parentName = row.father_full_name || row.mother_full_name || 'Parent';
      var parentPhone = row.father_phone || row.mother_phone;

      if (!parentEmail) continue;

      const userRes = await pool.query(
        `SELECT u.id, u.school_id, u.name, u.email, r.name AS role
         FROM users u
         INNER JOIN roles r ON r.id = u.role_id
         WHERE u.email = $1 AND r.name = 'PARENT'
         LIMIT 1`,
        [parentEmail]
      );

      if (userRes.rows[0]) {
        // Count how many children this parent has
        const childrenRes = await academicPool.query(
          `SELECT COUNT(*) as count FROM students WHERE parent_id = $1 AND school_id = $2`,
          [userRes.rows[0].id, userRes.rows[0].school_id]
        );

        results.push({
          id: userRes.rows[0].id,
          school_id: userRes.rows[0].school_id,
          name: parentName,
          email: parentEmail,
          phone: parentPhone,
          role: 'PARENT',
          children_count: parseInt((childrenRes.rows[0] && childrenRes.rows[0].count) || '0', 10)
        });
      }
    }
    return results;
  } catch (error) {
    console.error('Database error in findParentsByPhone:', error.message);
    throw error;
  }
};

/**
 * Find parent auth user by ID
 */
const findParentById = async (parentId, schoolId) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.school_id, u.name, u.email, r.name AS role
       FROM users u
       INNER JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1 AND u.school_id = $2 AND r.name = 'PARENT'
       LIMIT 1`,
      [parentId, schoolId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Database error in findParentById:', error.message);
    throw error;
  }
};

module.exports = { findUserByEmail, blacklistToken, cleanupExpiredTokens, findTeachersByPhone, findTeacherById, findParentsByPhone, findParentById };
