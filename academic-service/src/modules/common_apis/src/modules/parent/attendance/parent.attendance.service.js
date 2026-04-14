const parentRepository = require('./parent.attendance.repository');

const assertParentRole = (user) => {
  if (!user || user.role !== 'PARENT') {
    const error = new Error('Forbidden: only parents can access this resource');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }
};

const assertStudentOwnership = async (studentId, user) => {
  const student = await parentRepository.verifyStudentBelongsToParent({
    studentId,
    parentId: user.user_id,
    schoolId: user.school_id
  });
  if (!student) {
    const error = new Error('Parent not authorized for this student');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }
};

const assertValidMonth = (month) => {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    const error = new Error('Invalid month format. Use YYYY-MM');
    error.statusCode = 400;
    error.code = 'INVALID_MONTH_FORMAT';
    throw error;
  }
};

const getParentStudents = async (user) => {
  assertParentRole(user);
  return parentRepository.getStudentsByParent({
    schoolId: user.school_id,
    parentId: user.user_id
  });
};

const getAttendanceSummary = async ({ user, studentId }) => {
  assertParentRole(user);
  await assertStudentOwnership(studentId, user);

  const rows = await parentRepository.getAttendanceSummary({
    schoolId: user.school_id,
    studentId
  });

  const summary = { total: 0, present: 0, absent: 0, late: 0, half_day: 0 };

  for (const row of rows) {
    const key = row.status.toLowerCase();
    if (key in summary) {
      summary[key] = row.count;
    }
    summary.total += row.count;
  }

  summary.attendance_percentage = summary.total > 0
    ? Math.round((summary.present / summary.total) * 100)
    : 0;

  return { student_id: studentId, summary };
};

const getMonthlyAttendance = async ({ user, studentId, month }) => {
  assertParentRole(user);
  assertValidMonth(month);
  await assertStudentOwnership(studentId, user);

  const records = await parentRepository.getMonthlyAttendance({
    schoolId: user.school_id,
    studentId,
    month
  });

  return { month, records };
};

const getRecentAttendance = async ({ user, studentId }) => {
  assertParentRole(user);
  await assertStudentOwnership(studentId, user);

  const records = await parentRepository.getRecentAttendance({
    schoolId: user.school_id,
    studentId
  });

  return { records };
};

module.exports = {
  getParentStudents,
  getAttendanceSummary,
  getMonthlyAttendance,
  getRecentAttendance
};
