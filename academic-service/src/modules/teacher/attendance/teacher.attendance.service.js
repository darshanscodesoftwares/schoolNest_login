const pool = require('../../../config/db');
const attendanceRepository = require('./teacher.attendance.repository');

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

const getAttendanceHistory = async ({ user, classId, fromDate, toDate }) => {
  assertTeacherRole(user);
  assertValidDate(fromDate);
  assertValidDate(toDate);

  if (new Date(fromDate) > new Date(toDate)) {
    const error = new Error('from_date must be less than or equal to to_date');
    error.statusCode = 400;
    error.code = 'INVALID_DATE_RANGE';
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

  const records = await attendanceRepository.getAttendanceByDateRange({
    schoolId: user.school_id,
    classId,
    fromDate,
    toDate
  });

  const grouped = {};
  records.forEach((record) => {
    if (!grouped[record.date]) {
      grouped[record.date] = [];
    }
    grouped[record.date].push({
      student_id: record.student_id,
      name: record.name,
      roll_no: record.roll_no,
      status: record.status
    });
  });

  const groupedRecords = Object.entries(grouped).map(([date, students]) => ({
    date,
    students
  }));

  return {
    success: true,
    class_id: classId,
    from_date: fromDate,
    to_date: toDate,
    total_records: records.length,
    records: groupedRecords
  };
};

const getStudentAttendanceSummary = async ({ user, studentId }) => {
  assertTeacherRole(user);

  const student = await attendanceRepository.getStudentByTeacher({
    schoolId: user.school_id,
    studentId,
    teacherId: user.user_id
  });

  if (!student) {
    const error = new Error('Student not found in your classes');
    error.statusCode = 404;
    error.code = 'STUDENT_NOT_FOUND';
    throw error;
  }

  const summary = await attendanceRepository.getStudentAttendanceSummary({
    schoolId: user.school_id,
    studentId
  });

  const counts = {};
  summary.forEach((row) => {
    counts[row.status.toLowerCase()] = parseInt(row.count, 10);
  });

  const total = summary.reduce((sum, row) => sum + parseInt(row.count, 10), 0);
  const present = counts.present || 0;
  const late = counts.late || 0;
  const half_day = counts.half_day || 0;
  const marked = present + late + half_day;
  const percentage = total > 0 ? ((marked / total) * 100).toFixed(2) : 0;

  return {
    success: true,
    student: {
      student_id: student.student_id,
      name: student.name,
      class_id: student.class_id
    },
    summary: {
      total,
      present: counts.present || 0,
      absent: counts.absent || 0,
      late: counts.late || 0,
      half_day: counts.half_day || 0,
      attendance_percentage: parseFloat(percentage)
    }
  };
};

const getClassAttendanceReport = async ({ user, classId, month }) => {
  assertTeacherRole(user);

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    const error = new Error('month must be in format YYYY-MM');
    error.statusCode = 400;
    error.code = 'INVALID_MONTH_FORMAT';
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

  const monthDate = `${month}-01`;
  const report = await attendanceRepository.getMonthlyAttendanceReport({
    schoolId: user.school_id,
    classId,
    month: monthDate
  });

  const reportWithPercentage = report.map((row) => {
    const present = parseInt(row.present, 10);
    const absent = parseInt(row.absent, 10);
    const late = parseInt(row.late, 10);
    const half_day = parseInt(row.half_day, 10);
    const total_marked = parseInt(row.total_marked, 10);
    const marked = present + late + half_day;
    const percentage = total_marked > 0 ? ((marked / total_marked) * 100).toFixed(2) : 0;
    return {
      student_id: row.student_id,
      name: row.name,
      roll_no: row.roll_no,
      total_marked,
      present,
      absent,
      late,
      half_day,
      attendance_percentage: parseFloat(percentage)
    };
  });

  return {
    success: true,
    class_id: classId,
    month,
    report: reportWithPercentage
  };
};

const updateAttendanceRecord = async ({ user, recordId, status }) => {
  assertTeacherRole(user);

  if (!status || typeof status !== 'string') {
    const error = new Error('status is required and must be a string');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const record = await attendanceRepository.getAttendanceById({
    schoolId: user.school_id,
    recordId
  });

  if (!record) {
    const error = new Error('Attendance record not found');
    error.statusCode = 404;
    error.code = 'ATTENDANCE_NOT_FOUND';
    throw error;
  }

  const classOwned = await attendanceRepository.getClassByTeacher({
    schoolId: user.school_id,
    classId: record.class_id,
    teacherId: user.user_id
  });

  if (!classOwned) {
    const error = new Error('Forbidden: you cannot update attendance for this class');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  const statusRows = await attendanceRepository.getActiveStatuses({
    schoolId: user.school_id
  });
  const VALID_STATUSES = new Set(statusRows.map((s) => s.code));

  const normalizedStatus = String(status).toUpperCase();
  if (!VALID_STATUSES.has(normalizedStatus)) {
    const error = new Error(`Invalid status: ${status}`);
    error.statusCode = 400;
    error.code = 'INVALID_STATUS';
    throw error;
  }

  const updated = await attendanceRepository.updateAttendanceStatus({
    schoolId: user.school_id,
    recordId,
    status: normalizedStatus
  });

  return {
    success: true,
    message: 'Attendance record updated',
    record_id: updated.id,
    old_status: record.status,
    new_status: updated.status,
    updated_at: updated.updated_at
  };
};

const deleteAttendanceRecord = async ({ user, recordId }) => {
  assertTeacherRole(user);

  const record = await attendanceRepository.getAttendanceById({
    schoolId: user.school_id,
    recordId
  });

  if (!record) {
    const error = new Error('Attendance record not found');
    error.statusCode = 404;
    error.code = 'ATTENDANCE_NOT_FOUND';
    throw error;
  }

  const classOwned = await attendanceRepository.getClassByTeacher({
    schoolId: user.school_id,
    classId: record.class_id,
    teacherId: user.user_id
  });

  if (!classOwned) {
    const error = new Error('Forbidden: you cannot delete attendance for this class');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  const deleted = await attendanceRepository.deleteAttendanceById({
    schoolId: user.school_id,
    recordId
  });

  return {
    success: true,
    message: 'Attendance record deleted',
    record_id: deleted.id,
    student_id: deleted.student_id,
    date: deleted.date,
    status: deleted.status
  };
};

module.exports = {
  getTeacherClasses,
  getClassStudentsWithAttendance,
  submitAttendance,
  getAttendanceStatuses,
  getAttendanceHistory,
  getStudentAttendanceSummary,
  getClassAttendanceReport,
  updateAttendanceRecord,
  deleteAttendanceRecord
};
