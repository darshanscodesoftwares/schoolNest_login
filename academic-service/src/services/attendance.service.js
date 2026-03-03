const pool = require('../config/db');
const attendanceRepository = require('../repositories/attendance.repository');

const VALID_STATUSES = new Set(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY']);

const assertTeacherRole = (user) => {
  if (!user || user.role !== 'TEACHER') {
    const error = new Error('Forbidden: only teachers can access this resource');
    error.statusCode = 403;
    throw error;
  }
};

const assertValidDate = (date) => {
  if (!date || Number.isNaN(new Date(date).getTime())) {
    const error = new Error('Invalid date. Use format YYYY-MM-DD');
    error.statusCode = 400;
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
    throw error;
  }

  const classStudents = await attendanceRepository.getStudentsByClass({
    schoolId: user.school_id,
    classId
  });
  const validStudentIds = new Set(classStudents.map((s) => s.student_id));

  const normalizedEntries = attendance.map((entry) => {
    if (!entry.student_id || !entry.status) {
      const error = new Error('Each attendance item must contain student_id and status');
      error.statusCode = 400;
      throw error;
    }

    if (!validStudentIds.has(entry.student_id)) {
      const error = new Error(`Student ${entry.student_id} does not belong to this class/school`);
      error.statusCode = 400;
      throw error;
    }

    const normalizedStatus = String(entry.status).toUpperCase();
    if (!VALID_STATUSES.has(normalizedStatus)) {
      const error = new Error(`Invalid status for student ${entry.student_id}`);
      error.statusCode = 400;
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

  const summary = normalizedEntries.reduce(
    (acc, row) => {
      acc.total += 1;
      if (row.status === 'PRESENT') acc.present += 1;
      if (row.status === 'ABSENT') acc.absent += 1;
      if (row.status === 'LATE') acc.late += 1;
      if (row.status === 'HALF_DAY') acc.half_day += 1;
      return acc;
    },
    { total: 0, present: 0, absent: 0, late: 0, half_day: 0 }
  );

  return {
    message: 'Attendance Saved Successfully',
    summary
  };
};

module.exports = {
  getTeacherClasses,
  getClassStudentsWithAttendance,
  submitAttendance
};
