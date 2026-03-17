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
