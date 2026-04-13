const staffStudentsRepository = require('./staff-students.repository');
const pool = require('../../../config/db');

// Direct DB lookup (replaces HTTP call to common-api)
const fetchClassesMap = async (school_id) => {
  try {
    const res = await pool.query(
      `SELECT id, class_name FROM school_classes WHERE school_id = $1 ORDER BY order_number ASC`,
      [school_id]
    );
    const classMap = {};
    res.rows.forEach(row => { classMap[row.id] = row.class_name; });
    return classMap;
  } catch {
    return {};
  }
};

// Helper function to enrich students with class names
const enrichStudentsWithClassNames = async (students, schoolId) => {
  const classMap = await fetchClassesMap(schoolId);

  return students.map(student => ({
    ...student,
    class_name: classMap[student.class_id] || null
  }));
};

// Get all approved students with filtering
const getAllApprovedStudents = async (schoolId, filters = {}) => {
  try {
    const students = await staffStudentsRepository.getApprovedStudents(schoolId, filters);
    const totalCount = await staffStudentsRepository.getTotalApprovedStudentsCount(schoolId);

    if (!students || students.length === 0) {
      return {
        success: true,
        totalApprovedStudents: totalCount,
        message: 'No approved students found',
        count: 0,
        data: []
      };
    }

    // Enrich students with class names from common-api
    const enrichedStudents = await enrichStudentsWithClassNames(students, schoolId);

    return {
      success: true,
      totalApprovedStudents: totalCount,
      message: 'Approved students retrieved successfully',
      count: enrichedStudents.length,
      data: enrichedStudents
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Get approved student by roll number
const getApprovedStudentByRollNumber = async (schoolId, classId, rollNumber) => {
  try {
    const student = await staffStudentsRepository.getApprovedStudentByRollNumber(
      schoolId,
      classId,
      rollNumber
    );

    if (!student) {
      const error = new Error('Approved student not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Enrich student with class name from common-api
    const enrichedStudent = await enrichStudentsWithClassNames([student], schoolId);

    return {
      success: true,
      data: enrichedStudent[0],
      message: 'Approved student retrieved successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Get approved students by class and section
const getApprovedStudentsByClassAndSection = async (schoolId, classId, section) => {
  try {
    const students = await staffStudentsRepository.getApprovedStudentsByClassAndSection(
      schoolId,
      classId,
      section
    );

    if (!students || students.length === 0) {
      return {
        success: true,
        data: [],
        message: 'No approved students found in this class/section',
        count: 0
      };
    }

    // Enrich students with class names from common-api
    const enrichedStudents = await enrichStudentsWithClassNames(students, schoolId);

    return {
      success: true,
      data: enrichedStudents,
      message: 'Approved students retrieved successfully',
      count: enrichedStudents.length
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Update approved student
const updateApprovedStudent = async (schoolId, studentId, updateData) => {
  try {
    // If class_name is provided, convert it to class_id
    let processedData = { ...updateData };

    if (updateData.class_name || updateData.className) {
      const className = updateData.class_name || updateData.className;
      const classMap = await fetchClassesMap(schoolId);

      // Create reverse map: class_name -> class_id
      let classId = null;
      for (const [id, name] of Object.entries(classMap)) {
        if (name === className) {
          classId = id;
          break;
        }
      }

      if (!classId) {
        const error = new Error(`Invalid class name: "${className}". Please provide a valid class name.`);
        error.statusCode = 400;
        error.code = 'INVALID_CLASS';
        throw error;
      }

      // Replace class_name with class_id in processedData
      processedData.class_id = classId;
      delete processedData.class_name;
      delete processedData.className;
    }

    const result = await staffStudentsRepository.updateApprovedStudent(
      schoolId,
      studentId,
      processedData
    );

    if (!result) {
      const error = new Error('Student not found or not approved');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Enrich student with class name from common-api
    const enrichedStudent = await enrichStudentsWithClassNames([result]);

    return {
      success: true,
      data: enrichedStudent[0],
      message: 'Student updated successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

module.exports = {
  getAllApprovedStudents,
  getApprovedStudentByRollNumber,
  getApprovedStudentsByClassAndSection,
  updateApprovedStudent
};
