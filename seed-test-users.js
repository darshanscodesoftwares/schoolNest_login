/**
 * seed-test-users.js — Test login data (bypasses Bridge 1 / Bridge 2)
 *
 * Run from repo root: node seed-test-users.js
 *
 * Creates matching rows across auth_db and academic_db so you can log in
 * as teacher or parent without going through the full admin flow.
 *
 * What it creates (all idempotent):
 *   2 teachers — teacher_records + auth_db.users (same UUID on both sides)
 *   2 classes  — in the denormalized classes table, teacher_id = teacher UUID
 *   2 parents  — auth_db.users rows (id = PAR101, PAR102)
 *   3 students — linked to classes and parents
 *
 * Login credentials after seeding:
 *   Teacher 1: teacher1@schoolnest.com / Teacher@123
 *   Teacher 2: teacher2@schoolnest.com / Teacher@123
 *   Parent 1:  parent1@schoolnest.com  / Parent@123
 *   Parent 2:  parent2@schoolnest.com  / Parent@123
 */

require('./auth-service/node_modules/dotenv').config({ path: './auth-service/.env' });

const bcrypt = require('./auth-service/node_modules/bcrypt');
const { Pool } = require('./auth-service/node_modules/pg');

const SCHOOL_ID = 101;
const SALT_ROUNDS = 10;

const isRemote = process.env.DB_HOST && process.env.DB_HOST !== 'localhost';
const authPool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432', 10),
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'auth_db',
  ssl:      isRemote ? { rejectUnauthorized: false } : false,
});

const academicIsRemote = process.env.ACADEMIC_DB_HOST && process.env.ACADEMIC_DB_HOST !== 'localhost';
const academicPool = new Pool({
  host:     process.env.ACADEMIC_DB_HOST     || process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.ACADEMIC_DB_PORT || process.env.DB_PORT || '5432', 10),
  user:     process.env.ACADEMIC_DB_USER     || process.env.DB_USER     || 'postgres',
  password: process.env.ACADEMIC_DB_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.ACADEMIC_DB_NAME     || 'academic_db',
  ssl:      academicIsRemote ? { rejectUnauthorized: false } : false,
});

const ok  = (msg) => console.log('  ✓', msg);
const log = (msg) => console.log('\n──', msg);

// Deterministic UUIDs so re-running the seed doesn't create duplicates
const TEACHER_1_ID = '11111111-1111-4111-a111-111111111111';
const TEACHER_2_ID = '22222222-2222-4222-a222-222222222222';
const CLASS_1_ID   = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
const CLASS_2_ID   = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
const PARENT_1_ID  = 'PAR101';
const PARENT_2_ID  = 'PAR102';

