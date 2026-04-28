'use strict';

/**
 * Seed 2 teachers + 2 students into school 104 (local DBs only).
 *
 * Teachers: Bridge 1 — same UUID used in both academic_db.teacher_records
 * and auth_db.users. Emails teacher1@school104.com / teacher2@school104.com.
 *
 * Students: approved admission flow seeded directly —
 *   students_admission (Approved) → personal_information → academic_information
 *   → parent_guardian_information → students (denorm) → auth_db parent user
 *
 * Run: node seed-school104.js
 */

const { Pool } = require('./auth-service/node_modules/pg');
const bcrypt    = require('./auth-service/node_modules/bcrypt');
const { v4: uuid } = require('./academic-service/node_modules/uuid');

const SCHOOL_ID = 104;

const academicPool = new Pool({
  host:     'localhost',
  port:     5432,
  user:     'postgres',
  password: 'Postgres@12345',
  database: 'academic_db',
});

const authPool = new Pool({
  host:     'localhost',
  port:     5432,
  user:     'postgres',
  password: 'Postgres@12345',
  database: 'auth_db',
});

// ─── helpers ─────────────────────────────────────────────────────────────────

async function hash(pw) {
  return bcrypt.hash(pw, 10);
}

// ─── step 1: create school_classes + class_sections for Class 1 & Class 2 ───

async function seedClasses(client) {
  // Fetch class templates for Class 1 and Class 2
  const tplRes = await client.query(
    `SELECT id, class_name, order_number FROM class_templates
     WHERE class_name IN ('Class 1', 'Class 2') ORDER BY order_number`
  );
  const templates = tplRes.rows; // [{id, class_name, order_number}, ...]

  // Fetch default section templates (A, B, C, D)
  const secRes = await client.query(
    `SELECT id, section_name, order_number FROM section_templates
     WHERE is_default = true ORDER BY order_number`
  );
  const defaultSections = secRes.rows;

  const classIds = {};

  for (const tpl of templates) {
    // Insert school_class
    const clsRes = await client.query(
      `INSERT INTO school_classes (school_id, class_name, order_number, template_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (school_id, class_name) DO UPDATE
         SET order_number = EXCLUDED.order_number,
             template_id  = COALESCE(school_classes.template_id, EXCLUDED.template_id)
       RETURNING id`,
      [SCHOOL_ID, tpl.class_name, tpl.order_number, tpl.id]
    );
    const classId = clsRes.rows[0].id;
    classIds[tpl.class_name] = classId;

    // Insert default sections
    for (const sec of defaultSections) {
      await client.query(
        `INSERT INTO class_sections (school_id, class_id, section_template_id, section_name)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (school_id, class_id, section_template_id) DO NOTHING`,
        [SCHOOL_ID, classId, sec.id, sec.section_name]
      );
    }

    console.log(`  class: ${tpl.class_name} (${classId}) — sections A,B,C,D attached`);
  }

  return classIds; // { 'Class 1': uuid, 'Class 2': uuid }
}

// ─── step 2: teachers ────────────────────────────────────────────────────────

async function seedTeachers(academicClient, authClient, deptId) {
  const teachers = [
    {
      first_name:     'Priya',
      last_name:      'Sharma',
      email:          'teacher1@school104.com',
      phone:          '9000000041',
      employee_id:    'T104-001',
      designation:    'Mathematics Teacher',
      teacher_type:   'Full-Time',
    },
    {
      first_name:     'Anand',
      last_name:      'Raj',
      email:          'teacher2@school104.com',
      phone:          '9000000042',
      employee_id:    'T104-002',
      designation:    'Science Teacher',
      teacher_type:   'Full-Time',
    },
  ];

  const passwordHash = await hash('Teacher@123');
  const teacherIds = [];

  for (const t of teachers) {
    const teacherId = uuid();
    const fullName  = `${t.first_name} ${t.last_name}`;

    // academic_db teacher record
    await academicClient.query(
      `INSERT INTO teacher_records
         (id, school_id, first_name, primary_email, primary_phone,
          employee_id, designation, teacher_type, department_id,
          date_of_joining, employment_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,CURRENT_DATE,'Active')
       ON CONFLICT DO NOTHING`,
      [teacherId, SCHOOL_ID, t.first_name, t.email, t.phone,
       t.employee_id, t.designation, t.teacher_type, deptId]
    );

    // auth_db user (role_id=2 TEACHER)
    await authClient.query(
      `INSERT INTO users (id, school_id, role_id, name, email, password_hash)
       VALUES ($1,$2,2,$3,$4,$5)
       ON CONFLICT (email) DO NOTHING`,
      [teacherId, SCHOOL_ID, fullName, t.email, passwordHash]
    );

    teacherIds.push({ ...t, id: teacherId, fullName });
    console.log(`  teacher: ${fullName} (${teacherId}) — ${t.email} / Teacher@123`);
  }

  return teacherIds;
}

// ─── step 3: students (+ parent auth users) ──────────────────────────────────

