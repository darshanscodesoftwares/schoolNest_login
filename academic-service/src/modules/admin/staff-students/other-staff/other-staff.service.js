const otherStaffRepository = require('./other-staff.repository');
const pool = require('../../../../config/db');

// Direct DB lookup helpers (replaced HTTP calls to common-api)
const enrichBloodGroupName = async (bloodGroupId) => {
  if (!bloodGroupId) return null;
  try {
    const res = await pool.query(`SELECT blood_group FROM blood_groups WHERE id = $1 LIMIT 1`, [bloodGroupId]);
    return (res.rows[0] && res.rows[0].blood_group) || null;
  } catch { return null; }
};

const enrichStaffRoleName = async (staffRoleId) => {
  if (!staffRoleId) return null;
  try {
    const res = await pool.query(`SELECT role_name FROM staff_roles WHERE id = $1 LIMIT 1`, [staffRoleId]);
    return (res.rows[0] && res.rows[0].role_name) || null;
  } catch { return null; }
};

const enrichStaffDepartmentName = async (staffDeptId) => {
  if (!staffDeptId) return null;
  try {
    const res = await pool.query(`SELECT department_name FROM staff_departments WHERE id = $1 LIMIT 1`, [staffDeptId]);
    return (res.rows[0] && res.rows[0].department_name) || null;
  } catch { return null; }
};

const enrichStaffPositionName = async (positionLevelId) => {
  if (!positionLevelId) return null;
  try {
    const res = await pool.query(`SELECT position_name FROM staff_positions WHERE id = $1 LIMIT 1`, [positionLevelId]);
    return (res.rows[0] && res.rows[0].position_name) || null;
  } catch { return null; }
};

// Helper function to convert absolute paths to full URLs
const convertPathsToUrls = async (staff) => {
  if (!staff) return staff;

  const fileFields = [
    'staff_photo',
    'adhar_document',
    'pan_card',
    'education_certificate'
  ];

  const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
  const converted = { ...staff };

  fileFields.forEach(field => {
    if (converted[field]) {
      const uploadsIndex = converted[field].indexOf('/uploads/');
      if (uploadsIndex !== -1) {
        const relativePath = converted[field].substring(uploadsIndex);
        converted[field] = `${baseUrl}${relativePath}`;
      }
    }
  });

  // Enrich data with names from common-api
  if (converted.blood_group_id) {
    converted.blood_group = await enrichBloodGroupName(converted.blood_group_id);
    delete converted.blood_group_id;
  }

  if (converted.staff_role_id) {
    converted.staff_role_name = await enrichStaffRoleName(converted.staff_role_id);
  }

  if (converted.staff_dept_id) {
    converted.staff_dept_name = await enrichStaffDepartmentName(converted.staff_dept_id);
  }

  if (converted.position_level_id) {
    converted.position_level_name = await enrichStaffPositionName(converted.position_level_id);
  }

  return converted;
};

