const workDetailsRepository = require('./teacher.work-details.repository');
const commonPool = require('../../../config/common-db');

const ACADEMIC_SERVICE_BASE_URL = process.env.UPLOAD_BASE_URL || process.env.ACADEMIC_SERVICE_URL || 'http://localhost:4002';

/**
 * Get teacher's complete work details
 * Includes: basic info, assigned classes, student count, work hours
 *
 * @param {string} teacher_id - Teacher ID from JWT token
 * @param {number} school_id - School ID from JWT token
 * @returns {Object} Complete teacher work details
 */
const getMyWorkDetails = async (teacher_id, school_id) => {
  try {
    // Validate inputs
    if (!teacher_id || !school_id) {
      const error = new Error('Teacher ID and School ID are required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Get teacher basic info
    const teacherInfo = await workDetailsRepository.getTeacherWorkDetails(teacher_id, school_id);

    if (!teacherInfo) {
      const error = new Error('Teacher not found');
      error.statusCode = 404;
      error.code = 'TEACHER_NOT_FOUND';
      throw error;
    }

    // Get assigned classes with student count
    const classes = await workDetailsRepository.getTeacherClasses(teacher_id, school_id);

    // Get work hours summary
    const workHours = await workDetailsRepository.getTeacherWorkHours(teacher_id, school_id);

    // Get class_ids from teacher_records (for classes that may not be in classes table yet)
    const classIds = teacherInfo.class_ids || [];

    // Fetch class names from common_db
    let classNamesMap = new Map();
    if (classIds.length > 0) {
      try {
        const query = {
          text: `SELECT id, class_name FROM school_classes WHERE id = ANY($1)`,
          values: [classIds]
        };
        const result = await commonPool.query(query);
        result.rows.forEach(row => {
          classNamesMap.set(row.id, row.class_name);
        });
      } catch (error) {
        console.error('Error fetching class names from common_db:', error.message);
        // Continue without class names if error occurs
      }
    }

    // Fetch department name from common_db if department_id exists
    let departmentName = null;
    if (teacherInfo.department_id) {
      try {
        const query = {
          text: `SELECT department_name FROM departments WHERE id = $1`,
          values: [teacherInfo.department_id]
        };
        const result = await commonPool.query(query);
        if (result.rows.length > 0) {
          departmentName = result.rows[0].department_name;
        }
      } catch (error) {
        console.error('Error fetching department name from common_db:', error.message);
        // Continue without department name if error occurs
      }
    }

    // Map class_ids to class objects (combine with DB classes if they exist)
    const classesMap = new Map();

    // First add classes from database
    classes.forEach(cls => {
      classesMap.set(cls.id, {
        id: cls.id,
        name: cls.name,
        section: cls.section,
        subject: cls.subject,
        student_count: parseInt(cls.student_count || 0)
      });
    });

    // Then add class IDs from teacher_records with names from common_db
    classIds.forEach(classId => {
      if (!classesMap.has(classId)) {
        const className = classNamesMap.get(classId) || `Class ${classId}`;
        classesMap.set(classId, {
          id: classId,
          name: className,
          student_count: 0
        });
      }
    });

    // Build full photo URL if photo exists
    let photoUrl = null;
    if (teacherInfo.teacher_photo) {
      photoUrl = `${ACADEMIC_SERVICE_BASE_URL}${teacherInfo.teacher_photo}`;
    }

    return {
      teacher: {
        id: teacherInfo.id,
        school_id: teacherInfo.school_id,
        name: teacherInfo.first_name,
        employee_id: teacherInfo.employee_id,
        designation: teacherInfo.designation,
        email: teacherInfo.primary_email,
        phone: teacherInfo.primary_phone,
        photo: photoUrl,
        qualification: teacherInfo.highest_qualification,
        specialization: teacherInfo.specialization,
        department: departmentName || 'N/A',
        date_of_joining: teacherInfo.date_of_joining,
        classes: Array.from(classesMap.values())
      },
      work_summary: {
        total_classes: classesMap.size,
        total_students: workHours.students_count,
        hours_per_week: workHours.total_hours
      }
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw {
      message: error.message,
      statusCode: 500,
      code: 'WORK_DETAILS_ERROR'
    };
  }
};

module.exports = { getMyWorkDetails };
