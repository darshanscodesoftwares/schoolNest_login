-- Migration 024: Add section column to timetable_period_config
-- Make periods specific to each section (per class, per year, per section)

-- Step 1: Add section column
ALTER TABLE timetable_period_config
ADD COLUMN IF NOT EXISTS section VARCHAR(10) NOT NULL DEFAULT 'A';

-- Step 2: Drop old constraint (without section)
ALTER TABLE timetable_period_config
DROP CONSTRAINT IF EXISTS timetable_period_config_school_id_class_name_academic_year_period_number_key;

-- Step 3: Add new constraint with section
ALTER TABLE timetable_period_config
ADD CONSTRAINT timetable_period_config_school_id_class_name_section_academic_year_period_number_key
UNIQUE (school_id, class_name, section, academic_year, period_number);
