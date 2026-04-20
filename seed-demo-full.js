/**
 * seed-demo-full.js — Full demo dataset for every admin/teacher/parent dashboard
 *datas
 * Run from repo root:
 *   Local:  node seed-demo-full.js
 *   Render: set -a && source auth-service/.env.production && set +a \
 *             && ACADEMIC_DB_HOST=dpg-d7ed0dnaqgkc73fv3o8g-a.singapore-postgres.render.com \
 *                node seed-demo-full.js
 *
 * Assumes seed-all.js and seed-test-users.js have already run — the fixtures
 * here reuse ADM001, teacher1/2 (UUID ids), parent1/2 (PAR101/102), the 3
 * students, and the 2 denormalized classes.
 *
 * Idempotent — every INSERT is ON CONFLICT DO NOTHING (or DO UPDATE where
 * relevant). Deterministic UUIDs keep FKs aligned across reruns.
 */

require("./auth-service/node_modules/dotenv").config({
  path: "./auth-service/.env",
});

const bcrypt = require("./auth-service/node_modules/bcrypt");
const { Pool } = require("./auth-service/node_modules/pg");

const SCHOOL_ID = 101;
const SALT_ROUNDS = 10;

const isRemote = process.env.DB_HOST && process.env.DB_HOST !== "localhost";
const authPool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "auth_db",
  ssl: isRemote ? { rejectUnauthorized: false } : false,
});

const academicIsRemote =
  process.env.ACADEMIC_DB_HOST && process.env.ACADEMIC_DB_HOST !== "localhost";
const academicPool = new Pool({
  host: process.env.ACADEMIC_DB_HOST || process.env.DB_HOST || "localhost",
  port: parseInt(
    process.env.ACADEMIC_DB_PORT || process.env.DB_PORT || "5432",
    10
  ),
  user: process.env.ACADEMIC_DB_USER || process.env.DB_USER || "postgres",
  password: process.env.ACADEMIC_DB_PASSWORD || process.env.DB_PASSWORD || "",
  database: process.env.ACADEMIC_DB_NAME || "academic_db",
  ssl: academicIsRemote ? { rejectUnauthorized: false } : false,
});

const log = (msg) => console.log("\n──", msg);
const ok = (msg) => console.log("  ✓", msg);
const warn = (msg, e) => console.warn("  ⚠", msg, e ? `— ${e.message}` : "");

// ─── Known fixtures from previous seeds ────────────────────────────────────────
const TEACHER_1_ID = "11111111-1111-4111-a111-111111111111";
const TEACHER_2_ID = "22222222-2222-4222-a222-222222222222";
const CLASS_1_ID = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
const CLASS_2_ID = "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb";
const PARENT_1_ID = "PAR101";
const PARENT_2_ID = "PAR102";

// ─── Deterministic UUIDs for this seed ────────────────────────────────────────
const ENQUIRY_IDS = Array.from({ length: 10 }, (_, i) =>
  `eeeeeeee-eeee-4${i}0e-aeee-eeeeeeeeeeee`.replace(
    /^eeeeeeee/,
    "e" + String(i).padStart(7, "0")
  )
);
const ADMISSION_IDS = [
  "cccccccc-cccc-4ccc-acc1-000000000001", // Draft
  "cccccccc-cccc-4ccc-acc1-000000000002", // Draft
  "cccccccc-cccc-4ccc-acc1-000000000003", // Under Verification
  "cccccccc-cccc-4ccc-acc1-000000000004", // Under Verification
  "cccccccc-cccc-4ccc-acc1-000000000005", // Approved
  "cccccccc-cccc-4ccc-acc1-000000000006", // Approved
  "cccccccc-cccc-4ccc-acc1-000000000007", // Approved
  "cccccccc-cccc-4ccc-acc1-000000000008", // Approved
];
const DRIVER_IDS = [
  "dddddddd-dddd-4ddd-addd-000000000001",
  "dddddddd-dddd-4ddd-addd-000000000002",
];
const STAFF_IDS = [
  "ffffffff-ffff-4fff-afff-000000000001",
  "ffffffff-ffff-4fff-afff-000000000002",
  "ffffffff-ffff-4fff-afff-000000000003",
];
const EXAM_IDS = [
  "99999999-9999-4999-a999-000000000001", // UPCOMING
  "99999999-9999-4999-a999-000000000002", // UPCOMING
  "99999999-9999-4999-a999-000000000003", // COMPLETED
  "99999999-9999-4999-a999-000000000004", // ONGOING
  "99999999-9999-4999-a999-000000000005", // PUBLISHED
];
// Parent auth IDs for approved admissions
const APPROVED_PARENT_IDS = ["PAR201", "PAR202", "PAR203", "PAR204"];

// ─── Look up reference data IDs by name ───────────────────────────────────────
async function lookupId(table, nameColumn, value, extraWhere = "") {
  const sql = `SELECT id FROM ${table} WHERE ${nameColumn} = $1 ${extraWhere} LIMIT 1`;
  const res = await academicPool.query(sql, [value]);
  return (res.rows[0] && res.rows[0].id) || null;
}

let refs = {}; // populated at start of main()

