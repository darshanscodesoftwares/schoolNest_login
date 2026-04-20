'use strict';

/**
 * Seed timetable data for school 101 (demo school).
 *
 * Creates period config + full week timetable (Mon-Sat) for each class
 * that has assigned teachers, then publishes everything.
 *
 * Run locally:
 *   node seed-timetable.js
 *
 * Run against Render:
 *   ACADEMIC_DB_HOST=dpg-d7ed0dnaqgkc73fv3o8g-a.singapore-postgres.render.com \
 *   ACADEMIC_DB_PASSWORD=<pass> node seed-timetable.js
 */

const { Pool } = require('./academic-service/node_modules/pg');
require('./academic-service/node_modules/dotenv').config({ path: './academic-service/.env' });

const pool = new Pool({
  host:     process.env.ACADEMIC_DB_HOST     || 'localhost',
  port:     parseInt(process.env.ACADEMIC_DB_PORT || '5432'),
  database: process.env.ACADEMIC_DB_NAME     || 'academic_db',
  user:     process.env.ACADEMIC_DB_USER     || 'postgres',
  password: process.env.ACADEMIC_DB_PASSWORD || 'postgres',
  ssl:      process.env.ACADEMIC_DB_HOST && process.env.ACADEMIC_DB_HOST.includes('render.com')
              ? { rejectUnauthorized: false } : false
});

const SCHOOL_ID = 101;
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Period config applies to all sections of a class_name
// Structure: { periodNumber, label, isBreak, start, end }
const PERIOD_CONFIG_TEMPLATE = [
  { period_number: 1,  label: 'Period 1',      is_break: false, start_time: '08:00', end_time: '08:45' },
  { period_number: 2,  label: 'Period 2',      is_break: false, start_time: '08:45', end_time: '09:30' },
  { period_number: 3,  label: 'Period 3',      is_break: false, start_time: '09:30', end_time: '10:15' },
  { period_number: 4,  label: 'Lunch Break',   is_break: true,  start_time: '10:15', end_time: '10:45' },
  { period_number: 5,  label: 'Period 4',      is_break: false, start_time: '10:45', end_time: '11:30' },
  { period_number: 6,  label: 'Period 5',      is_break: false, start_time: '11:30', end_time: '12:15' },
  { period_number: 7,  label: 'Period 6',      is_break: false, start_time: '12:15', end_time: '13:00' }
];

// Subject rotation per class (6 teaching slots per day, skipping break at period_number 4)
const SUBJECTS_BY_CLASS = {
  default: ['Mathematics', 'English', 'Science', 'Social Studies', 'Computer Science', 'Physical Education']
};

// Day-based subject rotation so each day feels different
const DAY_SUBJECT_ROTATION = {
  Monday:    [0, 1, 2, 3, 4, 5],
  Tuesday:   [1, 2, 3, 4, 5, 0],
  Wednesday: [2, 3, 4, 5, 0, 1],
  Thursday:  [3, 4, 5, 0, 1, 2],
  Friday:    [4, 5, 0, 1, 2, 3],
  Saturday:  [5, 0, 1, 2, 3, 4]
};

async function upsertPeriodConfig(client, schoolId, className) {
  // Delete existing and re-insert
  await client.query(
    'DELETE FROM timetable_period_config WHERE school_id = $1 AND class_name = $2',
    [schoolId, className]
  );
  for (var i = 0; i < PERIOD_CONFIG_TEMPLATE.length; i++) {
    var p = PERIOD_CONFIG_TEMPLATE[i];
    await client.query(
      `INSERT INTO timetable_period_config
         (school_id, class_name, period_number, label, is_break, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [schoolId, className, p.period_number, p.label, p.is_break, p.start_time, p.end_time]
    );
  }
  console.log('  Period config upserted for', className);
}

async function upsertTimetable(client, schoolId, className, section, teacherId) {
  var subjects = SUBJECTS_BY_CLASS[className] || SUBJECTS_BY_CLASS.default;
  var teachingSlots = PERIOD_CONFIG_TEMPLATE.filter(function(p) { return !p.is_break; });

  // Delete existing rows for this class+section
  await client.query(
    'DELETE FROM timetable WHERE school_id = $1 AND class_name = $2 AND section = $3',
    [schoolId, className, section]
  );

  for (var d = 0; d < DAYS.length; d++) {
    var day = DAYS[d];
    var rotation = DAY_SUBJECT_ROTATION[day];

    for (var s = 0; s < teachingSlots.length; s++) {
      var slot = teachingSlots[s];
      var subject = subjects[rotation[s] % subjects.length];

      await client.query(
        `INSERT INTO timetable
           (school_id, class_name, section, day_of_week, period_number, subject, teacher_id, start_time, end_time, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PUBLISHED')`,
        [schoolId, className, section, day, slot.period_number, subject, teacherId, slot.start_time, slot.end_time]
      );
    }
  }
  console.log('  Timetable seeded & published for', className, section, '(teacher:', teacherId + ')');
}

async function main() {
  const client = await pool.connect();
  try {
    console.log('Fetching class assignments for school', SCHOOL_ID, '...');

    // Get all unique class+section+teacher combos from the classes table
    const { rows: classRows } = await client.query(
      `SELECT DISTINCT name AS class_name, section, teacher_id
       FROM classes
       WHERE school_id = $1
       ORDER BY class_name, section`,
      [SCHOOL_ID]
    );

    if (classRows.length === 0) {
      console.log('No classes found for school', SCHOOL_ID, '— run seed-all.js first');
      return;
    }

    console.log('Found', classRows.length, 'class-section assignments:');
    classRows.forEach(function(r) {
      console.log(' ', r.class_name, r.section, '→ teacher:', r.teacher_id);
    });

    await client.query('BEGIN');

    // Upsert period config for each unique class_name
    var seenClassNames = {};
    for (var i = 0; i < classRows.length; i++) {
      var className = classRows[i].class_name;
      if (!seenClassNames[className]) {
        seenClassNames[className] = true;
        await upsertPeriodConfig(client, SCHOOL_ID, className);
      }
    }

    // Upsert timetable for each class+section
    for (var j = 0; j < classRows.length; j++) {
      var row = classRows[j];
      await upsertTimetable(client, SCHOOL_ID, row.class_name, row.section, row.teacher_id);
    }

    await client.query('COMMIT');
    console.log('\nDone! All timetables seeded and published.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error:', e.message);
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(function(e) {
  console.error(e);
  process.exit(1);
});
