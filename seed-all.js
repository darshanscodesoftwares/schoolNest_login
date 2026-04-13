/**
 * seed-all.js — Unified seed for schoolNest monorepo
 *
 * Run from repo root: node seed-all.js
 *
 * What it seeds:
 *   auth_db  — roles (ADMIN, TEACHER, PARENT) + admin user ADM001
 *   academic_db — attendance_statuses, school_classes, enquiry_sources,
 *                 sections, departments, subjects, staff_roles/departments/positions,
 *                 school_admin_profile for school 101
 *
 * Teachers and parents are NOT seeded here — they are created via Admin API:
 *   POST /api/v1/academic/admin/teacher-records   → Bridge 1 auto-creates auth user
 *   PUT  /api/v1/academic/admin/admissions/:id/approve → Bridge 2 auto-creates parent
 */

require('./auth-service/node_modules/dotenv').config({ path: './auth-service/.env' });

const bcrypt = require('./auth-service/node_modules/bcrypt');
const { Pool } = require('./auth-service/node_modules/pg');

const SCHOOL_ID = 101;
const SALT_ROUNDS = 10;

// ─── Auth DB pool ──────────────────────────────────────────────────────────────
const authPool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432', 10),
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'auth_db',
});

// ─── Academic DB pool ──────────────────────────────────────────────────────────
const academicPool = new Pool({
  host:     process.env.ACADEMIC_DB_HOST     || process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.ACADEMIC_DB_PORT || process.env.DB_PORT || '5432', 10),
  user:     process.env.ACADEMIC_DB_USER     || process.env.DB_USER     || 'postgres',
  password: process.env.ACADEMIC_DB_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.ACADEMIC_DB_NAME     || 'academic_db',
});

// ─── Helpers ───────────────────────────────────────────────────────────────────
const ok  = (msg) => console.log('  ✓', msg);
const log = (msg) => console.log('\n──', msg);
const err = (msg, e) => { console.error('  ✗', msg, e.message); };

