-- \c academic_db;  -- Skip on Render (already connected via external URL)

-- ============================================================
-- CLASSES (2 classes, Teacher TCH001, School 101)
-- ============================================================
INSERT INTO classes (id, school_id, name, section, subject, teacher_id, created_at) VALUES
('88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 101, '10A', 'A', 'Mathematics', 'TCH001', NOW()),
('99ccaaee-8bd2-4f93-addd-c0deadbeef19', 101, '10B', 'B', 'English', 'TCH001', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STUDENTS: Class 10A (8 students)
-- ============================================================
INSERT INTO students (id, school_id, class_id, roll_no, name, parent_id, created_at) VALUES
('f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 1, 'Rahul Sharma',    'PAR001', NOW()),
('0540f78d-8479-4d11-bd41-d3fd2b014db4', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 2, 'Priya Singh',     'PAR001', NOW()),
('1a2b3c4d-5e6f-7890-abcd-ef1234567891', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 3, 'Amit Kumar',      'PAR002', NOW()),
('2b3c4d5e-6f78-9012-bcde-f12345678901', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 4, 'Sneha Patel',     'PAR002', NOW()),
('3c4d5e6f-7890-1234-cdef-123456789012', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 5, 'Arjun Reddy',     NULL,     NOW()),
('aa000001-0000-0000-0000-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 6, 'Kavya Nair',      'PAR003', NOW()),
('aa000001-0000-0000-0000-000000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 7, 'Rohan Mehta',     'PAR003', NOW()),
('aa000001-0000-0000-0000-000000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 8, 'Ananya Gupta',    'PAR004', NOW())
ON CONFLICT (school_id, class_id, roll_no) DO NOTHING;

-- ============================================================
-- STUDENTS: Class 10B (8 students)
-- ============================================================
INSERT INTO students (id, school_id, class_id, roll_no, name, parent_id, created_at) VALUES
('4d5e6f70-8901-2345-def0-234567890123', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 1, 'Aisha Khan',      'PAR001', NOW()),
('5e6f7089-0123-4567-ef01-345678901234', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 2, 'Vikram Verma',    NULL,     NOW()),
('6f708901-2345-6789-f012-456789012345', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 3, 'Pooja Desai',     NULL,     NOW()),
('70890123-4567-8901-0123-567890123456', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 4, 'Nikhil Chopra',   NULL,     NOW()),
('81901234-5678-9012-1234-678901234567', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 5, 'Deepika Sharma',  NULL,     NOW()),
('bb000001-0000-0000-0000-000000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 6, 'Siddharth Joshi',  'PAR004', NOW()),
('bb000001-0000-0000-0000-000000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 7, 'Meera Iyer',       'PAR005', NOW()),
('bb000001-0000-0000-0000-000000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 8, 'Farhan Sheikh',    'PAR005', NOW())
ON CONFLICT (school_id, class_id, roll_no) DO NOTHING;

-- ============================================================
-- ATTENDANCE STATUSES
-- ============================================================
INSERT INTO attendance_statuses (school_id, code, label, color, is_active) VALUES
(101, 'PRESENT',  'Present',  'green',  true),
(101, 'ABSENT',   'Absent',   'red',    true),
(101, 'LATE',     'Late',     'orange', true),
(101, 'HALF_DAY', 'Half Day', 'yellow', true)
ON CONFLICT (school_id, code) DO NOTHING;

-- ============================================================
-- ATTENDANCE: Class 10A - Week 1 (March 3-7, 2026)
-- ============================================================

-- March 3 (Monday) - 10A
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('a0a1a2a3-a4a5-a6a7-a8a9-aaabacadaeaf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 'TCH001', '2026-03-03', 'PRESENT',  NOW(), NOW()),
('b1b2b3b4-b5b6-b7b8-b9ba-bbbbbcbdbebf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '0540f78d-8479-4d11-bd41-d3fd2b014db4', 'TCH001', '2026-03-03', 'ABSENT',   NOW(), NOW()),
('c2c3c4c5-c6c7-c8c9-caca-cbcccccddcdf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 'TCH001', '2026-03-03', 'PRESENT',  NOW(), NOW()),
('d3d4d5d6-d7d8-d9da-dbdc-dddddedfdedf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '2b3c4d5e-6f78-9012-bcde-f12345678901', 'TCH001', '2026-03-03', 'LATE',     NOW(), NOW()),
('e4e5e6e7-e8e9-eaea-ebec-edeeeeefefef', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '3c4d5e6f-7890-1234-cdef-123456789012', 'TCH001', '2026-03-03', 'HALF_DAY', NOW(), NOW()),
('a1000003-0001-0001-0001-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-03', 'PRESENT',  NOW(), NOW()),
('a1000003-0001-0001-0001-000000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-03', 'PRESENT',  NOW(), NOW()),
('a1000003-0001-0001-0001-000000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-03', 'LATE',     NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- March 4 (Tuesday) - 10A
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('10000001-0001-0001-0001-100000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 'TCH001', '2026-03-04', 'PRESENT',  NOW(), NOW()),
('10000001-0001-0001-0001-100000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '0540f78d-8479-4d11-bd41-d3fd2b014db4', 'TCH001', '2026-03-04', 'PRESENT',  NOW(), NOW()),
('10000001-0001-0001-0001-100000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 'TCH001', '2026-03-04', 'ABSENT',   NOW(), NOW()),
('10000001-0001-0001-0001-100000000004', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '2b3c4d5e-6f78-9012-bcde-f12345678901', 'TCH001', '2026-03-04', 'PRESENT',  NOW(), NOW()),
('10000001-0001-0001-0001-100000000005', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '3c4d5e6f-7890-1234-cdef-123456789012', 'TCH001', '2026-03-04', 'PRESENT',  NOW(), NOW()),
('a1000004-0001-0001-0001-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-04', 'PRESENT',  NOW(), NOW()),
('a1000004-0001-0001-0001-000000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-04', 'ABSENT',   NOW(), NOW()),
('a1000004-0001-0001-0001-000000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-04', 'PRESENT',  NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- March 5 (Wednesday) - 10A
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('10000002-0002-0002-0002-200000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 'TCH001', '2026-03-05', 'PRESENT',  NOW(), NOW()),
('10000002-0002-0002-0002-200000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '0540f78d-8479-4d11-bd41-d3fd2b014db4', 'TCH001', '2026-03-05', 'LATE',     NOW(), NOW()),
('10000002-0002-0002-0002-200000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 'TCH001', '2026-03-05', 'PRESENT',  NOW(), NOW()),
('10000002-0002-0002-0002-200000000004', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '2b3c4d5e-6f78-9012-bcde-f12345678901', 'TCH001', '2026-03-05', 'PRESENT',  NOW(), NOW()),
('10000002-0002-0002-0002-200000000005', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '3c4d5e6f-7890-1234-cdef-123456789012', 'TCH001', '2026-03-05', 'ABSENT',   NOW(), NOW()),
('a1000005-0001-0001-0001-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-05', 'HALF_DAY', NOW(), NOW()),
('a1000005-0001-0001-0001-000000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-05', 'PRESENT',  NOW(), NOW()),
('a1000005-0001-0001-0001-000000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-05', 'PRESENT',  NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- March 6 (Thursday) - 10A
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('10000003-0003-0003-0003-300000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 'TCH001', '2026-03-06', 'LATE',     NOW(), NOW()),
('10000003-0003-0003-0003-300000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '0540f78d-8479-4d11-bd41-d3fd2b014db4', 'TCH001', '2026-03-06', 'PRESENT',  NOW(), NOW()),
('10000003-0003-0003-0003-300000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 'TCH001', '2026-03-06', 'PRESENT',  NOW(), NOW()),
('10000003-0003-0003-0003-300000000004', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '2b3c4d5e-6f78-9012-bcde-f12345678901', 'TCH001', '2026-03-06', 'HALF_DAY', NOW(), NOW()),
('10000003-0003-0003-0003-300000000005', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '3c4d5e6f-7890-1234-cdef-123456789012', 'TCH001', '2026-03-06', 'PRESENT',  NOW(), NOW()),
('a1000006-0001-0001-0001-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-06', 'PRESENT',  NOW(), NOW()),
('a1000006-0001-0001-0001-000000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-06', 'PRESENT',  NOW(), NOW()),
('a1000006-0001-0001-0001-000000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-06', 'ABSENT',   NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- March 7 (Friday) - 10A
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('10000004-0004-0004-0004-400000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 'TCH001', '2026-03-07', 'PRESENT',  NOW(), NOW()),
('10000004-0004-0004-0004-400000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '0540f78d-8479-4d11-bd41-d3fd2b014db4', 'TCH001', '2026-03-07', 'PRESENT',  NOW(), NOW()),
('10000004-0004-0004-0004-400000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 'TCH001', '2026-03-07', 'PRESENT',  NOW(), NOW()),
('10000004-0004-0004-0004-400000000004', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '2b3c4d5e-6f78-9012-bcde-f12345678901', 'TCH001', '2026-03-07', 'PRESENT',  NOW(), NOW()),
('10000004-0004-0004-0004-400000000005', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '3c4d5e6f-7890-1234-cdef-123456789012', 'TCH001', '2026-03-07', 'LATE',     NOW(), NOW()),
('a1000007-0001-0001-0001-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-07', 'PRESENT',  NOW(), NOW()),
('a1000007-0001-0001-0001-000000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-07', 'LATE',     NOW(), NOW()),
('a1000007-0001-0001-0001-000000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-07', 'PRESENT',  NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- ============================================================
-- ATTENDANCE: Class 10A - Week 2 (March 10-14, 2026)
-- ============================================================

-- March 10 (Monday) - 10A
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('a2000010-0001-0001-0001-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 'TCH001', '2026-03-10', 'PRESENT',  NOW(), NOW()),
('a2000010-0001-0001-0001-000000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '0540f78d-8479-4d11-bd41-d3fd2b014db4', 'TCH001', '2026-03-10', 'ABSENT',   NOW(), NOW()),
('a2000010-0001-0001-0001-000000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 'TCH001', '2026-03-10', 'PRESENT',  NOW(), NOW()),
('a2000010-0001-0001-0001-000000000004', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '2b3c4d5e-6f78-9012-bcde-f12345678901', 'TCH001', '2026-03-10', 'LATE',     NOW(), NOW()),
('a2000010-0001-0001-0001-000000000005', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '3c4d5e6f-7890-1234-cdef-123456789012', 'TCH001', '2026-03-10', 'PRESENT',  NOW(), NOW()),
('a2000010-0001-0001-0001-000000000006', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-10', 'PRESENT',  NOW(), NOW()),
('a2000010-0001-0001-0001-000000000007', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-10', 'PRESENT',  NOW(), NOW()),
('a2000010-0001-0001-0001-000000000008', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-10', 'HALF_DAY', NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- March 11 (Tuesday) - 10A
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('a2000011-0001-0001-0001-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 'TCH001', '2026-03-11', 'PRESENT',  NOW(), NOW()),
('a2000011-0001-0001-0001-000000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '0540f78d-8479-4d11-bd41-d3fd2b014db4', 'TCH001', '2026-03-11', 'ABSENT',   NOW(), NOW()),
('a2000011-0001-0001-0001-000000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 'TCH001', '2026-03-11', 'LATE',     NOW(), NOW()),
('a2000011-0001-0001-0001-000000000004', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '2b3c4d5e-6f78-9012-bcde-f12345678901', 'TCH001', '2026-03-11', 'PRESENT',  NOW(), NOW()),
('a2000011-0001-0001-0001-000000000005', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '3c4d5e6f-7890-1234-cdef-123456789012', 'TCH001', '2026-03-11', 'PRESENT',  NOW(), NOW()),
('a2000011-0001-0001-0001-000000000006', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-11', 'ABSENT',   NOW(), NOW()),
('a2000011-0001-0001-0001-000000000007', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-11', 'PRESENT',  NOW(), NOW()),
('a2000011-0001-0001-0001-000000000008', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-11', 'PRESENT',  NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- March 12 (Wednesday) - 10A
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('a2000012-0001-0001-0001-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 'TCH001', '2026-03-12', 'PRESENT',  NOW(), NOW()),
('a2000012-0001-0001-0001-000000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '0540f78d-8479-4d11-bd41-d3fd2b014db4', 'TCH001', '2026-03-12', 'PRESENT',  NOW(), NOW()),
('a2000012-0001-0001-0001-000000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 'TCH001', '2026-03-12', 'PRESENT',  NOW(), NOW()),
('a2000012-0001-0001-0001-000000000004', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '2b3c4d5e-6f78-9012-bcde-f12345678901', 'TCH001', '2026-03-12', 'ABSENT',   NOW(), NOW()),
('a2000012-0001-0001-0001-000000000005', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '3c4d5e6f-7890-1234-cdef-123456789012', 'TCH001', '2026-03-12', 'ABSENT',   NOW(), NOW()),
('a2000012-0001-0001-0001-000000000006', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-12', 'PRESENT',  NOW(), NOW()),
('a2000012-0001-0001-0001-000000000007', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-12', 'LATE',     NOW(), NOW()),
('a2000012-0001-0001-0001-000000000008', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-12', 'PRESENT',  NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- March 13 (Thursday) - 10A
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('a2000013-0001-0001-0001-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 'TCH001', '2026-03-13', 'LATE',     NOW(), NOW()),
('a2000013-0001-0001-0001-000000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '0540f78d-8479-4d11-bd41-d3fd2b014db4', 'TCH001', '2026-03-13', 'PRESENT',  NOW(), NOW()),
('a2000013-0001-0001-0001-000000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 'TCH001', '2026-03-13', 'PRESENT',  NOW(), NOW()),
('a2000013-0001-0001-0001-000000000004', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '2b3c4d5e-6f78-9012-bcde-f12345678901', 'TCH001', '2026-03-13', 'PRESENT',  NOW(), NOW()),
('a2000013-0001-0001-0001-000000000005', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '3c4d5e6f-7890-1234-cdef-123456789012', 'TCH001', '2026-03-13', 'HALF_DAY', NOW(), NOW()),
('a2000013-0001-0001-0001-000000000006', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-13', 'PRESENT',  NOW(), NOW()),
('a2000013-0001-0001-0001-000000000007', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-13', 'PRESENT',  NOW(), NOW()),
('a2000013-0001-0001-0001-000000000008', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-13', 'PRESENT',  NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- March 14 (Friday) - 10A
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('a2000014-0001-0001-0001-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 'TCH001', '2026-03-14', 'PRESENT',  NOW(), NOW()),
('a2000014-0001-0001-0001-000000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '0540f78d-8479-4d11-bd41-d3fd2b014db4', 'TCH001', '2026-03-14', 'PRESENT',  NOW(), NOW()),
('a2000014-0001-0001-0001-000000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 'TCH001', '2026-03-14', 'PRESENT',  NOW(), NOW()),
('a2000014-0001-0001-0001-000000000004', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '2b3c4d5e-6f78-9012-bcde-f12345678901', 'TCH001', '2026-03-14', 'PRESENT',  NOW(), NOW()),
('a2000014-0001-0001-0001-000000000005', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '3c4d5e6f-7890-1234-cdef-123456789012', 'TCH001', '2026-03-14', 'PRESENT',  NOW(), NOW()),
('a2000014-0001-0001-0001-000000000006', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-14', 'LATE',     NOW(), NOW()),
('a2000014-0001-0001-0001-000000000007', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-14', 'PRESENT',  NOW(), NOW()),
('a2000014-0001-0001-0001-000000000008', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-14', 'PRESENT',  NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- ============================================================
-- ATTENDANCE: Class 10A - Week 3 (March 17-18, 2026)
-- ============================================================

-- March 17 (Monday) - 10A
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('a3000017-0001-0001-0001-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 'TCH001', '2026-03-17', 'PRESENT',  NOW(), NOW()),
('a3000017-0001-0001-0001-000000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '0540f78d-8479-4d11-bd41-d3fd2b014db4', 'TCH001', '2026-03-17', 'PRESENT',  NOW(), NOW()),
('a3000017-0001-0001-0001-000000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 'TCH001', '2026-03-17', 'ABSENT',   NOW(), NOW()),
('a3000017-0001-0001-0001-000000000004', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '2b3c4d5e-6f78-9012-bcde-f12345678901', 'TCH001', '2026-03-17', 'PRESENT',  NOW(), NOW()),
('a3000017-0001-0001-0001-000000000005', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '3c4d5e6f-7890-1234-cdef-123456789012', 'TCH001', '2026-03-17', 'LATE',     NOW(), NOW()),
('a3000017-0001-0001-0001-000000000006', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-17', 'PRESENT',  NOW(), NOW()),
('a3000017-0001-0001-0001-000000000007', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-17', 'PRESENT',  NOW(), NOW()),
('a3000017-0001-0001-0001-000000000008', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-17', 'PRESENT',  NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- March 18 (Tuesday) - 10A
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('a3000018-0001-0001-0001-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 'TCH001', '2026-03-18', 'PRESENT',  NOW(), NOW()),
('a3000018-0001-0001-0001-000000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '0540f78d-8479-4d11-bd41-d3fd2b014db4', 'TCH001', '2026-03-18', 'LATE',     NOW(), NOW()),
('a3000018-0001-0001-0001-000000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 'TCH001', '2026-03-18', 'PRESENT',  NOW(), NOW()),
('a3000018-0001-0001-0001-000000000004', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '2b3c4d5e-6f78-9012-bcde-f12345678901', 'TCH001', '2026-03-18', 'PRESENT',  NOW(), NOW()),
('a3000018-0001-0001-0001-000000000005', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '3c4d5e6f-7890-1234-cdef-123456789012', 'TCH001', '2026-03-18', 'PRESENT',  NOW(), NOW()),
('a3000018-0001-0001-0001-000000000006', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-18', 'ABSENT',   NOW(), NOW()),
('a3000018-0001-0001-0001-000000000007', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-18', 'PRESENT',  NOW(), NOW()),
('a3000018-0001-0001-0001-000000000008', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'aa000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-18', 'HALF_DAY', NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- ============================================================
-- ATTENDANCE: Class 10B - Week 1 (March 3-7, 2026)
-- ============================================================

-- March 3 (Monday) - 10B
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('20000001-0001-0001-0001-100000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '4d5e6f70-8901-2345-def0-234567890123', 'TCH001', '2026-03-03', 'PRESENT',  NOW(), NOW()),
('20000001-0001-0001-0001-100000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '5e6f7089-0123-4567-ef01-345678901234', 'TCH001', '2026-03-03', 'PRESENT',  NOW(), NOW()),
('20000001-0001-0001-0001-100000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '6f708901-2345-6789-f012-456789012345', 'TCH001', '2026-03-03', 'ABSENT',   NOW(), NOW()),
('20000001-0001-0001-0001-100000000004', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '70890123-4567-8901-0123-567890123456', 'TCH001', '2026-03-03', 'PRESENT',  NOW(), NOW()),
('20000001-0001-0001-0001-100000000005', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '81901234-5678-9012-1234-678901234567', 'TCH001', '2026-03-03', 'LATE',     NOW(), NOW()),
('b1000003-0001-0001-0001-000000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-03', 'PRESENT',  NOW(), NOW()),
('b1000003-0001-0001-0001-000000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-03', 'HALF_DAY', NOW(), NOW()),
('b1000003-0001-0001-0001-000000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-03', 'PRESENT',  NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- March 4 (Tuesday) - 10B
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('20000002-0002-0002-0002-200000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '4d5e6f70-8901-2345-def0-234567890123', 'TCH001', '2026-03-04', 'PRESENT',  NOW(), NOW()),
('20000002-0002-0002-0002-200000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '5e6f7089-0123-4567-ef01-345678901234', 'TCH001', '2026-03-04', 'LATE',     NOW(), NOW()),
('20000002-0002-0002-0002-200000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '6f708901-2345-6789-f012-456789012345', 'TCH001', '2026-03-04', 'PRESENT',  NOW(), NOW()),
('20000002-0002-0002-0002-200000000004', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '70890123-4567-8901-0123-567890123456', 'TCH001', '2026-03-04', 'ABSENT',   NOW(), NOW()),
('20000002-0002-0002-0002-200000000005', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '81901234-5678-9012-1234-678901234567', 'TCH001', '2026-03-04', 'PRESENT',  NOW(), NOW()),
('b1000004-0001-0001-0001-000000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-04', 'PRESENT',  NOW(), NOW()),
('b1000004-0001-0001-0001-000000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-04', 'PRESENT',  NOW(), NOW()),
('b1000004-0001-0001-0001-000000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-04', 'ABSENT',   NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- March 5 (Wednesday) - 10B
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('20000003-0003-0003-0003-300000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '4d5e6f70-8901-2345-def0-234567890123', 'TCH001', '2026-03-05', 'PRESENT',  NOW(), NOW()),
('20000003-0003-0003-0003-300000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '5e6f7089-0123-4567-ef01-345678901234', 'TCH001', '2026-03-05', 'PRESENT',  NOW(), NOW()),
('20000003-0003-0003-0003-300000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '6f708901-2345-6789-f012-456789012345', 'TCH001', '2026-03-05', 'PRESENT',  NOW(), NOW()),
('20000003-0003-0003-0003-300000000004', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '70890123-4567-8901-0123-567890123456', 'TCH001', '2026-03-05', 'PRESENT',  NOW(), NOW()),
('20000003-0003-0003-0003-300000000005', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '81901234-5678-9012-1234-678901234567', 'TCH001', '2026-03-05', 'HALF_DAY', NOW(), NOW()),
('b1000005-0001-0001-0001-000000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-05', 'LATE',     NOW(), NOW()),
('b1000005-0001-0001-0001-000000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-05', 'PRESENT',  NOW(), NOW()),
('b1000005-0001-0001-0001-000000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-05', 'PRESENT',  NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- March 6 (Thursday) - 10B
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('20000004-0004-0004-0004-400000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '4d5e6f70-8901-2345-def0-234567890123', 'TCH001', '2026-03-06', 'ABSENT',   NOW(), NOW()),
('20000004-0004-0004-0004-400000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '5e6f7089-0123-4567-ef01-345678901234', 'TCH001', '2026-03-06', 'PRESENT',  NOW(), NOW()),
('20000004-0004-0004-0004-400000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '6f708901-2345-6789-f012-456789012345', 'TCH001', '2026-03-06', 'PRESENT',  NOW(), NOW()),
('20000004-0004-0004-0004-400000000004', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '70890123-4567-8901-0123-567890123456', 'TCH001', '2026-03-06', 'LATE',     NOW(), NOW()),
('20000004-0004-0004-0004-400000000005', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '81901234-5678-9012-1234-678901234567', 'TCH001', '2026-03-06', 'PRESENT',  NOW(), NOW()),
('b1000006-0001-0001-0001-000000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-06', 'PRESENT',  NOW(), NOW()),
('b1000006-0001-0001-0001-000000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-06', 'ABSENT',   NOW(), NOW()),
('b1000006-0001-0001-0001-000000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-06', 'PRESENT',  NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- March 7 (Friday) - 10B
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('20000005-0005-0005-0005-500000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '4d5e6f70-8901-2345-def0-234567890123', 'TCH001', '2026-03-07', 'PRESENT',  NOW(), NOW()),
('20000005-0005-0005-0005-500000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '5e6f7089-0123-4567-ef01-345678901234', 'TCH001', '2026-03-07', 'PRESENT',  NOW(), NOW()),
('20000005-0005-0005-0005-500000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '6f708901-2345-6789-f012-456789012345', 'TCH001', '2026-03-07', 'LATE',     NOW(), NOW()),
('20000005-0005-0005-0005-500000000004', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '70890123-4567-8901-0123-567890123456', 'TCH001', '2026-03-07', 'PRESENT',  NOW(), NOW()),
('20000005-0005-0005-0005-500000000005', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '81901234-5678-9012-1234-678901234567', 'TCH001', '2026-03-07', 'PRESENT',  NOW(), NOW()),
('b1000007-0001-0001-0001-000000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-07', 'PRESENT',  NOW(), NOW()),
('b1000007-0001-0001-0001-000000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-07', 'PRESENT',  NOW(), NOW()),
('b1000007-0001-0001-0001-000000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-07', 'LATE',     NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- ============================================================
-- ATTENDANCE: Class 10B - Week 2 (March 10-14, 2026)
-- ============================================================

-- March 10 (Monday) - 10B
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('b2000010-0001-0001-0001-000000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '4d5e6f70-8901-2345-def0-234567890123', 'TCH001', '2026-03-10', 'PRESENT',  NOW(), NOW()),
('b2000010-0001-0001-0001-000000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '5e6f7089-0123-4567-ef01-345678901234', 'TCH001', '2026-03-10', 'PRESENT',  NOW(), NOW()),
('b2000010-0001-0001-0001-000000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '6f708901-2345-6789-f012-456789012345', 'TCH001', '2026-03-10', 'ABSENT',   NOW(), NOW()),
('b2000010-0001-0001-0001-000000000004', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '70890123-4567-8901-0123-567890123456', 'TCH001', '2026-03-10', 'PRESENT',  NOW(), NOW()),
('b2000010-0001-0001-0001-000000000005', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '81901234-5678-9012-1234-678901234567', 'TCH001', '2026-03-10', 'PRESENT',  NOW(), NOW()),
('b2000010-0001-0001-0001-000000000006', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-10', 'LATE',     NOW(), NOW()),
('b2000010-0001-0001-0001-000000000007', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-10', 'PRESENT',  NOW(), NOW()),
('b2000010-0001-0001-0001-000000000008', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-10', 'PRESENT',  NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- March 11 (Tuesday) - 10B
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('b2000011-0001-0001-0001-000000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '4d5e6f70-8901-2345-def0-234567890123', 'TCH001', '2026-03-11', 'LATE',     NOW(), NOW()),
('b2000011-0001-0001-0001-000000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '5e6f7089-0123-4567-ef01-345678901234', 'TCH001', '2026-03-11', 'PRESENT',  NOW(), NOW()),
('b2000011-0001-0001-0001-000000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '6f708901-2345-6789-f012-456789012345', 'TCH001', '2026-03-11', 'PRESENT',  NOW(), NOW()),
('b2000011-0001-0001-0001-000000000004', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '70890123-4567-8901-0123-567890123456', 'TCH001', '2026-03-11', 'PRESENT',  NOW(), NOW()),
('b2000011-0001-0001-0001-000000000005', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '81901234-5678-9012-1234-678901234567', 'TCH001', '2026-03-11', 'ABSENT',   NOW(), NOW()),
('b2000011-0001-0001-0001-000000000006', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-11', 'PRESENT',  NOW(), NOW()),
('b2000011-0001-0001-0001-000000000007', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-11', 'HALF_DAY', NOW(), NOW()),
('b2000011-0001-0001-0001-000000000008', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-11', 'PRESENT',  NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- March 12 (Wednesday) - 10B
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('b2000012-0001-0001-0001-000000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '4d5e6f70-8901-2345-def0-234567890123', 'TCH001', '2026-03-12', 'PRESENT',  NOW(), NOW()),
('b2000012-0001-0001-0001-000000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '5e6f7089-0123-4567-ef01-345678901234', 'TCH001', '2026-03-12', 'PRESENT',  NOW(), NOW()),
('b2000012-0001-0001-0001-000000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '6f708901-2345-6789-f012-456789012345', 'TCH001', '2026-03-12', 'LATE',     NOW(), NOW()),
('b2000012-0001-0001-0001-000000000004', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '70890123-4567-8901-0123-567890123456', 'TCH001', '2026-03-12', 'PRESENT',  NOW(), NOW()),
('b2000012-0001-0001-0001-000000000005', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '81901234-5678-9012-1234-678901234567', 'TCH001', '2026-03-12', 'PRESENT',  NOW(), NOW()),
('b2000012-0001-0001-0001-000000000006', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-12', 'PRESENT',  NOW(), NOW()),
('b2000012-0001-0001-0001-000000000007', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-12', 'PRESENT',  NOW(), NOW()),
('b2000012-0001-0001-0001-000000000008', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-12', 'ABSENT',   NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- March 13 (Thursday) - 10B
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('b2000013-0001-0001-0001-000000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '4d5e6f70-8901-2345-def0-234567890123', 'TCH001', '2026-03-13', 'PRESENT',  NOW(), NOW()),
('b2000013-0001-0001-0001-000000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '5e6f7089-0123-4567-ef01-345678901234', 'TCH001', '2026-03-13', 'ABSENT',   NOW(), NOW()),
('b2000013-0001-0001-0001-000000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '6f708901-2345-6789-f012-456789012345', 'TCH001', '2026-03-13', 'PRESENT',  NOW(), NOW()),
('b2000013-0001-0001-0001-000000000004', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '70890123-4567-8901-0123-567890123456', 'TCH001', '2026-03-13', 'PRESENT',  NOW(), NOW()),
('b2000013-0001-0001-0001-000000000005', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '81901234-5678-9012-1234-678901234567', 'TCH001', '2026-03-13', 'PRESENT',  NOW(), NOW()),
('b2000013-0001-0001-0001-000000000006', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-13', 'PRESENT',  NOW(), NOW()),
('b2000013-0001-0001-0001-000000000007', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-13', 'LATE',     NOW(), NOW()),
('b2000013-0001-0001-0001-000000000008', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-13', 'PRESENT',  NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- March 14 (Friday) - 10B
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('b2000014-0001-0001-0001-000000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '4d5e6f70-8901-2345-def0-234567890123', 'TCH001', '2026-03-14', 'ABSENT',   NOW(), NOW()),
('b2000014-0001-0001-0001-000000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '5e6f7089-0123-4567-ef01-345678901234', 'TCH001', '2026-03-14', 'PRESENT',  NOW(), NOW()),
('b2000014-0001-0001-0001-000000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '6f708901-2345-6789-f012-456789012345', 'TCH001', '2026-03-14', 'PRESENT',  NOW(), NOW()),
('b2000014-0001-0001-0001-000000000004', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '70890123-4567-8901-0123-567890123456', 'TCH001', '2026-03-14', 'PRESENT',  NOW(), NOW()),
('b2000014-0001-0001-0001-000000000005', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '81901234-5678-9012-1234-678901234567', 'TCH001', '2026-03-14', 'LATE',     NOW(), NOW()),
('b2000014-0001-0001-0001-000000000006', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-14', 'PRESENT',  NOW(), NOW()),
('b2000014-0001-0001-0001-000000000007', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-14', 'PRESENT',  NOW(), NOW()),
('b2000014-0001-0001-0001-000000000008', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-14', 'PRESENT',  NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- ============================================================
-- ATTENDANCE: Class 10B - Week 3 (March 17-18, 2026)
-- ============================================================

-- March 17 (Monday) - 10B
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('b3000017-0001-0001-0001-000000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '4d5e6f70-8901-2345-def0-234567890123', 'TCH001', '2026-03-17', 'PRESENT',  NOW(), NOW()),
('b3000017-0001-0001-0001-000000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '5e6f7089-0123-4567-ef01-345678901234', 'TCH001', '2026-03-17', 'PRESENT',  NOW(), NOW()),
('b3000017-0001-0001-0001-000000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '6f708901-2345-6789-f012-456789012345', 'TCH001', '2026-03-17', 'PRESENT',  NOW(), NOW()),
('b3000017-0001-0001-0001-000000000004', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '70890123-4567-8901-0123-567890123456', 'TCH001', '2026-03-17', 'ABSENT',   NOW(), NOW()),
('b3000017-0001-0001-0001-000000000005', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '81901234-5678-9012-1234-678901234567', 'TCH001', '2026-03-17', 'PRESENT',  NOW(), NOW()),
('b3000017-0001-0001-0001-000000000006', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-17', 'PRESENT',  NOW(), NOW()),
('b3000017-0001-0001-0001-000000000007', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-17', 'LATE',     NOW(), NOW()),
('b3000017-0001-0001-0001-000000000008', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-17', 'PRESENT',  NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- March 18 (Tuesday) - 10B
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('b3000018-0001-0001-0001-000000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '4d5e6f70-8901-2345-def0-234567890123', 'TCH001', '2026-03-18', 'PRESENT',  NOW(), NOW()),
('b3000018-0001-0001-0001-000000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '5e6f7089-0123-4567-ef01-345678901234', 'TCH001', '2026-03-18', 'HALF_DAY', NOW(), NOW()),
('b3000018-0001-0001-0001-000000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '6f708901-2345-6789-f012-456789012345', 'TCH001', '2026-03-18', 'PRESENT',  NOW(), NOW()),
('b3000018-0001-0001-0001-000000000004', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '70890123-4567-8901-0123-567890123456', 'TCH001', '2026-03-18', 'PRESENT',  NOW(), NOW()),
('b3000018-0001-0001-0001-000000000005', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '81901234-5678-9012-1234-678901234567', 'TCH001', '2026-03-18', 'PRESENT',  NOW(), NOW()),
('b3000018-0001-0001-0001-000000000006', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000001', 'TCH001', '2026-03-18', 'PRESENT',  NOW(), NOW()),
('b3000018-0001-0001-0001-000000000007', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000002', 'TCH001', '2026-03-18', 'PRESENT',  NOW(), NOW()),
('b3000018-0001-0001-0001-000000000008', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'bb000001-0000-0000-0000-000000000003', 'TCH001', '2026-03-18', 'LATE',     NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;

-- ============================================================
-- LEAVE REQUESTS (10 total - varied statuses, reasons, dates)
-- ============================================================
INSERT INTO leave_requests (id, school_id, student_id, from_date, to_date, reason, message, status, created_at) VALUES
-- 10A students
('30000001-0001-0001-0001-000000000001', 101, '0540f78d-8479-4d11-bd41-d3fd2b014db4', '2026-03-10', '2026-03-11', 'Sick',            'Fever and cold, doctor advised rest.',                  'APPROVED', NOW()),
('30000001-0001-0001-0001-000000000002', 101, '3c4d5e6f-7890-1234-cdef-123456789012', '2026-03-12', '2026-03-13', 'Family Function',  'Sister wedding ceremony.',                              'PENDING',  NOW()),
('30000001-0001-0001-0001-000000000005', 101, 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', '2026-03-19', '2026-03-20', 'Sick',            'Dental surgery scheduled.',                              'PENDING',  NOW()),
('30000001-0001-0001-0001-000000000006', 101, '1a2b3c4d-5e6f-7890-abcd-ef1234567891', '2026-03-05', '2026-03-05', 'Sick',            'Stomach ache, went to hospital.',                        'APPROVED', NOW()),
('30000001-0001-0001-0001-000000000007', 101, '2b3c4d5e-6f78-9012-bcde-f12345678901', '2026-03-20', '2026-03-21', 'Travel',          'Going to grandparents village for festival.',            'PENDING',  NOW()),
('30000001-0001-0001-0001-000000000008', 101, 'aa000001-0000-0000-0000-000000000001', '2026-03-18', '2026-03-18', 'Personal',        'Family emergency, need to visit hospital.',              'APPROVED', NOW()),
('30000001-0001-0001-0001-000000000009', 101, 'aa000001-0000-0000-0000-000000000003', '2026-03-07', '2026-03-07', 'Sick',            'Eye infection, doctor said stay home.',                   'REJECTED', NOW()),
-- 10B students
('30000001-0001-0001-0001-000000000003', 101, '4d5e6f70-8901-2345-def0-234567890123', '2026-03-14', '2026-03-14', 'Travel',          'Family trip, will return same day.',                     'APPROVED', NOW()),
('30000001-0001-0001-0001-000000000004', 101, '70890123-4567-8901-0123-567890123456', '2026-03-06', '2026-03-07', 'Personal',        'Personal work at home.',                                 'REJECTED', NOW()),
('30000001-0001-0001-0001-000000000010', 101, '81901234-5678-9012-1234-678901234567', '2026-03-21', '2026-03-22', 'Family Function',  'Cousin engagement ceremony in another city.',           'PENDING',  NOW()),
('30000001-0001-0001-0001-000000000011', 101, 'bb000001-0000-0000-0000-000000000002', '2026-03-11', '2026-03-11', 'Sick',            'High fever since last night.',                           'APPROVED', NOW()),
('30000001-0001-0001-0001-000000000012', 101, 'bb000001-0000-0000-0000-000000000003', '2026-03-24', '2026-03-25', 'Other',           'Participating in inter-school sports competition.',      'PENDING',  NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TIMETABLE: Class 10B (full week)
-- ============================================================
INSERT INTO timetable (school_id, class_id, day_of_week, period_number, subject, teacher_id, start_time, end_time) VALUES
-- Monday
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Monday', 1, 'English',            'TCH001', '08:00', '08:45'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Monday', 2, 'Mathematics',        'TCH002', '08:45', '09:30'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Monday', 3, 'Hindi',              NULL,     '09:30', '10:15'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Monday', 4, 'Science',            NULL,     '10:45', '11:30'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Monday', 5, 'Social Studies',     NULL,     '11:30', '12:15'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Monday', 6, 'Physical Education', NULL,     '12:15', '13:00'),
-- Tuesday
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Tuesday', 1, 'Science',           NULL,     '08:00', '08:45'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Tuesday', 2, 'English',           'TCH001', '08:45', '09:30'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Tuesday', 3, 'Mathematics',       'TCH002', '09:30', '10:15'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Tuesday', 4, 'Hindi',             NULL,     '10:45', '11:30'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Tuesday', 5, 'Computer Science',  NULL,     '11:30', '12:15'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Tuesday', 6, 'Social Studies',    NULL,     '12:15', '13:00'),
-- Wednesday
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Wednesday', 1, 'English',           'TCH001', '08:00', '08:45'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Wednesday', 2, 'Science',           NULL,     '08:45', '09:30'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Wednesday', 3, 'Hindi',             NULL,     '09:30', '10:15'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Wednesday', 4, 'Mathematics',       'TCH002', '10:45', '11:30'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Wednesday', 5, 'Physical Education',NULL,     '11:30', '12:15'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Wednesday', 6, 'Computer Science',  NULL,     '12:15', '13:00'),
-- Thursday
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Thursday', 1, 'Hindi',             NULL,     '08:00', '08:45'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Thursday', 2, 'English',           'TCH001', '08:45', '09:30'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Thursday', 3, 'Social Studies',    NULL,     '09:30', '10:15'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Thursday', 4, 'Science',           NULL,     '10:45', '11:30'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Thursday', 5, 'Mathematics',       'TCH002', '11:30', '12:15'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Thursday', 6, 'Computer Science',  NULL,     '12:15', '13:00'),
-- Friday
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Friday', 1, 'Mathematics',       'TCH002', '08:00', '08:45'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Friday', 2, 'Social Studies',    NULL,     '08:45', '09:30'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Friday', 3, 'English',           'TCH001', '09:30', '10:15'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Friday', 4, 'Hindi',             NULL,     '10:45', '11:30'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Friday', 5, 'Science',           NULL,     '11:30', '12:15'),
(101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Friday', 6, 'Physical Education',NULL,     '12:15', '13:00')
ON CONFLICT (school_id, class_id, day_of_week, period_number) DO NOTHING;

-- ============================================================
-- TIMETABLE: Class 10A (full week)
-- ============================================================
INSERT INTO timetable (school_id, class_id, day_of_week, period_number, subject, teacher_id, start_time, end_time) VALUES
-- Monday
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Monday', 1, 'Mathematics',        'TCH001', '08:00', '08:45'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Monday', 2, 'English',            'TCH002', '08:45', '09:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Monday', 3, 'Science',            NULL,     '09:30', '10:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Monday', 4, 'Hindi',              NULL,     '10:45', '11:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Monday', 5, 'Computer Science',   NULL,     '11:30', '12:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Monday', 6, 'Physical Education', NULL,     '12:15', '13:00'),
-- Tuesday
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Tuesday', 1, 'English',           'TCH002', '08:00', '08:45'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Tuesday', 2, 'Mathematics',       'TCH001', '08:45', '09:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Tuesday', 3, 'Social Studies',    NULL,     '09:30', '10:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Tuesday', 4, 'Science',           NULL,     '10:45', '11:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Tuesday', 5, 'Hindi',             NULL,     '11:30', '12:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Tuesday', 6, 'Computer Science',  NULL,     '12:15', '13:00'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Tuesday', 7, 'Mathematics',       'TCH001', '13:00', '13:45'),
-- Wednesday
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Wednesday', 1, 'Science',           NULL,     '08:00', '08:45'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Wednesday', 2, 'English',           'TCH002', '08:45', '09:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Wednesday', 3, 'Mathematics',       'TCH001', '09:30', '10:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Wednesday', 4, 'Computer Science',  NULL,     '10:45', '11:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Wednesday', 5, 'Social Studies',    NULL,     '11:30', '12:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Wednesday', 6, 'Physical Education',NULL,     '12:15', '13:00'),
-- Thursday
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Thursday', 1, 'Mathematics',       'TCH001', '08:00', '08:45'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Thursday', 2, 'Hindi',             NULL,     '08:45', '09:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Thursday', 3, 'Science',           NULL,     '09:30', '10:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Thursday', 4, 'English',           'TCH002', '10:45', '11:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Thursday', 5, 'Social Studies',    NULL,     '11:30', '12:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Thursday', 6, 'Computer Science',  NULL,     '12:15', '13:00'),
-- Friday
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Friday', 1, 'Social Studies',    NULL,     '08:00', '08:45'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Friday', 2, 'Mathematics',       'TCH001', '08:45', '09:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Friday', 3, 'English',           'TCH002', '09:30', '10:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Friday', 4, 'Science',           NULL,     '10:45', '11:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Friday', 5, 'Hindi',             NULL,     '11:30', '12:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Friday', 6, 'Physical Education',NULL,     '12:15', '13:00')
ON CONFLICT (school_id, class_id, day_of_week, period_number) DO NOTHING;

-- ============================================================
-- HOMEWORK: Class 10A - Mathematics (8 assignments)
-- ============================================================
INSERT INTO homework (id, school_id, class_id, teacher_id, subject, title, description, due_date) VALUES
('00000001-0000-0000-0000-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', 'Solve Chapter 5 Exercise',         'Complete all questions from Exercise 5.2 and 5.3. Show all working steps.',               '2026-03-17'),
('00000001-0000-0000-0000-000000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', 'Practice Quadratic Equations',     'Solve worksheet problems 1-20. Focus on the factorization method.',                        '2026-03-20'),
('00000001-0000-0000-0000-000000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', 'Trigonometry Basics',              'Learn and practice sin, cos, tan identities from Chapter 8.',                              '2026-03-24'),
('00000001-0000-0000-0000-000000000004', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', 'Chapter 3 Revision',               'Revise all formulas from Chapter 3 and solve past paper questions.',                       '2026-03-10'),
('00000001-0000-0000-0000-000000000005', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', 'Algebra Word Problems',            'Solve 15 word problems from Chapter 4. Write equations before solving.',                   '2026-03-07'),
('00000001-0000-0000-0000-000000000006', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', 'Statistics and Probability',       'Complete Exercise 14.1 and 14.2. Draw all required graphs on graph paper.',                '2026-03-26'),
('00000001-0000-0000-0000-000000000007', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', 'Geometry - Circles',               'Prove theorems 1-5 from Chapter 10. Draw neat diagrams with compass.',                    '2026-03-28'),
('00000001-0000-0000-0000-000000000008', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', 'Surface Area and Volume',          'Solve all examples from Section 13.3. Include unit conversions.',                          '2026-03-31')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- HOMEWORK: Class 10B - English (8 assignments)
-- ============================================================
INSERT INTO homework (id, school_id, class_id, teacher_id, subject, title, description, due_date) VALUES
('00000002-0000-0000-0000-000000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'TCH001', 'English', 'Essay Writing - My School',            'Write a 500-word essay on "My School" with introduction, body, and conclusion.',            '2026-03-17'),
('00000002-0000-0000-0000-000000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'TCH001', 'English', 'Grammar Worksheet',                    'Complete the grammar worksheet on tenses - past, present, and future.',                     '2026-03-19'),
('00000002-0000-0000-0000-000000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'TCH001', 'English', 'Reading Comprehension',                'Read the passage on page 45 and answer questions 1-10.',                                    '2026-03-22'),
('00000002-0000-0000-0000-000000000004', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'TCH001', 'English', 'Poem Analysis - The Road Not Taken',   'Analyze the poem and write a summary with literary devices used.',                          '2026-03-12'),
('00000002-0000-0000-0000-000000000005', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'TCH001', 'English', 'Letter Writing - Formal',              'Write a formal letter to principal requesting permission for a school trip.',                '2026-03-07'),
('00000002-0000-0000-0000-000000000006', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'TCH001', 'English', 'Vocabulary Building',                  'Learn 30 new words from Chapter 6 and write sentences using each word.',                    '2026-03-25'),
('00000002-0000-0000-0000-000000000007', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'TCH001', 'English', 'Story Writing - Adventure',            'Write a 600-word adventure story with proper plot structure and character development.',     '2026-03-28'),
('00000002-0000-0000-0000-000000000008', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'TCH001', 'English', 'Debate Preparation - Technology',      'Prepare arguments for and against: "Technology is making students lazy". 3 points each.',   '2026-03-31')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ANNOUNCEMENTS (6 announcements with recipients)
-- ============================================================

-- Announcement 1: TCH001 sent to all parents in 10A (important)
INSERT INTO announcements (id, school_id, sender_id, sender_name, sender_role, class_id, audience_type, title, message, is_important, recipient_count, created_at) VALUES
('c0000001-0000-0000-0000-000000000001', 101, 'TCH001', 'John Smith', 'TEACHER', '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'ALL_PARENTS', 'Parent-Teacher Meeting', 'Dear Parents, a parent-teacher meeting is scheduled for March 20, 2026 at 10:00 AM. Please make it a point to attend. We will discuss your child progress and upcoming exams.', true, 4, '2026-03-10 09:00:00'),
('c0000001-0000-0000-0000-000000000002', 101, 'TCH001', 'John Smith', 'TEACHER', '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'ALL_PARENTS', 'Mathematics Test Next Week', 'Unit test on Chapter 5 and 6 will be conducted on March 21. Please ensure students revise properly.', false, 4, '2026-03-12 14:30:00'),
('c0000001-0000-0000-0000-000000000003', 101, 'TCH001', 'John Smith', 'TEACHER', '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'ALL_PARENTS', 'English Recitation Competition', 'An English poem recitation competition will be held on March 25. Students should prepare a poem of their choice (2-3 minutes).', false, 3, '2026-03-14 10:00:00'),
('c0000001-0000-0000-0000-000000000004', 101, 'TCH001', 'John Smith', 'TEACHER', '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'SPECIFIC_PARENTS', 'Regarding Your Child Attendance', 'Your child has been absent frequently. Please ensure regular attendance as exams are approaching.', true, 2, '2026-03-15 11:00:00'),
('c0000001-0000-0000-0000-000000000005', 101, 'ADM001', 'Admin User', 'ADMIN', NULL, 'ALL_TEACHERS', 'Staff Meeting Notice', 'All teachers are requested to attend the staff meeting on March 22 at 3:00 PM in the conference hall. Agenda: Annual day planning.', true, 2, '2026-03-16 08:00:00'),
('c0000001-0000-0000-0000-000000000006', 101, 'TCH001', 'John Smith', 'TEACHER', '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'ALL_PARENTS', 'Holiday Homework Instructions', 'Please note that holiday homework for Holi break has been uploaded. Students must complete it before March 31.', false, 3, '2026-03-17 09:30:00')
ON CONFLICT (id) DO NOTHING;

-- Recipients for announcements
INSERT INTO announcement_recipients (id, announcement_id, recipient_id, school_id, is_read, read_at) VALUES
-- Announcement 1: All parents in 10A (PAR001, PAR002, PAR003, PAR004)
('d0000001-0001-0001-0001-000000000001', 'c0000001-0000-0000-0000-000000000001', 'PAR001', 101, true,  '2026-03-10 10:15:00'),
('d0000001-0001-0001-0001-000000000002', 'c0000001-0000-0000-0000-000000000001', 'PAR002', 101, true,  '2026-03-10 11:00:00'),
('d0000001-0001-0001-0001-000000000003', 'c0000001-0000-0000-0000-000000000001', 'PAR003', 101, false, NULL),
('d0000001-0001-0001-0001-000000000004', 'c0000001-0000-0000-0000-000000000001', 'PAR004', 101, false, NULL),
-- Announcement 2: All parents in 10A
('d0000002-0001-0001-0001-000000000001', 'c0000001-0000-0000-0000-000000000002', 'PAR001', 101, true,  '2026-03-12 15:00:00'),
('d0000002-0001-0001-0001-000000000002', 'c0000001-0000-0000-0000-000000000002', 'PAR002', 101, false, NULL),
('d0000002-0001-0001-0001-000000000003', 'c0000001-0000-0000-0000-000000000002', 'PAR003', 101, false, NULL),
('d0000002-0001-0001-0001-000000000004', 'c0000001-0000-0000-0000-000000000002', 'PAR004', 101, false, NULL),
-- Announcement 3: All parents in 10B (PAR001, PAR004, PAR005)
('d0000003-0001-0001-0001-000000000001', 'c0000001-0000-0000-0000-000000000003', 'PAR001', 101, false, NULL),
('d0000003-0001-0001-0001-000000000002', 'c0000001-0000-0000-0000-000000000003', 'PAR004', 101, true,  '2026-03-14 12:00:00'),
('d0000003-0001-0001-0001-000000000003', 'c0000001-0000-0000-0000-000000000003', 'PAR005', 101, false, NULL),
-- Announcement 4: Specific parents (PAR001, PAR002) - attendance warning
('d0000004-0001-0001-0001-000000000001', 'c0000001-0000-0000-0000-000000000004', 'PAR001', 101, true,  '2026-03-15 12:30:00'),
('d0000004-0001-0001-0001-000000000002', 'c0000001-0000-0000-0000-000000000004', 'PAR002', 101, false, NULL),
-- Announcement 5: Admin to all teachers (TCH001, TCH002)
('d0000005-0001-0001-0001-000000000001', 'c0000001-0000-0000-0000-000000000005', 'TCH001', 101, true,  '2026-03-16 09:00:00'),
('d0000005-0001-0001-0001-000000000002', 'c0000001-0000-0000-0000-000000000005', 'TCH002', 101, false, NULL),
-- Announcement 6: All parents in 10B
('d0000006-0001-0001-0001-000000000001', 'c0000001-0000-0000-0000-000000000006', 'PAR001', 101, false, NULL),
('d0000006-0001-0001-0001-000000000002', 'c0000001-0000-0000-0000-000000000006', 'PAR004', 101, false, NULL),
('d0000006-0001-0001-0001-000000000003', 'c0000001-0000-0000-0000-000000000006', 'PAR005', 101, false, NULL)
ON CONFLICT (announcement_id, recipient_id) DO NOTHING;

-- ============================================================
-- EXAMS
-- 3 exam sessions covering all 3 tabs:
--   completed  → exam_date < today (2026-03-19)
--   ongoing    → exam_date = today (2026-03-19)
--   upcoming   → exam_date > today (2026-03-19)
-- ============================================================
INSERT INTO exams (id, school_id, name, created_at) VALUES
('ee000001-0000-0000-0000-000000000001', 101, 'Unit Test 1',   '2026-03-01 08:00:00'),
('ee000001-0000-0000-0000-000000000002', 101, 'Class Test',    '2026-03-18 08:00:00'),
('ee000001-0000-0000-0000-000000000003', 101, 'Mid Term Exam', '2026-03-18 08:00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- EXAM SUBJECTS
-- Unit Test 1 (completed — both subjects done in early March)
--   10A Math   → SUBMITTED (fully done, marks locked)
--   10B English → DRAFT    (marks partially entered)
-- Class Test (ongoing — exam happening today 2026-03-19)
--   10A Math   → PENDING
-- Mid Term (upcoming — April)
--   10A Math   → PENDING
--   10B English → PENDING
-- ============================================================
INSERT INTO exam_subjects (id, school_id, exam_id, class_id, teacher_id, subject_name, exam_date, max_marks, pass_marks, result_status) VALUES
-- Unit Test 1
('e5000001-0000-0000-0000-000000000001', 101, 'ee000001-0000-0000-0000-000000000001', '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', '2026-03-10', 50, 20, 'SUBMITTED'),
('e5000001-0000-0000-0000-000000000002', 101, 'ee000001-0000-0000-0000-000000000001', '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'TCH001', 'English',      '2026-03-11', 50, 20, 'DRAFT'),
-- Class Test (ongoing today)
('e5000001-0000-0000-0000-000000000003', 101, 'ee000001-0000-0000-0000-000000000002', '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', '2026-03-19', 25, 10, 'PENDING'),
-- Mid Term (upcoming)
('e5000001-0000-0000-0000-000000000004', 101, 'ee000001-0000-0000-0000-000000000003', '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', '2026-04-05', 100, 35, 'PENDING'),
('e5000001-0000-0000-0000-000000000005', 101, 'ee000001-0000-0000-0000-000000000003', '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'TCH001', 'English',      '2026-04-07', 100, 35, 'PENDING')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- EXAM RESULTS
-- Only for Unit Test 1 (completed exams)
--   10A Math (SUBMITTED) → all 8 students have marks
--   10B English (DRAFT)  → 5 of 8 students have marks entered so far
-- ============================================================

-- Unit Test 1 — 10A Mathematics (SUBMITTED, max_marks=50)
INSERT INTO exam_results (exam_subject_id, school_id, student_id, marks_obtained, is_absent) VALUES
('e5000001-0000-0000-0000-000000000001', 101, 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 45, false),  -- Rahul Sharma
('e5000001-0000-0000-0000-000000000001', 101, '0540f78d-8479-4d11-bd41-d3fd2b014db4', 38, false),  -- Priya Singh
('e5000001-0000-0000-0000-000000000001', 101, '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 22, false),  -- Amit Kumar
('e5000001-0000-0000-0000-000000000001', 101, '2b3c4d5e-6f78-9012-bcde-f12345678901', 47, false),  -- Sneha Patel
('e5000001-0000-0000-0000-000000000001', 101, '3c4d5e6f-7890-1234-cdef-123456789012', NULL, true), -- Arjun Reddy (absent)
('e5000001-0000-0000-0000-000000000001', 101, 'aa000001-0000-0000-0000-000000000001', 41, false),  -- Kavya Nair
('e5000001-0000-0000-0000-000000000001', 101, 'aa000001-0000-0000-0000-000000000002', 33, false),  -- Rohan Mehta
('e5000001-0000-0000-0000-000000000001', 101, 'aa000001-0000-0000-0000-000000000003', 49, false)   -- Ananya Gupta
ON CONFLICT (exam_subject_id, student_id) DO NOTHING;

-- Unit Test 1 — 10B English (DRAFT, max_marks=50) — 5 of 8 entered so far
INSERT INTO exam_results (exam_subject_id, school_id, student_id, marks_obtained, is_absent) VALUES
('e5000001-0000-0000-0000-000000000002', 101, '4d5e6f70-8901-2345-def0-234567890123', 40, false),  -- Aisha Khan
('e5000001-0000-0000-0000-000000000002', 101, '5e6f7089-0123-4567-ef01-345678901234', 28, false),  -- Vikram Verma
('e5000001-0000-0000-0000-000000000002', 101, '6f708901-2345-6789-f012-456789012345', 35, false),  -- Pooja Desai
('e5000001-0000-0000-0000-000000000002', 101, '70890123-4567-8901-0123-567890123456', NULL, true), -- Nikhil Chopra (absent)
('e5000001-0000-0000-0000-000000000002', 101, '81901234-5678-9012-1234-678901234567', 44, false)   -- Deepika Sharma
ON CONFLICT (exam_subject_id, student_id) DO NOTHING;

-- ============================================================
-- MORE EXAMS — Additional test data for frontend
-- ============================================================

-- 3 more exams
INSERT INTO exams (id, school_id, name, created_at) VALUES
('ee000001-0000-0000-0000-000000000004', 101, 'Weekly Quiz 1',    '2026-02-20 08:00:00'),
('ee000001-0000-0000-0000-000000000005', 101, 'Unit Test 2',      '2026-03-15 08:00:00'),
('ee000001-0000-0000-0000-000000000006', 101, 'Half Yearly Exam', '2026-03-18 08:00:00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- MORE EXAM SUBJECTS
-- Weekly Quiz 1 (completed — Feb 25, both subjects done)
--   10A Math   → SUBMITTED (marks locked)
--   10B English → PENDING  (marks not entered yet — good for testing fresh entry)
-- Unit Test 2 (completed — Mar 14-15, both subjects)
--   10A Math   → DRAFT    (partial marks entered)
--   10B English → DRAFT   (partial marks entered)
-- Half Yearly (upcoming — April 15-18)
--   10A Math   → PENDING
--   10B English → PENDING
-- ============================================================
INSERT INTO exam_subjects (id, school_id, exam_id, class_id, teacher_id, subject_name, exam_date, max_marks, pass_marks, result_status) VALUES
-- Weekly Quiz 1
('e5000001-0000-0000-0000-000000000006', 101, 'ee000001-0000-0000-0000-000000000004', '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', '2026-02-25', 25, 10, 'SUBMITTED'),
('e5000001-0000-0000-0000-000000000007', 101, 'ee000001-0000-0000-0000-000000000004', '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'TCH001', 'English',      '2026-02-25', 25, 10, 'PENDING'),
-- Unit Test 2
('e5000001-0000-0000-0000-000000000008', 101, 'ee000001-0000-0000-0000-000000000005', '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', '2026-03-14', 50, 20, 'DRAFT'),
('e5000001-0000-0000-0000-000000000009', 101, 'ee000001-0000-0000-0000-000000000005', '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'TCH001', 'English',      '2026-03-15', 50, 20, 'DRAFT'),
-- Half Yearly
('e5000001-0000-0000-0000-000000000010', 101, 'ee000001-0000-0000-0000-000000000006', '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', '2026-04-15', 100, 35, 'PENDING'),
('e5000001-0000-0000-0000-000000000011', 101, 'ee000001-0000-0000-0000-000000000006', '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'TCH001', 'English',      '2026-04-18', 100, 35, 'PENDING')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- MORE EXAM RESULTS
-- Weekly Quiz 1 — 10A Mathematics (SUBMITTED, max=25)
-- ============================================================
INSERT INTO exam_results (exam_subject_id, school_id, student_id, marks_obtained, is_absent) VALUES
('e5000001-0000-0000-0000-000000000006', 101, 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 22, false),   -- Rahul Sharma
('e5000001-0000-0000-0000-000000000006', 101, '0540f78d-8479-4d11-bd41-d3fd2b014db4', 18, false),   -- Priya Singh
('e5000001-0000-0000-0000-000000000006', 101, '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 8, false),    -- Amit Kumar (FAIL)
('e5000001-0000-0000-0000-000000000006', 101, '2b3c4d5e-6f78-9012-bcde-f12345678901', 25, false),   -- Sneha Patel (FULL MARKS)
('e5000001-0000-0000-0000-000000000006', 101, '3c4d5e6f-7890-1234-cdef-123456789012', 15, false),   -- Arjun Reddy
('e5000001-0000-0000-0000-000000000006', 101, 'aa000001-0000-0000-0000-000000000001', 20, false),    -- Kavya Nair
('e5000001-0000-0000-0000-000000000006', 101, 'aa000001-0000-0000-0000-000000000002', NULL, true),   -- Rohan Mehta (ABSENT)
('e5000001-0000-0000-0000-000000000006', 101, 'aa000001-0000-0000-0000-000000000003', 24, false)     -- Ananya Gupta
ON CONFLICT (exam_subject_id, student_id) DO NOTHING;

-- Unit Test 2 — 10A Mathematics (DRAFT, max=50) — 5 of 8 entered
INSERT INTO exam_results (exam_subject_id, school_id, student_id, marks_obtained, is_absent) VALUES
('e5000001-0000-0000-0000-000000000008', 101, 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 42, false),   -- Rahul Sharma
('e5000001-0000-0000-0000-000000000008', 101, '0540f78d-8479-4d11-bd41-d3fd2b014db4', 35, false),   -- Priya Singh
('e5000001-0000-0000-0000-000000000008', 101, '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 17, false),   -- Amit Kumar (FAIL)
('e5000001-0000-0000-0000-000000000008', 101, '2b3c4d5e-6f78-9012-bcde-f12345678901', 48, false),   -- Sneha Patel
('e5000001-0000-0000-0000-000000000008', 101, '3c4d5e6f-7890-1234-cdef-123456789012', NULL, true)    -- Arjun Reddy (ABSENT)
ON CONFLICT (exam_subject_id, student_id) DO NOTHING;

-- Unit Test 2 — 10B English (DRAFT, max=50) — 4 of 8 entered
INSERT INTO exam_results (exam_subject_id, school_id, student_id, marks_obtained, is_absent) VALUES
('e5000001-0000-0000-0000-000000000009', 101, '4d5e6f70-8901-2345-def0-234567890123', 43, false),   -- Aisha Khan
('e5000001-0000-0000-0000-000000000009', 101, '5e6f7089-0123-4567-ef01-345678901234', 31, false),   -- Vikram Verma
('e5000001-0000-0000-0000-000000000009', 101, '6f708901-2345-6789-f012-456789012345', NULL, true),  -- Pooja Desai (ABSENT)
('e5000001-0000-0000-0000-000000000009', 101, '70890123-4567-8901-0123-567890123456', 39, false)    -- Nikhil Chopra
ON CONFLICT (exam_subject_id, student_id) DO NOTHING;

-- School config for school_id = 101
INSERT INTO school_config (school_id, campus_latitude, campus_longitude, campus_radius_meters, checkin_time)
VALUES (101, 12.9716, 77.5946, 200, '09:30:00')
ON CONFLICT (school_id) DO NOTHING;

-- ============================================================
-- VERIFY ALL INSERTS
-- ============================================================
SELECT 'Classes'              AS table_name, COUNT(*) AS count FROM classes              WHERE school_id = 101;
SELECT 'Students'             AS table_name, COUNT(*) AS count FROM students             WHERE school_id = 101;
SELECT 'Attendance Statuses'  AS table_name, COUNT(*) AS count FROM attendance_statuses  WHERE school_id = 101;
SELECT 'Attendance'           AS table_name, COUNT(*) AS count FROM attendance           WHERE school_id = 101;
SELECT 'Leave Requests'       AS table_name, COUNT(*) AS count FROM leave_requests       WHERE school_id = 101;
SELECT 'Timetable'            AS table_name, COUNT(*) AS count FROM timetable            WHERE school_id = 101;
SELECT 'Homework'             AS table_name, COUNT(*) AS count FROM homework             WHERE school_id = 101;
SELECT 'Announcements'        AS table_name, COUNT(*) AS count FROM announcements        WHERE school_id = 101;
SELECT 'Ann. Recipients'      AS table_name, COUNT(*) AS count FROM announcement_recipients WHERE school_id = 101;
SELECT 'Exams'                AS table_name, COUNT(*) AS count FROM exams                WHERE school_id = 101;
SELECT 'Exam Subjects'        AS table_name, COUNT(*) AS count FROM exam_subjects        WHERE school_id = 101;
SELECT 'Exam Results'         AS table_name, COUNT(*) AS count FROM exam_results         WHERE school_id = 101;
SELECT 'School Config'        AS table_name, COUNT(*) AS count FROM school_config        WHERE school_id = 101;
