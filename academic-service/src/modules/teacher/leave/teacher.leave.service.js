const leaveRepository = require('./teacher.leave.repository');

const VALID_TABS = ['PENDING', 'APPROVED', 'REJECTED'];

const getLeaveRequests = async ({ user, query }) => {
  if (user.role !== 'TEACHER') {
    const err = new Error('Access denied: TEACHER role required');
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  const tab = (query.tab || 'PENDING').toUpperCase();

  if (!VALID_TABS.includes(tab)) {
    const err = new Error(`tab must be one of: pending, approved, rejected`);
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const classes = await leaveRepository.getClassesByTeacher({ schoolId: user.school_id, teacherId: user.user_id });

  if (!classes.length) {
    return { counts: { PENDING: 0, APPROVED: 0, REJECTED: 0 }, requests: [] };
  }

  const classIds = classes.map((c) => c.class_id);

  const [requests, countRows] = await Promise.all([
    leaveRepository.getLeaveRequests({ schoolId: user.school_id, classIds, status: tab }),
    leaveRepository.getLeaveCountsByStatus({ schoolId: user.school_id, classIds })
  ]);

  const counts = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
  countRows.forEach((r) => { counts[r.status] = parseInt(r.count, 10); });

  return { counts, requests };
};

const updateLeaveStatus = async ({ user, params, body }) => {
  if (user.role !== 'TEACHER') {
    const err = new Error('Access denied: TEACHER role required');
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  const { leaveId } = params;
  const { status } = body;

  if (!['APPROVED', 'REJECTED'].includes((status || '').toUpperCase())) {
    const err = new Error('status must be APPROVED or REJECTED');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const classes = await leaveRepository.getClassesByTeacher({ schoolId: user.school_id, teacherId: user.user_id });
  const classIds = classes.map((c) => c.class_id);

  const leave = await leaveRepository.getLeaveById({ schoolId: user.school_id, leaveId, classIds });

  if (!leave) {
    const err = new Error('Leave request not found or not in your class');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const updated = await leaveRepository.updateLeaveStatus({ leaveId, status: status.toUpperCase() });
  return updated;
};

module.exports = { getLeaveRequests, updateLeaveStatus };
