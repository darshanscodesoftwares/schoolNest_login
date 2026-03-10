const timetableRepository = require('./teacher.timetable.repository');

const VALID_DAYS = new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const assertTeacherRole = (user) => {
  if (!user || user.role !== 'TEACHER') {
    const error = new Error('Forbidden: only teachers can access this resource');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }
};

const getTimetableByDay = async ({ user, day }) => {
  assertTeacherRole(user);

  const resolvedDay = day || DAY_NAMES[new Date().getDay()];

  if (!VALID_DAYS.has(resolvedDay)) {
    const error = new Error('day must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday');
    error.statusCode = 400;
    error.code = 'INVALID_DAY';
    throw error;
  }

  const periods = await timetableRepository.getTimetableByDay({
    schoolId: user.school_id,
    teacherId: user.user_id,
    day: resolvedDay
  });

  return {
    success: true,
    day: resolvedDay,
    total_periods: periods.length,
    periods
  };
};

const getNextClass = async ({ user }) => {
  assertTeacherRole(user);

  const now = new Date();
  const day = DAY_NAMES[now.getDay()];
  // Format current time as HH:MM for DB comparison
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Weekend — no next class
  if (day === 'Sunday') {
    return { success: true, next_class: null, message: 'No classes on Sunday' };
  }

  const nextClass = await timetableRepository.getNextClass({
    schoolId: user.school_id,
    teacherId: user.user_id,
    day,
    currentTime
  });

  return {
    success: true,
    day,
    current_time: currentTime,
    next_class: nextClass
  };
};

const getClassSummary = async ({ user, classId }) => {
  assertTeacherRole(user);

  if (!classId) {
    const error = new Error('class_id is required');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const summary = await timetableRepository.getClassSummary({
    schoolId: user.school_id,
    classId,
    teacherId: user.user_id
  });

  if (!summary) {
    const error = new Error('Class not found for this teacher');
    error.statusCode = 404;
    error.code = 'CLASS_NOT_FOUND';
    throw error;
  }

  return {
    success: true,
    class: summary
  };
};

const getRecentActivity = async ({ user, classId }) => {
  assertTeacherRole(user);

  if (!classId) {
    const error = new Error('class_id is required');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // Verify class belongs to teacher
  const summary = await timetableRepository.getClassSummary({
    schoolId: user.school_id,
    classId,
    teacherId: user.user_id
  });

  if (!summary) {
    const error = new Error('Class not found for this teacher');
    error.statusCode = 404;
    error.code = 'CLASS_NOT_FOUND';
    throw error;
  }

  const activity = await timetableRepository.getRecentActivity({
    schoolId: user.school_id,
    classId
  });

  // Format attendance percentage if exists
  let lastAttendance = null;
  if (activity.last_attendance) {
    const { date, present_count, total_count } = activity.last_attendance;
    const percentage = total_count > 0 ? Math.round((present_count / total_count) * 100) : 0;
    lastAttendance = { date, present_count, total_count, percentage };
  }

  return {
    success: true,
    class_id: classId,
    recent_activity: {
      last_attendance: lastAttendance,
      last_homework: activity.last_homework
    }
  };
};

module.exports = {
  getTimetableByDay,
  getNextClass,
  getClassSummary,
  getRecentActivity
};
