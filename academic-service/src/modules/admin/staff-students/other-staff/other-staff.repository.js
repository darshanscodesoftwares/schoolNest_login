const pool = require('../../../../config/db');

// Get all other staff records
const getAllOtherStaff = async (schoolId, filters = {}) => {
  try {
    let query = `
      SELECT *
      FROM otherStaff_records
      WHERE school_id = $1
    `;
    const params = [schoolId];
    let paramIndex = 2;

    // Status filter
    if (filters.employment_status) {
      query += ` AND other_staff_employment_status = $${paramIndex}`;
      params.push(filters.employment_status);
      paramIndex++;
    }

    // Role filter
    if (filters.staff_role_id) {
      query += ` AND staff_role_id = $${paramIndex}`;
      params.push(filters.staff_role_id);
      paramIndex++;
    }

    // Department filter
    if (filters.staff_dept_id) {
      query += ` AND staff_dept_id = $${paramIndex}`;
      params.push(filters.staff_dept_id);
      paramIndex++;
    }

    // Pagination
    query += ` ORDER BY created_at DESC`;
    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }
    if (filters.offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get other staff by ID
const getOtherStaffById = async (schoolId, staffId) => {
  try {
    const query = `
      SELECT *
      FROM otherStaff_records
      WHERE school_id = $1 AND id = $2
    `;
    const result = await pool.query(query, [schoolId, staffId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get total count
const getTotalOtherStaffCount = async (schoolId) => {
  try {
    const query = `
      SELECT COUNT(*) as total
      FROM otherStaff_records
      WHERE school_id = $1
    `;
    const result = await pool.query(query, [schoolId]);
    return parseInt(result.rows[0].total, 10);
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Check if email exists
const getOtherStaffByEmail = async (schoolId, email) => {
  try {
    const query = `
      SELECT id FROM otherStaff_records
      WHERE school_id = $1 AND primary_email = $2
    `;
    const result = await pool.query(query, [schoolId, email]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Check if aadhar exists
const getOtherStaffByAadhar = async (schoolId, aadharNumber) => {
  try {
    const query = `
      SELECT id FROM otherStaff_records
      WHERE school_id = $1 AND aadhar_number = $2
    `;
    const result = await pool.query(query, [schoolId, aadharNumber]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Check if PAN exists
const getOtherStaffByPan = async (schoolId, panNumber) => {
  try {
    const query = `
      SELECT id FROM otherStaff_records
      WHERE school_id = $1 AND pan_number = $2
    `;
    const result = await pool.query(query, [schoolId, panNumber]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Create other staff record
const createOtherStaff = async (schoolId, staffData) => {
  try {
    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      blood_group_id,
      nationality,
      staff_photo,
      primary_phone,
      primary_email,
      alternate_phone,
      alternate_email,
      current_street,
      current_city,
      current_state,
      current_pincode,
      is_permanent_same,
      permanent_street,
      permanent_city,
      permanent_state,
      permanent_pincode,
      staff_role_id,
      staff_dept_id,
      position_level_id,
      employment_type,
      monthly_salary,
      join_date,
      emergency_contact_name,
      emergency_relation,
      emergency_phone,
      aadhar_number,
      pan_number,
      bank_name,
      account_number,
      ifsc_code,
      adhar_document,
      pan_card,
      education_certificate,
      other_staff_employment_status
    } = staffData;

    const query = `
      INSERT INTO otherStaff_records (
        school_id,
        first_name,
        last_name,
        date_of_birth,
        gender,
        blood_group_id,
        nationality,
        staff_photo,
        primary_phone,
        primary_email,
        alternate_phone,
        alternate_email,
        current_street,
        current_city,
        current_state,
        current_pincode,
        is_permanent_same,
        permanent_street,
        permanent_city,
        permanent_state,
        permanent_pincode,
        staff_role_id,
        staff_dept_id,
        position_level_id,
        employment_type,
        monthly_salary,
        join_date,
        emergency_contact_name,
        emergency_relation,
        emergency_phone,
        aadhar_number,
        pan_number,
        bank_name,
        account_number,
        ifsc_code,
        adhar_document,
        pan_card,
        education_certificate,
        other_staff_employment_status
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36, $37, $38, $39
      )
      RETURNING *
    `;

    const result = await pool.query(query, [
      schoolId,
      first_name || null,
      last_name || null,
      date_of_birth || null,
      gender || null,
      blood_group_id || null,
      nationality || null,
      staff_photo || null,
      primary_phone || null,
      primary_email || null,
      alternate_phone || null,
      alternate_email || null,
      current_street || null,
      current_city || null,
      current_state || null,
      current_pincode || null,
      is_permanent_same || false,
      permanent_street || null,
      permanent_city || null,
      permanent_state || null,
      permanent_pincode || null,
      staff_role_id || null,
      staff_dept_id || null,
      position_level_id || null,
      employment_type || null,
      monthly_salary || 0,
      join_date || null,
      emergency_contact_name || null,
      emergency_relation || null,
      emergency_phone || null,
      aadhar_number || null,
      pan_number || null,
      bank_name || null,
      account_number || null,
      ifsc_code || null,
      adhar_document || null,
      pan_card || null,
      education_certificate || null,
      other_staff_employment_status || 'Active'
    ]);

    return result.rows[0];
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Update other staff record
const updateOtherStaff = async (schoolId, staffId, updateData) => {
  try {
    const updates = [];
    const values = [schoolId, staffId];
    let paramIndex = 2;

    const allowedFields = [
      'first_name', 'last_name', 'date_of_birth', 'gender', 'blood_group_id', 'nationality', 'staff_photo',
      'primary_phone', 'primary_email', 'alternate_phone', 'alternate_email',
      'current_street', 'current_city', 'current_state', 'current_pincode',
      'is_permanent_same', 'permanent_street', 'permanent_city', 'permanent_state', 'permanent_pincode',
      'staff_role_id', 'staff_dept_id', 'position_level_id',
      'employment_type', 'monthly_salary', 'join_date',
      'emergency_contact_name', 'emergency_relation', 'emergency_phone',
      'aadhar_number', 'pan_number', 'bank_name', 'account_number', 'ifsc_code',
      'adhar_document', 'pan_card', 'education_certificate', 'other_staff_employment_status'
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        paramIndex++;
        updates.push(`${field} = $${paramIndex}`);
        values.push(updateData[field] || null);
      }
    }

    if (updates.length === 0) {
      return await getOtherStaffById(schoolId, staffId);
    }

    paramIndex++;
    updates.push(`updated_at = NOW()`);
    const query = `
      UPDATE otherStaff_records
      SET ${updates.join(', ')}
      WHERE school_id = $1 AND id = $2
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Delete other staff record
const deleteOtherStaff = async (schoolId, staffId) => {
  try {
    const query = `
      DELETE FROM otherStaff_records
      WHERE school_id = $1 AND id = $2
      RETURNING id, first_name, last_name
    `;
    const result = await pool.query(query, [schoolId, staffId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

module.exports = {
  getAllOtherStaff,
  getOtherStaffById,
  getTotalOtherStaffCount,
  getOtherStaffByEmail,
  getOtherStaffByAadhar,
  getOtherStaffByPan,
  createOtherStaff,
  updateOtherStaff,
  deleteOtherStaff
};
