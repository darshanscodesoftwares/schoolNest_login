\c academic_db;

-- Insert Classes for Teacher TCH001 (School 101)
INSERT INTO classes (id, school_id, name, section, subject, teacher_id, created_at) VALUES
('88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 101, '10A', 'A', 'Mathematics', 'TCH001', NOW()),
('99ccaaee-8bd2-4f93-addd-c0deadbeef19', 101, '10B', 'B', 'English', 'TCH001', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Students in Class 10A (5 students)
INSERT INTO students (id, school_id, class_id, roll_no, name, parent_id, created_at) VALUES
('f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 1, 'Rahul Sharma',  'PAR001', NOW()),
('0540f78d-8479-4d11-bd41-d3fd2b014db4', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 2, 'Priya Singh',   'PAR001', NOW()),
('1a2b3c4d-5e6f-7890-abcd-ef1234567891', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 3, 'Amit Kumar',    'PAR002', NOW()),
('2b3c4d5e-6f78-9012-bcde-f12345678901', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 4, 'Sneha Patel',   'PAR002', NOW()),
('3c4d5e6f-7890-1234-cdef-123456789012', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 5, 'Arjun Reddy',   NULL,     NOW())
ON CONFLICT (school_id, class_id, roll_no) DO NOTHING;

-- Insert Students in Class 10B (5 students)
INSERT INTO students (id, school_id, class_id, roll_no, name, parent_id, created_at) VALUES
('4d5e6f70-8901-2345-def0-234567890123', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 1, 'Aisha Khan',     'PAR001', NOW()),
('5e6f7089-0123-4567-ef01-345678901234', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 2, 'Vikram Verma',   NULL,     NOW()),
('6f708901-2345-6789-f012-456789012345', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 3, 'Pooja Desai',    NULL,     NOW()),
('70890123-4567-8901-0123-567890123456', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 4, 'Nikhil Chopra',  NULL,     NOW()),
('81901234-5678-9012-1234-678901234567', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 5, 'Deepika Sharma', NULL,     NOW())
ON CONFLICT (school_id, class_id, roll_no) DO NOTHING;

-- Insert Attendance Statuses for School 101
INSERT INTO attendance_statuses (school_id, code, label, color, is_active) VALUES
(101, 'PRESENT',  'Present',  'green',  true),
(101, 'ABSENT',   'Absent',   'red',    true),
(101, 'LATE',     'Late',     'orange', true),
(101, 'HALF_DAY', 'Half Day', 'yellow', true)
ON CONFLICT (school_id, code) DO NOTHING;

-- Insert Attendance for 2026-03-03 (Class 10A)
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('a0a1a2a3-a4a5-a6a7-a8a9-aaabacadaeaf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 'TCH001', '2026-03-03', 'PRESENT',  NOW(), NOW()),
('b1b2b3b4-b5b6-b7b8-b9ba-bbbbbcbdbebf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '0540f78d-8479-4d11-bd41-d3fd2b014db4', 'TCH001', '2026-03-03', 'ABSENT',   NOW(), NOW()),
('c2c3c4c5-c6c7-c8c9-caca-cbcccccddcdf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 'TCH001', '2026-03-03', 'PRESENT',  NOW(), NOW()),
('d3d4d5d6-d7d8-d9da-dbdc-dddddedfdedf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '2b3c4d5e-6f78-9012-bcde-f12345678901', 'TCH001', '2026-03-03', 'LATE',     NOW(), NOW()),
('e4e5e6e7-e8e9-eaea-ebec-edeeeeefefef', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '3c4d5e6f-7890-1234-cdef-123456789012', 'TCH001', '2026-03-03', 'HALF_DAY', NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- Verify inserts
SELECT 'Classes'  AS table_name, COUNT(*) AS count FROM classes  WHERE school_id = 101;
SELECT 'Students' AS table_name, COUNT(*) AS count FROM students WHERE school_id = 101;
SELECT 'Attendance' AS table_name, COUNT(*) AS count FROM attendance WHERE school_id = 101;
