const repo = require('./admin.timetable.repository');

const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getPeriodConfig = async ({ schoolId, class_name, section, academic_year }) => {
  if (!class_name || !section || !academic_year) {
    const e = new Error('class_name, section, and academic_year are required');
    e.statusCode = 400;
    throw e;
  }
  return repo.getPeriodConfig({ schoolId, class_name, section, academic_year });
};

const upsertPeriodConfig = async ({ schoolId, class_name, section, academic_year, periods }) => {
  if (!class_name || !section || !academic_year || !Array.isArray(periods) || periods.length === 0) {
    const e = new Error('class_name, section, academic_year, and periods[] are required');
    e.statusCode = 400;
    throw e;
  }
  return repo.replacePeriodConfig({ schoolId, class_name, section, academic_year, periods });
};

const getTimetableGrid = async ({ schoolId, class_name, section, academic_year, day }) => {
  if (!class_name || !section || !academic_year) {
    const e = new Error('class_name, section, and academic_year are required');
    e.statusCode = 400;
    throw e;
  }
  if (day && !VALID_DAYS.includes(day)) {
    const e = new Error('day must be one of: ' + VALID_DAYS.join(', '));
    e.statusCode = 400;
    throw e;
  }

  const days = day ? [day] : VALID_DAYS;

  const config  = await repo.getPeriodConfig({ schoolId, class_name, section, academic_year });
  const entries = await repo.getTimetableEntries({ schoolId, class_name, section, academic_year, days });

  // Build lookup: "day|period_number" → entry
  const entryMap = {};
  entries.forEach(function(e) {
    entryMap[e.day_of_week + '|' + e.period_number] = e;
  });

  const grid = {};
  days.forEach(function(d) {
    grid[d] = config.map(function(slot) {
      const cell = entryMap[d + '|' + slot.period_number] || null;
      return {
        period_number: slot.period_number,
        label:         slot.label,
        is_break:      slot.is_break,
        start_time:    slot.start_time,
        end_time:      slot.end_time,
        subject:       cell ? cell.subject      : null,
        teacher_id:    cell ? cell.teacher_id   : null,
        teacher_name:  cell ? cell.teacher_name : null,
        status:        cell ? cell.status       : 'DRAFT'
      };
    });
  });

  const anyPublished = entries.some(function(e) { return e.status === 'PUBLISHED'; });

  return {
    class_name: class_name,
    section:    section,
    academic_year: academic_year,
    status:     anyPublished ? 'PUBLISHED' : 'DRAFT',
    grid:       grid
  };
};

const upsertPeriod = async ({ schoolId, class_name, section, academic_year, day_of_week, period_number, subject, teacher_id }) => {
  if (!class_name || !section || !academic_year || !day_of_week || period_number == null || !subject) {
    const e = new Error('class_name, section, academic_year, day_of_week, period_number, and subject are required');
    e.statusCode = 400;
    throw e;
  }
  if (!VALID_DAYS.includes(day_of_week)) {
    const e = new Error('day_of_week must be one of: ' + VALID_DAYS.join(', '));
    e.statusCode = 400;
    throw e;
  }

  const slot = await repo.getPeriodSlot({ schoolId, class_name, academic_year, period_number });
  if (!slot) {
    const e = new Error('Period number ' + period_number + ' not found in config for ' + class_name + ' / ' + academic_year + '. Configure period timings first.');
    e.statusCode = 400;
    throw e;
  }

  return repo.upsertPeriod({
    schoolId, class_name, section, academic_year, day_of_week, period_number, subject,
    teacher_id: teacher_id || null,
    start_time: slot.start_time,
    end_time:   slot.end_time
  });
};

const deletePeriod = async ({ schoolId, class_name, section, academic_year, day_of_week, period_number }) => {
  if (!class_name || !section || !academic_year) {
    const e = new Error('class_name, section, and academic_year are required');
    e.statusCode = 400;
    throw e;
  }
  return repo.deletePeriod({ schoolId, class_name, section, academic_year, day_of_week, period_number });
};

const setStatus = async ({ schoolId, class_name, section, academic_year, status }) => {
  if (!class_name || !section || !academic_year) {
    const e = new Error('class_name, section, and academic_year are required');
    e.statusCode = 400;
    throw e;
  }
  return repo.setStatus({ schoolId, class_name, section, academic_year, status });
};

module.exports = { getPeriodConfig, upsertPeriodConfig, getTimetableGrid, upsertPeriod, deletePeriod, setStatus };
