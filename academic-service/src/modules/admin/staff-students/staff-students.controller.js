const staffStudentsService = require('./staff-students.service');

// Get all approved students
const getAllApprovedStudents = async (req, res, next) => {
  try {
    const schoolId = req.user.school_id;
    const { classId, section, rollNumber, limit, offset } = req.query;

    const filters = {};
    if (classId) filters.classId = classId;
    if (section) filters.section = section;
    if (rollNumber) filters.rollNumber = rollNumber;
    if (limit) filters.limit = parseInt(limit, 10);
    if (offset) filters.offset = parseInt(offset, 10);

    const result = await staffStudentsService.getAllApprovedStudents(schoolId, filters);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// Get approved student by roll number
const getApprovedStudentByRollNumber = async (req, res, next) => {
  try {
    const schoolId = req.user.school_id;
    const { classId, rollNumber } = req.params;

    if (!classId || !rollNumber) {
      const error = new Error('classId and rollNumber are required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await staffStudentsService.getApprovedStudentByRollNumber(
      schoolId,
      classId,
      rollNumber
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// Get approved students by class and section
const getApprovedStudentsByClassAndSection = async (req, res, next) => {
  try {
    const schoolId = req.user.school_id;
    const { classId, section } = req.params;

    if (!classId || !section) {
      const error = new Error('classId and section are required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await staffStudentsService.getApprovedStudentsByClassAndSection(
      schoolId,
      classId,
      section
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// Update approved student by student ID
const updateApprovedStudent = async (req, res, next) => {
  try {
    const schoolId = req.user.school_id;
    const { studentId } = req.params;
    const updateData = req.body;

    if (!studentId) {
      const error = new Error('studentId is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await staffStudentsService.updateApprovedStudent(
      schoolId,
      studentId,
      updateData
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllApprovedStudents,
  getApprovedStudentByRollNumber,
  getApprovedStudentsByClassAndSection,
  updateApprovedStudent
};
