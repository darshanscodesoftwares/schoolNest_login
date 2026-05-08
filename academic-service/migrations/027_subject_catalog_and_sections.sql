-- Migration 027: Global subject catalog + section-aware subject teacher assignment
--
-- Three changes:
-- 1) New global subject_catalog table (super-admin owned, like class_templates)
-- 2) subjects.catalog_id FK so each school's subject row picks from the catalog
-- 3) subject_class_assign gains section_name (was previously per-class only,
--    silently covering all sections); explode existing rows to per-section
--    and tighten the unique key to include section.

-- ─── 1. subject_catalog ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subject_catalog (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_name  VARCHAR(100) UNIQUE NOT NULL,
  order_number  INT          NOT NULL DEFAULT 0,
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subject_catalog_active ON subject_catalog (is_active);

-- Seed the 14 canonical subjects (alphabetic order_number)
INSERT INTO subject_catalog (subject_name, order_number) VALUES
  ('Biology',            1),
  ('Chemistry',          2),
  ('Computer Science',   3),
  ('English',            4),
  ('French',             5),
  ('Geography',          6),
  ('Hindi',              7),
  ('History',            8),
  ('Maths',              9),
  ('Physical Education', 10),
  ('Physics',            11),
  ('Science',            12),
  ('Social Science',     13),
  ('Tamil',              14)
ON CONFLICT (subject_name) DO NOTHING;

-- ─── 2. subjects.catalog_id ────────────────────────────────────────────
ALTER TABLE subjects
  ADD COLUMN IF NOT EXISTS catalog_id UUID REFERENCES subject_catalog(id);

CREATE INDEX IF NOT EXISTS idx_subjects_catalog ON subjects (catalog_id);

-- Best-effort backfill: case-insensitive name match. Aliases handle Math→Maths.
UPDATE subjects s
SET catalog_id = sc.id
FROM subject_catalog sc
WHERE s.catalog_id IS NULL
  AND (
    LOWER(TRIM(s.subject_name)) = LOWER(sc.subject_name)
    OR (LOWER(TRIM(s.subject_name)) = 'math' AND sc.subject_name = 'Maths')
    OR (LOWER(TRIM(s.subject_name)) = 'social science' AND sc.subject_name = 'Social Science')
  );

-- ─── 3. subject_class_assign.section_name ──────────────────────────────
ALTER TABLE subject_class_assign
  ADD COLUMN IF NOT EXISTS section_name VARCHAR(50);

-- Explode existing rows: for each existing assignment, create one row per
-- section that belongs to that class in class_sections. The original row's
-- section_name is set to the first section encountered; additional rows are
-- inserted for the rest. Idempotent — the unique key prevents duplicates on
-- re-run.
DO $$
DECLARE
  rec RECORD;
  sec RECORD;
  first_section TEXT;
BEGIN
  FOR rec IN
    SELECT id, school_id, subject_id, class_id, teacher_id, sequence
    FROM subject_class_assign
    WHERE section_name IS NULL
  LOOP
    first_section := NULL;
    FOR sec IN
      SELECT cs.section_name
      FROM class_sections cs
      WHERE cs.school_id = rec.school_id AND cs.class_id = rec.class_id
      ORDER BY cs.section_name
    LOOP
      IF first_section IS NULL THEN
        first_section := sec.section_name;
        UPDATE subject_class_assign
        SET section_name = sec.section_name
        WHERE id = rec.id;
      ELSE
        INSERT INTO subject_class_assign
          (school_id, subject_id, class_id, teacher_id, sequence, section_name)
        VALUES
          (rec.school_id, rec.subject_id, rec.class_id, rec.teacher_id, rec.sequence, sec.section_name)
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
    -- If the class has no sections in class_sections, leave section_name NULL.
    -- These rows are orphans and should be cleaned up by admin via the EDIT flow.
  END LOOP;
END $$;

-- Tighten unique key to include section_name. Drop old key first.
ALTER TABLE subject_class_assign
  DROP CONSTRAINT IF EXISTS subject_class_assign_school_id_subject_id_class_id_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'subject_class_assign_unique_per_section'
  ) THEN
    ALTER TABLE subject_class_assign
    ADD CONSTRAINT subject_class_assign_unique_per_section
    UNIQUE (school_id, subject_id, class_id, section_name);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subject_class_assign_section
  ON subject_class_assign (school_id, class_id, section_name);
