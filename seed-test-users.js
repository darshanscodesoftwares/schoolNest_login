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

// Lookup helper: fetch an ID by name from a reference table
async function lookupId(table, nameColumn, value) {
  const res = await academicPool.query(
    `SELECT id FROM ${table} WHERE ${nameColumn} = $1 LIMIT 1`,
    [value]
  );
  return (res.rows[0] && res.rows[0].id) || null;
}

async function seedTeachers() {
  log('teachers — teacher_records + auth_db.users (Bridge 1 replica)');

  const roleRes = await authPool.query(`SELECT id FROM roles WHERE name = 'TEACHER' LIMIT 1`);
  if (roleRes.rows.length === 0) throw new Error('TEACHER role missing — run seed-all.js first');
  const teacherRoleId = roleRes.rows[0].id;
  const pwdHash = await bcrypt.hash('Teacher@123', SALT_ROUNDS);

  // Resolve FK IDs from reference tables (seeded by seed-all.js)
  const bgAPos       = await lookupId('blood_groups',    'blood_group',     'A+');
  const bgBPos       = await lookupId('blood_groups',    'blood_group',     'B+');
  const deptMath     = await lookupId('departments',     'department_name', 'Mathematics');
  const deptEnglish  = await lookupId('departments',     'department_name', 'English');
  const class10      = await lookupId('school_classes',  'class_name',      'Class 10');
  const class9       = await lookupId('school_classes',  'class_name',      'Class 9');

  const teachers = [
    {
      id: TEACHER_1_ID, name: 'John Teacher', email: 'teacher1@schoolnest.com', phone: '+91-9000000001',
      dob: '1985-06-15', gender: 'Male', nationality: 'Indian', religion: 'Hindu', marital_status: 'Married',
      blood_group_id: bgAPos, department_id: deptMath, class_ids: [class10, class9].filter(Boolean),
      current_street: '12 Park Street', current_city: 'Bengaluru', current_state: 'Karnataka', current_pincode: '560001',
      is_permanent_same: true,
      employee_id: 'EMP001', designation: 'Senior Teacher', teacher_type: 'Full-time',
      specialization: 'Algebra & Geometry', date_of_joining: '2020-06-01',
      highest_qualification: 'M.Sc Mathematics', university: 'Bangalore University', year_of_passing: 2008, percentage_cgpa: '8.5',
      total_experience_years: 12, previous_school_institution: 'ABC Public School', previous_designation: 'Teacher', experience_at_previous_school: 5,
      monthly_salary: 45000.00, bank_name: 'HDFC Bank', account_number: '5012345678', ifsc_code: 'HDFC0001234',
      pan_number: 'ABCDE1234F', aadhar_number: '123412341234',
      emergency_contact_name: 'Mary Teacher', emergency_relation: 'Spouse', emergency_phone: '+91-9000000011',
    },
    {
      id: TEACHER_2_ID, name: 'Jane Teacher', email: 'teacher2@schoolnest.com', phone: '+91-9000000002',
      dob: '1990-09-22', gender: 'Female', nationality: 'Indian', religion: 'Christian', marital_status: 'Single',
      blood_group_id: bgBPos, department_id: deptEnglish, class_ids: [class10].filter(Boolean),
      current_street: '45 MG Road', current_city: 'Bengaluru', current_state: 'Karnataka', current_pincode: '560002',
      is_permanent_same: false,
      permanent_street: 'Village Kothamangalam', permanent_city: 'Ernakulam', permanent_state: 'Kerala', permanent_pincode: '686691',
      employee_id: 'EMP002', designation: 'Teacher', teacher_type: 'Full-time',
      specialization: 'English Literature', date_of_joining: '2022-04-10',
      highest_qualification: 'M.A English', university: 'MG University', year_of_passing: 2013, percentage_cgpa: '8.1',
      total_experience_years: 6, previous_school_institution: 'XYZ School', previous_designation: 'Junior Teacher', experience_at_previous_school: 3,
      monthly_salary: 38000.00, bank_name: 'ICICI Bank', account_number: '6123456789', ifsc_code: 'ICIC0005678',
      pan_number: 'FGHIJ5678K', aadhar_number: '567856785678',
      emergency_contact_name: 'Thomas Teacher', emergency_relation: 'Father', emergency_phone: '+91-9000000022',
    },
  ];

  for (const t of teachers) {
    await academicPool.query(
      `INSERT INTO teacher_records (
         id, auth_user_id, school_id,
         first_name, date_of_birth, gender, blood_group_id, nationality, religion, marital_status,
         primary_phone, primary_email,
         current_street, current_city, current_state, current_pincode,
         is_permanent_same, permanent_street, permanent_city, permanent_state, permanent_pincode,
         employee_id, designation, teacher_type, department_id, specialization, date_of_joining, class_ids, employment_status,
         highest_qualification, university, year_of_passing, percentage_cgpa,
         total_experience_years, previous_school_institution, previous_designation, experience_at_previous_school,
         monthly_salary, bank_name, account_number, ifsc_code, pan_number, aadhar_number,
         emergency_contact_name, emergency_relation, emergency_phone
       )
       VALUES (
         $1::uuid, $2::varchar, $3,
         $4, $5, $6, $7, $8, $9, $10,
         $11, $12,
         $13, $14, $15, $16,
         $17, $18, $19, $20, $21,
         $22, $23, $24, $25, $26, $27, $28, 'Active',
         $29, $30, $31, $32,
         $33, $34, $35, $36,
         $37, $38, $39, $40, $41, $42,
         $43, $44, $45
       )
       ON CONFLICT (id) DO UPDATE SET
         first_name = EXCLUDED.first_name,
         date_of_birth = EXCLUDED.date_of_birth,
         gender = EXCLUDED.gender,
         blood_group_id = EXCLUDED.blood_group_id,
         nationality = EXCLUDED.nationality,
         religion = EXCLUDED.religion,
         marital_status = EXCLUDED.marital_status,
         current_street = EXCLUDED.current_street,
         current_city = EXCLUDED.current_city,
         current_state = EXCLUDED.current_state,
         current_pincode = EXCLUDED.current_pincode,
         is_permanent_same = EXCLUDED.is_permanent_same,
         permanent_street = EXCLUDED.permanent_street,
         permanent_city = EXCLUDED.permanent_city,
         permanent_state = EXCLUDED.permanent_state,
         permanent_pincode = EXCLUDED.permanent_pincode,
         employee_id = EXCLUDED.employee_id,
         designation = EXCLUDED.designation,
         teacher_type = EXCLUDED.teacher_type,
         department_id = EXCLUDED.department_id,
         specialization = EXCLUDED.specialization,
         date_of_joining = EXCLUDED.date_of_joining,
         class_ids = EXCLUDED.class_ids,
         highest_qualification = EXCLUDED.highest_qualification,
         university = EXCLUDED.university,
         year_of_passing = EXCLUDED.year_of_passing,
         percentage_cgpa = EXCLUDED.percentage_cgpa,
         total_experience_years = EXCLUDED.total_experience_years,
         previous_school_institution = EXCLUDED.previous_school_institution,
         previous_designation = EXCLUDED.previous_designation,
         experience_at_previous_school = EXCLUDED.experience_at_previous_school,
         monthly_salary = EXCLUDED.monthly_salary,
         bank_name = EXCLUDED.bank_name,
         account_number = EXCLUDED.account_number,
         ifsc_code = EXCLUDED.ifsc_code,
         pan_number = EXCLUDED.pan_number,
         aadhar_number = EXCLUDED.aadhar_number,
         emergency_contact_name = EXCLUDED.emergency_contact_name,
         emergency_relation = EXCLUDED.emergency_relation,
         emergency_phone = EXCLUDED.emergency_phone,
         updated_at = CURRENT_TIMESTAMP`,
      [
        t.id, t.id, SCHOOL_ID,
        t.name, t.dob, t.gender, t.blood_group_id, t.nationality, t.religion, t.marital_status,
        t.phone, t.email,
        t.current_street, t.current_city, t.current_state, t.current_pincode,
        t.is_permanent_same, t.permanent_street || null, t.permanent_city || null, t.permanent_state || null, t.permanent_pincode || null,
        t.employee_id, t.designation, t.teacher_type, t.department_id, t.specialization, t.date_of_joining, t.class_ids,
        t.highest_qualification, t.university, t.year_of_passing, t.percentage_cgpa,
        t.total_experience_years, t.previous_school_institution, t.previous_designation, t.experience_at_previous_school,
        t.monthly_salary, t.bank_name, t.account_number, t.ifsc_code, t.pan_number, t.aadhar_number,
        t.emergency_contact_name, t.emergency_relation, t.emergency_phone,
      ]
    );

    await authPool.query(
      `INSERT INTO users (id, school_id, role_id, name, email, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [t.id, SCHOOL_ID, teacherRoleId, t.name, t.email, pwdHash]
    );

    ok(`teacher ${t.name} — ${t.email} (dept: ${t.department_id ? 'ok' : 'MISSING'}, bg: ${t.blood_group_id ? 'ok' : 'MISSING'}, classes: ${t.class_ids.length})`);
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
