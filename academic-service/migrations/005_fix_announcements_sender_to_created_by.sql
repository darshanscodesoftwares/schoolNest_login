-- Migration: Fix announcements table - rename sender_id to created_by

BEGIN;

-- Check if sender_id exists and rename it to created_by
DO $$
BEGIN
  -- Drop the constraint from sender_id if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'sender_id') THEN

    -- Rename sender_id to created_by
    ALTER TABLE announcements RENAME COLUMN sender_id TO created_by;

  END IF;
END $$;

-- Now make sure created_by column exists
ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Make sure all required columns exist with correct types
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

-- Drop old sender index if it exists
DROP INDEX IF EXISTS idx_announcements_sender;

-- Create proper indexes
CREATE INDEX IF NOT EXISTS idx_announcements_school ON announcements(school_id);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(school_id, status);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(school_id, created_at DESC);

COMMIT;
