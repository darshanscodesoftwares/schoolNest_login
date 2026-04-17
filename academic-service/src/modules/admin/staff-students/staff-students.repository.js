const pool = require('../../../config/db');

// Get all approved students with specific fields for staff
const getApprovedStudents = async (schoolId, filters = {}) => {
  try {
    let query = `
      SELECT DISTINCT ON (sa.id)
        pi.student_id,
        ai.roll_number,
        pi.first_name,
        pi.last_name,
        ai.class_id,
        ai.section,
        pg.father_full_name,
        pg.father_phone,
        ci.student_email,
        sa.admission_status,
        ai.admission_number
      FROM students_admission sa
      LEFT JOIN personal_information pi ON sa.id = pi.student_id
      LEFT JOIN academic_information ai ON sa.id = ai.student_id
      LEFT JOIN parent_guardian_information pg ON sa.id = pg.student_id
      LEFT JOIN contact_information ci ON sa.id = ci.student_id
      WHERE sa.school_id = $1 AND sa.admission_status = 'Approved'
      AND pi.student_id IS NOT NULL
    `;

    const params = [schoolId];
    let paramIndex = 1;

    // Optional filters
    if (filters.classId) {
      paramIndex++;
      query += ` AND ai.class_id = $${paramIndex}::uuid`;
      params.push(filters.classId);
    }

    if (filters.section) {
      paramIndex++;
      query += ` AND ai.section = $${paramIndex}`;
      params.push(filters.section);
    }

    if (filters.rollNumber) {
      paramIndex++;
      query += ` AND ai.roll_number = $${paramIndex}`;
      params.push(filters.rollNumber);
    }

    // Text search filters (partial match)
    if (filters.studentName) {
      paramIndex++;
      const searchPattern = `%${filters.studentName}%`;
      query += ` AND (pi.first_name ILIKE $${paramIndex} OR pi.last_name ILIKE $${paramIndex})`;
      params.push(searchPattern);
    }

    if (filters.className) {
      paramIndex++;
      query += ` AND (SELECT class_name FROM school_classes WHERE id = ai.class_id) ILIKE $${paramIndex}`;
      params.push(`%${filters.className}%`);
    }

    if (filters.rollNo) {
      paramIndex++;
      query += ` AND ai.roll_number ILIKE $${paramIndex}`;
      params.push(`%${filters.rollNo}%`);
    }

    if (filters.parentGuardian) {
      paramIndex++;
      query += ` AND pg.father_full_name ILIKE $${paramIndex}`;
      params.push(`%${filters.parentGuardian}%`);
    }

    query += ` ORDER BY sa.id, sa.created_at ASC`;

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
    console.error('❌ Error fetching approved students:', error);
    throw error;
  }
};

