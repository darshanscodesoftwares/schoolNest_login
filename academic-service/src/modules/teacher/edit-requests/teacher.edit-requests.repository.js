const pool = require('../../../config/db');

/**
 * Create new edit request with changed fields
 */
const createEditRequest = async ({ school_id, teacher_id, changed_fields }) => {
  const query = {
    text: `
      INSERT INTO teacher_edit_requests (school_id, teacher_id, changed_fields, status)
      VALUES ($1, $2, $3, 'PENDING')
      RETURNING
        id,
        school_id,
        teacher_id,
        changed_fields,
        status,
        created_at,
        updated_at
    `,
    values: [school_id, teacher_id, JSON.stringify(changed_fields)]
  };

  const { rows } = await pool.query(query);
  return rows[0];
};

/**
 * Get teacher's own edit requests
 */
const getTeacherEditRequests = async ({ school_id, teacher_id }) => {
  const query = {
    text: `
      SELECT
        id,
        school_id,
        teacher_id,
        changed_fields,
        status,
        created_at,
        updated_at
      FROM teacher_edit_requests
      WHERE school_id = $1 AND teacher_id = $2
      ORDER BY created_at DESC
    `,
    values: [school_id, teacher_id]
  };

  const { rows } = await pool.query(query);
  return rows;
};

/**
 * Get single edit request by ID (teacher can only see their own)
 */
const getEditRequestById = async ({ school_id, teacher_id, request_id }) => {
  const query = {
    text: `
      SELECT
        id,
        school_id,
        teacher_id,
        changed_fields,
        status,
        created_at,
        updated_at
      FROM teacher_edit_requests
      WHERE id = $1 AND school_id = $2 AND teacher_id = $3
      LIMIT 1
    `,
    values: [request_id, school_id, teacher_id]
  };

  const { rows } = await pool.query(query);
  return rows[0] || null;
};

/**
 * Cancel pending edit request (teacher can cancel anytime)
 */
const cancelEditRequest = async ({ school_id, teacher_id, request_id }) => {
  const query = {
    text: `
      DELETE FROM teacher_edit_requests
      WHERE id = $1 AND school_id = $2 AND teacher_id = $3
      RETURNING
        id,
        teacher_id
    `,
    values: [request_id, school_id, teacher_id]
  };

  const { rows } = await pool.query(query);
  return rows[0] || null;
};

/**
 * Count pending requests for a teacher
 */
const countPendingRequests = async ({ school_id, teacher_id }) => {
  const query = {
    text: `
      SELECT COUNT(*) as count
      FROM teacher_edit_requests
      WHERE school_id = $1 AND teacher_id = $2 AND status = 'PENDING'
    `,
    values: [school_id, teacher_id]
  };

  const { rows } = await pool.query(query);
  return parseInt(rows[0].count, 10);
};

/**
 * Get the latest active edit request (PENDING or REJECTED) for a teacher
 * Used by work-details API to show pending edit status in profile response
 */
const getLatestActiveRequest = async ({ school_id, teacher_id }) => {
  const query = {
    text: `
      SELECT id, status, changed_fields, reason, rejection_reason, created_at, updated_at
      FROM teacher_edit_requests
      WHERE teacher_id = $1 AND school_id = $2
        AND status IN ('PENDING', 'REJECTED')
      ORDER BY created_at DESC
      LIMIT 1
    `,
    values: [teacher_id, school_id]
  };

  const { rows } = await pool.query(query);
  return rows[0] || null;
};

module.exports = {
  createEditRequest,
  getTeacherEditRequests,
  getEditRequestById,
  cancelEditRequest,
  countPendingRequests,
  getLatestActiveRequest
};
