-- Migration 022: Academic Years Management
-- Auto-generate academic years for school admin

CREATE TABLE IF NOT EXISTS academic_years (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       INT          NOT NULL,
  year_name       VARCHAR(20)  NOT NULL,
  start_date      DATE         NOT NULL,
  end_date        DATE         NOT NULL,
  is_active       BOOLEAN      NOT NULL DEFAULT true,
  created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE (school_id, year_name)
);

CREATE INDEX IF NOT EXISTS idx_academic_years_school
  ON academic_years (school_id);

CREATE INDEX IF NOT EXISTS idx_academic_years_active
  ON academic_years (school_id, is_active);
