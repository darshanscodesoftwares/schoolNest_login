const teacherService = require('./teacher-records.service');

// GET all teachers
const getAllTeachers = async (req, res, next) => {
  try {
    const schoolId = req.user.school_id;
    const filters = {
      designation: req.query.designation,
      department_id: req.query.department_id,
      employment_status: req.query.employment_status,
      limit: req.query.limit ? parseInt(req.query.limit, 10) : null,
      offset: req.query.offset ? parseInt(req.query.offset, 10) : null
    };

    const result = await teacherService.getAllTeachers(schoolId, filters);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// GET teacher by ID
const getTeacherById = async (req, res, next) => {
  try {
    const schoolId = req.user.school_id;
    const { teacherId } = req.params;

    if (!teacherId) {
      const error = new Error('Teacher ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await teacherService.getTeacherById(schoolId, teacherId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// Helper function to convert absolute path to relative URL
const getFileUrl = (absolutePath) => {
  if (!absolutePath) return null;
  const uploadsIndex = absolutePath.indexOf('/uploads/');
  if (uploadsIndex === -1) return absolutePath;
  return absolutePath.substring(uploadsIndex);
};

// POST create new teacher
const createTeacher = async (req, res, next) => {
  try {
    const schoolId = req.user.school_id;
    const teacherData = req.body;

    // Parse class_ids if it comes as a JSON string from FormData
    if (teacherData.class_ids && typeof teacherData.class_ids === 'string') {
      try {
        teacherData.class_ids = JSON.parse(teacherData.class_ids);
      } catch (e) {
        // If parsing fails, initialize as empty array
        teacherData.class_ids = [];
      }
    }

    // Handle file uploads - map file paths to teacherData
    if (req.files) {
      if (req.files.teacher_photo && req.files.teacher_photo[0]) {
        teacherData.teacher_photo = getFileUrl(req.files.teacher_photo[0].path);
      }
      if (req.files.resume_cv && req.files.resume_cv[0]) {
        teacherData.resume_cv = getFileUrl(req.files.resume_cv[0].path);
      }
      if (req.files.qualification_certificates && req.files.qualification_certificates[0]) {
        teacherData.qualification_certificates = getFileUrl(req.files.qualification_certificates[0].path);
      }
      if (req.files.experience_certificates && req.files.experience_certificates[0]) {
        teacherData.experience_certificates = getFileUrl(req.files.experience_certificates[0].path);
      }
      if (req.files.aadhar_card && req.files.aadhar_card[0]) {
        teacherData.aadhar_card = getFileUrl(req.files.aadhar_card[0].path);
      }
      if (req.files.pan_card && req.files.pan_card[0]) {
        teacherData.pan_card = getFileUrl(req.files.pan_card[0].path);
      }
    }

    const result = await teacherService.createTeacher(schoolId, teacherData);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

// PUT update teacher
const updateTeacher = async (req, res, next) => {
  try {
    const schoolId = req.user.school_id;
    const { teacherId } = req.params;
    const updateData = req.body;

    if (!teacherId) {
      const error = new Error('Teacher ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Parse class_ids if it comes as a JSON string from FormData
    if (updateData.class_ids && typeof updateData.class_ids === 'string') {
      try {
        updateData.class_ids = JSON.parse(updateData.class_ids);
      } catch (e) {
        // If parsing fails, initialize as empty array
        updateData.class_ids = [];
      }
    }

    // Handle file uploads - map file paths to updateData
    if (req.files) {
      if (req.files.teacher_photo && req.files.teacher_photo[0]) {
        updateData.teacher_photo = getFileUrl(req.files.teacher_photo[0].path);
      }
      if (req.files.resume_cv && req.files.resume_cv[0]) {
        updateData.resume_cv = getFileUrl(req.files.resume_cv[0].path);
      }
      if (req.files.qualification_certificates && req.files.qualification_certificates[0]) {
        updateData.qualification_certificates = getFileUrl(req.files.qualification_certificates[0].path);
      }
      if (req.files.experience_certificates && req.files.experience_certificates[0]) {
        updateData.experience_certificates = getFileUrl(req.files.experience_certificates[0].path);
      }
      if (req.files.aadhar_card && req.files.aadhar_card[0]) {
        updateData.aadhar_card = getFileUrl(req.files.aadhar_card[0].path);
      }
      if (req.files.pan_card && req.files.pan_card[0]) {
        updateData.pan_card = getFileUrl(req.files.pan_card[0].path);
      }
    }

    const result = await teacherService.updateTeacher(schoolId, teacherId, updateData);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// DELETE teacher
const deleteTeacher = async (req, res, next) => {
  try {
    const schoolId = req.user.school_id;
    const { teacherId } = req.params;

    if (!teacherId) {
      const error = new Error('Teacher ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await teacherService.deleteTeacher(schoolId, teacherId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher
};
