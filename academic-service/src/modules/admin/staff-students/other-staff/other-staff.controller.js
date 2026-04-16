const otherStaffService = require('./other-staff.service');
const fileStorageUtil = require('../../../../utils/fileStorage.util');

// GET all other staff
const getAllOtherStaff = async (req, res, next) => {
  try {
    const schoolId = req.user.school_id;
    const filters = {
      employment_status: req.query.employment_status,
      staff_role_id: req.query.staff_role_id,
      staff_dept_id: req.query.staff_dept_id,
      limit: req.query.limit ? parseInt(req.query.limit, 10) : null,
      offset: req.query.offset ? parseInt(req.query.offset, 10) : null
    };

    const result = await otherStaffService.getAllOtherStaff(schoolId, filters);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// GET other staff by ID
const getOtherStaffById = async (req, res, next) => {
  try {
    const schoolId = req.user.school_id;
    const { staffId } = req.params;

    if (!staffId) {
      const error = new Error('Staff ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await otherStaffService.getOtherStaffById(schoolId, staffId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// POST create new other staff
const createOtherStaff = async (req, res, next) => {
  try {
    const schoolId = req.user.school_id;
    const staffData = req.body;

    console.log('📝 Files received:', req.files ? Object.keys(req.files) : 'NO FILES');
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        console.log(`  - ${key}: ${(req.files[key][0] && req.files[key][0].filename) || 'no filename'}, path: ${(req.files[key][0] && req.files[key][0].path) || 'no path'}`);
      });
    }

    // Trim string fields to remove whitespace from FormData
    ['employment_type', 'gender'].forEach(field => {
      if (staffData[field] && typeof staffData[field] === 'string') {
        staffData[field] = staffData[field].trim();
      }
    });

    // Auto-fill permanent address from current address if is_permanent_same is true
    if (staffData.is_permanent_same === true || staffData.is_permanent_same === 'true') {
      staffData.permanent_street = staffData.current_street;
      staffData.permanent_city = staffData.current_city;
      staffData.permanent_state = staffData.current_state;
      staffData.permanent_pincode = staffData.current_pincode;
    }

    // Force-set employment status to Active (ignore user input)
    staffData.other_staff_employment_status = 'Active';

    // Handle file uploads - save to database and get file URLs
    if (req.files) {
      const fileFields = [
        'staff_photo',
        'adhar_document',
        'pan_card',
        'education_certificate'
      ];

      for (const field of fileFields) {
        if (req.files[field] && req.files[field][0]) {
          const fileId = await fileStorageUtil.saveFileToDB(
            req.files[field][0],
            schoolId,
            field
          );
          const protocol = req.protocol || 'https';
          const host = req.get('host');
          staffData[field] = `${protocol}://${host}/api/v1/academic/files/${fileId}`;
        }
      }
    } else {
      console.warn('⚠️ No files attached to request');
    }

    const result = await otherStaffService.createOtherStaff(schoolId, staffData);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

// PUT update other staff
const updateOtherStaff = async (req, res, next) => {
  try {
    const schoolId = req.user.school_id;
    const { staffId } = req.params;
    const updateData = req.body;

    // Trim string fields to remove whitespace from FormData
    ['employment_type', 'gender', 'other_staff_employment_status'].forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        updateData[field] = updateData[field].trim();
      }
    });

    // Auto-fill permanent address from current address if is_permanent_same is true
    if (updateData.is_permanent_same === true || updateData.is_permanent_same === 'true') {
      updateData.permanent_street = updateData.current_street;
      updateData.permanent_city = updateData.current_city;
      updateData.permanent_state = updateData.current_state;
      updateData.permanent_pincode = updateData.current_pincode;
    }

    if (!staffId) {
      const error = new Error('Staff ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Handle file uploads - save to database and get file URLs
    if (req.files) {
      const fileFields = [
        'staff_photo',
        'adhar_document',
        'pan_card',
        'education_certificate'
      ];

      const protocol = req.protocol || 'https';
      const host = req.get('host');

      for (const field of fileFields) {
        if (req.files[field] && req.files[field][0]) {
          const fileId = await fileStorageUtil.saveFileToDB(
            req.files[field][0],
            schoolId,
            field
          );
          updateData[field] = `${protocol}://${host}/api/v1/academic/files/${fileId}`;
        }
      }
    }

    const result = await otherStaffService.updateOtherStaff(schoolId, staffId, updateData);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// DELETE other staff
const deleteOtherStaff = async (req, res, next) => {
  try {
    const schoolId = req.user.school_id;
    const { staffId } = req.params;

    if (!staffId) {
      const error = new Error('Staff ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await otherStaffService.deleteOtherStaff(schoolId, staffId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllOtherStaff,
  getOtherStaffById,
  createOtherStaff,
  updateOtherStaff,
  deleteOtherStaff
};
