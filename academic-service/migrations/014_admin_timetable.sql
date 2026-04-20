-- Migration 014: Admin timetable CRUD support
-- Add class_name, section, status to timetable; create timetable_period_config

-- Step 1: Add admin-managed columns
ALTER TABLE timetable
  ADD COLUMN IF NOT EXISTS class_name VARCHAR(50),
  ADD COLUMN IF NOT EXISTS section    VARCHAR(10),
  ADD COLUMN IF NOT EXISTS status     VARCHAR(20) NOT NULL DEFAULT 'DRAFT';

-- Step 2: Allow class_id to be NULL (new admin rows won't have a classes FK)
ALTER TABLE timetable ALTER COLUMN class_id DROP NOT NULL;

-- Step 3: Drop old unique constraint (was keyed on class_id which is now nullable)
ALTER TABLE timetable DROP CONSTRAINT IF EXISTS uq_timetable;

-- Step 4: New unique constraint keyed on class_name + section
ALTER TABLE timetable
  ADD CONSTRAINT uq_timetable_admin
  UNIQUE (school_id, class_name, section, day_of_week, period_number);

-- Step 5: Create period config table (one row per slot per class_name, shared across all sections)
CREATE TABLE IF NOT EXISTS timetable_period_config (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     INT          NOT NULL,
  class_name    VARCHAR(50)  NOT NULL,
  period_number INT          NOT NULL,
  label         VARCHAR(50)  NOT NULL DEFAULT '',
  is_break      BOOLEAN      NOT NULL DEFAULT false,
  start_time    TIME         NOT NULL,
  end_time      TIME         NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE (school_id, class_name, period_number)
);

CREATE INDEX IF NOT EXISTS idx_period_config_school_class
  ON timetable_period_config (school_id, class_name);
