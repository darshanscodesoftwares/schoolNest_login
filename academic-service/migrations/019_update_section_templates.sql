-- Migration 019: Replace A-series, B-series, and color sections with C-series
--
-- Removes: A1-A5, B1-B5, Red, Blue, Green, Yellow
-- Adds:    C1-C5 at order_number 10-14

-- Remove sections no longer offered
DELETE FROM section_templates
WHERE section_name IN (
  'A1','A2','A3','A4','A5',
  'B1','B2','B3','B4','B5',
  'Red','Blue','Green','Yellow'
);

-- Add C-series
INSERT INTO section_templates (section_name, order_number, is_default) VALUES
  ('C1', 10, false),
  ('C2', 11, false),
  ('C3', 12, false),
  ('C4', 13, false),
  ('C5', 14, false)
ON CONFLICT (section_name) DO NOTHING;
