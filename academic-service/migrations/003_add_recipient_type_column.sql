-- Migration: Add missing columns to announcement_recipients table
-- This migration adds the recipient_type column which is needed for the compose endpoint

BEGIN;

-- Add recipient_type column if it doesn't exist
ALTER TABLE announcement_recipients
ADD COLUMN IF NOT EXISTS recipient_type VARCHAR(50) DEFAULT 'Teacher';

-- Add constraint for recipient_type
ALTER TABLE announcement_recipients
ADD CONSTRAINT check_recipient_type CHECK (recipient_type IN ('Teacher', 'Parent', 'Class'));

-- Add other missing columns
ALTER TABLE announcement_recipients
ADD COLUMN IF NOT EXISTS teacher_id UUID;

ALTER TABLE announcement_recipients
ADD COLUMN IF NOT EXISTS parent_id UUID;

ALTER TABLE announcement_recipients
ADD COLUMN IF NOT EXISTS class_id UUID;

ALTER TABLE announcement_recipients
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Rename is_read to read_at if it exists and read_at doesn't
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcement_recipients' AND column_name = 'is_read')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcement_recipients' AND column_name = 'read_at')
  THEN
    ALTER TABLE announcement_recipients RENAME COLUMN is_read TO read_at;
    ALTER TABLE announcement_recipients ALTER COLUMN read_at TYPE TIMESTAMPTZ USING CASE WHEN read_at IS TRUE THEN NOW() ELSE NULL END;
  END IF;
END $$;

-- Add created_at if it doesn't exist
ALTER TABLE announcement_recipients
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_ann_recipients_recipient;
DROP INDEX IF EXISTS idx_ann_recipients_announcement;

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_announcement_recipients_school ON announcement_recipients(school_id);
CREATE INDEX IF NOT EXISTS idx_announcement_recipients_announcement ON announcement_recipients(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_recipients_recipient ON announcement_recipients(school_id, recipient_type, recipient_id);
CREATE INDEX IF NOT EXISTS idx_announcement_recipients_teacher ON announcement_recipients(school_id, teacher_id);
CREATE INDEX IF NOT EXISTS idx_announcement_recipients_parent ON announcement_recipients(school_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_announcement_recipients_class ON announcement_recipients(school_id, class_id);

COMMIT;
