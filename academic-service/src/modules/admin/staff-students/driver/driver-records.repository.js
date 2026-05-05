const pool = require('../../../../config/db');

// Get all drivers
const getAllDrivers = async (schoolId, filters = {}) => {
  try {
    let query = `
      SELECT *
      FROM drivers_records
      WHERE school_id = $1
    `;

    const params = [schoolId];
    let paramIndex = 1;

    // Optional filters
    if (filters.employment_status) {
      paramIndex++;
      query += ` AND employment_status = $${paramIndex}`;
      params.push(filters.employment_status);
    }

    if (filters.bus_number) {
      paramIndex++;
      query += ` AND bus_number ILIKE $${paramIndex}`;
      params.push(`%${filters.bus_number}%`);
    }

    query += ` ORDER BY created_at DESC`;

    // Add pagination if provided
    if (filters.limit) {
      paramIndex++;
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
    }
    if (filters.offset) {
      paramIndex++;
      query += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get total count of drivers
const getTotalDriversCount = async (schoolId) => {
  try {
    const query = `
      SELECT COUNT(*) as total
      FROM drivers_records
      WHERE school_id = $1
    `;
    const result = await pool.query(query, [schoolId]);
    return parseInt(result.rows[0].total, 10);
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get driver by ID
const getDriverById = async (schoolId, driverId) => {
  try {
    const query = `
      SELECT *
      FROM drivers_records
      WHERE school_id = $1 AND id = $2
    `;
    const result = await pool.query(query, [schoolId, driverId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get driver by license number
const getDriverByLicenseNumber = async (schoolId, licenseNumber) => {
  try {
    const query = `
      SELECT id, license_number, first_name
      FROM drivers_records
      WHERE school_id = $1 AND license_number = $2
      LIMIT 1
    `;
    const result = await pool.query(query, [schoolId, licenseNumber]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get driver by aadhar number
const getDriverByAadharNumber = async (schoolId, aadharNumber) => {
  try {
    const query = `
      SELECT id, aadhar_number, first_name
      FROM drivers_records
      WHERE school_id = $1 AND aadhar_number = $2
      LIMIT 1
    `;
    const result = await pool.query(query, [schoolId, aadharNumber]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get driver by PAN number
const getDriverByPanNumber = async (schoolId, panNumber) => {
  try {
    const query = `
      SELECT id, pan_number, first_name
      FROM drivers_records
      WHERE school_id = $1 AND pan_number = $2
      LIMIT 1
    `;
    const result = await pool.query(query, [schoolId, panNumber]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get driver by email
const getDriverByEmail = async (schoolId, email) => {
  try {
    const query = `
      SELECT id, primary_email, first_name
      FROM drivers_records
      WHERE school_id = $1 AND primary_email = $2
      LIMIT 1
    `;
    const result = await pool.query(query, [schoolId, email]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Create new driver
const createDriver = async (schoolId, driverData) => {
  try {
    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      blood_group_id,
      nationality,
      driver_photo,
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
      license_number,
      license_expiry,
      license_class,
      commercial_license,
      dL_verified,
      bus_number,
      routes,
      assign_date,
      total_experience_years,
      previous_employer,
      previous_route,
      employment_type,
      monthly_salary,
      aadhar_number,
      pan_number,
      bank_name,
      account_number,
      ifsc_code,
      emergency_contact_name,
      emergency_relation,
      emergency_phone,
      license_document,
      aadhar_card,
      police_clearance,
      employment_status
    } = driverData;

    const query = `
      INSERT INTO drivers_records (
        school_id, first_name, last_name, date_of_birth, gender, blood_group_id, nationality,
        driver_photo, primary_phone, primary_email, alternate_phone, alternate_email,
        current_street, current_city, current_state, current_pincode, is_permanent_same,
        permanent_street, permanent_city, permanent_state, permanent_pincode,
        license_number, license_expiry, license_class, commercial_license, dL_verified,
        bus_number, routes, assign_date,
        total_experience_years, previous_employer, previous_route,
        employment_type, monthly_salary, aadhar_number, pan_number, bank_name, account_number, ifsc_code,
        emergency_contact_name, emergency_relation, emergency_phone,
        license_document, aadhar_card, police_clearance, employment_status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38,
        $39, $40, $41, $42, $43, $44, $45, $46
      )
      RETURNING *
    `;

    const values = [
      schoolId, first_name, last_name, date_of_birth, gender, blood_group_id, nationality,
      driver_photo, primary_phone, primary_email, alternate_phone, alternate_email,
      current_street, current_city, current_state, current_pincode, is_permanent_same,
      permanent_street, permanent_city, permanent_state, permanent_pincode,
      license_number, license_expiry, license_class, commercial_license || false, dL_verified || false,
      bus_number, routes, assign_date,
      total_experience_years, previous_employer, previous_route,
      employment_type, monthly_salary, aadhar_number, pan_number, bank_name, account_number, ifsc_code,
      emergency_contact_name, emergency_relation, emergency_phone,
      license_document, aadhar_card, police_clearance, employment_status || 'Active'
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Update driver
const updateDriver = async (schoolId, driverId, updateData) => {
  try {
    // Build dynamic UPDATE query
    const updates = [];
    const values = [schoolId, driverId];
    let paramIndex = 2;

    // Map of field names that can be updated
    const allowedFields = [
      'first_name', 'last_name', 'date_of_birth', 'gender', 'blood_group_id', 'nationality', 'driver_photo',
      'primary_phone', 'primary_email', 'alternate_phone', 'alternate_email',
      'current_street', 'current_city', 'current_state', 'current_pincode', 'is_permanent_same',
      'permanent_street', 'permanent_city', 'permanent_state', 'permanent_pincode',
      'license_number', 'license_expiry', 'license_class', 'commercial_license', 'dL_verified',
      'bus_number', 'routes', 'assign_date',
      'total_experience_years', 'previous_employer', 'previous_route',
      'employment_type', 'monthly_salary', 'aadhar_number', 'pan_number', 'bank_name', 'account_number', 'ifsc_code',
      'emergency_contact_name', 'emergency_relation', 'emergency_phone',
      'license_document', 'aadhar_card', 'police_clearance', 'employment_status'
    ];

    // Add updated_at timestamp
    updates.push(`updated_at = NOW()`);

    // Build parameterized updates
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        paramIndex++;
        updates.push(`${field} = $${paramIndex}`);
        values.push(updateData[field]);
      }
    }

    if (updates.length === 1) {
      // Only updated_at was set, no actual updates
      return await getDriverById(schoolId, driverId);
    }

    const query = `
      UPDATE drivers_records
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

// Delete driver
const deleteDriver = async (schoolId, driverId) => {
  try {
    const query = `
      DELETE FROM drivers_records
      WHERE school_id = $1 AND id = $2
      RETURNING id, driver_id, first_name
    `;
    const result = await pool.query(query, [schoolId, driverId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

module.exports = {
  getAllDrivers,
  getTotalDriversCount,
  getDriverById,
  getDriverByLicenseNumber,
  getDriverByAadharNumber,
  getDriverByPanNumber,
  getDriverByEmail,
  createDriver,
  updateDriver,
  deleteDriver
};
