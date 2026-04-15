-- Migration: Add class_id column to announcements table

BEGIN;

-- Add class_id column to announcements table
ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS class_id UUID;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_announcements_class ON announcements(school_id, class_id);

COMMIT;
