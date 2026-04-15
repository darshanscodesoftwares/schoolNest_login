const pool = require('../../../config/db');

/**
 * Get all edit requests for school (with optional filters)
 */
const getAllEditRequests = async ({ school_id, teacher_id, status, from_date, to_date, limit, offset }) => {
  let queryText = `
    SELECT
      ter.id,
      ter.school_id,
      ter.teacher_id,
      ter.changed_fields,
      ter.reason,
      ter.status,
      ter.created_at,
      ter.updated_at,
      tr.first_name,
      tr.employee_id,
      tr.designation
    FROM teacher_edit_requests ter
    JOIN teacher_records tr ON ter.teacher_id = tr.id
    WHERE ter.school_id = $1
  `;

  const values = [school_id];
  let paramCount = 1;

  // Apply filters
  if (teacher_id) {
    paramCount++;
    queryText += ` AND ter.teacher_id = $${paramCount}`;
    values.push(teacher_id);
  }

  if (status) {
    paramCount++;
    queryText += ` AND ter.status = $${paramCount}`;
    values.push(status.toUpperCase());
  }

  if (from_date) {
    paramCount++;
    queryText += ` AND ter.created_at >= $${paramCount}`;
    values.push(from_date);
  }

  if (to_date) {
    paramCount++;
    queryText += ` AND ter.created_at <= $${paramCount}`;
    values.push(to_date);
  }

  queryText += ' ORDER BY created_at DESC';

  // Apply pagination
  if (limit) {
    paramCount++;
    queryText += ` LIMIT $${paramCount}`;
    values.push(limit);
  }

  if (offset) {
    paramCount++;
    queryText += ` OFFSET $${paramCount}`;
    values.push(offset);
  }

  const { rows } = await pool.query({ text: queryText, values });
  return rows;
};

/**
 * Get single edit request by ID
 */
const getEditRequestById = async ({ school_id, request_id }) => {
  const query = {
    text: `
      SELECT
        ter.id,
        ter.school_id,
        ter.teacher_id,
        ter.changed_fields,
        ter.reason,
        ter.status,
        ter.created_at,
        ter.updated_at,
        tr.first_name,
        tr.employee_id,
        tr.designation
      FROM teacher_edit_requests ter
      JOIN teacher_records tr ON ter.teacher_id = tr.id
      WHERE ter.id = $1 AND ter.school_id = $2
      LIMIT 1
    `,
    values: [request_id, school_id]
  };

  const { rows } = await pool.query(query);
  return rows[0] || null;
};

/**
 * Approve edit request
 * When admin clicks approve: 1) Get the request, 2) Apply changes to teacher_records, 3) Update status to APPROVED
 */
const approveEditRequest = async ({ school_id, request_id, admin_notes }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get the edit request with changed_fields
    const getRequestQuery = {
      text: `
        SELECT id, teacher_id, changed_fields, status
        FROM teacher_edit_requests
        WHERE id = $1 AND school_id = $2
      `,
      values: [request_id, school_id]
    };
    const requestResult = await client.query(getRequestQuery);
    const editRequest = requestResult.rows[0];

    if (!editRequest) {
      throw new Error('Edit request not found');
    }

    // 2. Apply changed_fields to teacher_records
    const changedFields = editRequest.changed_fields;
    if (changedFields && Object.keys(changedFields).length > 0) {
      const fieldNames = Object.keys(changedFields);
      const fieldValues = Object.values(changedFields);

      // Build dynamic UPDATE query
      const setClause = fieldNames
        .map((field, idx) => `${field} = $${idx + 3}`)
        .join(', ');

      const updateTeacherQuery = {
        text: `
          UPDATE teacher_records
          SET ${setClause}, updated_at = NOW()
          WHERE id = $1 AND school_id = $2
        `,
        values: [editRequest.teacher_id, school_id, ...fieldValues]
      };

      await client.query(updateTeacherQuery);
    }

    // 3. Update edit request status to APPROVED with admin_notes
    const updateRequestQuery = {
      text: `
        UPDATE teacher_edit_requests
        SET status = 'APPROVED', admin_notes = $3, updated_at = NOW()
        WHERE id = $1 AND school_id = $2
        RETURNING id, school_id, teacher_id, changed_fields, status, admin_notes, created_at, updated_at
      `,
      values: [request_id, school_id, admin_notes]
    };

    const approveResult = await client.query(updateRequestQuery);

    // Fetch teacher details
    const teacherQuery = {
      text: `
        SELECT first_name, employee_id, designation
        FROM teacher_records
        WHERE id = $1 AND school_id = $2
      `,
      values: [editRequest.teacher_id, school_id]
    };
    const teacherResult = await client.query(teacherQuery);
    const teacher = teacherResult.rows[0];

    await client.query('COMMIT');

    // Combine edit request with teacher details
    return { ...approveResult.rows[0], ...teacher };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Reject edit request (update status to REJECTED)
 * When admin clicks reject, the status is updated to REJECTED with rejection_reason
 */
const rejectEditRequest = async ({ school_id, request_id, rejection_reason }) => {
  const query = {
    text: `
      UPDATE teacher_edit_requests
      SET status = 'REJECTED', rejection_reason = $3, updated_at = NOW()
      WHERE id = $1 AND school_id = $2
      RETURNING
        id,
        school_id,
        teacher_id,
        status,
        rejection_reason,
        created_at,
        updated_at
    `,
    values: [request_id, school_id, rejection_reason]
  };

  const { rows } = await pool.query(query);
  return rows[0] || null;
};

/**
 * Get edit request statistics (counts for all statuses)
 */
const getEditRequestStats = async ({ school_id }) => {
  const query = {
    text: `
      SELECT
        COUNT(*) FILTER (WHERE status = 'PENDING') as pending_count,
        COUNT(*) FILTER (WHERE status = 'APPROVED') as approved_count,
        COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected_count,
        COUNT(*) as total_count
      FROM teacher_edit_requests
      WHERE school_id = $1
    `,
    values: [school_id]
  };

  const { rows } = await pool.query(query);
  const stats = rows[0];

  return {
    pending: parseInt(stats.pending_count, 10),
    approved: parseInt(stats.approved_count, 10),
    rejected: parseInt(stats.rejected_count, 10),
    total: parseInt(stats.total_count, 10)
  };
};

module.exports = {
  getAllEditRequests,
  getEditRequestById,
  approveEditRequest,
  rejectEditRequest,
  getEditRequestStats
};
