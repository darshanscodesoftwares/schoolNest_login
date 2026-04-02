const leaveRepository = require('./parent.leave.repository');

const VALID_REASONS = ['Sick', 'Family Function', 'Travel', 'Personal', 'Other'];

const applyLeave = async ({ user, body }) => {
  if (user.role !== 'PARENT') {
    const err = new Error('Access denied: PARENT role required');
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  const { from_date, to_date, reason, message } = body;

  if (!from_date || !to_date || !reason) {
    const err = new Error('from_date, to_date and reason are required');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  if (!VALID_REASONS.includes(reason)) {
    const err = new Error(`reason must be one of: ${VALID_REASONS.join(', ')}`);
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  if (new Date(to_date) < new Date(from_date)) {
    const err = new Error('to_date cannot be before from_date');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  // Get parent's child (single child — pick first)
  const students = await leaveRepository.getStudentsByParent({ schoolId: user.school_id, parentId: user.user_id });

  if (!students.length) {
    const err = new Error('No student found for this parent');
    err.statusCode = 404;
    err.code = 'STUDENT_NOT_FOUND';
    throw err;
  }

  const student = students[0];

  const leave = await leaveRepository.createLeaveRequest({
    schoolId: user.school_id,
    studentId: student.student_id,
    fromDate: from_date,
    toDate: to_date,
    reason,
    message
  });

  return {
    ...leave,
    student_name: student.name,
    roll_no: student.roll_no,
    class_name: student.class_name,
    section: student.section
  };
};

const getLeaveHistory = async ({ user }) => {
  if (user.role !== 'PARENT') {
    const err = new Error('Access denied: PARENT role required');
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  const students = await leaveRepository.getStudentsByParent({ schoolId: user.school_id, parentId: user.user_id });

  if (!students.length) {
    return [];
  }

  const studentIds = students.map((s) => s.student_id);
  const history = await leaveRepository.getLeaveHistory({ schoolId: user.school_id, studentIds });

  return history;
};

module.exports = { applyLeave, getLeaveHistory };
