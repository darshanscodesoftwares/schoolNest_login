-- Migration 021: Class Definitions with Academic Year
-- Creates a central lookup table for timetable system
-- Maps class_name + section + academic_year for admin-managed timetables

CREATE TABLE IF NOT EXISTS class_definitions (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       INT          NOT NULL,
  class_name      VARCHAR(50)  NOT NULL,
  section         VARCHAR(10)  NOT NULL,
  academic_year   VARCHAR(20)  NOT NULL,
  is_active       BOOLEAN      NOT NULL DEFAULT true,
  created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE (school_id, class_name, section, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_class_definitions_school
  ON class_definitions (school_id);

CREATE INDEX IF NOT EXISTS idx_class_definitions_class_section
  ON class_definitions (school_id, class_name, section);

CREATE INDEX IF NOT EXISTS idx_class_definitions_academic_year
  ON class_definitions (school_id, academic_year);

-- Update timetable to reference class_definitions instead of just class_name/section
ALTER TABLE timetable
  ADD COLUMN IF NOT EXISTS class_definition_id UUID REFERENCES class_definitions(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_timetable_class_definition
  ON timetable (class_definition_id);

-- Update timetable_period_config to support academic_year
ALTER TABLE timetable_period_config
  ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20);

-- Create new unique constraint for period config with academic_year
-- (Keep old constraint for backward compatibility)
DO $$
BEGIN
  BEGIN
    ALTER TABLE timetable_period_config
      ADD CONSTRAINT uq_period_config_with_year
      UNIQUE (school_id, class_name, academic_year, period_number);
  EXCEPTION WHEN duplicate_object THEN
    -- Constraint already exists
    NULL;
  END;
END $$;

