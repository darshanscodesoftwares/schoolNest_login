CREATE DATABASE academic_db;

\c academic_db;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  section VARCHAR(20) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  teacher_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes (school_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_school ON classes (school_id, teacher_id);

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INT NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  roll_no INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  parent_id VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_school_id ON students (school_id);
CREATE INDEX IF NOT EXISTS idx_students_class_school ON students (school_id, class_id);
CREATE INDEX IF NOT EXISTS idx_students_parent ON students (school_id, parent_id);
ALTER TABLE students ADD CONSTRAINT uq_student_roll UNIQUE (school_id, class_id, roll_no);

CREATE TABLE IF NOT EXISTS attendance_statuses (
  id SERIAL PRIMARY KEY,
  school_id INT NOT NULL,
  code VARCHAR(20) NOT NULL,
  label VARCHAR(100) NOT NULL,
  color VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (school_id, code)
);

CREATE INDEX IF NOT EXISTS idx_att_statuses_school ON attendance_statuses (school_id);

CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INT NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL,
  remarks VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (school_id, class_id, student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_school_id ON attendance (school_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date_school ON attendance (school_id, class_id, date);

CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INT NOT NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('Sick', 'Family Function', 'Travel', 'Personal', 'Other')),
  message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_school_id ON leave_requests (school_id);
CREATE INDEX IF NOT EXISTS idx_leave_student_date_status ON leave_requests (school_id, student_id, from_date, to_date, status);
CREATE INDEX IF NOT EXISTS idx_leave_class ON leave_requests (school_id, status);

CREATE TABLE IF NOT EXISTS timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INT NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  day_of_week VARCHAR(10) NOT NULL,
  period_number INT NOT NULL,
  subject VARCHAR(100) NOT NULL,
  teacher_id VARCHAR(50),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timetable_class ON timetable (school_id, class_id);
CREATE INDEX IF NOT EXISTS idx_timetable_day ON timetable (day_of_week);
ALTER TABLE timetable ADD CONSTRAINT uq_timetable UNIQUE (school_id, class_id, day_of_week, period_number);

CREATE TABLE IF NOT EXISTS homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INT NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id VARCHAR(50) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  attachment_url VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homework_school ON homework (school_id);
CREATE INDEX IF NOT EXISTS idx_homework_class_due ON homework (school_id, class_id, due_date);
CREATE INDEX IF NOT EXISTS idx_homework_teacher_due ON homework (school_id, teacher_id, due_date);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INT NOT NULL,
  sender_id VARCHAR(50) NOT NULL,
  sender_name VARCHAR(100) NOT NULL,
  sender_role VARCHAR(20) NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  audience_type VARCHAR(20) NOT NULL CHECK (audience_type IN ('full_class', 'specific_students', 'all_teachers')),
  title VARCHAR(255),
  message TEXT NOT NULL,
  is_important BOOLEAN NOT NULL DEFAULT false,
  recipient_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_school ON announcements (school_id);
CREATE INDEX IF NOT EXISTS idx_announcements_sender ON announcements (school_id, sender_id);

CREATE TABLE IF NOT EXISTS announcement_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INT NOT NULL,
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  recipient_type VARCHAR(50) NOT NULL,
  recipient_id VARCHAR(255),
  teacher_id VARCHAR(50),
  parent_id UUID,
  class_id UUID,
  read_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (announcement_id, recipient_type, recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_ann_recipients_recipient ON announcement_recipients (school_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_ann_recipients_announcement ON announcement_recipients (announcement_id);
CREATE INDEX IF NOT EXISTS idx_ann_recipients_type ON announcement_recipients (school_id, recipient_type);

-- Announcement history for audit trail
CREATE TABLE IF NOT EXISTS announcement_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INT NOT NULL,
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  total_recipients INT NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Sent',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcement_history_announcement ON announcement_history(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_history_school ON announcement_history(school_id);

-- Exams
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_classes (
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  school_id INT NOT NULL,
  PRIMARY KEY (exam_id, class_id)
);

CREATE TABLE IF NOT EXISTS exam_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  school_id INT NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_name VARCHAR(100) NOT NULL,
  exam_date DATE NOT NULL,
  max_marks INT NOT NULL,
  pass_marks INT NOT NULL,
  teacher_id VARCHAR(50) NOT NULL,
  result_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (result_status IN ('PENDING', 'DRAFT', 'SUBMITTED')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_subject_id UUID NOT NULL REFERENCES exam_subjects(id) ON DELETE CASCADE,
  school_id INT NOT NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  marks_obtained INT,
  is_absent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (exam_subject_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_exams_school ON exams (school_id);
CREATE INDEX IF NOT EXISTS idx_exam_subjects_teacher ON exam_subjects (school_id, teacher_id);
CREATE INDEX IF NOT EXISTS idx_exam_subjects_class ON exam_subjects (school_id, class_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_subject ON exam_results (exam_subject_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results (school_id, student_id);

-- School config: campus location, geofence radius, check-in time
CREATE TABLE IF NOT EXISTS school_config (
  school_id            INT          PRIMARY KEY,
  campus_latitude      DECIMAL(10, 7),
  campus_longitude     DECIMAL(10, 7),
  campus_radius_meters INT          DEFAULT 200,
  checkin_time         TIME         DEFAULT '09:30:00'
);

-- Teacher self check-in records
CREATE TABLE IF NOT EXISTS teacher_checkins (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     INT          NOT NULL,
  teacher_id    VARCHAR(50)  NOT NULL,
  check_in_time TIMESTAMPTZ  NOT NULL,
  latitude      DECIMAL(10, 7) NOT NULL,
  longitude     DECIMAL(10, 7) NOT NULL,
  status        VARCHAR(10)  NOT NULL CHECK (status IN ('ON_TIME', 'LATE')),
  date          DATE         NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE (school_id, teacher_id, date)
);

CREATE INDEX IF NOT EXISTS idx_teacher_checkins_school ON teacher_checkins (school_id);
CREATE INDEX IF NOT EXISTS idx_teacher_checkins_teacher_date ON teacher_checkins (school_id, teacher_id, date);

-- Fee categories (Tuition Fee, Transport Fee, Exam Fee, etc.)
CREATE TABLE IF NOT EXISTS fee_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fee_categories_school ON fee_categories (school_id);

-- Student fees (individual fee assignment per student)
CREATE TABLE IF NOT EXISTS student_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INT NOT NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_category_id UUID NOT NULL REFERENCES fee_categories(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE')),
  paid_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_fees_school ON student_fees (school_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_student ON student_fees (school_id, student_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_category ON student_fees (fee_category_id);

-- Payment history (tracks every payment attempt)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INT NOT NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_fee_id UUID NOT NULL REFERENCES student_fees(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  method VARCHAR(30) NOT NULL CHECK (method IN ('UPI', 'CARD', 'NET_BANKING', 'CASH')),
  transaction_id VARCHAR(100),
  status VARCHAR(20) NOT NULL CHECK (status IN ('PAID', 'FAILED')),
  paid_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_school ON payments (school_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments (school_id, student_id);
CREATE INDEX IF NOT EXISTS idx_payments_fee ON payments (student_fee_id);


