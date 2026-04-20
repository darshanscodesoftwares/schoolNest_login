const timetableRepository = require('./parent.timetable.repository');

const VALID_DAYS = new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
const DAY_NAMES  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const assertParentRole = (user) => {
  if (!user || user.role !== 'PARENT') {
    const error = new Error('Forbidden: only parents can access this resource');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }
};

const toMinutes = (t) => {
  const [h, m] = t.split(':');
  return (+h) * 60 + (+m);
};

const buildScheduleWithBreaks = (periods) => {
  const schedule = [];
  for (let i = 0; i < periods.length; i++) {
    schedule.push(Object.assign({}, periods[i], {
      type: 'period',
      duration_minutes: toMinutes(periods[i].end_time) - toMinutes(periods[i].start_time)
    }));

    if (i < periods.length - 1) {
      const currentEnd = periods[i].end_time;
      const nextStart  = periods[i + 1].start_time;
      if (currentEnd < nextStart) {
        schedule.push({
          type: 'break',
          subject: 'Break',
          start_time: currentEnd,
          end_time: nextStart,
          period_number: null,
          duration_minutes: toMinutes(nextStart) - toMinutes(currentEnd)
        });
      }
    }
  }

  // Re-number periods sequentially (1,2,3,break,4,5,6...)
  // so breaks don't create gaps regardless of how many breaks exist
  let counter = 1;
  schedule.forEach(function(entry) {
    if (entry.type === 'period') {
      entry.period_number = counter++;
    }
  });

  return schedule;
};

const getStudentTimetable = async ({ user, studentId, day }) => {
  assertParentRole(user);

  const student = await timetableRepository.getStudentByParent({
    studentId,
    parentId: user.user_id,
    schoolId: user.school_id
  });

  if (!student) {
    const error = new Error('Student does not belong to this parent');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  const resolvedDay = day || DAY_NAMES[new Date().getDay()];

  if (!VALID_DAYS.has(resolvedDay)) {
    const error = new Error('day must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday');
    error.statusCode = 400;
    error.code = 'INVALID_DAY';
    throw error;
  }

  const periods = await timetableRepository.getTimetableByClass({
    schoolId: user.school_id,
    className: student.class_name,
    section:   student.section,
    day:       resolvedDay
  });

  const schedule = buildScheduleWithBreaks(periods);

  return {
    student: { id: student.id, name: student.name },
    day: resolvedDay,
    total_periods: periods.length,
    schedule
  };
};

module.exports = {
  getStudentTimetable
};
