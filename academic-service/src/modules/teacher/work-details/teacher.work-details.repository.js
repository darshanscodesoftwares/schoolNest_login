const pool = require('../../../config/db');

/**
 * Get teacher's work details
 * Returns: assigned classes, total students, timetable, etc.
 *
 * @param {string} teacher_id - Teacher's ID (UUID)
 * @param {number} school_id - School ID
 * @returns {Object} Teacher work details
 */
const getTeacherWorkDetails = async (teacher_id, school_id) => {
  const query = {
    text: `
      SELECT
        tr.id,
        tr.school_id,
        tr.first_name,
        tr.employee_id,
        tr.designation,
        tr.teacher_photo,
        tr.primary_phone,
        tr.primary_email,
        tr.class_ids,
        tr.department_id,
        tr.date_of_joining,
        tr.highest_qualification,
        tr.specialization
      FROM teacher_records tr
      WHERE tr.id = $1 AND tr.school_id = $2
      LIMIT 1
    `,
    values: [teacher_id, school_id]
  };

  try {
    const result = await pool.query(query);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Database error in getTeacherWorkDetails:', error.message);
    throw error;
  }
};

/**
 * Get teacher's assigned classes with student count
 *
 * @param {string} teacher_id - Teacher's ID (UUID)
 * @param {number} school_id - School ID
 * @returns {Array} Classes assigned to teacher
 */
const getTeacherClasses = async (teacher_id, school_id) => {
  const query = {
    text: `
      SELECT
        c.id,
        c.name,
        c.section,
        c.subject,
        COUNT(s.id)::integer as student_count
      FROM classes c
      LEFT JOIN students s ON s.class_id = c.id AND s.school_id = c.school_id
      WHERE c.school_id = $1
        AND c.id IN (
          SELECT UNNEST(class_ids) FROM teacher_records WHERE id = $2 AND school_id = $1
        )
      GROUP BY c.id, c.name, c.section, c.subject
      ORDER BY c.name
    `,
    values: [school_id, teacher_id]
  };

  try {
    const result = await pool.query(query);
    return result.rows || [];
  } catch (error) {
    console.error('Database error in getTeacherClasses:', error.message);
    // Return empty array if query fails instead of throwing
    return [];
  }
};

/**
 * Get teacher's total work hours per week
 *
 * @param {string} teacher_id - Teacher's ID (UUID)
 * @param {number} school_id - School ID
 * @returns {Number} Total hours
 */
const getTeacherWorkHours = async (teacher_id, school_id) => {
  try {
    // Get all assigned classes
    const classes = await getTeacherClasses(teacher_id, school_id);

    if (!classes || classes.length === 0) {
      return {
        total_hours: 0,
        classes_count: 0,
        students_count: 0
      };
    }

    const total_students = classes.reduce((sum, c) => sum + parseInt(c.student_count || 0), 0);

    return {
      total_hours: classes.length * 5, // Assuming 5 hours per class per week
      classes_count: classes.length,
      students_count: total_students
    };
  } catch (error) {
    console.error('Database error in getTeacherWorkHours:', error.message);
    throw error;
  }
};

module.exports = {
  getTeacherWorkDetails,
  getTeacherClasses,
  getTeacherWorkHours
};
