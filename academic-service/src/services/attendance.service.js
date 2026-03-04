const pool = require('../config/db');
const attendanceRepository = require('../repositories/attendance.repository');

const assertTeacherRole = (user) => {
  if (!user || user.role !== 'TEACHER') {
    const error = new Error('Forbidden: only teachers can access this resource');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }
};

const assertValidDate = (date) => {
  if (!date || Number.isNaN(new Date(date).getTime())) {
    const error = new Error('Invalid date. Use format YYYY-MM-DD');
    error.statusCode = 400;
    error.code = 'INVALID_DATE_FORMAT';
    throw error;
  }
};

const getTeacherClasses = async (user) => {
  assertTeacherRole(user);

  return attendanceRepository.getTeacherClasses({
    schoolId: user.school_id,
    teacherId: user.user_id
  });
};

const getClassStudentsWithAttendance = async ({ user, classId, date }) => {
  assertTeacherRole(user);
  assertValidDate(date);

  const classOwned = await attendanceRepository.getClassByTeacher({
    schoolId: user.school_id,
    classId,
    teacherId: user.user_id
  });

  if (!classOwned) {
    const error = new Error('Class not found for this teacher in current school');
    error.statusCode = 404;
    error.code = 'CLASS_NOT_FOUND';
    throw error;
  }

  const [students, attendanceRows, leaveRows] = await Promise.all([
    attendanceRepository.getStudentsByClass({ schoolId: user.school_id, classId }),
    attendanceRepository.getAttendanceByClassAndDate({ schoolId: user.school_id, classId, date }),
    attendanceRepository.getApprovedLeaveByClassAndDate({ schoolId: user.school_id, classId, date })
  ]);

  const attendanceMap = new Map(attendanceRows.map((row) => [row.student_id, row.status]));
  const leaveSet = new Set(leaveRows.map((row) => row.student_id));

  const merged = students.map((student) => ({
    student_id: student.student_id,
    roll_no: student.roll_no,
    name: student.name,
    leave_applied: leaveSet.has(student.student_id),
    attendance_status: attendanceMap.get(student.student_id) || null
  }));

  return {
    success: true,
    date,
    total_students: merged.length,
    students: merged
  };
};

const submitAttendance = async ({ user, classId, date, attendance }) => {
  assertTeacherRole(user);
  assertValidDate(date);

  if (!classId || !Array.isArray(attendance) || attendance.length === 0) {
    const error = new Error('class_id and non-empty attendance array are required');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const classOwned = await attendanceRepository.getClassByTeacher({
    schoolId: user.school_id,
    classId,
    teacherId: user.user_id
  });

  if (!classOwned) {
    const error = new Error('Class not found for this teacher in current school');
    error.statusCode = 404;
    error.code = 'CLASS_NOT_FOUND';
    throw error;
  }

  // Fetch valid statuses from DB
  const statusRows = await attendanceRepository.getActiveStatuses({
    schoolId: user.school_id
  });
  const VALID_STATUSES = new Set(statusRows.map((s) => s.code));

  const classStudents = await attendanceRepository.getStudentsByClass({
    schoolId: user.school_id,
    classId
  });
  const validStudentIds = new Set(classStudents.map((s) => s.student_id));

  const normalizedEntries = attendance.map((entry) => {
    if (!entry.student_id || !entry.status) {
      const error = new Error('Each attendance item must contain student_id and status');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    if (!validStudentIds.has(entry.student_id)) {
      const error = new Error(`Student ${entry.student_id} does not belong to this class/school`);
      error.statusCode = 400;
      error.code = 'INVALID_STUDENT';
      throw error;
    }

    const normalizedStatus = String(entry.status).toUpperCase();
    if (!VALID_STATUSES.has(normalizedStatus)) {
      const error = new Error(`Invalid status for student ${entry.student_id}`);
      error.statusCode = 400;
      error.code = 'INVALID_STATUS';
      throw error;
    }

    return {
      school_id: user.school_id,
      class_id: classId,
      student_id: entry.student_id,
      teacher_id: user.user_id,
      date,
      status: normalizedStatus
    };
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await attendanceRepository.deleteAttendanceByClassAndDate({
      client,
      schoolId: user.school_id,
      classId,
      date
    });

    await attendanceRepository.bulkInsertAttendance({
      client,
      entries: normalizedEntries
    });

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  // Dynamic summary based on actual statuses
  const summary = { total: normalizedEntries.length };
  for (const entry of normalizedEntries) {
    const key = entry.status.toLowerCase();
    summary[key] = (summary[key] || 0) + 1;
  }

  return {
    success: true,
    message: 'Attendance Saved Successfully',
    summary
  };
};

const getAttendanceStatuses = async (user) => {
  assertTeacherRole(user);

  const statuses = await attendanceRepository.getActiveStatuses({
    schoolId: user.school_id
  });

  return {
    data: statuses
  };
};

module.exports = {
  getTeacherClasses,
  getClassStudentsWithAttendance,
  submitAttendance,
  getAttendanceStatuses
};
