const teacherRepository = require('./teacher-records.repository');
const pool = require('../../../../config/db');
const authPool = require('../../../../config/auth-db');
const bcrypt = require('bcrypt');

// ─── Bridge 1: teacher created → auto-create auth_db user ──────────────────
// This lets the teacher login via email/password (as well as OTP).
const createAuthUser = async (teacher) => {
  try {
    // Get TEACHER role ID from auth_db
    const roleRes = await authPool.query(
      `SELECT id FROM roles WHERE name = 'TEACHER' LIMIT 1`
    );
    if (roleRes.rows.length === 0) {
      console.error('Bridge 1: TEACHER role not found in auth_db.roles');
      return;
    }
    const roleId = roleRes.rows[0].id;

    // Default temporary password — teacher should change after first login
    const tempPassword = 'Teacher@123';
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // INSERT into auth_db.users using teacher UUID as the user ID
    await authPool.query(
      `INSERT INTO users (id, school_id, role_id, name, email, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [teacher.id, teacher.school_id, roleId, teacher.first_name, teacher.primary_email, passwordHash]
    );

    // Link teacher_records.auth_user_id to auth_db.users.id
    await pool.query(
      `UPDATE teacher_records SET auth_user_id = $1 WHERE id = $2`,
      [teacher.id, teacher.id]
    );

    console.log(`Bridge 1: auth user created for teacher ${teacher.first_name} (${teacher.primary_email})`);
  } catch (error) {
    // Non-fatal: log but don't block teacher creation
    console.error('Bridge 1 error (auth user creation):', error.message);
  }
};

// ─── Bridge 1 cleanup: teacher deleted → remove auth_db user ────────────────
const deleteAuthUser = async (teacherId) => {
  try {
    await authPool.query(`DELETE FROM users WHERE id = $1`, [teacherId]);
    console.log(`Bridge 1: auth user removed for teacher id ${teacherId}`);
  } catch (error) {
    console.error('Bridge 1 cleanup error:', error.message);
  }
};

// Direct DB lookup helpers (replaced HTTP calls to common-api)
const enrichClassNames = async (classIds) => {
  if (!classIds || classIds.length === 0) return [];
  try {
    const res = await pool.query(
      `SELECT id, class_name FROM school_classes WHERE id = ANY($1)`,
      [classIds]
    );
    const nameMap = {};
    res.rows.forEach(row => { nameMap[row.id] = row.class_name; });
    return classIds.map(id => ({ id, name: nameMap[id] || id }));
  } catch {
    return classIds.map(id => ({ id, name: id }));
  }
};

const enrichBloodGroupName = async (bloodGroupId) => {
  if (!bloodGroupId) return null;
  try {
    const res = await pool.query(`SELECT blood_group FROM blood_groups WHERE id = $1 LIMIT 1`, [bloodGroupId]);
    return (res.rows[0] && res.rows[0].blood_group) || null;
  } catch { return null; }
};

const enrichDepartmentName = async (departmentId) => {
  if (!departmentId) return null;
  try {
    const res = await pool.query(`SELECT department_name FROM departments WHERE id = $1 LIMIT 1`, [departmentId]);
    return (res.rows[0] && res.rows[0].department_name) || null;
  } catch { return null; }
};

// Helper function to convert absolute paths to full URLs and enrich class names
const convertPathsToUrls = async (teacher) => {
  if (!teacher) return teacher;

  const fileFields = [
    'teacher_photo',
    'resume_cv',
    'qualification_certificates',
    'experience_certificates',
    'aadhar_card',
    'pan_card'
  ];

  // Get base URL from environment or construct it
  const baseUrl = process.env.BASE_URL || `http://localhost:4000`;

  const converted = { ...teacher };

  fileFields.forEach(field => {
    if (converted[field]) {
      const uploadsIndex = converted[field].indexOf('/uploads/');
      if (uploadsIndex !== -1) {
        const relativePath = converted[field].substring(uploadsIndex);
        converted[field] = `${baseUrl}${relativePath}`;
      }
    }
  });

  // Enrich class names if class_ids exist
  if (converted.class_ids && Array.isArray(converted.class_ids) && converted.class_ids.length > 0) {
    converted.classes = await enrichClassNames(converted.class_ids);
    // Remove class_ids and keep only enriched classes
    delete converted.class_ids;
  }

  // Enrich blood group name if blood_group_id exists
  if (converted.blood_group_id) {
    converted.blood_group = await enrichBloodGroupName(converted.blood_group_id);
    // Remove blood_group_id and keep only enriched blood group
    delete converted.blood_group_id;
  }

  // Enrich department name if department_id exists
  if (converted.department_id) {
    converted.department = await enrichDepartmentName(converted.department_id);
    // Remove department_id and keep only enriched department
    delete converted.department_id;
  }

  return converted;
};

// Get all teachers
const getAllTeachers = async (schoolId, filters = {}) => {
  try {
    const teachers = await teacherRepository.getAllTeachers(schoolId, filters);
    const totalCount = await teacherRepository.getTotalTeachersCount(schoolId);

    if (!teachers || teachers.length === 0) {
      return {
        success: true,
        totalTeachers: totalCount,
        message: 'No teachers found',
        count: 0,
        data: []
      };
    }

    // Convert paths to URLs for all teachers (async operation)
    const convertedTeachers = await Promise.all(teachers.map(convertPathsToUrls));

    return {
      success: true,
      totalTeachers: totalCount,
      message: 'Teachers retrieved successfully',
      count: convertedTeachers.length,
      data: convertedTeachers
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Get teacher by ID
const getTeacherById = async (schoolId, teacherId) => {
  try {
    const teacher = await teacherRepository.getTeacherById(schoolId, teacherId);

    if (!teacher) {
      const error = new Error('Teacher not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    const convertedTeacher = await convertPathsToUrls(teacher);

    return {
      success: true,
      data: convertedTeacher,
      message: 'Teacher retrieved successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Create new teacher
const createTeacher = async (schoolId, teacherData) => {
  try {
    // Validate required fields (teacher_id will be auto-generated by database)
    if (!teacherData.first_name || !teacherData.date_of_birth || !teacherData.gender || !teacherData.nationality || !teacherData.date_of_joining) {
      const error = new Error('Missing required fields: first_name, date_of_birth, gender, nationality, date_of_joining');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Validate employee_id uniqueness if provided
    if (teacherData.employee_id) {
      const existingTeacher = await teacherRepository.getTeacherByEmployeeId(schoolId, teacherData.employee_id);
      if (existingTeacher) {
        const error = new Error('Employee ID already exists. Please use a unique employee ID.');
        error.statusCode = 400;
        error.code = 'DUPLICATE_EMPLOYEE_ID';
        throw error;
      }
    }

    const newTeacher = await teacherRepository.createTeacher(schoolId, teacherData);

    // Bridge 1: auto-create login credentials in auth_db
    await createAuthUser(newTeacher);

    const convertedTeacher = await convertPathsToUrls(newTeacher);

    return {
      success: true,
      data: convertedTeacher,
      message: 'Teacher created successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Update teacher
const updateTeacher = async (schoolId, teacherId, updateData) => {
  try {
    // Validate employee_id uniqueness if being updated
    if (updateData.employee_id) {
      const existingTeacher = await teacherRepository.getTeacherByEmployeeId(schoolId, updateData.employee_id);
      // Allow if it's the same teacher (same ID), otherwise it's a duplicate
      if (existingTeacher && existingTeacher.id !== teacherId) {
        const error = new Error('Employee ID already exists. Please use a unique employee ID.');
        error.statusCode = 400;
        error.code = 'DUPLICATE_EMPLOYEE_ID';
        throw error;
      }
    }

    const updatedTeacher = await teacherRepository.updateTeacher(schoolId, teacherId, updateData);

    if (!updatedTeacher) {
      const error = new Error('Teacher not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    const convertedTeacher = await convertPathsToUrls(updatedTeacher);

    return {
      success: true,
      data: convertedTeacher,
      message: 'Teacher updated successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Delete teacher
const deleteTeacher = async (schoolId, teacherId) => {
  try {
    const deletedTeacher = await teacherRepository.deleteTeacher(schoolId, teacherId);

    if (!deletedTeacher) {
      const error = new Error('Teacher not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Bridge 1 cleanup: remove auth_db user when teacher is deleted
    await deleteAuthUser(teacherId);

    const convertedTeacher = await convertPathsToUrls(deletedTeacher);

    return {
      success: true,
      data: convertedTeacher,
      message: 'Teacher deleted successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

module.exports = {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher
};
