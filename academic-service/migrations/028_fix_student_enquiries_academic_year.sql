-- Migration 028: Fix student_enquiries academic_year column
-- Change academic_year from VARCHAR(20) to UUID with foreign key reference to academic_years

-- Step 1: Drop existing constraint if it exists
ALTER TABLE student_enquiries
  DROP CONSTRAINT IF EXISTS student_enquiries_academic_year_fkey;

-- Step 2: Create a temporary UUID column to hold the new values
ALTER TABLE student_enquiries
  ADD COLUMN academic_year_id UUID;

-- Step 3: Migrate data from old varchar column to new UUID column
-- Maps year_name strings to academic_years.id UUIDs
UPDATE student_enquiries
SET academic_year_id = (
  SELECT ay.id
  FROM academic_years ay
  WHERE ay.year_name = student_enquiries.academic_year
  AND ay.school_id = student_enquiries.school_id
  LIMIT 1
)
WHERE academic_year IS NOT NULL AND academic_year != '';

-- Step 4: Drop the old VARCHAR column
ALTER TABLE student_enquiries
  DROP COLUMN academic_year;

-- Step 5: Rename the temporary UUID column to the original name
ALTER TABLE student_enquiries
  RENAME COLUMN academic_year_id TO academic_year;

-- Step 6: Add foreign key constraint to reference academic_years table
ALTER TABLE student_enquiries
  ADD CONSTRAINT student_enquiries_academic_year_fkey
  FOREIGN KEY (academic_year)
  REFERENCES academic_years(id)
  ON DELETE SET NULL;

-- Step 7: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_student_enquiries_academic_year
  ON student_enquiries(school_id, academic_year);
