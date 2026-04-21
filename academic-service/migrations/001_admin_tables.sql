-- ============================================================
-- MIGRATION 001: Admin Tables + Former Common-API Tables
-- Adds all admin module tables to academic_db
-- All tables use school_id for multi-tenant isolation
-- ============================================================

-- ============================================================
-- FORMER COMMON-API: Reference/Lookup Tables (school-specific)
-- ============================================================

-- Global class template catalogue (no school_id — shared across tenants).
-- Super-admin owned; schools pick from this in the Add New Class popup.
-- See migration 015_class_and_section_templates.sql for the seed data.
CREATE TABLE IF NOT EXISTS class_templates (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name    VARCHAR(50)  NOT NULL UNIQUE,
  order_number  INT          NOT NULL DEFAULT 0,
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Global section template catalogue (no school_id — shared across tenants).
-- is_default=true auto-attaches to every new class and cannot be detached.
CREATE TABLE IF NOT EXISTS section_templates (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name  VARCHAR(10)  NOT NULL UNIQUE,
  order_number  INT          NOT NULL DEFAULT 0,
  is_default    BOOLEAN      NOT NULL DEFAULT false,
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Admin-managed class definitions per school (e.g. "Class 1", "LKG", "Grade 10")
CREATE TABLE IF NOT EXISTS school_classes (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id    INT          NOT NULL,
  class_name   VARCHAR(100) NOT NULL,
  order_number INT          NOT NULL DEFAULT 0,
  template_id  UUID         REFERENCES class_templates(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (school_id, class_name)
);
CREATE INDEX IF NOT EXISTS idx_school_classes_school ON school_classes(school_id);

-- Per-class section binding. "A" for Class 1 and "A" for Class 2 are
-- separate rows, both pointing at the same section_templates record.
CREATE TABLE IF NOT EXISTS class_sections (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id            INT          NOT NULL,
  class_id             UUID         NOT NULL REFERENCES school_classes(id) ON DELETE CASCADE,
  section_template_id  UUID         NOT NULL REFERENCES section_templates(id) ON DELETE RESTRICT,
  section_name         VARCHAR(10)  NOT NULL,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (school_id, class_id, section_template_id)
);
CREATE INDEX IF NOT EXISTS idx_class_sections_class ON class_sections(school_id, class_id);

-- Departments (e.g. Science, Arts, Commerce)
CREATE TABLE IF NOT EXISTS departments (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       INT          NOT NULL,
  department_name VARCHAR(100) NOT NULL,
  order_number    INT          NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (school_id, department_name)
);
CREATE INDEX IF NOT EXISTS idx_departments_school ON departments(school_id);

-- Enquiry sources (e.g. Website, Social Media, Referral)
CREATE TABLE IF NOT EXISTS enquiry_sources (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   INT          NOT NULL,
  source_name VARCHAR(100) NOT NULL,
  order_number INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (school_id, source_name)
);
CREATE INDEX IF NOT EXISTS idx_enquiry_sources_school ON enquiry_sources(school_id);

-- Staff roles (e.g. Accountant, Librarian, Peon)
CREATE TABLE IF NOT EXISTS staff_roles (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id      INT          NOT NULL,
  role_name      VARCHAR(100) NOT NULL,
  order_number   INT          NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (school_id, role_name)
);
CREATE INDEX IF NOT EXISTS idx_staff_roles_school ON staff_roles(school_id);

-- Staff departments (school-specific)
CREATE TABLE IF NOT EXISTS staff_departments (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       INT          NOT NULL,
  department_name VARCHAR(100) NOT NULL,
  order_number    INT          NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (school_id, department_name)
);
CREATE INDEX IF NOT EXISTS idx_staff_departments_school ON staff_departments(school_id);

-- Staff positions (school-specific)
CREATE TABLE IF NOT EXISTS staff_positions (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     INT          NOT NULL,
  position_name VARCHAR(100) NOT NULL,
  order_number  INT          NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (school_id, position_name)
);
CREATE INDEX IF NOT EXISTS idx_staff_positions_school ON staff_positions(school_id);

-- Universal lookup tables (no school_id — same values everywhere)
CREATE TABLE IF NOT EXISTS blood_groups (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  blood_group  VARCHAR(5)  NOT NULL UNIQUE,
  order_number INT         NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS license_types (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  license_name VARCHAR(100) NOT NULL UNIQUE,
  order_number INT          NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TEACHER RECORDS (Admin manages full teacher profiles)
-- ============================================================
CREATE TABLE IF NOT EXISTS teacher_records (
  id                           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id                 VARCHAR(50),  -- links to auth_db.users.id (set on creation)
  school_id                    INT          NOT NULL,
  -- Personal
  first_name                   VARCHAR(100) NOT NULL,
  date_of_birth                DATE,
  gender                       VARCHAR(20),
  blood_group_id               UUID         REFERENCES blood_groups(id),
  nationality                  VARCHAR(100),
  religion                     VARCHAR(100),
  marital_status               VARCHAR(50),
  teacher_photo                VARCHAR(255),
  -- Contact
  primary_phone                VARCHAR(20),
  primary_email                VARCHAR(150),
  alternate_phone              VARCHAR(20),
  alternate_email              VARCHAR(150),
  -- Address
  current_street               VARCHAR(255),
  current_city                 VARCHAR(100),
  current_state                VARCHAR(100),
  current_pincode              VARCHAR(20),
  is_permanent_same            BOOLEAN      DEFAULT FALSE,
  permanent_street             VARCHAR(255),
  permanent_city               VARCHAR(100),
  permanent_state              VARCHAR(100),
  permanent_pincode            VARCHAR(20),
  -- Employment
  employee_id                  VARCHAR(50),
  designation                  VARCHAR(150),
  teacher_type                 VARCHAR(50),
  department_id                UUID         REFERENCES departments(id),
  specialization               VARCHAR(255),
  date_of_joining              DATE,
  class_ids                    UUID[],
  employment_status            VARCHAR(50)  DEFAULT 'Active',
  -- Qualification
  highest_qualification        VARCHAR(150),
  university                   VARCHAR(255),
  year_of_passing              INT,
  percentage_cgpa              VARCHAR(20),
  additional_certifications    TEXT,
  -- Experience
  total_experience_years       INT,
  previous_school_institution  VARCHAR(255),
  previous_designation         VARCHAR(150),
  experience_at_previous_school INT,
  -- Salary & Banking
  monthly_salary               DECIMAL(12,2),
  bank_name                    VARCHAR(150),
  account_number               VARCHAR(50),
  ifsc_code                    VARCHAR(20),
  pan_number                   VARCHAR(20),
  aadhar_number                VARCHAR(20),
  -- Emergency Contact
  emergency_contact_name       VARCHAR(150),
  emergency_relation           VARCHAR(100),
  emergency_phone              VARCHAR(20),
  -- Documents (file paths)
  resume_cv                    VARCHAR(255),
  qualification_certificates   VARCHAR(255),
  experience_certificates      VARCHAR(255),
  aadhar_card                  VARCHAR(255),
  pan_card                     VARCHAR(255),
  created_at                   TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  updated_at                   TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_teacher_records_school    ON teacher_records(school_id);
CREATE INDEX IF NOT EXISTS idx_teacher_records_phone     ON teacher_records(school_id, primary_phone);
CREATE INDEX IF NOT EXISTS idx_teacher_records_email     ON teacher_records(school_id, primary_email);
CREATE INDEX IF NOT EXISTS idx_teacher_records_auth_user ON teacher_records(auth_user_id);

-- ============================================================
-- SUBJECTS & CLASS ASSIGNMENT
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id    INT          NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  created_at   TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (school_id, subject_name)
);
CREATE INDEX IF NOT EXISTS idx_subjects_school ON subjects(school_id);

-- Sections (e.g. A, B, C per school)
CREATE TABLE IF NOT EXISTS sections (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id    INT         NOT NULL,
  section_name VARCHAR(50) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (school_id, section_name)
);
CREATE INDEX IF NOT EXISTS idx_sections_school ON sections(school_id);

-- Class-Section-Teacher assignments
CREATE TABLE IF NOT EXISTS classes_assign (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id    INT          NOT NULL,
  class_id     UUID         NOT NULL REFERENCES school_classes(id) ON DELETE CASCADE,
  teacher_id   VARCHAR(50)  NOT NULL, -- references teacher_records.auth_user_id (= auth_db users.id)
  section_name VARCHAR(50)  NOT NULL,
  created_at   TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (school_id, class_id, section_name)
);
CREATE INDEX IF NOT EXISTS idx_classes_assign_school  ON classes_assign(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_assign_teacher ON classes_assign(school_id, teacher_id);

-- Subject-Class-Teacher assignments
CREATE TABLE IF NOT EXISTS subject_class_assign (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id  INT         NOT NULL,
  subject_id UUID        NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id   UUID        NOT NULL REFERENCES school_classes(id) ON DELETE CASCADE,
  teacher_id VARCHAR(50) NOT NULL, -- references teacher_records.auth_user_id
  sequence   INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (school_id, subject_id, class_id)
);
CREATE INDEX IF NOT EXISTS idx_subject_class_assign_school  ON subject_class_assign(school_id);
CREATE INDEX IF NOT EXISTS idx_subject_class_assign_class   ON subject_class_assign(school_id, class_id);
CREATE INDEX IF NOT EXISTS idx_subject_class_assign_teacher ON subject_class_assign(school_id, teacher_id);

-- ============================================================
-- STUDENT ENQUIRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS student_enquiries (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id           INT          NOT NULL,
  student_name        VARCHAR(150) NOT NULL,
  father_name         VARCHAR(150),
  contact_number      VARCHAR(20)  NOT NULL,
  email               VARCHAR(150),
  class_id            UUID         REFERENCES school_classes(id),
  academic_year       VARCHAR(20),
  preferred_medium    VARCHAR(50),
  current_school_name VARCHAR(255),
  residential_area    VARCHAR(255),
  source_id           UUID         REFERENCES enquiry_sources(id),
  transport_required  BOOLEAN      DEFAULT FALSE,
  siblings_in_school  BOOLEAN      DEFAULT FALSE,
  religion            VARCHAR(100),
  community_category  VARCHAR(100),
  remarks             TEXT,
  enquiry_status      VARCHAR(50)  DEFAULT 'New',
  created_at          TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_student_enquiries_school  ON student_enquiries(school_id);
CREATE INDEX IF NOT EXISTS idx_student_enquiries_status ON student_enquiries(school_id, enquiry_status);

-- ============================================================
-- STUDENT ADMISSIONS (Full lifecycle)
-- ============================================================
CREATE TABLE IF NOT EXISTS students_admission (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id        INT         NOT NULL,
  admission_status VARCHAR(50) DEFAULT 'Draft',
  submitted_by     VARCHAR(50),
  submitted_date   TIMESTAMPTZ,
  enquiry_id       UUID        REFERENCES student_enquiries(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_students_admission_school  ON students_admission(school_id);
CREATE INDEX IF NOT EXISTS idx_students_admission_status ON students_admission(school_id, admission_status);

CREATE TABLE IF NOT EXISTS personal_information (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     INT          NOT NULL,
  student_id    UUID         NOT NULL REFERENCES students_admission(id) ON DELETE CASCADE,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  date_of_birth DATE         NOT NULL,
  gender        VARCHAR(20)  NOT NULL,
  blood_group_id UUID        REFERENCES blood_groups(id),
  nationality   VARCHAR(100) NOT NULL,
  religion      VARCHAR(100),
  category      VARCHAR(100),
  student_photo VARCHAR(255),
  created_at    TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_personal_school_student ON personal_information(school_id, student_id);

CREATE TABLE IF NOT EXISTS academic_information (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id        INT         NOT NULL,
  student_id       UUID        NOT NULL REFERENCES students_admission(id) ON DELETE CASCADE,
  admission_number VARCHAR(50) UNIQUE,
  admission_date   DATE        NOT NULL,
  class_id         UUID        REFERENCES school_classes(id),
  section          VARCHAR(50) NOT NULL,
  roll_number      VARCHAR(50),
  previous_school  VARCHAR(255),
  created_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (school_id, class_id, section, roll_number)
);
CREATE INDEX IF NOT EXISTS idx_academic_school_student ON academic_information(school_id, student_id);

CREATE TABLE IF NOT EXISTS contact_information (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id      INT         NOT NULL,
  student_id     UUID        NOT NULL REFERENCES students_admission(id) ON DELETE CASCADE,
  student_phone  VARCHAR(20),
  student_email  VARCHAR(150),
  created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_contact_school_student ON contact_information(school_id, student_id);

CREATE TABLE IF NOT EXISTS address_information (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id         INT         NOT NULL,
  student_id        UUID        NOT NULL REFERENCES students_admission(id) ON DELETE CASCADE,
  current_street    VARCHAR(255),
  current_city      VARCHAR(100),
  current_state     VARCHAR(100),
  current_pincode   VARCHAR(20),
  is_permanent_same BOOLEAN     DEFAULT FALSE,
  permanent_street  VARCHAR(255),
  permanent_city    VARCHAR(100),
  permanent_state   VARCHAR(100),
  permanent_pincode VARCHAR(20),
  created_at        TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_address_school_student ON address_information(school_id, student_id);

CREATE TABLE IF NOT EXISTS parent_guardian_information (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id             INT           NOT NULL,
  student_id            UUID          NOT NULL REFERENCES students_admission(id) ON DELETE CASCADE,
  father_full_name      VARCHAR(150),
  father_occupation     VARCHAR(150),
  father_phone          VARCHAR(20),
  father_email          VARCHAR(150),
  father_annual_income  DECIMAL(12,2),
  mother_full_name      VARCHAR(150),
  mother_occupation     VARCHAR(150),
  mother_phone          VARCHAR(20),
  mother_email          VARCHAR(150),
  mother_annual_income  DECIMAL(12,2),
  guardian_full_name    VARCHAR(150),
  guardian_relation     VARCHAR(100),
  guardian_phone        VARCHAR(20),
  guardian_email        VARCHAR(150),
  guardian_annual_income DECIMAL(12,2),
  created_at            TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_parent_school_student ON parent_guardian_information(school_id, student_id);

CREATE TABLE IF NOT EXISTS emergency_contact (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id    INT          NOT NULL,
  student_id   UUID         NOT NULL REFERENCES students_admission(id) ON DELETE CASCADE,
  contact_name VARCHAR(150) NOT NULL,
  relation     VARCHAR(100) NOT NULL,
  phone        VARCHAR(20)  NOT NULL,
  created_at   TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_emergency_school_student ON emergency_contact(school_id, student_id);

CREATE TABLE IF NOT EXISTS medical_information (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id           INT         NOT NULL,
  student_id          UUID        NOT NULL REFERENCES students_admission(id) ON DELETE CASCADE,
  allergies           TEXT,
  medical_conditions  TEXT,
  medications         TEXT,
  family_doctor_name  VARCHAR(150),
  doctor_phone        VARCHAR(20),
  created_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_medical_school_student ON medical_information(school_id, student_id);

CREATE TABLE IF NOT EXISTS student_documents (
  id                           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id                    INT         NOT NULL,
  student_id                   UUID        NOT NULL REFERENCES students_admission(id) ON DELETE CASCADE,
  birth_certificate            VARCHAR(255),
  birth_certificate_status     VARCHAR(50) DEFAULT 'Pending',
  aadhaar_card                 VARCHAR(255),
  aadhaar_card_status          VARCHAR(50) DEFAULT 'Pending',
  transfer_certificate         VARCHAR(255),
  transfer_certificate_status  VARCHAR(50) DEFAULT 'Optional',
  created_at                   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at                   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_documents_school_student ON student_documents(school_id, student_id);

-- ============================================================
-- ADMIN EXAMS (jerin's exam management schema)
-- ============================================================
CREATE TABLE IF NOT EXISTS create_exams (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     INT          NOT NULL,
  exam_name     VARCHAR(250) NOT NULL,
  academic_year VARCHAR(20)  NOT NULL,
  start_date    DATE         NOT NULL,
  end_date      DATE         NOT NULL,
  status        VARCHAR(20)  DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING','ONGOING','COMPLETED','PUBLISHED')),
  created_at    TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_create_exams_school  ON create_exams(school_id);
CREATE INDEX IF NOT EXISTS idx_create_exams_status  ON create_exams(school_id, status);

CREATE TABLE IF NOT EXISTS exam_details (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     INT         NOT NULL,
  exam_id       UUID        NOT NULL REFERENCES create_exams(id) ON DELETE CASCADE,
  class_id      UUID        NOT NULL REFERENCES school_classes(id),
  section_id    UUID        NOT NULL REFERENCES sections(id),
  subject_id    UUID        NOT NULL REFERENCES subjects(id),
  exam_date     DATE        NOT NULL,
  max_marks     INT         NOT NULL,
  pass_marks    INT         NOT NULL,
  teacher_id    VARCHAR(50) NOT NULL,
  result_status VARCHAR(50) DEFAULT 'Not Started' CHECK (result_status IN ('Not Started','Marks Pending','Ready to Publish','Published')),
  created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (school_id, exam_id, class_id, section_id, subject_id)
);
CREATE INDEX IF NOT EXISTS idx_exam_details_school        ON exam_details(school_id);
CREATE INDEX IF NOT EXISTS idx_exam_details_exam          ON exam_details(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_details_teacher       ON exam_details(school_id, teacher_id);
CREATE INDEX IF NOT EXISTS idx_exam_details_result_status ON exam_details(school_id, result_status);

-- ============================================================
-- DRIVERS RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS drivers_records (
  id                      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id               INT          NOT NULL,
  first_name              VARCHAR(100) NOT NULL,
  last_name               VARCHAR(100),
  date_of_birth           DATE,
  gender                  VARCHAR(20),
  blood_group_id          UUID         REFERENCES blood_groups(id),
  nationality             VARCHAR(100),
  driver_photo            VARCHAR(255),
  primary_phone           VARCHAR(20),
  primary_email           VARCHAR(150),
  alternate_phone         VARCHAR(20),
  alternate_email         VARCHAR(150),
  current_street          VARCHAR(255),
  current_city            VARCHAR(100),
  current_state           VARCHAR(100),
  current_pincode         VARCHAR(20),
  is_permanent_same       BOOLEAN      DEFAULT FALSE,
  permanent_street        VARCHAR(255),
  permanent_city          VARCHAR(100),
  permanent_state         VARCHAR(100),
  permanent_pincode       VARCHAR(20),
  license_number          VARCHAR(50),
  license_expiry          DATE,
  license_class           VARCHAR(50),
  commercial_license      BOOLEAN      DEFAULT FALSE,
  dL_verified             BOOLEAN      DEFAULT FALSE,
  bus_number              VARCHAR(50),
  routes                  TEXT,
  assign_date             DATE,
  total_experience_years  INT,
  previous_employer       VARCHAR(255),
  previous_route          VARCHAR(255),
  employment_type         VARCHAR(50),
  monthly_salary          DECIMAL(12,2),
  aadhar_number           VARCHAR(20),
  pan_number              VARCHAR(20),
  bank_name               VARCHAR(150),
  account_number          VARCHAR(50),
  ifsc_code               VARCHAR(20),
  emergency_contact_name  VARCHAR(150),
  emergency_relation      VARCHAR(100),
  emergency_phone         VARCHAR(20),
  license_document        VARCHAR(255),
  aadhar_card             VARCHAR(255),
  police_clearance        VARCHAR(255),
  employment_status       VARCHAR(50)  DEFAULT 'Active',
  created_at              TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_drivers_records_school ON drivers_records(school_id);

-- ============================================================
-- OTHER STAFF RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS otherStaff_records (
  id                            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id                     INT          NOT NULL,
  first_name                    VARCHAR(100) NOT NULL,
  last_name                     VARCHAR(100),
  date_of_birth                 DATE,
  gender                        VARCHAR(20),
  blood_group_id                UUID         REFERENCES blood_groups(id),
  nationality                   VARCHAR(100),
  staff_photo                   VARCHAR(255),
  primary_phone                 VARCHAR(20),
  primary_email                 VARCHAR(150),
  alternate_phone               VARCHAR(20),
  alternate_email               VARCHAR(150),
  current_street                VARCHAR(255),
  current_city                  VARCHAR(100),
  current_state                 VARCHAR(100),
  current_pincode               VARCHAR(20),
  is_permanent_same             BOOLEAN      DEFAULT FALSE,
  permanent_street              VARCHAR(255),
  permanent_city                VARCHAR(100),
  permanent_state               VARCHAR(100),
  permanent_pincode             VARCHAR(20),
  staff_role_id                 UUID         REFERENCES staff_roles(id),
  staff_dept_id                 UUID         REFERENCES staff_departments(id),
  position_level_id             UUID         REFERENCES staff_positions(id),
  employment_type               VARCHAR(50),
  monthly_salary                DECIMAL(12,2),
  join_date                     DATE,
  emergency_contact_name        VARCHAR(150),
  emergency_relation            VARCHAR(100),
  emergency_phone               VARCHAR(20),
  aadhar_number                 VARCHAR(20),
  pan_number                    VARCHAR(20),
  bank_name                     VARCHAR(150),
  account_number                VARCHAR(50),
  ifsc_code                     VARCHAR(20),
  adhar_document                VARCHAR(255),
  pan_card                      VARCHAR(255),
  education_certificate         VARCHAR(255),
  other_staff_employment_status VARCHAR(50)  DEFAULT 'Active',
  created_at                    TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  updated_at                    TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_otherstaff_records_school ON otherStaff_records(school_id);

-- ============================================================
-- SCHOOL ADMIN PROFILE (Settings)
-- ============================================================
CREATE TABLE IF NOT EXISTS school_admin_profile (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id          INT          NOT NULL UNIQUE,
  school_name        VARCHAR(255),
  affiliation_number VARCHAR(100),
  principal_name     VARCHAR(150),
  contact_email      VARCHAR(150),
  phone_number       VARCHAR(20),
  established_year   INT,
  address            TEXT,
  created_at         TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TEACHER EDIT REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS teacher_edit_requests (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id      INT         NOT NULL,
  teacher_id     UUID        NOT NULL REFERENCES teacher_records(id) ON DELETE CASCADE,
  changed_fields JSONB       NOT NULL,
  reason         TEXT,
  status         VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  admin_notes    TEXT,
  rejection_reason TEXT,
  created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_teacher_edit_requests_school   ON teacher_edit_requests(school_id);
CREATE INDEX IF NOT EXISTS idx_teacher_edit_requests_teacher  ON teacher_edit_requests(school_id, teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_edit_requests_status   ON teacher_edit_requests(school_id, status);

-- ============================================================
-- ANNOUNCEMENT TEMPLATES
-- ============================================================
CREATE TABLE IF NOT EXISTS announcement_templates (
  id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INT          NOT NULL,
  title     VARCHAR(255) NOT NULL,
  message   TEXT         NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (school_id, title)
);
CREATE INDEX IF NOT EXISTS idx_announcement_templates_school ON announcement_templates(school_id);

-- ============================================================
-- ALTER EXISTING TABLES
-- ============================================================

-- Add scope and status columns to announcements (for admin compose flow)
ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS scope  VARCHAR(50) DEFAULT 'Whole School'
    CHECK (scope IN ('Whole School', 'By Class', 'Specific Users'));

ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Sent'
    CHECK (status IN ('Draft', 'Sent'));

CREATE INDEX IF NOT EXISTS idx_announcements_scope  ON announcements(school_id, scope);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(school_id, status);

-- ============================================================
-- SEED: Universal lookup data (blood groups + license types)
-- ============================================================
INSERT INTO blood_groups (blood_group, order_number) VALUES
  ('O+',  1), ('O-',  2),
  ('A+',  3), ('A-',  4),
  ('B+',  5), ('B-',  6),
  ('AB+', 7), ('AB-', 8)
ON CONFLICT (blood_group) DO NOTHING;

INSERT INTO license_types (license_name, order_number) VALUES
  ('LMV - Light Motor Vehicle',           1),
  ('MCWG - Motorcycle With Gear',         2),
  ('HMV - Heavy Motor Vehicle',           3),
  ('HPMV - Heavy Passenger Motor Vehicle',4),
  ('MGV - Medium Goods Vehicle',          5),
  ('Transport Vehicle',                   6)
ON CONFLICT (license_name) DO NOTHING;
