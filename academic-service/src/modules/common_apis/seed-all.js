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

// Load from auth-service .env (3 levels up: common_apis/src/modules -> /academic-service -> /)
require('dotenv').config({ path: '../../../../../auth-service/.env' });

const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const SCHOOL_ID = 101;
const SALT_ROUNDS = 10;

const isRemote = process.env.DB_HOST && process.env.DB_HOST !== 'localhost';
const sslConfig = isRemote ? { rejectUnauthorized: false } : false;

// ─── Auth DB pool ──────────────────────────────────────────────────────────────
const authPool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432', 10),
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'auth_db',
  ssl:      sslConfig,
});

// ─── Academic DB pool ──────────────────────────────────────────────────────────
const academicIsRemote = process.env.ACADEMIC_DB_HOST && process.env.ACADEMIC_DB_HOST !== 'localhost';
const academicPool = new Pool({
  host:     process.env.ACADEMIC_DB_HOST     || process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.ACADEMIC_DB_PORT || process.env.DB_PORT || '5432', 10),
  user:     process.env.ACADEMIC_DB_USER     || process.env.DB_USER     || 'postgres',
  password: process.env.ACADEMIC_DB_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.ACADEMIC_DB_NAME     || 'academic_db',
  ssl:      academicIsRemote ? { rejectUnauthorized: false } : false,
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

  // ─── SAMPLE DATA ───────────────────────────────────────────────────────────
  log('academic_db — sample admission data');

  // Get real class_id from Class 10
  const classRes = await academicPool.query(
    `SELECT id FROM school_classes WHERE school_id = $1 AND class_name = 'Class 10' LIMIT 1`,
    [SCHOOL_ID]
  );
  const classId = classRes.rows[0]?.id;

  // Get blood group id for O+ (used by both admission and teacher)
  const bgRes = await academicPool.query(
    `SELECT id FROM blood_groups WHERE blood_group = 'O+' LIMIT 1`
  );
  const bloodGroupId = bgRes.rows[0]?.id;

  if (!classId) {
    err('Class 10 not found', { message: 'Cannot seed sample admission without Class 10' });
  } else {

    // 1. Create admission record
    const admissionRes = await academicPool.query(
      `INSERT INTO students_admission (school_id, admission_status, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING id`,
      [SCHOOL_ID, 'Draft']
    );
    const admissionId = admissionRes.rows[0].id;

    // 2. Personal information
    await academicPool.query(
      `INSERT INTO personal_information
       (school_id, student_id, first_name, last_name, date_of_birth, gender,
        blood_group_id, nationality, religion, category, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
      [
        SCHOOL_ID,
        admissionId,
        'Aarav',
        'Sharma',
        '2012-03-15',
        'Male',
        bloodGroupId,
        'Indian',
        'Hindu',
        'General',
      ]
    ).catch(e => err('personal_information', e));

    // 3. Academic information
    await academicPool.query(
      `INSERT INTO academic_information
       (school_id, student_id, admission_number, admission_date, class_id,
        section, roll_number, previous_school, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [
        SCHOOL_ID,
        admissionId,
        null,
        '2026-04-01',
        classId,
        'A',
        '001',
        'ABC Public School',
      ]
    ).catch(e => err('academic_information', e));

    // 4. Contact information
    await academicPool.query(
      `INSERT INTO contact_information
       (school_id, student_id, student_phone, student_email, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [
        SCHOOL_ID,
        admissionId,
        '9876543210',
        'aarav.sharma@example.com',
      ]
    ).catch(e => err('contact_information', e));

    // 5. Address information
    await academicPool.query(
      `INSERT INTO address_information
       (school_id, student_id, current_street, current_city, current_state, current_pincode,
        is_permanent_same, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [
        SCHOOL_ID,
        admissionId,
        '123 Main Street',
        'New Delhi',
        'Delhi',
        '110001',
        true,
      ]
    ).catch(e => err('address_information', e));

    // 6. Parent/guardian information
    await academicPool.query(
      `INSERT INTO parent_guardian_information
       (school_id, student_id, father_full_name, father_occupation, father_phone, father_email,
        father_annual_income, mother_full_name, mother_occupation, mother_phone, mother_email,
        mother_annual_income, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
      [
        SCHOOL_ID,
        admissionId,
        'Rajesh Sharma',
        'Engineer',
        '9876543211',
        'rajesh.sharma@example.com',
        '1200000.00',
        'Priya Sharma',
        'Doctor',
        '9876543212',
        'priya.sharma@example.com',
        '1500000.00',
      ]
    ).catch(e => err('parent_guardian_information', e));

    // 7. Emergency contact
    await academicPool.query(
      `INSERT INTO emergency_contact
       (school_id, student_id, contact_name, relation, phone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [
        SCHOOL_ID,
        admissionId,
        'Uncle Amit Sharma',
        'Uncle',
        '9876543213',
      ]
    ).catch(e => err('emergency_contact', e));

    // 8. Medical information
    await academicPool.query(
      `INSERT INTO medical_information
       (school_id, student_id, allergies, medical_conditions, medications,
        family_doctor_name, doctor_phone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [
        SCHOOL_ID,
        admissionId,
        'Peanut allergy',
        'None',
        'None',
        'Dr. Vikram Singh',
        '9876543214',
      ]
    ).catch(e => err('medical_information', e));

    // 9. Student documents
    await academicPool.query(
      `INSERT INTO student_documents
       (school_id, student_id, birth_certificate_status, aadhaar_card_status,
        transfer_certificate_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [
        SCHOOL_ID,
        admissionId,
        'Pending',
        'Pending',
        'Optional',
      ]
    ).catch(e => err('student_documents', e));

    ok(`Sample admission: ${admissionId} (Aarav Sharma, Class 10-A)`);
  }

  // ─── SAMPLE ENQUIRY ────────────────────────────────────────────────────────
  log('academic_db — sample student enquiry');

  // Get enquiry source
  const sourceRes = await academicPool.query(
    `SELECT id FROM enquiry_sources WHERE school_id = $1 AND source_name = 'Referral / Word of Mouth' LIMIT 1`,
    [SCHOOL_ID]
  );
  const sourceId = sourceRes.rows[0]?.id;

  if (sourceId) {
    await academicPool.query(
      `INSERT INTO student_enquiries
       (school_id, student_name, father_name, contact_number, email, class_id, academic_year,
        preferred_medium, current_school_name, residential_area, source_id, transport_required,
        siblings_in_school, religion, community_category, remarks, enquiry_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())`,
      [
        SCHOOL_ID,
        'Priya Desai',
        'Vikram Desai',
        '9999888877',
        'priya.desai@example.com',
        classId,
        '2026-27',
        'English',
        'Delhi Public School',
        'Bangalore',
        sourceId,
        true,
        false,
        'Hindu',
        'General',
        'Very interested in science stream',
        'Active',
      ]
    ).catch(e => err('student_enquiries', e));
    ok('Sample enquiry: Priya Desai');
  }

  // ─── SAMPLE TEACHER (auth + academic) ──────────────────────────────────────
  log('academic_db — sample teacher');

  // Get science department
  const deptRes = await academicPool.query(
    `SELECT id FROM departments WHERE school_id = $1 AND department_name = 'Science' LIMIT 1`,
    [SCHOOL_ID]
  );
  const deptId = deptRes.rows[0]?.id;

  // First, seed teacher in auth_db
  const teacherRoleRes = await authPool.query(`SELECT id FROM roles WHERE name = 'TEACHER' LIMIT 1`);
  if (teacherRoleRes.rows.length > 0) {
    const teacherRoleId = teacherRoleRes.rows[0].id;
    const teacherHash = await bcrypt.hash('Teacher@123', SALT_ROUNDS);

    await authPool.query(
      `INSERT INTO users (id, school_id, role_id, name, email, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      ['TCH001', SCHOOL_ID, teacherRoleId, 'John Teacher', 'john@schoolnest.com', teacherHash]
    ).catch(e => err('auth teacher user', e));

    // Now insert teacher record in academic_db
    if (deptId) {
      await academicPool.query(
        `INSERT INTO teacher_records
         (school_id, auth_user_id, first_name, date_of_birth, gender,
          blood_group_id, nationality, religion, primary_phone, primary_email,
          current_city, current_state, employee_id, designation, teacher_type,
          department_id, date_of_joining, employment_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
          SCHOOL_ID,
          'TCH001',
          'John Teacher',
          '1990-05-20',
          'Male',
          bloodGroupId,
          'Indian',
          'Christian',
          '9876543220',
          'john@schoolnest.com',
          'New Delhi',
          'Delhi',
          'EMP001',
          'Science Teacher',
          'Permanent',
          deptId,
          '2020-06-01',
          'Active',
        ]
      ).catch(e => err('teacher_records', e));
      ok('Sample teacher: TCH001 (John Teacher, Science Dept)');
    }
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 schoolNest unified seed — school_id=' + SCHOOL_ID);
  try {
    await seedAuthDb();
    await seedAcademicDb();

    console.log('\n✅ Seed complete!\n');
    console.log('  Admin login: admin@schoolnest.com  /  Admin@123');
    console.log('  Teacher login: john@schoolnest.com  /  Teacher@123 (TCH001)');
    console.log('\n  Seeded sample data:');
    console.log('    • Admission: Aarav Sharma (Class 10-A, Draft status)');
    console.log('    • Enquiry: Priya Desai (interested in Class 10)');
    console.log('    • Teacher: John Teacher (Science, TCH001)');
    console.log('\n  Quick start:');
    console.log('    1. cd auth-service     && npm run dev   (port 3000)');
    console.log('    2. cd academic-service && npm run dev   (port 4002)');
    console.log('    3. POST /api/v1/auth/login  { email, password }  → JWT');
    console.log('    4. GET /api/v1/academic/admin/admissions          → see sample admission');
    console.log('    5. GET /api/v1/academic/admin/teacher-records     → see TCH001\n');
  } catch (e) {
    console.error('\n❌ Seed failed:', e.message);
    process.exit(1);
  } finally {
    await authPool.end();
    await academicPool.end();
  }
}

main();
