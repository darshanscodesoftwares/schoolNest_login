-- Add enquiry_id column to students_admission table to link admissions to enquiries
ALTER TABLE students_admission
ADD COLUMN IF NOT EXISTS enquiry_id UUID;

-- Add foreign key constraint if needed
ALTER TABLE students_admission
ADD CONSTRAINT fk_enquiry_id FOREIGN KEY (enquiry_id)
REFERENCES student_enquiries(id) ON DELETE SET NULL;
