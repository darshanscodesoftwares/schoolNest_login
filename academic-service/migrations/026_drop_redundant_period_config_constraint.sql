-- Migration 026: Drop redundant period config constraint that blocks multi-section setup
--
-- Migration 023 created uq_period_config_with_year (school_id, class_name, academic_year,
-- period_number) — which was correct at the time. Migration 024 then added `section` to the
-- table and the new uq_period_config_with_section_year constraint, but never dropped the
-- now-redundant `_with_year` one. The leftover constraint (no section) blocks INSERT when
-- admin tries to configure periods for the same class+year but a different section
-- (e.g. Nursery 2025-2026 A and Nursery 2025-2026 B both having period 1).
--
-- This migration drops the obsolete constraint, leaving uq_period_config_with_section_year
-- as the single authoritative unique key.

ALTER TABLE timetable_period_config
DROP CONSTRAINT IF EXISTS uq_period_config_with_year;
