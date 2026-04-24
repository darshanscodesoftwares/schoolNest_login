-- Migration 017: Sync existing manually-typed sections from academic_information
-- into section_templates and class_sections so the dropdown-based UI doesn't
-- break existing admission records.
--
-- Step 1: Ensure every section string already in use exists in section_templates.
--         (section_name is UNIQUE in section_templates, so ON CONFLICT DO NOTHING is safe)
INSERT INTO section_templates (section_name, order_number, is_default, is_active)
SELECT DISTINCT
  ai.section,
  999,      -- high order_number so custom sections sort last
  false,    -- not a default section
  true
FROM academic_information ai
WHERE ai.section IS NOT NULL
  AND ai.section <> ''
ON CONFLICT (section_name) DO NOTHING;

-- Step 2: Ensure every (class_id, section) combination already used in
--         academic_information also exists in class_sections so the dropdown
--         can pre-select the saved value.
INSERT INTO class_sections (school_id, class_id, section_template_id, section_name)
SELECT DISTINCT
  ai.school_id,
  ai.class_id,
  st.id,
  ai.section
FROM academic_information ai
JOIN section_templates st ON st.section_name = ai.section
WHERE ai.section IS NOT NULL
  AND ai.section <> ''
  AND ai.class_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM class_sections cs
    WHERE cs.school_id = ai.school_id
      AND cs.class_id  = ai.class_id
      AND cs.section_template_id = st.id
  );
