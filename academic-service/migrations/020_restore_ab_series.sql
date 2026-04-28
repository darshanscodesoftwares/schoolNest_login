-- Migration 020: Restore A-series and B-series section templates

INSERT INTO section_templates (section_name, order_number, is_default) VALUES
  ('A1', 10, false), ('A2', 11, false), ('A3', 12, false), ('A4', 13, false), ('A5', 14, false),
  ('B1', 20, false), ('B2', 21, false), ('B3', 22, false), ('B4', 23, false), ('B5', 24, false)
ON CONFLICT (section_name) DO NOTHING;

-- Shift C-series to order_number 30-34 to keep A/B/C in order
UPDATE section_templates SET order_number = 30 WHERE section_name = 'C1';
UPDATE section_templates SET order_number = 31 WHERE section_name = 'C2';
UPDATE section_templates SET order_number = 32 WHERE section_name = 'C3';
UPDATE section_templates SET order_number = 33 WHERE section_name = 'C4';
UPDATE section_templates SET order_number = 34 WHERE section_name = 'C5';