async function loadReferences() {
  log(
    "loading reference IDs (blood groups, classes, sections, subjects, etc.)"
  );
  refs.bgAPos = await lookupId("blood_groups", "blood_group", "A+");
  refs.bgBPos = await lookupId("blood_groups", "blood_group", "B+");
  refs.bgOPos = await lookupId("blood_groups", "blood_group", "O+");
  refs.bgABPos = await lookupId("blood_groups", "blood_group", "AB+");

  refs.classNursery = await lookupId(
    "school_classes",
    "class_name",
    "Nursery",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.classLKG = await lookupId(
    "school_classes",
    "class_name",
    "LKG",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.classUKG = await lookupId(
    "school_classes",
    "class_name",
    "UKG",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.class1 = await lookupId(
    "school_classes",
    "class_name",
    "Class 1",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.class5 = await lookupId(
    "school_classes",
    "class_name",
    "Class 5",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.class8 = await lookupId(
    "school_classes",
    "class_name",
    "Class 8",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.class9 = await lookupId(
    "school_classes",
    "class_name",
    "Class 9",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.class10 = await lookupId(
    "school_classes",
    "class_name",
    "Class 10",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.class12 = await lookupId(
    "school_classes",
    "class_name",
    "Class 12",
    `AND school_id=${SCHOOL_ID}`
  );

  refs.sectionA = await lookupId(
    "sections",
    "section_name",
    "A",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.sectionB = await lookupId(
    "sections",
    "section_name",
    "B",
    `AND school_id=${SCHOOL_ID}`
  );

  refs.subjectMath = await lookupId(
    "subjects",
    "subject_name",
    "Mathematics",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.subjectEnglish = await lookupId(
    "subjects",
    "subject_name",
    "English",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.subjectScience = await lookupId(
    "subjects",
    "subject_name",
    "Science",
    `AND school_id=${SCHOOL_ID}`
  );

  refs.srcWebsite = await lookupId(
    "enquiry_sources",
    "source_name",
    "Website",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.srcSocial = await lookupId(
    "enquiry_sources",
    "source_name",
    "Social Media",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.srcReferral = await lookupId(
    "enquiry_sources",
    "source_name",
    "Referral / Word of Mouth",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.srcWalkIn = await lookupId(
    "enquiry_sources",
    "source_name",
    "Walk-in",
    `AND school_id=${SCHOOL_ID}`
  );

  refs.staffRoleAccountant = await lookupId(
    "staff_roles",
    "role_name",
    "Accountant",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.staffRoleLibrarian = await lookupId(
    "staff_roles",
    "role_name",
    "Librarian",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.staffRoleSecurity = await lookupId(
    "staff_roles",
    "role_name",
    "Security Guard",
    `AND school_id=${SCHOOL_ID}`
  );

  refs.staffDeptAdmin = await lookupId(
    "staff_departments",
    "department_name",
    "Administration",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.staffDeptFinance = await lookupId(
    "staff_departments",
    "department_name",
    "Finance",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.staffDeptLibrary = await lookupId(
    "staff_departments",
    "department_name",
    "Library",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.staffDeptSecurity = await lookupId(
    "staff_departments",
    "department_name",
    "Security",
    `AND school_id=${SCHOOL_ID}`
  );

  refs.staffPosJunior = await lookupId(
    "staff_positions",
    "position_name",
    "Junior Staff",
    `AND school_id=${SCHOOL_ID}`
  );
  refs.staffPosSenior = await lookupId(
    "staff_positions",
    "position_name",
    "Senior Staff",
    `AND school_id=${SCHOOL_ID}`
  );

  refs.licLMV = await lookupId(
    "license_types",
    "license_name",
    "LMV - Light Motor Vehicle"
  );
  refs.licHPMV = await lookupId(
    "license_types",
    "license_name",
    "HPMV - Heavy Passenger Motor Vehicle"
  );

  const missing = Object.entries(refs)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length)
    warn(
      `missing reference IDs (run seed-all.js first): ${missing.join(", ")}`
    );
  ok("reference IDs loaded");
}

// ─── SECTION 1.1 — Enquiries ─────────────────────────────────────────────────
async function seedEnquiries() {
  log("Section 1: enquiries (10 rows)");
  const enquiries = [
    {
      name: "Aryan Kapoor",
      father: "Rajiv Kapoor",
      phone: "9000010001",
      email: "aryan.k@test.com",
      class: refs.class1,
      src: refs.srcWebsite,
      medium: "English",
      school: "Little Stars Preschool",
      area: "Indiranagar, Bengaluru",
      transport: true,
      sib: false,
      relig: "Hindu",
      cat: "General",
      status: "New",
    },
    {
      name: "Ishita Patel",
      father: "Sanjay Patel",
      phone: "9000010002",
      email: "ishita.p@test.com",
      class: refs.class5,
      src: refs.srcReferral,
      medium: "English",
      school: "Sunrise Academy",
      area: "Whitefield, Bengaluru",
      transport: false,
      sib: true,
      relig: "Hindu",
      cat: "OBC",
      status: "New",
    },
    {
      name: "Arjun Verma",
      father: "Vikram Verma",
      phone: "9000010003",
      email: "arjun.v@test.com",
      class: refs.class9,
      src: refs.srcSocial,
      medium: "English",
      school: "St. Peters School",
      area: "Koramangala, Bengaluru",
      transport: true,
      sib: false,
      relig: "Hindu",
      cat: "General",
      status: "Follow-up",
    },
    {
      name: "Sara Khan",
      father: "Imran Khan",
      phone: "9000010004",
      email: "sara.k@test.com",
      class: refs.class10,
      src: refs.srcReferral,
      medium: "English",
      school: "Delhi Public School",
      area: "HSR Layout, Bengaluru",
      transport: false,
      sib: true,
      relig: "Islam",
      cat: "General",
      status: "Follow-up",
    },
    {
      name: "Rohan Nair",
      father: "Pradeep Nair",
      phone: "9000010005",
      email: "rohan.n@test.com",
      class: refs.class8,
      src: refs.srcWebsite,
      medium: "English",
      school: "Greenwood High",
      area: "Bellandur, Bengaluru",
      transport: true,
      sib: false,
      relig: "Hindu",
      cat: "General",
      status: "Converted",
    },
    {
      name: "Priyanka Reddy",
      father: "Venkat Reddy",
      phone: "9000010006",
      email: "priyanka.r@test.com",
      class: refs.classUKG,
      src: refs.srcSocial,
      medium: "English",
      school: "Bumble Bee Pre-School",
      area: "Marathahalli, Bengaluru",
      transport: false,
      sib: false,
      relig: "Hindu",
      cat: "General",
      status: "New",
    },
    {
      name: "Vivaan Joshi",
      father: "Rohit Joshi",
      phone: "9000010007",
      email: "vivaan.j@test.com",
      class: refs.class1,
      src: refs.srcWalkIn,
      medium: "English",
      school: "N/A",
      area: "JP Nagar, Bengaluru",
      transport: true,
      sib: false,
      relig: "Hindu",
      cat: "General",
      status: "Follow-up",
    },
    {
      name: "Aanya Iyer",
      father: "Srinivas Iyer",
      phone: "9000010008",
      email: "aanya.i@test.com",
      class: refs.class12,
      src: refs.srcReferral,
      medium: "English",
      school: "National Public School",
      area: "Jayanagar, Bengaluru",
      transport: false,
      sib: true,
      relig: "Hindu",
      cat: "General",
      status: "Closed",
    },
    {
      name: "Kabir Singh",
      father: "Amrit Singh",
      phone: "9000010009",
      email: "kabir.s@test.com",
      class: refs.class5,
      src: refs.srcWebsite,
      medium: "English",
      school: "Vidya Vihar",
      area: "Electronic City, Bengaluru",
      transport: true,
      sib: false,
      relig: "Sikh",
      cat: "General",
      status: "Converted",
    },
    {
      name: "Zara Fernandes",
      father: "Noel Fernandes",
      phone: "9000010010",
      email: "zara.f@test.com",
      class: refs.classLKG,
      src: refs.srcWalkIn,
      medium: "English",
      school: "Little Angels Play School",
      area: "Brookefield, Bengaluru",
      transport: false,
      sib: false,
      relig: "Christian",
      cat: "General",
      status: "New",
    },
  ];

  for (let i = 0; i < enquiries.length; i++) {
    const e = enquiries[i];
    await academicPool
      .query(
        `INSERT INTO student_enquiries (id, school_id, student_name, father_name, contact_number, email,
         class_id, academic_year, preferred_medium, current_school_name, residential_area, source_id,
         transport_required, siblings_in_school, religion, community_category, remarks, enquiry_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       ON CONFLICT (id) DO NOTHING`,
        [
          ENQUIRY_IDS[i],
          SCHOOL_ID,
          e.name,
          e.father,
          e.phone,
          e.email,
          e.class,
          "2025-26",
          e.medium,
          e.school,
          e.area,
          e.src,
          e.transport,
          e.sib,
          e.relig,
          e.cat,
          `Demo enquiry ${i + 1}`,
          e.status,
        ]
      )
      .catch((err) => warn(`enquiry ${e.name}`, err));
  }
  ok(`enquiries: ${enquiries.length} rows`);
}

// ─── SECTION 1.2 — Admissions (with 8 child tables + Bridge 2 bypass) ────────
async function seedAdmissions() {
  log("Section 1: admissions (8 rows) + 8 child tables + Bridge 2 bypass");

  const parentRoleRes = await authPool.query(
    `SELECT id FROM roles WHERE name='PARENT' LIMIT 1`
  );
  if (!parentRoleRes.rows[0])
    throw new Error("PARENT role missing — run seed-all.js first");
  const parentRoleId = parentRoleRes.rows[0].id;
  const parentPwdHash = await bcrypt.hash("Parent@123", SALT_ROUNDS);

  const admissions = [
    {
      idx: 0,
      status: "Draft",
      firstName: "Neel",
      lastName: "Bhatt",
      dob: "2020-03-15",
      gender: "Male",
      nat: "Indian",
      relig: "Hindu",
      cat: "General",
      class: refs.class1,
      section: "A",
      roll: "1",
      admNo: "ADM-2026-101",
      prev: null,
      father: "Manoj Bhatt",
      fEmail: "manoj.bhatt@test.com",
      fPhone: "9000020001",
      mother: "Geeta Bhatt",
      mEmail: "geeta.bhatt@test.com",
      mPhone: "9000020011",
    },
    {
      idx: 1,
      status: "Draft",
      firstName: "Myra",
      lastName: "Chawla",
      dob: "2021-07-22",
      gender: "Female",
      nat: "Indian",
      relig: "Hindu",
      cat: "OBC",
      class: refs.classLKG,
      section: "A",
      roll: "2",
      admNo: "ADM-2026-102",
      prev: null,
      father: "Karan Chawla",
      fEmail: "karan.chawla@test.com",
      fPhone: "9000020002",
      mother: "Sunita Chawla",
      mEmail: "sunita.chawla@test.com",
      mPhone: "9000020012",
    },
    {
      idx: 2,
      status: "Under Verification",
      firstName: "Advait",
      lastName: "Rao",
      dob: "2014-11-05",
      gender: "Male",
      nat: "Indian",
      relig: "Hindu",
      cat: "General",
      class: refs.class5,
      section: "A",
      roll: "3",
      admNo: "ADM-2026-103",
      prev: "Sunrise Academy",
      father: "Ravi Rao",
      fEmail: "ravi.rao@test.com",
      fPhone: "9000020003",
      mother: "Latha Rao",
      mEmail: "latha.rao@test.com",
      mPhone: "9000020013",
    },
    {
      idx: 3,
      status: "Under Verification",
      firstName: "Diya",
      lastName: "Menon",
      dob: "2013-04-19",
      gender: "Female",
      nat: "Indian",
      relig: "Hindu",
      cat: "General",
      class: refs.class8,
      section: "B",
      roll: "4",
      admNo: "ADM-2026-104",
      prev: "St. Marys Convent",
      father: "Arjun Menon",
      fEmail: "arjun.menon@test.com",
      fPhone: "9000020004",
      mother: "Radha Menon",
      mEmail: "radha.menon@test.com",
      mPhone: "9000020014",
    },
    {
      idx: 4,
      status: "Approved",
      firstName: "Kiaan",
      lastName: "Agarwal",
      dob: "2012-09-30",
      gender: "Male",
      nat: "Indian",
      relig: "Hindu",
      cat: "General",
      class: refs.class9,
      section: "A",
      roll: "5",
      admNo: "ADM-2026-105",
      prev: "Delhi Public School",
      father: "Anil Agarwal",
      fEmail: "anil.agarwal@test.com",
      fPhone: "9000020005",
      mother: "Neha Agarwal",
      mEmail: "neha.agarwal@test.com",
      mPhone: "9000020015",
    },
    {
      idx: 5,
      status: "Approved",
      firstName: "Anaya",
      lastName: "Pillai",
      dob: "2011-01-12",
      gender: "Female",
      nat: "Indian",
      relig: "Hindu",
      cat: "General",
      class: refs.class10,
      section: "A",
      roll: "6",
      admNo: "ADM-2026-106",
      prev: "Greenwood High",
      father: "Girish Pillai",
      fEmail: "girish.pillai@test.com",
      fPhone: "9000020006",
      mother: "Meera Pillai",
      mEmail: "meera.pillai@test.com",
      mPhone: "9000020016",
    },
    {
      idx: 6,
      status: "Approved",
      firstName: "Yash",
      lastName: "Sundaram",
      dob: "2010-06-08",
      gender: "Male",
      nat: "Indian",
      relig: "Hindu",
      cat: "OBC",
      class: refs.class10,
      section: "B",
      roll: "7",
      admNo: "ADM-2026-107",
      prev: "National Public School",
      father: "Suresh Sundaram",
      fEmail: "suresh.s@test.com",
      fPhone: "9000020007",
      mother: "Priya Sundaram",
      mEmail: "priya.s@test.com",
      mPhone: "9000020017",
    },
    {
      idx: 7,
      status: "Approved",
      firstName: "Tara",
      lastName: "DeSouza",
      dob: "2009-12-21",
      gender: "Female",
      nat: "Indian",
      relig: "Christian",
      cat: "General",
      class: refs.class12,
      section: "A",
      roll: "8",
      admNo: "ADM-2026-108",
      prev: "St. Josephs College",
      father: "Felix DeSouza",
      fEmail: "felix.d@test.com",
      fPhone: "9000020008",
      mother: "Maria DeSouza",
      mEmail: "maria.d@test.com",
      mPhone: "9000020018",
    },
  ];

  for (const a of admissions) {
    const admissionId = ADMISSION_IDS[a.idx];
    const bloodGroup = [refs.bgAPos, refs.bgBPos, refs.bgOPos, refs.bgABPos][
      a.idx % 4
    ];
    const isApproved = a.status === "Approved";
    const submittedDate =
      a.status === "Draft" ? null : new Date().toISOString();

    // students_admission root row
    await academicPool
      .query(
        `INSERT INTO students_admission (id, school_id, admission_status, submitted_by, submitted_date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET admission_status = EXCLUDED.admission_status, submitted_date = EXCLUDED.submitted_date`,
        [admissionId, SCHOOL_ID, a.status, "ADM001", submittedDate]
      )
      .catch((e) => warn(`students_admission ${a.firstName}`, e));

    // personal_information
    await academicPool
      .query(
        `INSERT INTO personal_information (school_id, student_id, first_name, last_name, date_of_birth,
         gender, blood_group_id, nationality, religion, category, student_photo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT DO NOTHING`,
        [
          SCHOOL_ID,
          admissionId,
          a.firstName,
          a.lastName,
          a.dob,
          a.gender,
          bloodGroup,
          a.nat,
          a.relig,
          a.cat,
          "/uploads/sample-photo.png",
        ]
      )
      .catch((e) => warn(`personal_info ${a.firstName}`, e));

    // academic_information
    await academicPool
      .query(
        `INSERT INTO academic_information (school_id, student_id, admission_number, admission_date,
         class_id, section, roll_number, previous_school)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (school_id, class_id, section, roll_number) DO NOTHING`,
        [
          SCHOOL_ID,
          admissionId,
          a.admNo,
          "2026-04-01",
          a.class,
          a.section,
          a.roll,
          a.prev,
        ]
      )
      .catch((e) => warn(`academic_info ${a.firstName}`, e));

    // contact_information
    await academicPool
      .query(
        `INSERT INTO contact_information (school_id, student_id, student_phone, student_email)
       VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [
          SCHOOL_ID,
          admissionId,
          `9100${String(a.idx).padStart(6, "0")}`,
          `${a.firstName.toLowerCase()}.${a.lastName.toLowerCase()}@test.com`,
        ]
      )
      .catch((e) => warn(`contact_info ${a.firstName}`, e));

    // address_information
    await academicPool
      .query(
        `INSERT INTO address_information (school_id, student_id, current_street, current_city, current_state,
         current_pincode, is_permanent_same, permanent_street, permanent_city, permanent_state, permanent_pincode)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT DO NOTHING`,
        [
          SCHOOL_ID,
          admissionId,
          `${a.idx + 1} Sample Street`,
          "Bengaluru",
          "Karnataka",
          "560001",
          true,
          `${a.idx + 1} Sample Street`,
          "Bengaluru",
          "Karnataka",
          "560001",
        ]
      )
      .catch((e) => warn(`address_info ${a.firstName}`, e));

    // parent_guardian_information
    await academicPool
      .query(
        `INSERT INTO parent_guardian_information (school_id, student_id, father_full_name, father_occupation,
         father_phone, father_email, father_annual_income, mother_full_name, mother_occupation, mother_phone,
         mother_email, mother_annual_income)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT DO NOTHING`,
        [
          SCHOOL_ID,
          admissionId,
          a.father,
          "Engineer",
          a.fPhone,
          a.fEmail,
          1200000,
          a.mother,
          "Teacher",
          a.mPhone,
          a.mEmail,
          800000,
        ]
      )
      .catch((e) => warn(`parent_info ${a.firstName}`, e));

    // emergency_contact
    await academicPool
      .query(
        `INSERT INTO emergency_contact (school_id, student_id, contact_name, relation, phone)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
        [SCHOOL_ID, admissionId, a.father, "Father", a.fPhone]
      )
      .catch((e) => warn(`emergency_contact ${a.firstName}`, e));

    // medical_information
    await academicPool
      .query(
        `INSERT INTO medical_information (school_id, student_id, allergies, medical_conditions, medications,
         family_doctor_name, doctor_phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
        [
          SCHOOL_ID,
          admissionId,
          "None",
          "None",
          "None",
          "Dr. Ramesh Kumar",
          "9900000000",
        ]
      )
      .catch((e) => warn(`medical_info ${a.firstName}`, e));

    // student_documents
    await academicPool
      .query(
        `INSERT INTO student_documents (school_id, student_id, birth_certificate, birth_certificate_status,
         aadhaar_card, aadhaar_card_status, transfer_certificate, transfer_certificate_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`,
        [
          SCHOOL_ID,
          admissionId,
          "/uploads/sample-birth-cert.pdf",
          "Verified",
          "/uploads/sample-aadhaar.pdf",
          "Verified",
          a.prev ? "/uploads/sample-tc.pdf" : null,
          a.prev ? "Verified" : "Optional",
        ]
      )
      .catch((e) => warn(`student_documents ${a.firstName}`, e));

    // Bridge 2 for approved admissions: create parent auth user + students row
    if (isApproved) {
      const parentAuthId = APPROVED_PARENT_IDS[a.idx - 4];
      const parentEmail = `admission${a.idx - 3}.parent@schoolnest.com`;

      await authPool
        .query(
          `INSERT INTO users (id, school_id, role_id, name, email, password_hash)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
          [
            parentAuthId,
            SCHOOL_ID,
            parentRoleId,
            a.father,
            parentEmail,
            parentPwdHash,
          ]
        )
        .catch((e) => warn(`parent auth user ${parentAuthId}`, e));

      // Map approved admission to a real denormalized class (fall back to CLASS_1_ID if no match)
      const denormClassId = a.section === "B" ? CLASS_2_ID : CLASS_1_ID;
      const studentName = `${a.firstName} ${a.lastName}`;
      // Use roll numbers 10+ to avoid colliding with seed-test-users students (roll 1,2)
      const denormRollNo = 10 + a.idx;
      await academicPool
        .query(
          `INSERT INTO students (school_id, class_id, roll_no, name, parent_id)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT (school_id, class_id, roll_no) DO NOTHING`,
          [SCHOOL_ID, denormClassId, denormRollNo, studentName, parentAuthId]
        )
        .catch((e) => warn(`student row ${studentName}`, e));
    }
  }

  ok(
    `admissions: 8 rows (2 Draft, 2 Under Verification, 4 Approved) + 8 child tables per admission`
  );
  ok(`Bridge 2: 4 parent auth users (PAR201-PAR204) + 4 students rows linked`);
}

// ─── SECTION 1.3 — Drivers ───────────────────────────────────────────────────
async function seedDrivers() {
  log("Section 1: drivers (2 rows)");
  const drivers = [
    {
      id: DRIVER_IDS[0],
      first: "Ramesh",
      last: "Kumar",
      dob: "1985-03-12",
      gender: "Male",
      bg: refs.bgOPos,
      nat: "Indian",
      phone: "9000030001",
      email: "ramesh.driver@test.com",
      street: "5 Driver Colony",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560010",
      licNum: "KA0120240001234",
      licExp: "2030-03-12",
      licClass: "LMV - Light Motor Vehicle",
      bus: "KA-01-AB-1234",
      routes: "Whitefield → School → Indiranagar",
      assign: "2024-06-01",
      exp: 8,
      salary: 22000,
      aadhar: "111122223333",
      pan: "ABCDE1234F",
      bank: "HDFC Bank",
      acc: "5012345678",
      ifsc: "HDFC0001234",
      em: "Sita Kumar",
      emRel: "Spouse",
      emPhone: "9000030011",
    },
    {
      id: DRIVER_IDS[1],
      first: "Ganesh",
      last: "Shetty",
      dob: "1980-11-08",
      gender: "Male",
      bg: refs.bgBPos,
      nat: "Indian",
      phone: "9000030002",
      email: "ganesh.driver@test.com",
      street: "12 Transport Lane",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560011",
      licNum: "KA0220240005678",
      licExp: "2029-08-20",
      licClass: "HPMV - Heavy Passenger Motor Vehicle",
      bus: "KA-02-CD-5678",
      routes: "Koramangala → School → HSR Layout",
      assign: "2023-04-15",
      exp: 12,
      salary: 26000,
      aadhar: "444455556666",
      pan: "FGHIJ5678K",
      bank: "SBI",
      acc: "6123456789",
      ifsc: "SBIN0005678",
      em: "Kavita Shetty",
      emRel: "Spouse",
      emPhone: "9000030012",
    },
  ];

  for (const d of drivers) {
    await academicPool
      .query(
        `INSERT INTO drivers_records (id, school_id, first_name, last_name, date_of_birth, gender, blood_group_id,
         nationality, primary_phone, primary_email, current_street, current_city, current_state, current_pincode,
         is_permanent_same, license_number, license_expiry, license_class, commercial_license, dL_verified,
         bus_number, routes, assign_date, total_experience_years, employment_type, monthly_salary, aadhar_number,
         pan_number, bank_name, account_number, ifsc_code, emergency_contact_name, emergency_relation, emergency_phone, employment_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35)
       ON CONFLICT (id) DO NOTHING`,
        [
          d.id,
          SCHOOL_ID,
          d.first,
          d.last,
          d.dob,
          d.gender,
          d.bg,
          d.nat,
          d.phone,
          d.email,
          d.street,
          d.city,
          d.state,
          d.pincode,
          true,
          d.licNum,
          d.licExp,
          d.licClass,
          true,
          true,
          d.bus,
          d.routes,
          d.assign,
          d.exp,
          "Permanent",
          d.salary,
          d.aadhar,
          d.pan,
          d.bank,
          d.acc,
          d.ifsc,
          d.em,
          d.emRel,
          d.emPhone,
          "Active",
        ]
      )
      .catch((e) => warn(`driver ${d.first}`, e));
  }
  ok("drivers: 2 rows");
}

// ─── SECTION 1.4 — Other Staff ──────────────────────────────────────────────
async function seedOtherStaff() {
  log("Section 1: other-staff (3 rows)");
  const staff = [
    {
      id: STAFF_IDS[0],
      first: "Suresh",
      last: "Reddy",
      dob: "1978-05-20",
      gender: "Male",
      bg: refs.bgAPos,
      phone: "9000040001",
      email: "suresh.accountant@test.com",
      role: refs.staffRoleAccountant,
      dept: refs.staffDeptFinance,
      pos: refs.staffPosSenior,
      salary: 45000,
      join: "2020-06-01",
    },
    {
      id: STAFF_IDS[1],
      first: "Lakshmi",
      last: "Narayanan",
      dob: "1985-02-14",
      gender: "Female",
      bg: refs.bgOPos,
      phone: "9000040002",
      email: "lakshmi.librarian@test.com",
      role: refs.staffRoleLibrarian,
      dept: refs.staffDeptLibrary,
      pos: refs.staffPosJunior,
      salary: 28000,
      join: "2022-04-10",
    },
    {
      id: STAFF_IDS[2],
      first: "Ibrahim",
      last: "Sheikh",
      dob: "1982-10-03",
      gender: "Male",
      bg: refs.bgBPos,
      phone: "9000040003",
      email: "ibrahim.security@test.com",
      role: refs.staffRoleSecurity,
      dept: refs.staffDeptSecurity,
      pos: refs.staffPosJunior,
      salary: 20000,
      join: "2021-09-15",
    },
  ];

  for (const s of staff) {
    await academicPool
      .query(
        `INSERT INTO otherStaff_records (id, school_id, first_name, last_name, date_of_birth, gender, blood_group_id,
         nationality, primary_phone, primary_email, current_street, current_city, current_state, current_pincode,
         is_permanent_same, staff_role_id, staff_dept_id, position_level_id, employment_type, monthly_salary,
         join_date, emergency_contact_name, emergency_relation, emergency_phone, aadhar_number, pan_number,
         bank_name, account_number, ifsc_code, other_staff_employment_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30)
       ON CONFLICT (id) DO NOTHING`,
        [
          s.id,
          SCHOOL_ID,
          s.first,
          s.last,
          s.dob,
          s.gender,
          s.bg,
          "Indian",
          s.phone,
          s.email,
          "1 Staff Quarters",
          "Bengaluru",
          "Karnataka",
          "560020",
          true,
          s.role,
          s.dept,
          s.pos,
          "Permanent",
          s.salary,
          s.join,
          "Emergency Contact",
          "Spouse",
          `9000040${String(s.id).slice(-3)}`,
          "7777" +
            String(100000000 + Math.floor(Math.random() * 100000000)).slice(
              0,
              8
            ),
          "STAFF1234Z",
          "Axis Bank",
          "9012345678",
          "UTIB0001234",
          "Active",
        ]
      )
      .catch((e) => warn(`staff ${s.first}`, e));
  }
  ok("other-staff: 3 rows");
}

// ─── SECTION 1.5 — Class & Subject Assignments ───────────────────────────────
async function seedClassAssignments() {
  log("Section 1: classes_assign (5 rows) + subject_class_assign (5 rows)");

  const classAssigns = [
    { classId: refs.class9, teacher: TEACHER_1_ID, section: "A" },
    { classId: refs.class9, teacher: TEACHER_2_ID, section: "B" },
    { classId: refs.class10, teacher: TEACHER_1_ID, section: "A" },
    { classId: refs.class10, teacher: TEACHER_2_ID, section: "B" },
    { classId: refs.class8, teacher: TEACHER_1_ID, section: "A" },
  ];
  for (const c of classAssigns) {
    if (!c.classId) continue;
    await academicPool
      .query(
        `INSERT INTO classes_assign (school_id, class_id, teacher_id, section_name)
       VALUES ($1,$2,$3,$4) ON CONFLICT (school_id, class_id, section_name) DO NOTHING`,
        [SCHOOL_ID, c.classId, c.teacher, c.section]
      )
      .catch((e) => warn("classes_assign", e));
  }

  const subjAssigns = [
    {
      subjectId: refs.subjectMath,
      classId: refs.class9,
      teacher: TEACHER_1_ID,
      seq: 1,
    },
    {
      subjectId: refs.subjectEnglish,
      classId: refs.class9,
      teacher: TEACHER_2_ID,
      seq: 2,
    },
    {
      subjectId: refs.subjectMath,
      classId: refs.class10,
      teacher: TEACHER_1_ID,
      seq: 1,
    },
    {
      subjectId: refs.subjectEnglish,
      classId: refs.class10,
      teacher: TEACHER_2_ID,
      seq: 2,
    },
    {
      subjectId: refs.subjectScience,
      classId: refs.class10,
      teacher: TEACHER_1_ID,
      seq: 3,
    },
  ];
  for (const s of subjAssigns) {
    if (!s.subjectId || !s.classId) continue;
    await academicPool
      .query(
        `INSERT INTO subject_class_assign (school_id, subject_id, class_id, teacher_id, sequence)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (school_id, subject_id, class_id) DO NOTHING`,
        [SCHOOL_ID, s.subjectId, s.classId, s.teacher, s.seq]
      )
      .catch((e) => warn("subject_class_assign", e));
  }
  ok("classes_assign: 5 rows, subject_class_assign: 5 rows");
}

// ─── SECTION 1.6 — Admin Exams (create_exams + exam_details) ─────────────────
async function seedAdminExams() {
  log("Section 1: create_exams (3 rows) + exam_details (15 rows)");

  const today = new Date();
  const daysAgo = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };
  const daysAhead = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };

  const exams = [
    {
      id: EXAM_IDS[0],
      name: "Mid-Term 2026",
      start: daysAhead(45),
      end: daysAhead(60),
      status: "UPCOMING",
    },
    {
      id: EXAM_IDS[1],
      name: "Final Term 2026",
      start: daysAhead(120),
      end: daysAhead(135),
      status: "UPCOMING",
    },
    {
      id: EXAM_IDS[2],
      name: "Quarterly 2025",
      start: daysAgo(300),
      end: daysAgo(290),
      status: "COMPLETED",
    },
    {
      id: EXAM_IDS[3],
      name: "Unit Test March 2026",
      start: daysAgo(2),
      end: daysAhead(4),
      status: "ONGOING",
    },
    {
      id: EXAM_IDS[4],
      name: "Annual Exam 2025",
      start: daysAgo(120),
      end: daysAgo(110),
      status: "PUBLISHED",
    },
  ];
  for (const e of exams) {
    await academicPool
      .query(
        `INSERT INTO create_exams (id, school_id, exam_name, academic_year, start_date, end_date, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
        [e.id, SCHOOL_ID, e.name, "2025-26", e.start, e.end, e.status]
      )
      .catch((err) => warn(`create_exam ${e.name}`, err));
  }

  // 15 exam_details: 3 exams × 5 class-subject combos
  const combos = [
    {
      classId: refs.class9,
      sectionId: refs.sectionA,
      subjectId: refs.subjectMath,
      teacher: TEACHER_1_ID,
    },
    {
      classId: refs.class9,
      sectionId: refs.sectionA,
      subjectId: refs.subjectEnglish,
      teacher: TEACHER_2_ID,
    },
    {
      classId: refs.class10,
      sectionId: refs.sectionA,
      subjectId: refs.subjectMath,
      teacher: TEACHER_1_ID,
    },
    {
      classId: refs.class10,
      sectionId: refs.sectionA,
      subjectId: refs.subjectEnglish,
      teacher: TEACHER_2_ID,
    },
    {
      classId: refs.class10,
      sectionId: refs.sectionB,
      subjectId: refs.subjectScience,
      teacher: TEACHER_1_ID,
    },
  ];
  let detailCount = 0;
  for (const exam of exams) {
    for (let i = 0; i < combos.length; i++) {
      const c = combos[i];
      if (!c.classId || !c.sectionId || !c.subjectId) continue;
      const examDate = new Date(exam.start);
      examDate.setDate(examDate.getDate() + i);
      await academicPool
        .query(
          `INSERT INTO exam_details (school_id, exam_id, class_id, section_id, subject_id, exam_date,
           max_marks, pass_marks, teacher_id, result_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (school_id, exam_id, class_id, section_id, subject_id) DO NOTHING`,
          [
            SCHOOL_ID,
            exam.id,
            c.classId,
            c.sectionId,
            c.subjectId,
            examDate.toISOString().slice(0, 10),
            100,
            35,
            c.teacher,
            exam.status === "COMPLETED" || exam.status === "PUBLISHED"
              ? "Published"
              : exam.status === "ONGOING"
              ? "Marks Pending"
              : "Not Started",
          ]
        )
        .catch((e) => warn("exam_details", e));
      detailCount++;
    }
  }
  ok(`create_exams: ${exams.length}, exam_details: ${detailCount}`);
}

// ─── SECTION 1.7 — Announcement Templates + Announcements ────────────────────
async function seedAnnouncements() {
  log("Section 1: announcement_templates (3) + announcements (5) + recipients");

  const templates = [
    {
      title: "Holiday Notice",
      message: "School will remain closed on {date} due to {reason}.",
    },
    {
      title: "PTA Meeting",
      message:
        "Parent-Teacher meeting scheduled for {date} at {time}. All parents requested to attend.",
    },
    {
      title: "Exam Schedule Released",
      message:
        "The exam schedule for {exam_name} has been released. Please check the portal.",
    },
  ];
  for (const t of templates) {
    await academicPool
      .query(
        `INSERT INTO announcement_templates (school_id, title, message)
       VALUES ($1,$2,$3) ON CONFLICT (school_id, title) DO NOTHING`,
        [SCHOOL_ID, t.title, t.message]
      )
      .catch((e) => warn(`template ${t.title}`, e));
  }

  const announcements = [
    {
      id: "77777777-7777-4777-a777-000000000001",
      classId: null,
      audience: "all_teachers",
      title: "Staff Meeting Tomorrow",
      msg: "All teachers report to the staff room by 9 AM for the monthly review.",
      important: true,
      recipients: 2,
      recipientIds: [TEACHER_1_ID, TEACHER_2_ID],
    },
    {
      id: "77777777-7777-4777-a777-000000000002",
      classId: CLASS_1_ID,
      audience: "full_class",
      title: "Class 10A - Field Trip Permission",
      msg: "Please submit signed permission slips for the upcoming science museum trip by Friday.",
      important: false,
      recipients: 2,
      recipientIds: [PARENT_1_ID, PARENT_2_ID],
    },
    {
      id: "77777777-7777-4777-a777-000000000003",
      classId: null,
      audience: "all_teachers",
      title: "New Grading System Rollout",
      msg: "Starting next term, we will adopt the new rubric-based grading system. Training session on Saturday.",
      important: true,
      recipients: 2,
      recipientIds: [TEACHER_1_ID, TEACHER_2_ID],
    },
    {
      id: "77777777-7777-4777-a777-000000000004",
      classId: CLASS_2_ID,
      audience: "full_class",
      title: "Class 10B - English Assignment",
      msg: 'Reading assignment — "To Kill a Mockingbird" chapters 1-5 due next Monday.',
      important: false,
      recipients: 1,
      recipientIds: [PARENT_1_ID],
    },
    {
      id: "77777777-7777-4777-a777-000000000005",
      classId: null,
      audience: "all_teachers",
      title: "Annual Day — Save the Date",
      msg: "The school annual day is scheduled for 15th December. Rehearsals will begin next week.",
      important: false,
      recipients: 2,
      recipientIds: [TEACHER_1_ID, TEACHER_2_ID],
    },
  ];

  for (const a of announcements) {
    await academicPool
      .query(
        `INSERT INTO announcements (id, school_id, sender_id, sender_name, sender_role, class_id,
         audience_type, title, message, is_important, recipient_count)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (id) DO NOTHING`,
        [
          a.id,
          SCHOOL_ID,
          "ADM001",
          "Admin User",
          "ADMIN",
          a.classId,
          a.audience,
          a.title,
          a.msg,
          a.important,
          a.recipients,
        ]
      )
      .catch((e) => warn(`announcement ${a.title}`, e));

    for (const recipientId of a.recipientIds) {
      await academicPool
        .query(
          `INSERT INTO announcement_recipients (announcement_id, recipient_id, school_id, is_read)
         VALUES ($1,$2,$3,$4) ON CONFLICT (announcement_id, recipient_id) DO NOTHING`,
          [a.id, recipientId, SCHOOL_ID, Math.random() > 0.5]
        )
        .catch((e) => warn("announcement_recipient", e));
    }
  }
  ok(`announcement_templates: 3, announcements: 5, recipients: ~9`);
}

// ─── SECTION 1.8 — Teacher Edit Requests ─────────────────────────────────────
async function seedTeacherEditRequests() {
  log("Section 1: teacher_edit_requests (2 rows)");
  const reqs = [
    {
      teacher: TEACHER_1_ID,
      changed: JSON.stringify({
        primary_phone: { old: "+91-9000000001", new: "+91-9876543210" },
      }),
      status: "PENDING",
      notes: null,
      reason: null,
    },
    {
      teacher: TEACHER_2_ID,
      changed: JSON.stringify({
        emergency_phone: { old: "+91-9000000022", new: "+91-9123456789" },
      }),
      status: "APPROVED",
      notes: "Approved by admin",
      reason: null,
    },
  ];
  for (const r of reqs) {
    await academicPool
      .query(
        `INSERT INTO teacher_edit_requests (school_id, teacher_id, changed_fields, status, admin_notes, rejection_reason)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
        [SCHOOL_ID, r.teacher, r.changed, r.status, r.notes, r.reason]
      )
      .catch((e) => warn("teacher_edit_request", e));
  }
  ok("teacher_edit_requests: 2 rows");
}

// ─── SECTION 2.1 — Attendance (past 7 days) ──────────────────────────────────
async function seedAttendance() {
  log("Section 2: attendance (past 7 days × 3 students × 2 classes)");

  // Get student IDs from our test-users seed (roll 1, 2, 3)
  const res = await academicPool.query(
    `SELECT id, class_id, roll_no FROM students WHERE school_id=$1 AND class_id IN ($2, $3) ORDER BY class_id, roll_no`,
    [SCHOOL_ID, CLASS_1_ID, CLASS_2_ID]
  );
  const students = res.rows;
  if (students.length === 0) {
    warn("no students found — run seed-test-users.js first");
    return;
  }

  const statuses = [
    "PRESENT",
    "PRESENT",
    "PRESENT",
    "ABSENT",
    "LATE",
    "HALF_DAY",
  ]; // weighted toward PRESENT
  const today = new Date();
  let count = 0;

  for (let d = 1; d <= 7; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);
    // skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (const s of students) {
      const teacher = s.class_id === CLASS_1_ID ? TEACHER_1_ID : TEACHER_2_ID;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      await academicPool
        .query(
          `INSERT INTO attendance (school_id, class_id, student_id, teacher_id, date, status, remarks)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING`,
          [SCHOOL_ID, s.class_id, s.id, teacher, dateStr, status, null]
        )
        .catch((e) => warn(`attendance ${dateStr}`, e));
      count++;
    }
  }
  ok(`attendance: ${count} rows across ~5 working days`);
}

// ─── SECTION 2.2 — Homework ──────────────────────────────────────────────────
async function seedHomework() {
  log("Section 2: homework (5 rows)");
  const today = new Date();
  const homeworks = [
    // Upcoming
    {
      classId: CLASS_1_ID,
      teacher: TEACHER_1_ID,
      subject: "Mathematics",
      title: "Quadratic Equations — Exercise 4.3",
      desc: "Solve all problems from exercise 4.3 in the textbook.",
      due: +3,
    },
    {
      classId: CLASS_1_ID,
      teacher: TEACHER_1_ID,
      subject: "Mathematics",
      title: "Trigonometry Worksheet",
      desc: "Attempt the worksheet on identities and submit by due date.",
      due: +7,
    },
    {
      classId: CLASS_2_ID,
      teacher: TEACHER_2_ID,
      subject: "English",
      title: "Essay — Life in 2050",
      desc: "Write a 500-word essay on how you imagine life in the year 2050.",
      due: +5,
    },
    // Due today (ongoing)
    {
      classId: CLASS_1_ID,
      teacher: TEACHER_1_ID,
      subject: "Mathematics",
      title: "Algebra Quick Quiz",
      desc: "In-class quiz today — review chapters 1-2 beforehand.",
      due: 0,
    },
    // Overdue / completed window
    {
      classId: CLASS_2_ID,
      teacher: TEACHER_2_ID,
      subject: "English",
      title: "Book Report — Animal Farm",
      desc: "Read chapters 1-3 and write a short summary.",
      due: -2,
    },
    {
      classId: CLASS_1_ID,
      teacher: TEACHER_1_ID,
      subject: "Mathematics",
      title: "Practice Test",
      desc: "Practice test covering chapters 1-3.",
      due: -5,
    },
    {
      classId: CLASS_2_ID,
      teacher: TEACHER_2_ID,
      subject: "English",
      title: "Grammar Worksheet — Completed",
      desc: "Past-tense exercise — collected and graded.",
      due: -10,
    },
  ];
  for (const h of homeworks) {
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + h.due);
    await academicPool
      .query(
        `INSERT INTO homework (school_id, class_id, teacher_id, subject, title, description, due_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
        [
          SCHOOL_ID,
          h.classId,
          h.teacher,
          h.subject,
          h.title,
          h.desc,
          dueDate.toISOString().slice(0, 10),
        ]
      )
      .catch((e) => warn(`homework ${h.title}`, e));
  }
  ok("homework: 5 rows");
}

// ─── SECTION 2.3 — Timetable ─────────────────────────────────────────────────
async function seedTimetable() {
  log("Section 2: timetable (10 rows — Mon-Fri × 2 classes)");
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const slots = [
    {
      classId: CLASS_1_ID,
      teacher: TEACHER_1_ID,
      subject: "Mathematics",
      period: 1,
      start: "09:00",
      end: "09:45",
    },
    {
      classId: CLASS_2_ID,
      teacher: TEACHER_2_ID,
      subject: "English",
      period: 1,
      start: "09:00",
      end: "09:45",
    },
  ];
  let count = 0;
  for (const day of days) {
    for (const s of slots) {
      await academicPool
        .query(
          `INSERT INTO timetable (school_id, class_id, day_of_week, period_number, subject, teacher_id, start_time, end_time)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (school_id, class_id, day_of_week, period_number) DO NOTHING`,
          [
            SCHOOL_ID,
            s.classId,
            day,
            s.period,
            s.subject,
            s.teacher,
            s.start,
            s.end,
          ]
        )
        .catch((e) => warn(`timetable ${day}`, e));
      count++;
    }
  }
  ok(`timetable: ${count} rows`);
}

// ─── SECTION 2.4 — Leave Requests ────────────────────────────────────────────
async function seedLeaveRequests() {
  log("Section 2: leave_requests (3 rows: 1 pending, 1 approved, 1 rejected)");
  const res = await academicPool.query(
    `SELECT id FROM students WHERE school_id=$1 ORDER BY roll_no LIMIT 3`,
    [SCHOOL_ID]
  );
  const studentIds = res.rows.map((r) => r.id);
  if (studentIds.length < 3) {
    warn("need at least 3 students");
    return;
  }

  const today = new Date();
  const leaves = [
    {
      studentId: studentIds[0],
      from: +2,
      to: +4,
      reason: "Sick",
      message: "Fever and flu, doctor advised rest",
      status: "PENDING",
    },
    {
      studentId: studentIds[1],
      from: -3,
      to: -2,
      reason: "Family Function",
      message: "Attending cousin wedding",
      status: "APPROVED",
    },
    {
      studentId: studentIds[2],
      from: -7,
      to: -5,
      reason: "Travel",
      message: "Family trip to Kerala",
      status: "REJECTED",
    },
  ];

  for (const l of leaves) {
    const fromDate = new Date(today);
    fromDate.setDate(fromDate.getDate() + l.from);
    const toDate = new Date(today);
    toDate.setDate(toDate.getDate() + l.to);
    await academicPool
      .query(
        `INSERT INTO leave_requests (school_id, student_id, from_date, to_date, reason, message, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
        [
          SCHOOL_ID,
          l.studentId,
          fromDate.toISOString().slice(0, 10),
          toDate.toISOString().slice(0, 10),
          l.reason,
          l.message,
          l.status,
        ]
      )
      .catch((e) => warn("leave_request", e));
  }
  ok("leave_requests: 3 rows");
}

// ─── SECTION 2.5 — Teacher Check-ins ─────────────────────────────────────────
async function seedTeacherCheckins() {
  log("Section 2: teacher_checkins (5 working days × 2 teachers)");
  const today = new Date();
  let count = 0;
  for (let d = 1; d <= 7; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const dateStr = date.toISOString().slice(0, 10);

    for (const teacherId of [TEACHER_1_ID, TEACHER_2_ID]) {
      const isLate = Math.random() > 0.7;
      const hour = isLate ? 10 : 9;
      const minute = isLate ? 5 : 25;
      const checkInTime = new Date(date);
      checkInTime.setHours(hour, minute, 0, 0);
      await academicPool
        .query(
          `INSERT INTO teacher_checkins (school_id, teacher_id, check_in_time, latitude, longitude, status, date)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (school_id, teacher_id, date) DO NOTHING`,
          [
            SCHOOL_ID,
            teacherId,
            checkInTime.toISOString(),
            12.9716,
            77.5946,
            isLate ? "LATE" : "ON_TIME",
            dateStr,
          ]
        )
        .catch((e) => warn(`teacher_checkin ${dateStr}`, e));
      count++;
    }
  }
  ok(`teacher_checkins: ${count} rows`);
}

// ─── SECTION 3.1 — Fees (fee_categories + student_fees + payments) ───────────
async function seedFees() {
  log("Section 3: fee_categories (3) + student_fees + payments");

  const feeCats = [
    {
      id: "44444444-4444-4444-a444-000000000001",
      name: "Tuition Fee",
      icon: "book",
    },
    {
      id: "44444444-4444-4444-a444-000000000002",
      name: "Transport Fee",
      icon: "bus",
    },
    {
      id: "44444444-4444-4444-a444-000000000003",
      name: "Exam Fee",
      icon: "edit",
    },
  ];
  for (const f of feeCats) {
    await academicPool
      .query(
        `INSERT INTO fee_categories (id, school_id, name, icon)
       VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING`,
        [f.id, SCHOOL_ID, f.name, f.icon]
      )
      .catch((e) => warn(`fee_category ${f.name}`, e));
  }

  const studentsRes = await academicPool.query(
    `SELECT id FROM students WHERE school_id=$1 ORDER BY roll_no LIMIT 3`,
    [SCHOOL_ID]
  );
  const studentIds = studentsRes.rows.map((r) => r.id);

  // Reset fees for these 3 students so rerunning stays idempotent (student_fees has no unique key besides id)
  if (studentIds.length > 0) {
    await academicPool
      .query(
        `DELETE FROM student_fees WHERE school_id=$1 AND student_id = ANY($2)`,
        [SCHOOL_ID, studentIds]
      )
      .catch((e) => warn("reset student_fees", e));
  }

  let feeCount = 0;
  let paymentCount = 0;
  // Rotate status across (student, category) pairs so every student sees PAID + PENDING + OVERDUE
  const statusCycle = ["PAID", "PENDING", "OVERDUE"];
  let pairIdx = 0;
  for (const studentId of studentIds) {
    for (const cat of feeCats) {
      const status = statusCycle[pairIdx++ % statusCycle.length];
      const amount =
        cat.name === "Tuition Fee"
          ? 15000
          : cat.name === "Transport Fee"
          ? 3000
          : 1500;
      // OVERDUE → due date in past; PENDING → future; PAID → future (recently paid)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (status === "OVERDUE" ? -10 : 30));

      const feeRes = await academicPool
        .query(
          `INSERT INTO student_fees (school_id, student_id, fee_category_id, amount, due_date, status, paid_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
          [
            SCHOOL_ID,
            studentId,
            cat.id,
            amount,
            dueDate.toISOString().slice(0, 10),
            status,
            status === "PAID" ? new Date().toISOString() : null,
          ]
        )
        .catch((e) => {
          warn("student_fee", e);
          return { rows: [] };
        });
      feeCount++;

      if (status === "PAID" && feeRes.rows[0]) {
        await academicPool
          .query(
            `INSERT INTO payments (school_id, student_id, student_fee_id, amount, method, transaction_id, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [
              SCHOOL_ID,
              studentId,
              feeRes.rows[0].id,
              amount,
              "UPI",
              `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
              "PAID",
            ]
          )
          .catch((e) => warn("payment", e));
        paymentCount++;
      }
    }
  }
  ok(
    `fee_categories: ${feeCats.length}, student_fees: ${feeCount}, payments: ${paymentCount}`
  );
}

// ─── SECTION 3.2 — Teacher-side exam results (for parent dashboard) ──────────
async function seedTeacherExams() {
  log(
    "Section 3: exams + exam_subjects + exam_results (for parent Results screen)"
  );

  // Use a single "Mid-Term 2026" exam in the teacher/parent schema
  const examId = "88888888-8888-4888-a888-000000000001";
  await academicPool
    .query(
      `INSERT INTO exams (id, school_id, name, academic_year, start_date, end_date)
     VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
      [
        examId,
        SCHOOL_ID,
        "Mid-Term 2026",
        "2025-26",
        "2026-09-01",
        "2026-09-15",
      ]
    )
    .catch((e) => warn("exams", e));

  // Link exam to both classes
  for (const classId of [CLASS_1_ID, CLASS_2_ID]) {
    await academicPool
      .query(
        `INSERT INTO exam_classes (exam_id, class_id, school_id)
       VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [examId, classId, SCHOOL_ID]
      )
      .catch((e) => warn("exam_classes", e));
  }

  // Two exam subjects — Maths (class 1), English (class 2)
  const subjects = [
    {
      id: "88888888-8888-4888-a888-000000000011",
      classId: CLASS_1_ID,
      subject: "Mathematics",
      teacher: TEACHER_1_ID,
      date: "2026-09-01",
    },
    {
      id: "88888888-8888-4888-a888-000000000012",
      classId: CLASS_2_ID,
      subject: "English",
      teacher: TEACHER_2_ID,
      date: "2026-09-03",
    },
  ];
  for (const s of subjects) {
    await academicPool
      .query(
        `INSERT INTO exam_subjects (id, exam_id, school_id, class_id, subject_name, exam_date, max_marks, pass_marks, teacher_id, result_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO NOTHING`,
        [
          s.id,
          examId,
          SCHOOL_ID,
          s.classId,
          s.subject,
          s.date,
          100,
          35,
          s.teacher,
          "SUBMITTED",
        ]
      )
      .catch((e) => warn(`exam_subject ${s.subject}`, e));
  }

  // Marks for each student
  const studentsRes = await academicPool.query(
    `SELECT id, class_id FROM students WHERE school_id=$1 AND class_id IN ($2, $3)`,
    [SCHOOL_ID, CLASS_1_ID, CLASS_2_ID]
  );
  let markCount = 0;
  for (const row of studentsRes.rows) {
    const subj = subjects.find((s) => s.classId === row.class_id);
    if (!subj) continue;
    const marks = 45 + Math.floor(Math.random() * 50); // 45-94
    await academicPool
      .query(
        `INSERT INTO exam_results (exam_subject_id, school_id, student_id, marks_obtained, is_absent)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (exam_subject_id, student_id) DO NOTHING`,
        [subj.id, SCHOOL_ID, row.id, marks, false]
      )
      .catch((e) => warn("exam_result", e));
    markCount++;
  }
  ok(`exams: 1, exam_subjects: ${subjects.length}, exam_results: ${markCount}`);
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`🌱 schoolNest full demo seed — school_id=${SCHOOL_ID}`);
  console.log("   (assumes seed-all.js + seed-test-users.js already ran)\n");
  try {
    await loadReferences();

    // Section 1 — Admin dashboard data
    await seedEnquiries();
    await seedAdmissions();
    await seedDrivers();
    await seedOtherStaff();
    await seedClassAssignments();
    await seedAdminExams();
    await seedAnnouncements();
    await seedTeacherEditRequests();

    // Section 2 — Teacher dashboard data
    await seedAttendance();
    await seedHomework();
    await seedTimetable();
    await seedLeaveRequests();
    await seedTeacherCheckins();

    // Section 3 — Parent dashboard data
    await seedFees();
    await seedTeacherExams();

    console.log("\n✅ Full demo seed complete!\n");
    console.log("  Admin logins:");
    console.log("    admin@schoolnest.com              / Admin@123");
    console.log("  Teacher logins:");
    console.log("    teacher1@schoolnest.com           / Teacher@123");
    console.log("    teacher2@schoolnest.com           / Teacher@123");
    console.log("  Existing parent logins:");
    console.log("    parent1@schoolnest.com            / Parent@123");
    console.log("    parent2@schoolnest.com            / Parent@123");
    console.log("  NEW parent logins (from approved admissions):");
    console.log("    admission1.parent@schoolnest.com  / Parent@123");
    console.log("    admission2.parent@schoolnest.com  / Parent@123");
    console.log("    admission3.parent@schoolnest.com  / Parent@123");
    console.log("    admission4.parent@schoolnest.com  / Parent@123\n");
  } catch (e) {
    console.error("\n❌ Seed failed:", e.message);
    console.error(e.stack);
    process.exit(1);
  } finally {
    await authPool.end();
    await academicPool.end();
  }
}

main();
