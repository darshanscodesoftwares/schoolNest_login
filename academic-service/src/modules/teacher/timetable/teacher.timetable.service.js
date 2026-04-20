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

// Screen 1: My Timetable — periods for a day + next class in one response
const getTimetable = async ({ user, day }) => {
  assertTeacherRole(user);

  const resolvedDay = day || DAY_NAMES[new Date().getDay()];

  if (!VALID_DAYS.has(resolvedDay)) {
    const error = new Error('day must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday');
    error.statusCode = 400;
    error.code = 'INVALID_DAY';
    throw error;
  }

  const now = new Date();
  const todayName = DAY_NAMES[now.getDay()];
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Fetch periods + next class in parallel (next class only relevant when viewing today)
  const isToday = resolvedDay === todayName;

  const [periods, nextClass] = await Promise.all([
    timetableRepository.getTimetableByDay({
      schoolId: user.school_id,
      teacherId: user.user_id,
      day: resolvedDay
    }),
    isToday && todayName !== 'Sunday'
      ? timetableRepository.getNextClass({
          schoolId: user.school_id,
          teacherId: user.user_id,
          day: todayName,
          currentTime
        })
      : Promise.resolve(null)
  ]);

  // Re-number periods sequentially so break slots don't create gaps
  let counter = 1;
  periods.forEach(function(p) { p.period_number = counter++; });

  return {
    success: true,
    day: resolvedDay,
    current_time: isToday ? currentTime : null,
    next_class: nextClass,
    total_periods: periods.length,
    periods
  };
};

// Screen 2: Class Detail — header info + recent activity in one response
const getClassDetail = async ({ user, classId }) => {
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

  const activity = await timetableRepository.getRecentActivity({
    schoolId: user.school_id,
    classId
  });

  let lastAttendance = null;
  if (activity.last_attendance) {
    const { date, present_count, total_count } = activity.last_attendance;
    const percentage = total_count > 0 ? Math.round((present_count / total_count) * 100) : 0;
    lastAttendance = { date, present_count, total_count, percentage };
  }

  return {
    success: true,
    class: summary,
    recent_activity: {
      last_attendance: lastAttendance,
      last_homework: activity.last_homework
    }
  };
};

module.exports = { getTimetable, getClassDetail };
