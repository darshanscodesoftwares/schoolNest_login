const otherStaffService = require('./other-staff.service');

// Helper function to convert absolute path to relative URL
const getFileUrl = (absolutePath) => {
  if (!absolutePath) return null;
  const uploadsIndex = absolutePath.indexOf('/uploads/');
  if (uploadsIndex === -1) return absolutePath;
  return absolutePath.substring(uploadsIndex);
};

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

    // Handle file uploads
    if (req.files) {
      if (req.files.staff_photo && req.files.staff_photo[0]) {
        staffData.staff_photo = getFileUrl(req.files.staff_photo[0].path);
      }
      if (req.files.adhar_document && req.files.adhar_document[0]) {
        staffData.adhar_document = getFileUrl(req.files.adhar_document[0].path);
      }
      if (req.files.pan_card && req.files.pan_card[0]) {
        staffData.pan_card = getFileUrl(req.files.pan_card[0].path);
      }
      if (req.files.education_certificate && req.files.education_certificate[0]) {
        staffData.education_certificate = getFileUrl(req.files.education_certificate[0].path);
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

    // Handle file uploads
    if (req.files) {
      if (req.files.staff_photo && req.files.staff_photo[0]) {
        updateData.staff_photo = getFileUrl(req.files.staff_photo[0].path);
      }
      if (req.files.adhar_document && req.files.adhar_document[0]) {
        updateData.adhar_document = getFileUrl(req.files.adhar_document[0].path);
      }
      if (req.files.pan_card && req.files.pan_card[0]) {
        updateData.pan_card = getFileUrl(req.files.pan_card[0].path);
      }
      if (req.files.education_certificate && req.files.education_certificate[0]) {
        updateData.education_certificate = getFileUrl(req.files.education_certificate[0].path);
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
