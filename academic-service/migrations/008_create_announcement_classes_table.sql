-- Migration: Create announcement_classes table

BEGIN;

-- Create announcement_classes linking table if it doesn't exist
CREATE TABLE IF NOT EXISTS announcement_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INT NOT NULL,
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  class_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(announcement_id, class_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_announcement_classes_school ON announcement_classes(school_id);
CREATE INDEX IF NOT EXISTS idx_announcement_classes_announcement ON announcement_classes(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_classes_class ON announcement_classes(class_id);

COMMIT;
