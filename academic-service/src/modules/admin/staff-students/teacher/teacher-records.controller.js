const teacherService = require('./teacher-records.service');
const fileStorageUtil = require('../../../../utils/fileStorage.util');

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

    // Handle file uploads - save to database and get file URLs
    if (req.files) {
      const fileFields = [
        'teacher_photo',
        'resume_cv',
        'qualification_certificates',
        'experience_certificates',
        'aadhar_card',
        'pan_card'
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
          teacherData[field] = `${protocol}://${host}/api/v1/academic/files/${fileId}`;
        }
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

    // Handle file uploads - save to database and get file URLs
    if (req.files) {
      const fileFields = [
        'teacher_photo',
        'resume_cv',
        'qualification_certificates',
        'experience_certificates',
        'aadhar_card',
        'pan_card'
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