// Get all other staff
const getAllOtherStaff = async (schoolId, filters = {}) => {
  try {
    const staff = await otherStaffRepository.getAllOtherStaff(schoolId, filters);
    const totalCount = await otherStaffRepository.getTotalOtherStaffCount(schoolId);

    if (!staff || staff.length === 0) {
      return {
        success: true,
        totalOtherStaff: totalCount,
        message: 'No other staff found',
        count: 0,
        data: []
      };
    }

    // Convert paths and enrich data for all staff
    const convertedStaff = await Promise.all(staff.map(convertPathsToUrls));

    return {
      success: true,
      totalOtherStaff: totalCount,
      message: 'Other staff retrieved successfully',
      count: convertedStaff.length,
      data: convertedStaff
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Get other staff by ID
const getOtherStaffById = async (schoolId, staffId) => {
  try {
    const staff = await otherStaffRepository.getOtherStaffById(schoolId, staffId);

    if (!staff) {
      const error = new Error('Other staff not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    const convertedStaff = await convertPathsToUrls(staff);

    return {
      success: true,
      data: convertedStaff,
      message: 'Other staff retrieved successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Create other staff
const createOtherStaff = async (schoolId, staffData) => {
  try {
    // Validate required fields
    if (!staffData.first_name) {
      const error = new Error('Missing required field: first_name');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Validate email if provided
    if (staffData.primary_email) {
      const existingEmail = await otherStaffRepository.getOtherStaffByEmail(schoolId, staffData.primary_email);
      if (existingEmail) {
        const error = new Error('Email already exists for this school');
        error.statusCode = 400;
        error.code = 'DUPLICATE_EMAIL';
        throw error;
      }
    }

    // Validate aadhar if provided
    if (staffData.aadhar_number) {
      const existingAadhar = await otherStaffRepository.getOtherStaffByAadhar(schoolId, staffData.aadhar_number);
      if (existingAadhar) {
        const error = new Error('Aadhar number already exists for this school');
        error.statusCode = 400;
        error.code = 'DUPLICATE_AADHAR';
        throw error;
      }
    }

    // Validate PAN if provided
    if (staffData.pan_number) {
      const existingPan = await otherStaffRepository.getOtherStaffByPan(schoolId, staffData.pan_number);
      if (existingPan) {
        const error = new Error('PAN number already exists for this school');
        error.statusCode = 400;
        error.code = 'DUPLICATE_PAN';
        throw error;
      }
    }

    // Validate employment_type
    if (staffData.employment_type && !['Permanent', 'Contractual', 'Temporary'].includes(staffData.employment_type)) {
      const error = new Error('Invalid employment_type. Must be one of: Permanent, Contractual, Temporary');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Validate gender
    if (staffData.gender && !['Male', 'Female', 'Other'].includes(staffData.gender)) {
      const error = new Error('Invalid gender. Must be one of: Male, Female, Other');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Auto-fill permanent address if is_permanent_same is true
    if (staffData.is_permanent_same === true || staffData.is_permanent_same === 'true') {
      staffData.permanent_street = staffData.current_street;
      staffData.permanent_city = staffData.current_city;
      staffData.permanent_state = staffData.current_state;
      staffData.permanent_pincode = staffData.current_pincode;
    }

    // Force-set employment status to Active (ignore user input)
    staffData.other_staff_employment_status = 'Active';

    const newStaff = await otherStaffRepository.createOtherStaff(schoolId, staffData);
    const convertedStaff = await convertPathsToUrls(newStaff);

    return {
      success: true,
      data: convertedStaff,
      message: 'Other staff created successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Update other staff
const updateOtherStaff = async (schoolId, staffId, updateData) => {
  try {
    // Validate employment_type if provided
    if (updateData.employment_type && !['Permanent', 'Contractual', 'Temporary'].includes(updateData.employment_type)) {
      const error = new Error('Invalid employment_type. Must be one of: Permanent, Contractual, Temporary');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Validate gender if provided
    if (updateData.gender && !['Male', 'Female', 'Other'].includes(updateData.gender)) {
      const error = new Error('Invalid gender. Must be one of: Male, Female, Other');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Auto-fill permanent address if is_permanent_same is true
    if (updateData.is_permanent_same === true || updateData.is_permanent_same === 'true') {
      updateData.permanent_street = updateData.current_street;
      updateData.permanent_city = updateData.current_city;
      updateData.permanent_state = updateData.current_state;
      updateData.permanent_pincode = updateData.current_pincode;
    }

    const updatedStaff = await otherStaffRepository.updateOtherStaff(schoolId, staffId, updateData);

    if (!updatedStaff) {
      const error = new Error('Other staff not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    const convertedStaff = await convertPathsToUrls(updatedStaff);

    return {
      success: true,
      data: convertedStaff,
      message: 'Other staff updated successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Delete other staff
const deleteOtherStaff = async (schoolId, staffId) => {
  try {
    const deletedStaff = await otherStaffRepository.deleteOtherStaff(schoolId, staffId);

    if (!deletedStaff) {
      const error = new Error('Other staff not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return {
      success: true,
      data: deletedStaff,
      message: 'Other staff deleted successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

module.exports = {
  getAllOtherStaff,
  getOtherStaffById,
  createOtherStaff,
  updateOtherStaff,
  deleteOtherStaff
};
