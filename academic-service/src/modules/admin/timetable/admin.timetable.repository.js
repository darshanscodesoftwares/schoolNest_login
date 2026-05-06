const pool = require('../../../config/db');

// Get or create a class_definition
const getOrCreateClassDefinition = async ({ schoolId, class_name, section, academic_year }) => {
  // First try to get it
  let { rows } = await pool.query({
    text: `SELECT id FROM class_definitions
           WHERE school_id = $1 AND class_name = $2 AND section = $3 AND academic_year = $4`,
    values: [schoolId, class_name, section, academic_year]
  });

  if (rows.length > 0) {
    return rows[0].id;
  }

  // Create it if it doesn't exist
  ({ rows } = await pool.query({
    text: `INSERT INTO class_definitions (school_id, class_name, section, academic_year)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
    values: [schoolId, class_name, section, academic_year]
  }));

  return rows[0].id;
};

const getPeriodConfig = async ({ schoolId, class_name, academic_year }) => {
  const { rows } = await pool.query({
    text: `SELECT period_number, label, is_break, start_time, end_time
           FROM timetable_period_config
           WHERE school_id = $1 AND class_name = $2 AND academic_year = $3
           ORDER BY period_number ASC`,
    values: [schoolId, class_name, academic_year]
  });
  return rows;
};

const getPeriodSlot = async ({ schoolId, class_name, academic_year, period_number }) => {
  const { rows } = await pool.query({
    text: `SELECT start_time, end_time
           FROM timetable_period_config
           WHERE school_id = $1 AND class_name = $2 AND academic_year = $3 AND period_number = $4`,
    values: [schoolId, class_name, academic_year, period_number]
  });
  return rows[0] || null;
};

const replacePeriodConfig = async ({ schoolId, class_name, academic_year, periods }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query({
      text:   'DELETE FROM timetable_period_config WHERE school_id = $1 AND class_name = $2 AND academic_year = $3',
      values: [schoolId, class_name, academic_year]
    });
    for (var i = 0; i < periods.length; i++) {
      var p = periods[i];
      await client.query({
        text: `INSERT INTO timetable_period_config
                 (school_id, class_name, academic_year, period_number, label, is_break, start_time, end_time)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        values: [schoolId, class_name, academic_year, p.period_number, p.label || '', p.is_break || false, p.start_time, p.end_time]
      });
    }
    await client.query('COMMIT');
    return getPeriodConfig({ schoolId, class_name, academic_year });
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const getTimetableEntries = async ({ schoolId, class_name, section, academic_year, days }) => {
  // Get class_definition_id
  const classDefId = await getOrCreateClassDefinition({ schoolId, class_name, section, academic_year });

  const { rows } = await pool.query({
    text: `SELECT t.period_number, t.day_of_week, t.subject, t.teacher_id, t.status,
                  tr.first_name AS teacher_name
           FROM timetable t
           LEFT JOIN teacher_records tr ON tr.id = t.teacher_id::uuid AND tr.school_id = t.school_id
           WHERE t.class_definition_id = $1::uuid AND t.day_of_week = ANY($2::text[])
           ORDER BY t.day_of_week ASC, t.period_number ASC`,
    values: [classDefId, days]
  });
  return rows;
};

const upsertPeriod = async ({ schoolId, class_name, section, academic_year, day_of_week, period_number, subject, teacher_id, start_time, end_time }) => {
  // Get or create class_definition
  const classDefId = await getOrCreateClassDefinition({ schoolId, class_name, section, academic_year });

  const { rows } = await pool.query({
    text: `INSERT INTO timetable
             (school_id, class_definition_id, class_name, section, day_of_week, period_number, subject, teacher_id, start_time, end_time, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'DRAFT')
           ON CONFLICT (school_id, class_name, section, day_of_week, period_number)
           DO UPDATE SET
             subject    = EXCLUDED.subject,
             teacher_id = EXCLUDED.teacher_id,
             start_time = EXCLUDED.start_time,
             end_time   = EXCLUDED.end_time
           RETURNING *`,
    values: [schoolId, classDefId, class_name, section, day_of_week, period_number, subject, teacher_id, start_time, end_time]
  });
  return rows[0];
};

const deletePeriod = async ({ schoolId, class_name, section, academic_year, day_of_week, period_number }) => {
  // Get class_definition_id
  const classDefId = await getOrCreateClassDefinition({ schoolId, class_name, section, academic_year });

  await pool.query({
    text: `DELETE FROM timetable
           WHERE class_definition_id = $1::uuid AND day_of_week = $2 AND period_number = $3`,
    values: [classDefId, day_of_week, period_number]
  });
};

const setStatus = async ({ schoolId, class_name, section, academic_year, status }) => {
  // Get class_definition_id
  const classDefId = await getOrCreateClassDefinition({ schoolId, class_name, section, academic_year });

  await pool.query({
    text: `UPDATE timetable SET status = $1
           WHERE class_definition_id = $2::uuid`,
    values: [status, classDefId]
  });
};

module.exports = {
  getOrCreateClassDefinition,
  getPeriodConfig,
  getPeriodSlot,
  replacePeriodConfig,
  getTimetableEntries,
  upsertPeriod,
  deletePeriod,
  setStatus
};
