-- Migration 023: Add academic_year support to timetable_period_config
-- Add academic_year column and update unique constraint

-- Step 1: Add academic_year column
ALTER TABLE timetable_period_config
ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) NOT NULL DEFAULT '2025-2026';

-- Step 2: Drop old constraint (without academic_year)
ALTER TABLE timetable_period_config
DROP CONSTRAINT IF EXISTS timetable_period_config_school_id_class_name_period_number_key;

-- Step 3: Add new constraint with academic_year
ALTER TABLE timetable_period_config
ADD CONSTRAINT timetable_period_config_school_id_class_name_academic_year_period_number_key
UNIQUE (school_id, class_name, academic_year, period_number);
