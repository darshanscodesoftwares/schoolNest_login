-- Migration 015: Class & Section Templates + per-class section binding
--
-- Introduces super-admin-owned global templates for classes and sections.
-- Schools pick from these templates via the new "Add New Class" popup.
-- See /home/rv/.claude/plans/so-ok-thats-that-idempotent-stroustrup.md for
-- the full design rationale.

-- ─────────────────────────────────────────────────────────────────────────
-- class_templates: global catalogue (no school_id — shared across tenants).
-- Future super-admin portal will CRUD this table. For now, seeded only.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS class_templates (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name    VARCHAR(50)  NOT NULL UNIQUE,
  order_number  INT          NOT NULL DEFAULT 0,
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO class_templates (class_name, order_number) VALUES
  ('Nursery',  1), ('LKG',      2), ('UKG',      3),
  ('Class 1',  4), ('Class 2',  5), ('Class 3',  6),
  ('Class 4',  7), ('Class 5',  8), ('Class 6',  9),
  ('Class 7', 10), ('Class 8', 11), ('Class 9', 12),
  ('Class 10',13), ('Class 11',14), ('Class 12',15)
ON CONFLICT (class_name) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────
-- section_templates: global catalogue (no school_id — shared across tenants).
-- is_default=true means this section is auto-attached to every new class and
-- cannot be detached by the school admin.
-- Future super-admin portal will CRUD this table. For now, seeded only.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS section_templates (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name  VARCHAR(10)  NOT NULL UNIQUE,
  order_number  INT          NOT NULL DEFAULT 0,
  is_default    BOOLEAN      NOT NULL DEFAULT false,
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO section_templates (section_name, order_number, is_default) VALUES
  -- Immutable defaults — auto-attached to every new class
  ('A',  1, true), ('B',  2, true), ('C',  3, true), ('D',  4, true),
  -- Optional letter sections
  ('E',  5, false), ('F',  6, false),
  -- A-series slot sections
  ('A1', 10, false), ('A2', 11, false), ('A3', 12, false), ('A4', 13, false), ('A5', 14, false),
  -- B-series slot sections
  ('B1', 20, false), ('B2', 21, false), ('B3', 22, false), ('B4', 23, false), ('B5', 24, false),
  -- Colour-house sections (common in Indian schools)
  ('Red', 30, false), ('Blue', 31, false), ('Green', 32, false), ('Yellow', 33, false)
ON CONFLICT (section_name) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────
-- Link school_classes rows to a template (nullable — supports legacy rows
-- without a template origin, and custom-name classes created pre-template).
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE school_classes
  ADD COLUMN IF NOT EXISTS template_id UUID
    REFERENCES class_templates(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- class_sections: per-class section binding.
-- "A" for Class 1 and "A" for Class 2 are separate rows, both pointing at
-- the same section_templates record. section_name is denormalised from the
-- template for fast reads.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS class_sections (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id            INT          NOT NULL,
  class_id             UUID         NOT NULL REFERENCES school_classes(id) ON DELETE CASCADE,
  section_template_id  UUID         NOT NULL REFERENCES section_templates(id) ON DELETE RESTRICT,
  section_name         VARCHAR(10)  NOT NULL,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (school_id, class_id, section_template_id)
);

CREATE INDEX IF NOT EXISTS idx_class_sections_class ON class_sections(school_id, class_id);