async function seedStudents(academicClient, authClient, classIds, teachers) {
  const class1Id = classIds['Class 1'];
  const class2Id = classIds['Class 2'];

  // Fetch the denorm classes table entry or create it
  // We need a classes (denorm) row that the students table FKs into.
  // Bridge 3: classes row is created by class-assignment. We seed it directly.
  const teacher1 = teachers[0];
  const teacher2 = teachers[1];

  const denormClass1Id = await upsertDenormClass(academicClient, {
    name: 'Class 1', section: 'A', subject: 'Mathematics',
    teacherId: teacher1.id,
  });
  const denormClass2Id = await upsertDenormClass(academicClient, {
    name: 'Class 2', section: 'A', subject: 'Science',
    teacherId: teacher2.id,
  });

  const students = [
    {
      firstName:   'Ravi',
      lastName:    'Pillai',
      dob:         '2014-06-15',
      gender:      'Male',
      classId:     class1Id,
      section:     'A',
      denormId:    denormClass1Id,
      rollNo:      1,
      admNo:       'ADM104-001',
      fatherName:  'Suresh Pillai',
      fatherPhone: '9100000041',
      fatherEmail: 'parent1@school104.com',
      motherName:  'Kavitha Pillai',
    },
    {
      firstName:   'Meena',
      lastName:    'Krishnan',
      dob:         '2013-03-20',
      gender:      'Female',
      classId:     class2Id,
      section:     'A',
      denormId:    denormClass2Id,
      rollNo:      1,
      admNo:       'ADM104-002',
      fatherName:  'Balu Krishnan',
      fatherPhone: '9100000042',
      fatherEmail: 'parent2@school104.com',
      motherName:  'Radha Krishnan',
    },
  ];

  const parentPasswordHash = await hash('Parent@123');

  for (const s of students) {
    // students_admission
    const admRes = await academicClient.query(
      `INSERT INTO students_admission (school_id, admission_status, submitted_date)
       VALUES ($1, 'Approved', NOW())
       RETURNING id`,
      [SCHOOL_ID]
    );
    const admId = admRes.rows[0].id;

    // personal_information
    await academicClient.query(
      `INSERT INTO personal_information
         (school_id, student_id, first_name, last_name, date_of_birth, gender, nationality)
       VALUES ($1,$2,$3,$4,$5,$6,'Indian')`,
      [SCHOOL_ID, admId, s.firstName, s.lastName, s.dob, s.gender]
    );

    // academic_information
    await academicClient.query(
      `INSERT INTO academic_information
         (school_id, student_id, admission_number, admission_date, class_id, section)
       VALUES ($1,$2,$3,CURRENT_DATE,$4,$5)`,
      [SCHOOL_ID, admId, s.admNo, s.classId, s.section]
    );

    // parent_guardian_information
    await academicClient.query(
      `INSERT INTO parent_guardian_information
         (school_id, student_id, father_full_name, father_phone, father_email, mother_full_name)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [SCHOOL_ID, admId, s.fatherName, s.fatherPhone, s.fatherEmail, s.motherName]
    );

    // auth_db parent user (role_id=3 PARENT)
    const parentId = uuid();
    await authClient.query(
      `INSERT INTO users (id, school_id, role_id, name, email, password_hash)
       VALUES ($1,$2,3,$3,$4,$5)
       ON CONFLICT (email) DO NOTHING`,
      [parentId, SCHOOL_ID, s.fatherName, s.fatherEmail, parentPasswordHash]
    );

    // students (denorm) — Bridge 2
    await academicClient.query(
      `INSERT INTO students (school_id, class_id, roll_no, name, parent_id)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT DO NOTHING`,
      [SCHOOL_ID, s.denormId, s.rollNo, `${s.firstName} ${s.lastName}`, parentId]
    );

    console.log(`  student: ${s.firstName} ${s.lastName} (adm: ${s.admNo}) — parent ${s.fatherEmail} / Parent@123`);
  }
}

async function upsertDenormClass(client, { name, section, subject, teacherId }) {
  const existing = await client.query(
    `SELECT id FROM classes WHERE school_id=$1 AND name=$2 AND section=$3 AND teacher_id=$4`,
    [SCHOOL_ID, name, section, teacherId]
  );
  if (existing.rows.length) return existing.rows[0].id;

  const res = await client.query(
    `INSERT INTO classes (school_id, name, section, subject, teacher_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [SCHOOL_ID, name, section, subject, teacherId]
  );
  return res.rows[0].id;
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  const academicClient = await academicPool.connect();
  const authClient     = await authPool.connect();

  try {
    await academicClient.query('BEGIN');
    await authClient.query('BEGIN');

    console.log('\n=== Seeding school 104 (local only) ===\n');

    // Step 1: classes
    console.log('--- Classes ---');
    const classIds = await seedClasses(academicClient);

    // Step 2: teachers — use the Mathematics department from school 104
    const deptRes = await academicClient.query(
      `SELECT id FROM departments WHERE school_id=$1 AND department_name='Mathematics' LIMIT 1`,
      [SCHOOL_ID]
    );
    const deptId = deptRes.rows[0] ? deptRes.rows[0].id : null;

    console.log('\n--- Teachers ---');
    const teachers = await seedTeachers(academicClient, authClient, deptId);

    // Step 3: students
    console.log('\n--- Students ---');
    await seedStudents(academicClient, authClient, classIds, teachers);

    await academicClient.query('COMMIT');
    await authClient.query('COMMIT');

    console.log('\n=== Done ===\n');
    console.log('School 104 logins:');
    console.log('  Admin:    admin4@schoolnest.com   / Admin3@123');
    console.log('  Teacher1: teacher1@school104.com  / Teacher@123');
    console.log('  Teacher2: teacher2@school104.com  / Teacher@123');
    console.log('  Parent1:  parent1@school104.com   / Parent@123');
    console.log('  Parent2:  parent2@school104.com   / Parent@123');

  } catch (err) {
    await academicClient.query('ROLLBACK').catch(() => {});
    await authClient.query('ROLLBACK').catch(() => {});
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    academicClient.release();
    authClient.release();
    await academicPool.end();
    await authPool.end();
  }
}

main();
