'use strict';

/**
 * Seed: one parent (Ravi Kumar) with 3 children, fully wired via Bridge 2 flow.
 *
 * What it creates:
 *   academic_db:
 *     - 3 x students_admission rows (status = Approved)
 *     - 3 x personal_information rows
 *     - 3 x academic_information rows
 *     - 3 x parent_guardian_information rows (same phone + email for all 3)
 *     - 3 x students rows (parent_id = parent auth_db user id)
 *
 *   auth_db:
 *     - 1 x users row (role = PARENT)
 *
 * Login:
 *   Phone OTP: 9500012345
 *   OTP code:  1234  (static dev OTP)
 *
 * Run locally:
 *   node seed-parent-3children.js
 *
 * Run against Render:
 *   ACADEMIC_DB_HOST=dpg-d7ed0dnaqgkc73fv3o8g-a.singapore-postgres.render.com \
 *   ACADEMIC_DB_PASSWORD=<pass> \
 *   AUTH_DB_HOST=dpg-d7ed0vhkh4rs73aaj5hg-a.singapore-postgres.render.com \
 *   AUTH_DB_PASSWORD=<pass> \
 *   node seed-parent-3children.js
 */

const { Pool }  = require('./academic-service/node_modules/pg');
const bcrypt    = require('./auth-service/node_modules/bcrypt');
require('./academic-service/node_modules/dotenv').config({ path: './academic-service/.env' });

const SCHOOL_ID   = 101;
const PARENT_PHONE = '9500012345';
const PARENT_EMAIL = 'ravi.kumar.parent@schoolnest.com';
const PARENT_NAME  = 'Ravi Kumar';

const academicPool = new Pool({
  host:     process.env.ACADEMIC_DB_HOST     || 'localhost',
  port:     parseInt(process.env.ACADEMIC_DB_PORT || '5432'),
  database: process.env.ACADEMIC_DB_NAME     || 'academic_db',
  user:     process.env.ACADEMIC_DB_USER     || 'postgres',
  password: process.env.ACADEMIC_DB_PASSWORD || 'Postgres@12345',
  ssl: process.env.ACADEMIC_DB_HOST && process.env.ACADEMIC_DB_HOST.includes('render.com')
        ? { rejectUnauthorized: false } : false
});

// Auth DB uses its own env or falls back to matching render host pattern
const authPool = new Pool({
  host:     process.env.AUTH_DB_HOST     || 'localhost',
  port:     parseInt(process.env.AUTH_DB_PORT || '5432'),
  database: process.env.AUTH_DB_NAME     || 'auth_db',
  user:     process.env.AUTH_DB_USER     || 'postgres',
  password: process.env.AUTH_DB_PASSWORD || 'Postgres@12345',
  ssl: process.env.AUTH_DB_HOST && process.env.AUTH_DB_HOST.includes('render.com')
        ? { rejectUnauthorized: false } : false
});

const CHILDREN = [
  { first_name: 'Aryan',  last_name: 'Kumar', gender: 'Male',   roll: 51 },
  { first_name: 'Priya',  last_name: 'Kumar', gender: 'Female', roll: 52 },
  { first_name: 'Rohit',  last_name: 'Kumar', gender: 'Male',   roll: 53 }
];

