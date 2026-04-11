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

-- Insert Attendance for Multiple Dates (Class 10A & 10B)
-- 2026-03-03 (Class 10A)
INSERT INTO attendance (id, school_id, class_id, student_id, teacher_id, date, status, created_at, updated_at) VALUES
('a0a1a2a3-a4a5-a6a7-a8a9-aaabacadaeaf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 'TCH001', '2026-03-03', 'PRESENT', NOW(), NOW()),
('b1b2b3b4-b5b6-b7b8-b9ba-bbbbbcbdbebf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '0540f78d-8479-4d11-bd41-d3fd2b014db4', 'TCH001', '2026-03-03', 'ABSENT', NOW(), NOW()),
('c2c3c4c5-c6c7-c8c9-caca-cbcccccddcdf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 'TCH001', '2026-03-03', 'PRESENT', NOW(), NOW()),
('d3d4d5d6-d7d8-d9da-dbdc-dddddedfdedf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '2b3c4d5e-6f78-9012-bcde-f12345678901', 'TCH001', '2026-03-03', 'LATE', NOW(), NOW()),
('e4e5e6e7-e8e9-eaea-ebec-edeeeeefefef', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '3c4d5e6f-7890-1234-cdef-123456789012', 'TCH001', '2026-03-03', 'HALF_DAY', NOW(), NOW()),
-- 2026-03-04 (Class 10A)
('a1a2a3a4-a5a6-a7a8-a9aa-aaabacadaeaf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 'TCH001', '2026-03-04', 'PRESENT', NOW(), NOW()),
('b2b3b4b5-b6b7-b8b9-baba-bbbbbcbdbebf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '0540f78d-8479-4d11-bd41-d3fd2b014db4', 'TCH001', '2026-03-04', 'PRESENT', NOW(), NOW()),
('c3c4c5c6-c7c8-c9ca-cbcc-cbcccccddcdf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 'TCH001', '2026-03-04', 'PRESENT', NOW(), NOW()),
('d4d5d6d7-d8d9-dada-dbdc-dddddedfdedf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '2b3c4d5e-6f78-9012-bcde-f12345678901', 'TCH001', '2026-03-04', 'PRESENT', NOW(), NOW()),
('e5e6e7e8-e9ea-eaea-ebec-edeeeeefefef', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '3c4d5e6f-7890-1234-cdef-123456789012', 'TCH001', '2026-03-04', 'PRESENT', NOW(), NOW()),
-- 2026-03-05 (Class 10A)
('a2a3a4a5-a6a7-a8a9-aaaa-aaabacadaeaf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 'TCH001', '2026-03-05', 'PRESENT', NOW(), NOW()),
('b3b4b5b6-b7b8-b9ba-baba-bbbbbcbdbebf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '0540f78d-8479-4d11-bd41-d3fd2b014db4', 'TCH001', '2026-03-05', 'LATE', NOW(), NOW()),
('c4c5c6c7-c8c9-caca-cbcc-cbcccccddcdf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 'TCH001', '2026-03-05', 'PRESENT', NOW(), NOW()),
('d5d6d7d8-d9da-dada-dbdc-dddddedfdedf', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '2b3c4d5e-6f78-9012-bcde-f12345678901', 'TCH001', '2026-03-05', 'ABSENT', NOW(), NOW()),
('e6e7e8e9-eaea-eaea-ebec-edeeeeefefef', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', '3c4d5e6f-7890-1234-cdef-123456789012', 'TCH001', '2026-03-05', 'PRESENT', NOW(), NOW()),
-- Class 10B attendance
('f0f1f2f3-f4f5-f6f7-f8f9-fafbfcfdfef0', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '4d5e6f70-8901-2345-def0-234567890123', 'TCH001', '2026-03-03', 'PRESENT', NOW(), NOW()),
('f1f2f3f4-f5f6-f7f8-f9fa-fafbfcfdfef0', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '5e6f7089-0123-4567-ef01-345678901234', 'TCH001', '2026-03-03', 'ABSENT', NOW(), NOW()),
('f2f3f4f5-f6f7-f8f9-fafa-fafbfcfdfef0', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '6f708901-2345-6789-f012-456789012345', 'TCH001', '2026-03-03', 'PRESENT', NOW(), NOW()),
('f3f4f5f6-f7f8-f9fa-fbfc-fafbfcfdfef0', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '70890123-4567-8901-0123-567890123456', 'TCH001', '2026-03-03', 'PRESENT', NOW(), NOW()),
('f4f5f6f7-f8f9-fafa-fbfc-fafbfcfdfef0', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', '81901234-5678-9012-1234-678901234567', 'TCH001', '2026-03-03', 'LATE', NOW(), NOW())
ON CONFLICT (school_id, class_id, student_id, date) DO NOTHING;


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

-- Insert Homework for Class 10A & 10B (school_id=101)
-- Class 10A - Mathematics (TCH001)
INSERT INTO homework (id, school_id, class_id, teacher_id, subject, title, description, due_date, attachment_url) VALUES
('00000001-0000-0000-0000-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', 'Solve Chapter 5 Exercise', 'Complete all questions from Exercise 5.2 and 5.3. Show all working steps.', '2026-03-09', NULL),
('00000001-0000-0000-0000-000000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', 'Practice Quadratic Equations', 'Solve worksheet problems 1-20. Focus on factorization method.', '2026-03-12', NULL),
('00000001-0000-0000-0000-000000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', 'Trigonometry Basics', 'Learn and practice sin, cos, tan identities from Chapter 8.', '2026-03-15', NULL),
('00000001-0000-0000-0000-000000000004', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', 'Chapter 3 Revision', 'Revise all formulas from Chapter 3 and solve past paper questions.', '2026-03-03', NULL),
('00000001-0000-0000-0000-000000000005', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', 'Algebra Worksheet', 'Solve algebraic equations from page 45-48.', '2026-03-10', NULL),
('00000001-0000-0000-0000-000000000006', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'TCH001', 'Mathematics', 'Geometry Problems', 'Complete 30 geometry problems from Chapters 6-7.', '2026-03-18', NULL),
-- Class 10B - English (TCH002)
('00000001-0000-0000-0000-000000000007', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'TCH002', 'English', 'Essay Writing', 'Write an essay on "Technology and Society" in 500-600 words.', '2026-03-08', NULL),
('00000001-0000-0000-0000-000000000008', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'TCH002', 'English', 'Vocabulary Practice', 'Learn 20 new words and write sentences for each.', '2026-03-07', NULL),
('00000001-0000-0000-0000-000000000009', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'TCH002', 'English', 'Shakespeare Reading', 'Read Act 1-2 of Romeo and Juliet and answer comprehension questions.', '2026-03-20', NULL),
('00000001-0000-0000-0000-000000000010', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'TCH002', 'English', 'Grammar Exercises', 'Complete exercises on tenses and active/passive voice.', '2026-03-06', NULL)
ON CONFLICT (id) DO NOTHING;

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

-- Insert Leave Requests (school_id=101) - Multiple statuses
INSERT INTO leave_requests (id, school_id, student_id, from_date, to_date, reason, message, status, created_at) VALUES
-- Class 10A - Rahul Sharma (PAR001)
('bb000001-0000-0000-0000-000000000001', 101, 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', '2026-02-03', '2026-02-04', 'Sick', 'Fever and cold', 'APPROVED', '2026-02-02 10:00:00'),
('bb000001-0000-0000-0000-000000000002', 101, 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', '2026-01-28', '2026-01-28', 'Family Function', 'Wedding in hometown', 'APPROVED', '2026-01-27 09:00:00'),
('bb000001-0000-0000-0000-000000000003', 101, 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', '2026-03-10', '2026-03-12', 'Travel', 'Family trip to Goa', 'PENDING', '2026-03-09 08:30:00'),
('bb000001-0000-0000-0000-000000000004', 101, 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', '2026-01-15', '2026-01-16', 'Personal', NULL, 'REJECTED', '2026-01-14 11:00:00'),
-- Class 10A - Priya Singh (PAR001)
('bb000001-0000-0000-0000-000000000005', 101, '0540f78d-8479-4d11-bd41-d3fd2b014db4', '2026-02-08', '2026-02-08', 'Sick', 'Headache and fever', 'APPROVED', '2026-02-07 09:00:00'),
('bb000001-0000-0000-0000-000000000006', 101, '0540f78d-8479-4d11-bd41-d3fd2b014db4', '2026-03-05', '2026-03-07', 'Family Function', 'Sister wedding', 'APPROVED', '2026-03-04 10:00:00'),
-- Class 10A - Amit Kumar (PAR002)
('bb000001-0000-0000-0000-000000000007', 101, '1a2b3c4d-5e6f-7890-abcd-ef1234567891', '2026-03-08', '2026-03-09', 'Sick', 'Stomach infection', 'PENDING', '2026-03-07 14:00:00'),
('bb000001-0000-0000-0000-000000000008', 101, '1a2b3c4d-5e6f-7890-abcd-ef1234567891', '2026-02-10', '2026-02-11', 'Family Function', 'Cousin wedding', 'REJECTED', '2026-02-09 10:00:00'),
-- Class 10A - Sneha Patel (PAR002)
('bb000001-0000-0000-0000-000000000009', 101, '2b3c4d5e-6f78-9012-bcde-f12345678901', '2026-02-15', '2026-02-16', 'Travel', 'Holiday', 'APPROVED', '2026-02-14 09:00:00'),
-- Class 10B - Aisha Khan (PAR001)
('bb000001-0000-0000-0000-000000000010', 101, '4d5e6f70-8901-2345-def0-234567890123', '2026-03-11', '2026-03-13', 'Other', 'Religious festival', 'PENDING', '2026-03-10 11:00:00'),
-- Class 10B - Deepika Sharma (no parent)
('bb000001-0000-0000-0000-000000000011', 101, '81901234-5678-9012-1234-678901234567', '2026-03-06', '2026-03-06', 'Sick', 'Viral infection', 'APPROVED', '2026-03-05 08:00:00')
ON CONFLICT (id) DO NOTHING;

-- Insert Exams (school_id=101) - Multiple exams for both classes
INSERT INTO exams (id, school_id, name, academic_year, start_date, end_date) VALUES
('cc000001-0000-0000-0000-000000000001', 101, 'Mid-Term Exam', '2025-2026', '2026-01-20', '2026-02-05'),
('cc000001-0000-0000-0000-000000000002', 101, 'Unit Test 3',   '2025-2026', '2026-02-01', '2026-02-10'),
('cc000001-0000-0000-0000-000000000003', 101, 'Final Exam',    '2025-2026', '2026-03-20', '2026-03-30'),
('cc000001-0000-0000-0000-000000000004', 101, 'Chapter Quiz',  '2025-2026', CURRENT_DATE, CURRENT_DATE),
('cc000001-0000-0000-0000-000000000005', 101, 'Unit Test 1',   '2025-2026', '2025-12-10', '2025-12-15'),
('cc000001-0000-0000-0000-000000000006', 101, 'Unit Test 2',   '2025-2026', '2026-01-05', '2026-01-10')
ON CONFLICT (id) DO NOTHING;

-- Exam Classes (exams for both 10A and 10B)
INSERT INTO exam_classes (exam_id, class_id, school_id) VALUES
-- Mid-Term for both classes
('cc000001-0000-0000-0000-000000000001', '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 101),
('cc000001-0000-0000-0000-000000000001', '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 101),
-- Unit Test 3 for both classes
('cc000001-0000-0000-0000-000000000002', '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 101),
('cc000001-0000-0000-0000-000000000002', '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 101),
-- Final Exam for both classes
('cc000001-0000-0000-0000-000000000003', '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 101),
('cc000001-0000-0000-0000-000000000003', '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 101),
-- Chapter Quiz for 10A
('cc000001-0000-0000-0000-000000000004', '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 101),
-- Unit Tests 1 & 2 for both classes
('cc000001-0000-0000-0000-000000000005', '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 101),
('cc000001-0000-0000-0000-000000000005', '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 101),
('cc000001-0000-0000-0000-000000000006', '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 101),
('cc000001-0000-0000-0000-000000000006', '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 101)
ON CONFLICT DO NOTHING;

-- Exam Subjects - Multiple subjects for multiple exams
-- Mid-Term Exam (Class 10A) - 5 subjects, all SUBMITTED
INSERT INTO exam_subjects (id, exam_id, school_id, class_id, subject_name, exam_date, max_marks, pass_marks, teacher_id, result_status) VALUES
('dd000001-0000-0000-0000-000000000001', 'cc000001-0000-0000-0000-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Mathematics',    '2026-01-28', 100, 35, 'TCH001', 'SUBMITTED'),
('dd000001-0000-0000-0000-000000000002', 'cc000001-0000-0000-0000-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'English',         '2026-01-29', 100, 35, 'TCH002', 'SUBMITTED'),
('dd000001-0000-0000-0000-000000000003', 'cc000001-0000-0000-0000-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Science',         '2026-01-30', 100, 35, 'TCH001', 'SUBMITTED'),
('dd000001-0000-0000-0000-000000000004', 'cc000001-0000-0000-0000-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Social Studies',  '2026-01-31', 100, 35, 'TCH001', 'SUBMITTED'),
('dd000001-0000-0000-0000-000000000005', 'cc000001-0000-0000-0000-000000000001', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Hindi',           '2026-02-01',  50, 20, 'TCH001', 'SUBMITTED'),
-- Mid-Term Exam (Class 10B) - 2 subjects, SUBMITTED
('dd000001-0000-0000-0000-000000000009', 'cc000001-0000-0000-0000-000000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'English',         '2026-01-29', 100, 35, 'TCH002', 'SUBMITTED'),
('dd000001-0000-0000-0000-000000000010', 'cc000001-0000-0000-0000-000000000001', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Science',         '2026-01-30', 100, 35, 'TCH001', 'SUBMITTED'),
-- Unit Test 3 (Class 10A) - Mathematics, DRAFT
('dd000001-0000-0000-0000-000000000006', 'cc000001-0000-0000-0000-000000000002', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Mathematics',    '2026-02-08',  50, 20, 'TCH001', 'DRAFT'),
-- Unit Test 3 (Class 10B) - English, SUBMITTED
('dd000001-0000-0000-0000-000000000011', 'cc000001-0000-0000-0000-000000000002', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'English',        '2026-02-09',  50, 20, 'TCH002', 'SUBMITTED'),
-- Final Exam (Class 10A) - Mathematics, PENDING
('dd000001-0000-0000-0000-000000000007', 'cc000001-0000-0000-0000-000000000003', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Mathematics',    '2026-03-20', 100, 35, 'TCH001', 'PENDING'),
-- Final Exam (Class 10B) - English, PENDING
('dd000001-0000-0000-0000-000000000012', 'cc000001-0000-0000-0000-000000000003', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'English',        '2026-03-21', 100, 35, 'TCH002', 'PENDING'),
-- Chapter Quiz (Class 10A) - Mathematics, today, PENDING
('dd000001-0000-0000-0000-000000000008', 'cc000001-0000-0000-0000-000000000004', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Mathematics',    CURRENT_DATE,  25, 10, 'TCH001', 'PENDING'),
-- Unit Test 1 (Class 10A & 10B)
('dd000001-0000-0000-0000-000000000013', 'cc000001-0000-0000-0000-000000000005', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Mathematics',    '2025-12-12',  50, 20, 'TCH001', 'SUBMITTED'),
('dd000001-0000-0000-0000-000000000014', 'cc000001-0000-0000-0000-000000000005', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'English',        '2025-12-13',  50, 20, 'TCH002', 'SUBMITTED'),
-- Unit Test 2 (Class 10A & 10B)
('dd000001-0000-0000-0000-000000000015', 'cc000001-0000-0000-0000-000000000006', 101, '88bbf5fd-7ac1-4e82-9cc0-b9cfdfde5f18', 'Science',        '2026-01-08',  50, 20, 'TCH001', 'SUBMITTED'),
('dd000001-0000-0000-0000-000000000016', 'cc000001-0000-0000-0000-000000000006', 101, '99ccaaee-8bd2-4f93-addd-c0deadbeef19', 'Social Studies', '2026-01-09',  50, 20, 'TCH001', 'SUBMITTED')
ON CONFLICT (id) DO NOTHING;

-- Exam Results - Comprehensive data for all exams and students
-- Mid-Term Exam Class 10A - Mathematics
INSERT INTO exam_results (exam_subject_id, school_id, student_id, marks_obtained, is_absent) VALUES
('dd000001-0000-0000-0000-000000000001', 101, 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 92, false),
('dd000001-0000-0000-0000-000000000001', 101, '0540f78d-8479-4d11-bd41-d3fd2b014db4', 78, false),
('dd000001-0000-0000-0000-000000000001', 101, '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 85, false),
('dd000001-0000-0000-0000-000000000001', 101, '2b3c4d5e-6f78-9012-bcde-f12345678901', 70, false),
('dd000001-0000-0000-0000-000000000001', 101, '3c4d5e6f-7890-1234-cdef-123456789012', NULL, true),
-- Mid-Term Exam Class 10A - English
('dd000001-0000-0000-0000-000000000002', 101, 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 95, false),
('dd000001-0000-0000-0000-000000000002', 101, '0540f78d-8479-4d11-bd41-d3fd2b014db4', 88, false),
('dd000001-0000-0000-0000-000000000002', 101, '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 72, false),
('dd000001-0000-0000-0000-000000000002', 101, '2b3c4d5e-6f78-9012-bcde-f12345678901', 82, false),
('dd000001-0000-0000-0000-000000000002', 101, '3c4d5e6f-7890-1234-cdef-123456789012', NULL, true),
-- Mid-Term Exam Class 10A - Science
('dd000001-0000-0000-0000-000000000003', 101, 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 88, false),
('dd000001-0000-0000-0000-000000000003', 101, '0540f78d-8479-4d11-bd41-d3fd2b014db4', 80, false),
('dd000001-0000-0000-0000-000000000003', 101, '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 76, false),
('dd000001-0000-0000-0000-000000000003', 101, '2b3c4d5e-6f78-9012-bcde-f12345678901', 68, false),
('dd000001-0000-0000-0000-000000000003', 101, '3c4d5e6f-7890-1234-cdef-123456789012', NULL, true),
-- Mid-Term Exam Class 10A - Social Studies
('dd000001-0000-0000-0000-000000000004', 101, 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 86, false),
('dd000001-0000-0000-0000-000000000004', 101, '0540f78d-8479-4d11-bd41-d3fd2b014db4', 74, false),
('dd000001-0000-0000-0000-000000000004', 101, '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 80, false),
('dd000001-0000-0000-0000-000000000004', 101, '2b3c4d5e-6f78-9012-bcde-f12345678901', 78, false),
('dd000001-0000-0000-0000-000000000004', 101, '3c4d5e6f-7890-1234-cdef-123456789012', NULL, true),
-- Mid-Term Exam Class 10A - Hindi
('dd000001-0000-0000-0000-000000000005', 101, 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 48, false),
('dd000001-0000-0000-0000-000000000005', 101, '0540f78d-8479-4d11-bd41-d3fd2b014db4', 40, false),
('dd000001-0000-0000-0000-000000000005', 101, '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 42, false),
('dd000001-0000-0000-0000-000000000005', 101, '2b3c4d5e-6f78-9012-bcde-f12345678901', 38, false),
('dd000001-0000-0000-0000-000000000005', 101, '3c4d5e6f-7890-1234-cdef-123456789012', NULL, true),
-- Mid-Term Exam Class 10B - English
('dd000001-0000-0000-0000-000000000009', 101, '4d5e6f70-8901-2345-def0-234567890123', 90, false),
('dd000001-0000-0000-0000-000000000009', 101, '5e6f7089-0123-4567-ef01-345678901234', 85, false),
('dd000001-0000-0000-0000-000000000009', 101, '6f708901-2345-6789-f012-456789012345', 92, false),
('dd000001-0000-0000-0000-000000000009', 101, '70890123-4567-8901-0123-567890123456', 78, false),
('dd000001-0000-0000-0000-000000000009', 101, '81901234-5678-9012-1234-678901234567', 88, false),
-- Mid-Term Exam Class 10B - Science
('dd000001-0000-0000-0000-000000000010', 101, '4d5e6f70-8901-2345-def0-234567890123', 82, false),
('dd000001-0000-0000-0000-000000000010', 101, '5e6f7089-0123-4567-ef01-345678901234', 79, false),
('dd000001-0000-0000-0000-000000000010', 101, '6f708901-2345-6789-f012-456789012345', 87, false),
('dd000001-0000-0000-0000-000000000010', 101, '70890123-4567-8901-0123-567890123456', 75, false),
('dd000001-0000-0000-0000-000000000010', 101, '81901234-5678-9012-1234-678901234567', 84, false),
-- Unit Test 3 Class 10A - Mathematics (DRAFT - only 2 entries)
('dd000001-0000-0000-0000-000000000006', 101, 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 46, false),
('dd000001-0000-0000-0000-000000000006', 101, '0540f78d-8479-4d11-bd41-d3fd2b014db4', NULL, true),
-- Unit Test 3 Class 10B - English (SUBMITTED - all students)
('dd000001-0000-0000-0000-000000000011', 101, '4d5e6f70-8901-2345-def0-234567890123', 48, false),
('dd000001-0000-0000-0000-000000000011', 101, '5e6f7089-0123-4567-ef01-345678901234', 44, false),
('dd000001-0000-0000-0000-000000000011', 101, '6f708901-2345-6789-f012-456789012345', 50, false),
('dd000001-0000-0000-0000-000000000011', 101, '70890123-4567-8901-0123-567890123456', 42, false),
('dd000001-0000-0000-0000-000000000011', 101, '81901234-5678-9012-1234-678901234567', 46, false),
-- Unit Test 1 Class 10A - Mathematics (SUBMITTED)
('dd000001-0000-0000-0000-000000000013', 101, 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 48, false),
('dd000001-0000-0000-0000-000000000013', 101, '0540f78d-8479-4d11-bd41-d3fd2b014db4', 40, false),
('dd000001-0000-0000-0000-000000000013', 101, '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 45, false),
('dd000001-0000-0000-0000-000000000013', 101, '2b3c4d5e-6f78-9012-bcde-f12345678901', 38, false),
('dd000001-0000-0000-0000-000000000013', 101, '3c4d5e6f-7890-1234-cdef-123456789012', 42, false),
-- Unit Test 1 Class 10B - English (SUBMITTED)
('dd000001-0000-0000-0000-000000000014', 101, '4d5e6f70-8901-2345-def0-234567890123', 46, false),
('dd000001-0000-0000-0000-000000000014', 101, '5e6f7089-0123-4567-ef01-345678901234', 44, false),
('dd000001-0000-0000-0000-000000000014', 101, '6f708901-2345-6789-f012-456789012345', 49, false),
('dd000001-0000-0000-0000-000000000014', 101, '70890123-4567-8901-0123-567890123456', 41, false),
('dd000001-0000-0000-0000-000000000014', 101, '81901234-5678-9012-1234-678901234567', 45, false),
-- Unit Test 2 Class 10A - Science (SUBMITTED)
('dd000001-0000-0000-0000-000000000015', 101, 'f8f36a25-8bf8-4df8-be47-30a4f0a4e811', 47, false),
('dd000001-0000-0000-0000-000000000015', 101, '0540f78d-8479-4d11-bd41-d3fd2b014db4', 42, false),
('dd000001-0000-0000-0000-000000000015', 101, '1a2b3c4d-5e6f-7890-abcd-ef1234567891', 44, false),
('dd000001-0000-0000-0000-000000000015', 101, '2b3c4d5e-6f78-9012-bcde-f12345678901', 39, false),
('dd000001-0000-0000-0000-000000000015', 101, '3c4d5e6f-7890-1234-cdef-123456789012', NULL, true),
-- Unit Test 2 Class 10B - Social Studies (SUBMITTED)
('dd000001-0000-0000-0000-000000000016', 101, '4d5e6f70-8901-2345-def0-234567890123', 45, false),
('dd000001-0000-0000-0000-000000000016', 101, '5e6f7089-0123-4567-ef01-345678901234', 43, false),
('dd000001-0000-0000-0000-000000000016', 101, '6f708901-2345-6789-f012-456789012345', 48, false),
('dd000001-0000-0000-0000-000000000016', 101, '70890123-4567-8901-0123-567890123456', 40, false),
('dd000001-0000-0000-0000-000000000016', 101, '81901234-5678-9012-1234-678901234567', 44, false)
ON CONFLICT (exam_subject_id, student_id) DO NOTHING;

-- Verify inserts
SELECT 'Classes' AS table_name, COUNT(*) as count FROM classes WHERE school_id = 101;
SELECT 'Students' AS table_name, COUNT(*) as count FROM students WHERE school_id = 101;
SELECT 'Attendance' AS table_name, COUNT(*) as count FROM attendance WHERE school_id = 101;
SELECT 'Homework' AS table_name, COUNT(*) as count FROM homework WHERE school_id = 101;
SELECT 'Announcements' AS table_name, COUNT(*) as count FROM announcements WHERE school_id = 101;
SELECT 'Leave Requests' AS table_name, COUNT(*) as count FROM leave_requests WHERE school_id = 101;
SELECT 'Exams' AS table_name, COUNT(*) as count FROM exams WHERE school_id = 101;
SELECT 'Exam Results' AS table_name, COUNT(*) as count FROM exam_results WHERE school_id = 101;

-- School config for school_id = 101
INSERT INTO school_config (school_id, campus_latitude, campus_longitude, campus_radius_meters, checkin_time)
VALUES (101, 12.9716, 77.5946, 200, '09:30:00')
ON CONFLICT (school_id) DO NOTHING;

SELECT 'School Config' AS table_name, COUNT(*) as count FROM school_config WHERE school_id = 101;