async function seedTeachers() {
  log('teachers — teacher_records + auth_db.users (Bridge 1 replica)');

  const roleRes = await authPool.query(`SELECT id FROM roles WHERE name = 'TEACHER' LIMIT 1`);
  if (roleRes.rows.length === 0) throw new Error('TEACHER role missing — run seed-all.js first');
  const teacherRoleId = roleRes.rows[0].id;
  const pwdHash = await bcrypt.hash('Teacher@123', SALT_ROUNDS);

  const teachers = [
    { id: TEACHER_1_ID, name: 'John Teacher',  email: 'teacher1@schoolnest.com', phone: '+91-9000000001' },
    { id: TEACHER_2_ID, name: 'Jane Teacher',  email: 'teacher2@schoolnest.com', phone: '+91-9000000002' },
  ];

  for (const t of teachers) {
    await academicPool.query(
      `INSERT INTO teacher_records (id, auth_user_id, school_id, first_name, primary_email, primary_phone, designation, employment_status)
       VALUES ($1::uuid, $2::varchar, $3, $4, $5, $6, 'Teacher', 'Active')
       ON CONFLICT (id) DO NOTHING`,
      [t.id, t.id, SCHOOL_ID, t.name, t.email, t.phone]
    );

    await authPool.query(
      `INSERT INTO users (id, school_id, role_id, name, email, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [t.id, SCHOOL_ID, teacherRoleId, t.name, t.email, pwdHash]
    );

    ok(`teacher ${t.name} — ${t.email}`);
  }
}

async function seedClasses() {
  log('classes — denormalized table (teacher/parent modules read from this)');

  const classes = [
    { id: CLASS_1_ID, name: 'Class 10', section: 'A', subject: 'Mathematics', teacher_id: TEACHER_1_ID },
    { id: CLASS_2_ID, name: 'Class 10', section: 'B', subject: 'English',     teacher_id: TEACHER_2_ID },
  ];

  for (const c of classes) {
    await academicPool.query(
      `INSERT INTO classes (id, school_id, name, section, subject, teacher_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [c.id, SCHOOL_ID, c.name, c.section, c.subject, c.teacher_id]
    );
    ok(`${c.name} ${c.section} (${c.subject}) → teacher ${c.teacher_id.slice(0, 8)}…`);
  }
}

async function seedParents() {
  log('parents — auth_db.users (Bridge 2 replica, parent side)');

  const roleRes = await authPool.query(`SELECT id FROM roles WHERE name = 'PARENT' LIMIT 1`);
  if (roleRes.rows.length === 0) throw new Error('PARENT role missing — run seed-all.js first');
  const parentRoleId = roleRes.rows[0].id;
  const pwdHash = await bcrypt.hash('Parent@123', SALT_ROUNDS);

  const parents = [
    { id: PARENT_1_ID, name: 'Alice Parent', email: 'parent1@schoolnest.com' },
    { id: PARENT_2_ID, name: 'Bob Parent',   email: 'parent2@schoolnest.com' },
  ];

  for (const p of parents) {
    await authPool.query(
      `INSERT INTO users (id, school_id, role_id, name, email, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [p.id, SCHOOL_ID, parentRoleId, p.name, p.email, pwdHash]
    );
    ok(`parent ${p.name} — ${p.email} (id: ${p.id})`);
  }
}

async function seedStudents() {
  log('students — linked to class + parent (Bridge 2 replica, student side)');

  const students = [
    { class_id: CLASS_1_ID, roll_no: 1, name: 'Arjun Kumar',  parent_id: PARENT_1_ID },
    { class_id: CLASS_1_ID, roll_no: 2, name: 'Priya Singh',  parent_id: PARENT_2_ID },
    { class_id: CLASS_2_ID, roll_no: 1, name: 'Rahul Sharma', parent_id: PARENT_1_ID },
  ];

  for (const s of students) {
    await academicPool.query(
      `INSERT INTO students (school_id, class_id, roll_no, name, parent_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (school_id, class_id, roll_no) DO NOTHING`,
      [SCHOOL_ID, s.class_id, s.roll_no, s.name, s.parent_id]
    );
    ok(`${s.name} — class ${s.class_id.slice(0, 8)}… roll ${s.roll_no} — parent ${s.parent_id}`);
  }
}

async function main() {
  console.log('🌱 schoolNest test-users seed — school_id=' + SCHOOL_ID);
  try {
    await seedTeachers();
    await seedClasses();
    await seedParents();
    await seedStudents();

    console.log('\n✅ Test users ready!\n');
    console.log('  Teacher 1: teacher1@schoolnest.com / Teacher@123');
    console.log('  Teacher 2: teacher2@schoolnest.com / Teacher@123');
    console.log('  Parent 1:  parent1@schoolnest.com  / Parent@123');
    console.log('  Parent 2:  parent2@schoolnest.com  / Parent@123');
    console.log('  Admin:     admin@schoolnest.com    / Admin@123\n');
  } catch (e) {
    console.error('\n❌ Seed failed:', e.message);
    process.exit(1);
  } finally {
    await authPool.end();
    await academicPool.end();
  }
}

main();
