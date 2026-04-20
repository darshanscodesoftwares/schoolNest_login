const pool = require('../../../config/db');

const getPeriodConfig = async ({ schoolId, class_name }) => {
  const { rows } = await pool.query({
    text: `SELECT period_number, label, is_break, start_time, end_time
           FROM timetable_period_config
           WHERE school_id = $1 AND class_name = $2
           ORDER BY period_number ASC`,
    values: [schoolId, class_name]
  });
  return rows;
};

const getPeriodSlot = async ({ schoolId, class_name, period_number }) => {
  const { rows } = await pool.query({
    text: `SELECT start_time, end_time
           FROM timetable_period_config
           WHERE school_id = $1 AND class_name = $2 AND period_number = $3`,
    values: [schoolId, class_name, period_number]
  });
  return rows[0] || null;
};

const replacePeriodConfig = async ({ schoolId, class_name, periods }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query({
      text:   'DELETE FROM timetable_period_config WHERE school_id = $1 AND class_name = $2',
      values: [schoolId, class_name]
    });
    for (var i = 0; i < periods.length; i++) {
      var p = periods[i];
      await client.query({
        text: `INSERT INTO timetable_period_config
                 (school_id, class_name, period_number, label, is_break, start_time, end_time)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        values: [schoolId, class_name, p.period_number, p.label || '', p.is_break || false, p.start_time, p.end_time]
      });
    }
    await client.query('COMMIT');
    return getPeriodConfig({ schoolId, class_name });
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const getTimetableEntries = async ({ schoolId, class_name, section, days }) => {
  const { rows } = await pool.query({
    text: `SELECT t.period_number, t.day_of_week, t.subject, t.teacher_id, t.status,
                  CONCAT(tr.first_name, ' ', tr.last_name) AS teacher_name
           FROM timetable t
           LEFT JOIN teacher_records tr ON tr.id = t.teacher_id AND tr.school_id = t.school_id
           WHERE t.school_id = $1 AND t.class_name = $2 AND t.section = $3
             AND t.day_of_week = ANY($4::text[])
           ORDER BY t.day_of_week ASC, t.period_number ASC`,
    values: [schoolId, class_name, section, days]
  });
  return rows;
};

const upsertPeriod = async ({ schoolId, class_name, section, day_of_week, period_number, subject, teacher_id, start_time, end_time }) => {
  const { rows } = await pool.query({
    text: `INSERT INTO timetable
             (school_id, class_name, section, day_of_week, period_number, subject, teacher_id, start_time, end_time, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'DRAFT')
           ON CONFLICT (school_id, class_name, section, day_of_week, period_number)
           DO UPDATE SET
             subject    = EXCLUDED.subject,
             teacher_id = EXCLUDED.teacher_id,
             start_time = EXCLUDED.start_time,
             end_time   = EXCLUDED.end_time
           RETURNING *`,
    values: [schoolId, class_name, section, day_of_week, period_number, subject, teacher_id, start_time, end_time]
  });
  return rows[0];
};

const deletePeriod = async ({ schoolId, class_name, section, day_of_week, period_number }) => {
  await pool.query({
    text: `DELETE FROM timetable
           WHERE school_id = $1 AND class_name = $2 AND section = $3
             AND day_of_week = $4 AND period_number = $5`,
    values: [schoolId, class_name, section, day_of_week, period_number]
  });
};

const setStatus = async ({ schoolId, class_name, section, status }) => {
  await pool.query({
    text: `UPDATE timetable SET status = $1
           WHERE school_id = $2 AND class_name = $3 AND section = $4`,
    values: [status, schoolId, class_name, section]
  });
};

module.exports = {
  getPeriodConfig,
  getPeriodSlot,
  replacePeriodConfig,
  getTimetableEntries,
  upsertPeriod,
  deletePeriod,
  setStatus
};
