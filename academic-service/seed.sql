\c academic_db;

-- Insert Classes for Teacher TCH001 (School 101)
-- Note: Using TCH001 to match auth-service teacher ID format
INSERT INTO classes (id, school_id, name, section, subject, teacher_id, created_at) VALUES
('88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 101, '10A', 'A', 'Mathematics', 'TCH001', NOW()),
('99ccaaee-8bd2-4f93-addd-c0deadbeef19', 101, '10B', 'B', 'English', 'TCH001', NOW());

-- Insert Students in Class 10A (5 students)
-- PAR001 has: Rahul Sharma, Priya Singh, Aisha Khan
-- PAR002 has: Amit Kumar, Sneha Patel
INSERT INTO students (id, school_id, class_id, roll_no, name, parent_id, created_at) VALUES
('f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 1, 'Rahul Sharma', 'PAR001', NOW()),
('0540f78d-8479-4d11-bd41-d3fd2b014db4', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 2, 'Priya Singh', 'PAR001', NOW()),
('1a2b3c4d-5e6f-7890-abcd-ef1234567891', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 3, 'Amit Kumar', 'PAR002', NOW()),
('2b3c4d5e-6f78-9012-bcde-f12345678901', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 4, 'Sneha Patel', 'PAR002', NOW()),
('3c4d5e6f-7890-1234-cdef-123456789012', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 5, 'Arjun Reddy', NULL, NOW());

-- Insert Students in Class 10B (5 students)
INSERT INTO students (id, school_id, class_id, roll_no, name, parent_id, created_at) VALUES
('4d5e6f70-8901-2345-def0-234567890123', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 1, 'Aisha Khan', 'PAR001', NOW()),
('5e6f7089-0123-4567-ef01-345678901234', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 2, 'Vikram Verma', NULL, NOW()),
('6f708901-2345-6789-f012-456789012345', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 3, 'Pooja Desai', NULL, NOW()),
('70890123-4567-8901-0123-567890123456', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 4, 'Nikhil Chopra', NULL, NOW()),
('81901234-5678-9012-1234-678901234567', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 5, 'Deepika Sharma', NULL, NOW());

-- Insert Attendance Statuses for School 101
INSERT INTO attendance_statuses (school_id, code, label, color, is_active) VALUES
(101, 'PRESENT', 'Present', 'green', true),
(101, 'ABSENT', 'Absent', 'red', true),
(101, 'LATE', 'Late', 'orange', true),
(101, 'HALF_DAY', 'Half Day', 'yellow', true);

-- Insert Attendance for 2026-03-03 (Class 10A)
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('a0a1a2a3-a4a5-a6a7-a8a9-aaabacadaeaf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 'TCH001', '2026-03-03', 'PRESENT', NOW(), NOW()),
('b1b2b3b4-b5b6-b7b8-b9ba-bbbbbcbdbebf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '0540f78d-8479-4d11-bd41-d3fd2b014db4', 'TCH001', '2026-03-03', 'ABSENT', NOW(), NOW()),
('c2c3c4c5-c6c7-c8c9-caca-cbcccccddcdf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 'TCH001', '2026-03-03', 'PRESENT', NOW(), NOW()),
('d3d4d5d6-d7d8-d9da-dbdc-dddddedfdedf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '2b3c4d5e-6f78-9012-bcde-f12345678901', 'TCH001', '2026-03-03', 'LATE', NOW(), NOW()),
('e4e5e6e7-e8e9-eaea-ebec-edeeeeefefef', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '3c4d5e6f-7890-1234-cdef-123456789012', 'TCH001', '2026-03-03', 'HALF_DAY', NOW(), NOW());


-- Insert Timetable for Class 10A (school_id=101)
-- Period schedule: P1=08:00-08:45, P2=08:45-09:30, P3=09:30-10:15, P4=10:45-11:30, P5=11:30-12:15, P6=12:15-13:00
-- (Lunch Break 10:15-10:45 is not a period row, handled by frontend)
INSERT INTO timetable (school_id, class_id, day_of_week, period_number, subject, teacher_id, start_time, end_time) VALUES
-- Monday
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Monday', 1, 'Mathematics', 'TCH001', '08:00', '08:45'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Monday', 2, 'English', 'TCH002', '08:45', '09:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Monday', 3, 'Science', NULL, '09:30', '10:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Monday', 4, 'Hindi', NULL, '10:45', '11:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Monday', 5, 'Computer Science', NULL, '11:30', '12:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Monday', 6, 'Physical Education', NULL, '12:15', '13:00'),
-- Tuesday
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Tuesday', 1, 'English', 'TCH002', '08:00', '08:45'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Tuesday', 2, 'Mathematics', 'TCH001', '08:45', '09:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Tuesday', 3, 'Social Studies', NULL, '09:30', '10:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Tuesday', 7, 'Mathematics', 'TCH001', '13:00', '13:45'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Tuesday', 4, 'Science', NULL, '10:45', '11:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Tuesday', 5, 'Hindi', NULL, '11:30', '12:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Tuesday', 6, 'Computer Science', NULL, '12:15', '13:00'),
-- Wednesday
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Wednesday', 1, 'Science', NULL, '08:00', '08:45'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Wednesday', 2, 'English', 'TCH002', '08:45', '09:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Wednesday', 3, 'Mathematics', 'TCH001', '09:30', '10:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Wednesday', 4, 'Computer Science', NULL, '10:45', '11:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Wednesday', 5, 'Social Studies', NULL, '11:30', '12:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Wednesday', 6, 'Physical Education', NULL, '12:15', '13:00'),
-- Thursday
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Thursday', 1, 'Mathematics', 'TCH001', '08:00', '08:45'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Thursday', 2, 'Hindi', NULL, '08:45', '09:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Thursday', 3, 'Science', NULL, '09:30', '10:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Thursday', 4, 'English', 'TCH002', '10:45', '11:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Thursday', 5, 'Social Studies', NULL, '11:30', '12:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Thursday', 6, 'Computer Science', NULL, '12:15', '13:00'),
-- Friday
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Friday', 1, 'Social Studies', NULL, '08:00', '08:45'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Friday', 2, 'Mathematics', 'TCH001', '08:45', '09:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Friday', 3, 'English', 'TCH002', '09:30', '10:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Friday', 4, 'Science', NULL, '10:45', '11:30'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Friday', 5, 'Hindi', NULL, '11:30', '12:15'),
(101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Friday', 6, 'Physical Education', NULL, '12:15', '13:00');

-- Insert Homework for Class 10A (school_id=101)
-- today = 2026-03-09, upcoming = future, completed = past
INSERT INTO homework (id, school_id, class_id, teacher_id, subject, title, description, due_date, attachment_url) VALUES
('00000001-0000-0000-0000-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', 'Solve Chapter 5 Exercise', 'Complete all questions from Exercise 5.2 and 5.3. Show all working steps.', '2026-03-09', NULL),
('00000001-0000-0000-0000-000000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', 'Practice Quadratic Equations', 'Solve worksheet problems 1-20. Focus on factorization method.', '2026-03-12', NULL),
('00000001-0000-0000-0000-000000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', 'Trigonometry Basics', 'Learn and practice sin, cos, tan identities from Chapter 8.', '2026-03-15', NULL),
('00000001-0000-0000-0000-000000000004', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', 'Chapter 3 Revision', 'Revise all formulas from Chapter 3 and solve past paper questions.', '2026-03-03', NULL);

-- Insert Announcements (school_id=101)
-- TCH001 sends to full class 10A (parents: PAR001, PAR002)
-- ADM001 sends to all teachers (TCH001, TCH002)
INSERT INTO announcements (id, school_id, sender_id, sender_name, sender_role, class_id, audience_type, title, message, is_important, recipient_count) VALUES
('aa000001-0000-0000-0000-000000000001', 101, 'TCH001', 'John Doe', 'TEACHER', '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'full_class', 'Parent-Teacher Meeting', 'Dear Parents, This is to inform you that a Parent-Teacher Meeting is scheduled for Feb 12, 2026 at 4:00 PM. Please make it convenient to attend.', true, 3),
('aa000001-0000-0000-0000-000000000002', 101, 'TCH001', 'John Doe', 'TEACHER', '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'specific_students', 'Homework Submission Reminder', 'Dear Parents, Your child has pending homework submissions. Please ensure they complete and submit it by tomorrow.', false, 2),
('aa000001-0000-0000-0000-000000000003', 101, 'ADM001', 'Admin Office', 'ADMIN', NULL, 'all_teachers', 'Exam Schedule Released', 'The Mid-Term Exam schedule has been released. Please check the school portal for detailed timetable and inform your class students.', true, 2),
('aa000001-0000-0000-0000-000000000004', 101, 'ADM001', 'Principal', 'ADMIN', NULL, 'all_teachers', 'Staff Meeting Tomorrow', 'Reminder: Staff meeting scheduled for Feb 9, 2026 at 3:00 PM in the conference room. Attendance is mandatory.', true, 2);

-- Recipients: announcement 1 → all parents of class 10A (PAR001, PAR002, and PAR001 again for Aisha in 10B but 10A announcement)
INSERT INTO announcement_recipients (announcement_id, recipient_id, school_id, is_read) VALUES
('aa000001-0000-0000-0000-000000000001', 'PAR001', 101, false),
('aa000001-0000-0000-0000-000000000001', 'PAR002', 101, true),
-- announcement 2 → specific students (Rahul=PAR001, Priya=PAR001, so just PAR001 + PAR002 for Amit)
('aa000001-0000-0000-0000-000000000002', 'PAR001', 101, false),
('aa000001-0000-0000-0000-000000000002', 'PAR002', 101, false),
-- announcement 3 + 4 → all teachers
('aa000001-0000-0000-0000-000000000003', 'TCH001', 101, false),
('aa000001-0000-0000-0000-000000000003', 'TCH002', 101, true),
('aa000001-0000-0000-0000-000000000004', 'TCH001', 101, false),
('aa000001-0000-0000-0000-000000000004', 'TCH002', 101, false);

-- Verify inserts
SELECT 'Classes' AS table_name, COUNT(*) as count FROM classes WHERE school_id = 101;
SELECT 'Students' AS table_name, COUNT(*) as count FROM students WHERE school_id = 101;
SELECT 'Attendance' AS table_name, COUNT(*) as count FROM attendance WHERE school_id = 101;
SELECT 'Homework' AS table_name, COUNT(*) as count FROM homework WHERE school_id = 101;
SELECT 'Announcements' AS table_name, COUNT(*) as count FROM announcements WHERE school_id = 101;