// Get approved student by roll number
const getApprovedStudentByRollNumber = async (schoolId, classId, rollNumber) => {
  try {
    const query = `
      SELECT
        pi.student_id,
        ai.roll_number,
        pi.first_name,
        pi.last_name,
        ai.class_id,
        ai.section,
        pg.father_full_name,
        pg.father_phone,
        ci.student_email,
        sa.admission_status,
        ai.admission_number
      FROM students_admission sa
      LEFT JOIN personal_information pi ON sa.id = pi.student_id
      LEFT JOIN academic_information ai ON sa.id = ai.student_id
      LEFT JOIN parent_guardian_information pg ON sa.id = pg.student_id
      LEFT JOIN contact_information ci ON sa.id = ci.student_id
      WHERE sa.school_id = $1
        AND sa.admission_status = 'Approved'
        AND ai.class_id = $2::uuid
        AND ai.roll_number = $3
      LIMIT 1
    `;

    const result = await pool.query(query, [schoolId, classId, rollNumber]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Error fetching approved student:', error);
    throw error;
  }
};

// Get approved students by class and section
const getApprovedStudentsByClassAndSection = async (schoolId, classId, section) => {
  try {
    const query = `
      SELECT
        pi.student_id,
        ai.roll_number,
        pi.first_name,
        pi.last_name,
        ai.class_id,
        ai.section,
        pg.father_full_name,
        pg.father_phone,
        ci.student_email,
        sa.admission_status,
        ai.admission_number
      FROM students_admission sa
      LEFT JOIN personal_information pi ON sa.id = pi.student_id
      LEFT JOIN academic_information ai ON sa.id = ai.student_id
      LEFT JOIN parent_guardian_information pg ON sa.id = pg.student_id
      LEFT JOIN contact_information ci ON sa.id = ci.student_id
      WHERE sa.school_id = $1
        AND sa.admission_status = 'Approved'
        AND ai.class_id = $2::uuid
        AND ai.section = $3
      ORDER BY ai.roll_number ASC
    `;

    const result = await pool.query(query, [schoolId, classId, section]);
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching approved students by class/section:', error);
    throw error;
  }
};

// Get total count of approved students
const getTotalApprovedStudentsCount = async (schoolId) => {
  try {
    const query = `
      SELECT COUNT(DISTINCT sa.id) as total
      FROM students_admission sa
      LEFT JOIN personal_information pi ON sa.id = pi.student_id
      WHERE sa.school_id = $1 AND sa.admission_status = 'Approved'
      AND pi.student_id IS NOT NULL
    `;

    const result = await pool.query(query, [schoolId]);
    return parseInt(result.rows[0].total, 10);
  } catch (error) {
    console.error('❌ Error fetching approved students count:', error);
    throw error;
  }
};

// Update approved student information
const updateApprovedStudent = async (schoolId, studentId, updateData) => {
  try {
    // Validate required parameters
    if (!studentId || !schoolId) {
      throw new Error(`Invalid parameters: studentId=${studentId}, schoolId=${schoolId}`);
    }

    // Updatable fields mapping
    const updatableFields = {
      first_name: updateData.first_name || updateData.firstName,
      last_name: updateData.last_name || updateData.lastName,
      student_email: updateData.student_email || updateData.studentEmail,
      father_full_name: updateData.father_full_name || updateData.fatherFullName,
      father_phone: updateData.father_phone || updateData.fatherPhone,
      roll_number: updateData.roll_number || updateData.rollNumber,
      section: updateData.section,
      class_id: updateData.class_id || updateData.classId
    };

    // Convert undefined to null for comparison
    Object.keys(updatableFields).forEach(key => {
      if (updatableFields[key] === undefined) {
        delete updatableFields[key];
      }
    });

    // Update personal_information
    if ('first_name' in updatableFields || 'last_name' in updatableFields) {
      const personalUpdates = [];
      const personalValues = [studentId, schoolId];
      let personalParamCount = 2;

      if ('first_name' in updatableFields) {
        personalParamCount++;
        personalUpdates.push(`first_name = $${personalParamCount}`);
        personalValues.push(updatableFields.first_name);
      }
      if ('last_name' in updatableFields) {
        personalParamCount++;
        personalUpdates.push(`last_name = $${personalParamCount}`);
        personalValues.push(updatableFields.last_name);
      }
      if (personalUpdates.length > 0) {
        await pool.query(
          `UPDATE personal_information SET ${personalUpdates.join(', ')}, updated_at = NOW() WHERE student_id = $1 AND school_id = $2`,
          personalValues
        );
      }
    }

    // Update contact_information
    if ('student_email' in updatableFields) {
      await pool.query(
        `UPDATE contact_information SET student_email = $3, updated_at = NOW() WHERE student_id = $1 AND school_id = $2`,
        [studentId, schoolId, updatableFields.student_email]
      );
    }

    // Update parent_guardian_information
    if ('father_full_name' in updatableFields || 'father_phone' in updatableFields) {
      const parentUpdates = [];
      const parentValues = [studentId, schoolId];
      let parentParamCount = 2;

      if ('father_full_name' in updatableFields) {
        parentParamCount++;
        parentUpdates.push(`father_full_name = $${parentParamCount}`);
        parentValues.push(updatableFields.father_full_name);
      }
      if ('father_phone' in updatableFields) {
        parentParamCount++;
        parentUpdates.push(`father_phone = $${parentParamCount}`);
        parentValues.push(updatableFields.father_phone);
      }
      if (parentUpdates.length > 0) {
        await pool.query(
          `UPDATE parent_guardian_information SET ${parentUpdates.join(', ')}, updated_at = NOW() WHERE student_id = $1 AND school_id = $2`,
          parentValues
        );
      }
    }

    // Update academic_information
    if ('roll_number' in updatableFields || 'section' in updatableFields || 'class_id' in updatableFields) {
      const academicUpdates = [];
      const academicValues = [studentId, schoolId];
      let academicParamCount = 2;

      if ('roll_number' in updatableFields) {
        academicParamCount++;
        academicUpdates.push(`roll_number = $${academicParamCount}`);
        academicValues.push(updatableFields.roll_number);
      }
      if ('section' in updatableFields) {
        academicParamCount++;
        academicUpdates.push(`section = $${academicParamCount}`);
        academicValues.push(updatableFields.section);
      }
      if ('class_id' in updatableFields) {
        academicParamCount++;
        academicUpdates.push(`class_id = $${academicParamCount}`);
        academicValues.push(updatableFields.class_id);
      }
      if (academicUpdates.length > 0) {
        await pool.query(
          `UPDATE academic_information SET ${academicUpdates.join(', ')}, updated_at = NOW() WHERE student_id = $1 AND school_id = $2`,
          academicValues
        );
      }
    }

    // Fetch updated student data
    const query = `
      SELECT
        pi.student_id,
        ai.roll_number,
        pi.first_name,
        pi.last_name,
        ai.class_id,
        ai.section,
        pg.father_full_name,
        pg.father_phone,
        ci.student_email,
        sa.admission_status,
        ai.admission_number
      FROM students_admission sa
      LEFT JOIN personal_information pi ON sa.id = pi.student_id
      LEFT JOIN academic_information ai ON sa.id = ai.student_id
      LEFT JOIN parent_guardian_information pg ON sa.id = pg.student_id
      LEFT JOIN contact_information ci ON sa.id = ci.student_id
      WHERE sa.school_id = $1
        AND sa.admission_status = 'Approved'
        AND pi.student_id = $2
      LIMIT 1
    `;

    const result = await pool.query(query, [schoolId, studentId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Error updating approved student:', error);
    throw error;
  }
};

module.exports = {
  getApprovedStudents,
  getApprovedStudentByRollNumber,
  getApprovedStudentsByClassAndSection,
  getTotalApprovedStudentsCount,
  updateApprovedStudent
};
