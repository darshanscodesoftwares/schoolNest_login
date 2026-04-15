-- Migration: Add missing columns to announcements table

BEGIN;

-- Add missing columns to announcements table
ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS created_by UUID;

ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS audience VARCHAR(50) DEFAULT 'Both';

ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS scope VARCHAR(50) DEFAULT 'Whole School';

ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT FALSE;

ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Draft';

ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_announcements_school;
DROP INDEX IF EXISTS idx_announcements_sender;

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_announcements_school ON announcements(school_id);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(school_id, status);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(school_id, created_at DESC);

COMMIT;