// ─── AUTH DB ───────────────────────────────────────────────────────────────────
async function seedAuthDb() {
  log('auth_db');

  // 1. Roles
  for (const role of ['ADMIN', 'TEACHER', 'PARENT']) {
    await authPool.query(
      `INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
      [role]
    );
  }
  ok('Roles: ADMIN, TEACHER, PARENT');

  // 2. Admin user ADM001
  const roleRes = await authPool.query(`SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1`);
  if (roleRes.rows.length === 0) throw new Error('ADMIN role not found after insert');
  const adminRoleId = roleRes.rows[0].id;

  const adminHash = await bcrypt.hash('Admin@123', SALT_ROUNDS);
  await authPool.query(
    `INSERT INTO users (id, school_id, role_id, name, email, password_hash)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO NOTHING`,
    ['ADM001', SCHOOL_ID, adminRoleId, 'Admin User', 'admin@schoolnest.com', adminHash]
  );
  ok('Admin user: ADM001 / admin@schoolnest.com / Admin@123');
}

// ─── ACADEMIC DB ───────────────────────────────────────────────────────────────
async function seedAcademicDb() {
  log('academic_db — attendance statuses');
  const statuses = [
    { code: 'PRESENT',  label: 'Present',  color: 'green',  is_active: true },
    { code: 'ABSENT',   label: 'Absent',   color: 'red',    is_active: true },
    { code: 'LATE',     label: 'Late',     color: 'orange', is_active: true },
    { code: 'HALF_DAY', label: 'Half Day', color: 'yellow', is_active: true },
  ];
  for (const s of statuses) {
    await academicPool.query(
      `INSERT INTO attendance_statuses (school_id, code, label, color, is_active)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (school_id, code) DO NOTHING`,
      [SCHOOL_ID, s.code, s.label, s.color, s.is_active]
    ).catch(e => err(`attendance_status ${s.code}`, e));
  }
  ok('attendance_statuses: PRESENT, ABSENT, LATE, HALF_DAY');

  // ── Blood groups + license types (already seeded by migration, ensure idempotent)
  log('academic_db — blood groups & license types');
  const bloodGroups = [
    { g: 'O+', n: 1 }, { g: 'O-', n: 2 },
    { g: 'A+', n: 3 }, { g: 'A-', n: 4 },
    { g: 'B+', n: 5 }, { g: 'B-', n: 6 },
    { g: 'AB+',n: 7 }, { g: 'AB-',n: 8 },
  ];
  for (const bg of bloodGroups) {
    await academicPool.query(
      `INSERT INTO blood_groups (blood_group, order_number) VALUES ($1, $2) ON CONFLICT (blood_group) DO NOTHING`,
      [bg.g, bg.n]
    ).catch(e => err(`blood_group ${bg.g}`, e));
  }
  ok('blood_groups: O+, O-, A+, A-, B+, B-, AB+, AB-');

  const licenseTypes = [
    'LMV - Light Motor Vehicle',
    'MCWG - Motorcycle With Gear',
    'HMV - Heavy Motor Vehicle',
    'HPMV - Heavy Passenger Motor Vehicle',
    'MGV - Medium Goods Vehicle',
    'Transport Vehicle',
  ];
  for (let i = 0; i < licenseTypes.length; i++) {
    await academicPool.query(
      `INSERT INTO license_types (license_name, order_number) VALUES ($1, $2) ON CONFLICT (license_name) DO NOTHING`,
      [licenseTypes[i], i + 1]
    ).catch(e => err(`license_type ${licenseTypes[i]}`, e));
  }
  ok('license_types: 6 types');

  // ── School classes (admin-defined, school 101)
  log('academic_db — school_classes for school 101');
  const classNames = [
    'Nursery', 'LKG', 'UKG',
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11', 'Class 12',
  ];
  for (let i = 0; i < classNames.length; i++) {
    await academicPool.query(
      `INSERT INTO school_classes (school_id, class_name, order_number)
       VALUES ($1, $2, $3) ON CONFLICT (school_id, class_name) DO NOTHING`,
      [SCHOOL_ID, classNames[i], i + 1]
    ).catch(e => err(`school_class ${classNames[i]}`, e));
  }
  ok(`school_classes: ${classNames.length} classes (Nursery → Class 12)`);

  // ── Sections
  log('academic_db — sections for school 101');
  const sectionNames = ['A', 'B', 'C', 'D', 'E'];
  for (let i = 0; i < sectionNames.length; i++) {
    await academicPool.query(
      `INSERT INTO sections (school_id, section_name) VALUES ($1, $2) ON CONFLICT (school_id, section_name) DO NOTHING`,
      [SCHOOL_ID, sectionNames[i]]
    ).catch(e => err(`section ${sectionNames[i]}`, e));
  }
  ok(`sections: ${sectionNames.join(', ')}`);

  // ── Enquiry sources
  log('academic_db — enquiry_sources for school 101');
  const enquirySources = [
    'Website',
    'Social Media',
    'Referral / Word of Mouth',
    'Newspaper Advertisement',
    'Hoarding / Banner',
    'Walk-in',
    'Phone Enquiry',
    'School Fair / Event',
    'Alumni',
    'Other',
  ];
  for (let i = 0; i < enquirySources.length; i++) {
    await academicPool.query(
      `INSERT INTO enquiry_sources (school_id, source_name, order_number)
       VALUES ($1, $2, $3) ON CONFLICT (school_id, source_name) DO NOTHING`,
      [SCHOOL_ID, enquirySources[i], i + 1]
    ).catch(e => err(`enquiry_source ${enquirySources[i]}`, e));
  }
  ok(`enquiry_sources: ${enquirySources.length} sources`);

  // ── Departments (academic)
  log('academic_db — departments for school 101');
  const departments = [
    'Science', 'Mathematics', 'English', 'Hindi',
    'Social Studies', 'Commerce', 'Arts', 'Physical Education',
    'Computer Science', 'Administration',
  ];
  for (let i = 0; i < departments.length; i++) {
    await academicPool.query(
      `INSERT INTO departments (school_id, department_name, order_number)
       VALUES ($1, $2, $3) ON CONFLICT (school_id, department_name) DO NOTHING`,
      [SCHOOL_ID, departments[i], i + 1]
    ).catch(e => err(`department ${departments[i]}`, e));
  }
  ok(`departments: ${departments.length} departments`);

  // ── Subjects
  log('academic_db — subjects for school 101');
  const subjectNames = [
    'Mathematics', 'English', 'Hindi', 'Science',
    'Social Studies', 'Computer Science', 'Physical Education',
    'Commerce', 'Economics', 'Accountancy', 'Business Studies',
    'Biology', 'Physics', 'Chemistry',
  ];
  for (const subjectName of subjectNames) {
    await academicPool.query(
      `INSERT INTO subjects (school_id, subject_name)
       VALUES ($1, $2) ON CONFLICT (school_id, subject_name) DO NOTHING`,
      [SCHOOL_ID, subjectName]
    ).catch(e => err(`subject ${subjectName}`, e));
  }
  ok(`subjects: ${subjectNames.length} subjects`);

  // ── Staff roles
  log('academic_db — staff_roles for school 101');
  const staffRoles = [
    'Accountant', 'Librarian', 'Lab Assistant', 'Peon / Attendant',
    'Security Guard', 'Clerk', 'Receptionist', 'Sweeper / Cleaner',
    'Bus Attendant', 'Canteen Staff',
  ];
  for (let i = 0; i < staffRoles.length; i++) {
    await academicPool.query(
      `INSERT INTO staff_roles (school_id, role_name, order_number)
       VALUES ($1, $2, $3) ON CONFLICT (school_id, role_name) DO NOTHING`,
      [SCHOOL_ID, staffRoles[i], i + 1]
    ).catch(e => err(`staff_role ${staffRoles[i]}`, e));
  }
  ok(`staff_roles: ${staffRoles.length} roles`);

  // ── Staff departments
  log('academic_db — staff_departments for school 101');
  const staffDepts = [
    'Administration', 'Finance', 'Library', 'Security',
    'Maintenance', 'Housekeeping', 'Canteen', 'Transport',
  ];
  for (let i = 0; i < staffDepts.length; i++) {
    await academicPool.query(
      `INSERT INTO staff_departments (school_id, department_name, order_number)
       VALUES ($1, $2, $3) ON CONFLICT (school_id, department_name) DO NOTHING`,
      [SCHOOL_ID, staffDepts[i], i + 1]
    ).catch(e => err(`staff_dept ${staffDepts[i]}`, e));
  }
  ok(`staff_departments: ${staffDepts.length} departments`);

  // ── Staff positions
  log('academic_db — staff_positions for school 101');
  const staffPositions = [
    'Junior Staff', 'Senior Staff', 'Supervisor', 'Head of Department', 'Manager',
  ];
  for (let i = 0; i < staffPositions.length; i++) {
    await academicPool.query(
      `INSERT INTO staff_positions (school_id, position_name, order_number)
       VALUES ($1, $2, $3) ON CONFLICT (school_id, position_name) DO NOTHING`,
      [SCHOOL_ID, staffPositions[i], i + 1]
    ).catch(e => err(`staff_position ${staffPositions[i]}`, e));
  }
  ok(`staff_positions: ${staffPositions.length} positions`);

  // ── School admin profile
  log('academic_db — school_admin_profile for school 101');
  await academicPool.query(
    `INSERT INTO school_admin_profile
       (school_id, school_name, principal_name, contact_email, phone_number, established_year, address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (school_id) DO NOTHING`,
    [
      SCHOOL_ID,
      'SchoolNest Academy',
      'Principal Name',
      'principal@schoolnest.com',
      '+91-9000000000',
      2000,
      '123, Education Lane, Knowledge City, India - 400001',
    ]
  ).catch(e => err('school_admin_profile', e));
  ok('school_admin_profile: SchoolNest Academy (school_id=101)');
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 schoolNest unified seed — school_id=' + SCHOOL_ID);
  try {
    await seedAuthDb();
    await seedAcademicDb();

    console.log('\n✅ Seed complete!\n');
    console.log('  Admin login: admin@schoolnest.com  /  Admin@123');
    console.log('  Teachers and parents are created via Admin API (not seeded).');
    console.log('\n  Quick start:');
    console.log('    1. cd auth-service     && npm run dev   (port 3000)');
    console.log('    2. cd academic-service && npm run dev   (port 4002)');
    console.log('    3. POST /api/v1/auth/login  { email, password }  → JWT');
    console.log('    4. POST /api/v1/academic/admin/teacher-records   → creates teacher + auth user');
    console.log('    5. PUT  /api/v1/academic/admin/admissions/:id/approve → creates student + parent\n');
  } catch (e) {
    console.error('\n❌ Seed failed:', e.message);
    process.exit(1);
  } finally {
    await authPool.end();
    await academicPool.end();
  }
}

main();
