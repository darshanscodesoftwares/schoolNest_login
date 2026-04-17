const pool = require('../../../../config/db');

// Get all teachers
const getAllTeachers = async (schoolId, filters = {}) => {
  try {
    // Use DISTINCT ON to avoid duplicate rows from class join
    let query = `
      SELECT DISTINCT ON (tr.id) tr.*
      FROM teacher_records tr
      WHERE tr.school_id = $1
    `;

    const params = [schoolId];
    let paramIndex = 1;

    // Optional filters
    if (filters.designation) {
      paramIndex++;
      query += ` AND tr.designation ILIKE $${paramIndex}`;
      params.push(`%${filters.designation}%`);
    }

    if (filters.department_id) {
      paramIndex++;
      query += ` AND tr.department_id = $${paramIndex}`;
      params.push(filters.department_id);
    }

    if (filters.employment_status) {
      paramIndex++;
      query += ` AND tr.employment_status = $${paramIndex}`;
      params.push(filters.employment_status);
    }

    // New text search filters
    if (filters.teacherName) {
      paramIndex++;
      query += ` AND tr.first_name ILIKE $${paramIndex}`;
      const searchPattern = `%${filters.teacherName}%`;
      params.push(searchPattern);
    }

    // Class search - join with school_classes to search by class name
    if (filters.classes) {
      query += ` INNER JOIN school_classes sc ON sc.id = ANY(tr.class_ids)`;
      paramIndex++;
      query += ` AND sc.class_name ILIKE $${paramIndex}`;
      params.push(`%${filters.classes}%`);
    }

    if (filters.experience) {
      paramIndex++;
      query += ` AND tr.total_experience_years = $${paramIndex}`;
      params.push(parseInt(filters.experience, 10));
    }

    query += ` ORDER BY tr.id, tr.created_at ASC`;

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
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get total count of teachers (with filter support)
const getTotalTeachersCount = async (schoolId, filters = {}) => {
  try {
    // Use DISTINCT ON to count unique teachers (avoid duplicates from class join)
    let query = `
      SELECT COUNT(DISTINCT tr.id) as total
      FROM teacher_records tr
      WHERE tr.school_id = $1
    `;

    const params = [schoolId];
    let paramIndex = 1;

    // Apply same filters as getAllTeachers
    if (filters.designation) {
      paramIndex++;
      query += ` AND tr.designation ILIKE $${paramIndex}`;
      params.push(`%${filters.designation}%`);
    }

    if (filters.department_id) {
      paramIndex++;
      query += ` AND tr.department_id = $${paramIndex}`;
      params.push(filters.department_id);
    }

    if (filters.employment_status) {
      paramIndex++;
      query += ` AND tr.employment_status = $${paramIndex}`;
      params.push(filters.employment_status);
    }

    if (filters.teacherName) {
      paramIndex++;
      query += ` AND tr.first_name ILIKE $${paramIndex}`;
      const searchPattern = `%${filters.teacherName}%`;
      params.push(searchPattern);
    }

    // Class search - join with school_classes to search by class name
    if (filters.classes) {
      query += ` INNER JOIN school_classes sc ON sc.id = ANY(tr.class_ids)`;
      paramIndex++;
      query += ` AND sc.class_name ILIKE $${paramIndex}`;
      params.push(`%${filters.classes}%`);
    }

    if (filters.experience) {
      paramIndex++;
      query += ` AND tr.total_experience_years = $${paramIndex}`;
      params.push(parseInt(filters.experience, 10));
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].total, 10);
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get teacher by ID
const getTeacherById = async (schoolId, teacherId) => {
  try {
    const query = `
      SELECT *
      FROM teacher_records
      WHERE school_id = $1 AND id = $2
    `;
    const result = await pool.query(query, [schoolId, teacherId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Create new teacher record
const createTeacher = async (schoolId, teacherData) => {
  try {
    const {
      first_name,
      date_of_birth,
      gender,
      blood_group_id,
      nationality,
      religion,
      marital_status,
      teacher_photo,
      primary_phone,
      primary_email,
      alternate_phone,
      alternate_email,
      current_street,
      current_city,
      current_state,
      current_pincode,
      is_permanent_same,
      permanent_street,
      permanent_city,
      permanent_state,
      permanent_pincode,
      employee_id,
      designation,
      teacher_type,
      department_id,
      specialization,
      date_of_joining,
      class_ids,
      highest_qualification,
      university,
      year_of_passing,
      percentage_cgpa,
      additional_certifications,
      total_experience_years,
      previous_school_institution,
      previous_designation,
      experience_at_previous_school,
      monthly_salary,
      bank_name,
      account_number,
      ifsc_code,
      pan_number,
      aadhar_number,
      emergency_contact_name,
      emergency_relation,
      emergency_phone,
      resume_cv,
      qualification_certificates,
      experience_certificates,
      aadhar_card,
      pan_card
    } = teacherData;

    const query = `
      INSERT INTO teacher_records (
        school_id, first_name, date_of_birth, gender,
        blood_group_id, nationality, religion, marital_status, teacher_photo,
        primary_phone, primary_email, alternate_phone, alternate_email,
        current_street, current_city, current_state, current_pincode,
        is_permanent_same, permanent_street, permanent_city, permanent_state, permanent_pincode,
        employee_id, designation, teacher_type, department_id, specialization, date_of_joining,
        class_ids, highest_qualification, university, year_of_passing, percentage_cgpa,
        additional_certifications, total_experience_years, previous_school_institution,
        previous_designation, experience_at_previous_school, monthly_salary, bank_name,
        account_number, ifsc_code, pan_number, aadhar_number,
        emergency_contact_name, emergency_relation, emergency_phone,
        resume_cv, qualification_certificates, experience_certificates, aadhar_card, pan_card,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34,
        $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51,
        $52, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `;

    const values = [
      schoolId, first_name, date_of_birth, gender,
      blood_group_id, nationality, religion, marital_status, teacher_photo,
      primary_phone, primary_email, alternate_phone, alternate_email,
      current_street, current_city, current_state, current_pincode,
      is_permanent_same, permanent_street, permanent_city, permanent_state, permanent_pincode,
      employee_id, designation, teacher_type, department_id, specialization, date_of_joining,
      class_ids, highest_qualification, university, year_of_passing, percentage_cgpa,
      additional_certifications, total_experience_years, previous_school_institution,
      previous_designation, experience_at_previous_school, monthly_salary, bank_name,
      account_number, ifsc_code, pan_number, aadhar_number,
      emergency_contact_name, emergency_relation, emergency_phone,
      resume_cv, qualification_certificates, experience_certificates, aadhar_card, pan_card
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Update teacher record
const updateTeacher = async (schoolId, teacherId, updateData) => {
  try {
    const updates = [];
    const values = [schoolId, teacherId];
    let paramIndex = 2;

    const updatableFields = {
      first_name: updateData.first_name,
      gender: updateData.gender,
      blood_group_id: updateData.blood_group_id,
      nationality: updateData.nationality,
      religion: updateData.religion,
      marital_status: updateData.marital_status,
      teacher_photo: updateData.teacher_photo,
      primary_phone: updateData.primary_phone,
      primary_email: updateData.primary_email,
      alternate_phone: updateData.alternate_phone,
      alternate_email: updateData.alternate_email,
      current_street: updateData.current_street,
      current_city: updateData.current_city,
      current_state: updateData.current_state,
      current_pincode: updateData.current_pincode,
      is_permanent_same: updateData.is_permanent_same,
      permanent_street: updateData.permanent_street,
      permanent_city: updateData.permanent_city,
      permanent_state: updateData.permanent_state,
      permanent_pincode: updateData.permanent_pincode,
      designation: updateData.designation,
      teacher_type: updateData.teacher_type,
      department_id: updateData.department_id,
      specialization: updateData.specialization,
      date_of_joining: updateData.date_of_joining,
      class_ids: updateData.class_ids,
      highest_qualification: updateData.highest_qualification,
      university: updateData.university,
      year_of_passing: updateData.year_of_passing,
      percentage_cgpa: updateData.percentage_cgpa,
      additional_certifications: updateData.additional_certifications,
      total_experience_years: updateData.total_experience_years,
      previous_school_institution: updateData.previous_school_institution,
      previous_designation: updateData.previous_designation,
      experience_at_previous_school: updateData.experience_at_previous_school,
      monthly_salary: updateData.monthly_salary,
      bank_name: updateData.bank_name,
      account_number: updateData.account_number,
      ifsc_code: updateData.ifsc_code,
      pan_number: updateData.pan_number,
      aadhar_number: updateData.aadhar_number,
      emergency_contact_name: updateData.emergency_contact_name,
      emergency_relation: updateData.emergency_relation,
      emergency_phone: updateData.emergency_phone,
      resume_cv: updateData.resume_cv,
      qualification_certificates: updateData.qualification_certificates,
      experience_certificates: updateData.experience_certificates,
      aadhar_card: updateData.aadhar_card,
      pan_card: updateData.pan_card
    };

    // Remove undefined values
    Object.keys(updatableFields).forEach(key => {
      if (updatableFields[key] === undefined) {
        delete updatableFields[key];
      }
    });

    // Build dynamic update query
    Object.keys(updatableFields).forEach(key => {
      paramIndex++;
      updates.push(`${key} = $${paramIndex}`);
      values.push(updatableFields[key]);
    });

    if (updates.length === 0) {
      return await getTeacherById(schoolId, teacherId);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE teacher_records
      SET ${updates.join(', ')}
      WHERE school_id = $1 AND id = $2
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Get teacher by employee ID
const getTeacherByEmployeeId = async (schoolId, employeeId) => {
  try {
    const query = `
      SELECT id, employee_id, first_name
      FROM teacher_records
      WHERE school_id = $1 AND employee_id = $2
      LIMIT 1
    `;
    const result = await pool.query(query, [schoolId, employeeId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Delete teacher record
const deleteTeacher = async (schoolId, teacherId) => {
  try {
    const query = `
      DELETE FROM teacher_records
      WHERE school_id = $1 AND id = $2
      RETURNING id, auth_user_id AS teacher_id, first_name
    `;
    const result = await pool.query(query, [schoolId, teacherId]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

module.exports = {
  getAllTeachers,
  getTotalTeachersCount,
  getTeacherById,
  getTeacherByEmployeeId,
  createTeacher,
  updateTeacher,
  deleteTeacher
};
