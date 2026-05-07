-- Fix period config constraint to include section and academic_year
-- Drop the old incorrect constraint if it exists
ALTER TABLE timetable_period_config
DROP CONSTRAINT IF EXISTS timetable_period_config_school_id_class_name_period_number_key;

-- Ensure the correct constraint exists.
-- Postgres has no `ADD CONSTRAINT IF NOT EXISTS` syntax, so we guard with a DO block.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_period_config_with_section_year'
  ) THEN
    ALTER TABLE timetable_period_config
    ADD CONSTRAINT uq_period_config_with_section_year
    UNIQUE (school_id, class_name, section, academic_year, period_number);
  END IF;
END $$;
