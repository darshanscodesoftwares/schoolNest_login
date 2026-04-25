-- Migration 018: Backfill order_number on school_classes from class_templates
--
-- Existing school_classes rows were created without copying order_number
-- from the class_template, so they default to 0. This causes incorrect
-- sort order in dropdowns (e.g. Class 10 before Class 2).

-- Match by template_id (for rows created via template picker)
UPDATE school_classes sc
SET order_number = ct.order_number
FROM class_templates ct
WHERE sc.template_id = ct.id
  AND (sc.order_number IS NULL OR sc.order_number = 0);

-- Match by class_name (for legacy rows without template_id)
UPDATE school_classes sc
SET order_number = ct.order_number,
    template_id  = ct.id
FROM class_templates ct
WHERE sc.template_id IS NULL
  AND sc.class_name = ct.class_name;
