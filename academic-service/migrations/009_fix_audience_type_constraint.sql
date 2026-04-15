-- Migration: Fix audience_type CHECK constraint

BEGIN;

-- Drop the old constraint if it exists
ALTER TABLE announcements
DROP CONSTRAINT IF EXISTS announcements_audience_type_check;

-- Add the correct constraint that accepts the values used by the code
ALTER TABLE announcements
ADD CONSTRAINT announcements_audience_type_check
CHECK (audience_type IN ('Teachers', 'Parents', 'Both', 'all_teachers', 'parent', 'all_both'));

COMMIT;