async function main() {
  const aClient = await academicPool.connect();
  const authClient = await authPool.connect();

  try {
    // ── 1. Pick classes for the 3 children ────────────────────────────────────
    const { rows: classRows } = await aClient.query(
      `SELECT DISTINCT ON (name) id, name, section
       FROM classes
       WHERE school_id = $1
       ORDER BY name, section`,
      [SCHOOL_ID]
    );

    if (classRows.length === 0) {
      throw new Error('No classes found for school ' + SCHOOL_ID + '. Run seed-all.js + seed-test-users.js first.');
    }

    // Assign each child a class (cycle if fewer than 3 classes)
    const assignedClasses = CHILDREN.map(function(_, i) {
      return classRows[i % classRows.length];
    });

    console.log('Class assignments:');
    CHILDREN.forEach(function(c, i) {
      console.log(' ', c.first_name, c.last_name, '→', assignedClasses[i].name, assignedClasses[i].section);
    });

    // ── 2. Fetch school_classes id for each assigned class ────────────────────
    // academic_information.class_id references school_classes.id
    const scIdMap = {};
    for (var i = 0; i < assignedClasses.length; i++) {
      var cls = assignedClasses[i];
      if (scIdMap[cls.name]) continue;
      var scRes = await aClient.query(
        `SELECT id FROM school_classes WHERE school_id = $1 AND class_name = $2 LIMIT 1`,
        [SCHOOL_ID, cls.name]
      );
      if (scRes.rows.length > 0) {
        scIdMap[cls.name] = scRes.rows[0].id;
      } else {
        // Insert into school_classes if missing
        var insertSc = await aClient.query(
          `INSERT INTO school_classes (school_id, class_name, order_number)
           VALUES ($1, $2, 99) RETURNING id`,
          [SCHOOL_ID, cls.name]
        );
        scIdMap[cls.name] = insertSc.rows[0].id;
        console.log('  Created school_classes entry for', cls.name);
      }
    }

    await aClient.query('BEGIN');
    await authClient.query('BEGIN');

    // ── 3. Create parent auth user ────────────────────────────────────────────
    const roleRes = await authClient.query(
      `SELECT id FROM roles WHERE name = 'PARENT' LIMIT 1`
    );
    if (roleRes.rows.length === 0) throw new Error('PARENT role not found in auth_db');
    const roleId = roleRes.rows[0].id;

    const passwordHash = await bcrypt.hash('Parent@123', 10);
    const { v4: uuidv4 } = require('./academic-service/node_modules/uuid');
    const newParentId = uuidv4();
    const parentAuthRes = await authClient.query(
      `INSERT INTO users (id, school_id, role_id, name, email, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [newParentId, SCHOOL_ID, roleId, PARENT_NAME, PARENT_EMAIL, passwordHash]
    );
    const parentAuthId = parentAuthRes.rows[0].id;
    console.log('\nParent auth user:', PARENT_EMAIL, '(id:', parentAuthId + ')');

    // ── 4. Create admission + student for each child ──────────────────────────
    for (var j = 0; j < CHILDREN.length; j++) {
      var child    = CHILDREN[j];
      var cls      = assignedClasses[j];
      var scId     = scIdMap[cls.name];
      var admNo    = 'ADM-SEED-' + (j + 1);
      var fullName = child.first_name + ' ' + child.last_name;

      // students_admission
      var admRes = await aClient.query(
        `INSERT INTO students_admission (school_id, admission_status, submitted_date)
         VALUES ($1, 'Approved', NOW())
         RETURNING id`,
        [SCHOOL_ID]
      );
      var admId = admRes.rows[0].id;

      // personal_information
      await aClient.query(
        `INSERT INTO personal_information (school_id, student_id, first_name, last_name, date_of_birth, gender, nationality)
         VALUES ($1, $2, $3, $4, '2010-06-15', $5, 'Indian')`,
        [SCHOOL_ID, admId, child.first_name, child.last_name, child.gender]
      );

      // academic_information
      await aClient.query(
        `INSERT INTO academic_information (school_id, student_id, admission_number, admission_date, class_id, section, roll_number)
         VALUES ($1, $2, $3, NOW(), $4, $5, $6)`,
        [SCHOOL_ID, admId, admNo + '-' + admId.slice(0, 6), scId, cls.section, String(child.roll)]
      );

      // parent_guardian_information — same phone + email for all 3 → same parent
      await aClient.query(
        `INSERT INTO parent_guardian_information
           (school_id, student_id, father_full_name, father_phone, father_email)
         VALUES ($1, $2, $3, $4, $5)`,
        [SCHOOL_ID, admId, PARENT_NAME, PARENT_PHONE, PARENT_EMAIL]
      );

      // students (the live table teachers/parents query)
      await aClient.query(
        `INSERT INTO students (school_id, class_id, roll_no, name, parent_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (school_id, class_id, roll_no) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id`,
        [SCHOOL_ID, cls.id, child.roll, fullName, parentAuthId]
      );

      console.log('  Child', (j + 1) + ':', fullName, '| class:', cls.name, cls.section, '| roll:', child.roll, '| adm_id:', admId);
    }

    await aClient.query('COMMIT');
    await authClient.query('COMMIT');

    console.log('\n✓ Done! Login with:');
    console.log('  Phone : ' + PARENT_PHONE);
    console.log('  OTP   : 1234');
    console.log('  Email : ' + PARENT_EMAIL + ' / Parent@123  (fallback)');

  } catch (e) {
    await aClient.query('ROLLBACK').catch(function() {});
    await authClient.query('ROLLBACK').catch(function() {});
    console.error('Error:', e.message);
    throw e;
  } finally {
    aClient.release();
    authClient.release();
    await academicPool.end();
    await authPool.end();
  }
}

main().catch(function(e) {
  console.error(e);
  process.exit(1);
});
