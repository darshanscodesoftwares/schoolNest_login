-- Migration: Change created_by and sender_id columns to VARCHAR

BEGIN;

-- Change created_by column type from UUID to VARCHAR to accept user IDs like "ADM001"
ALTER TABLE announcements
ALTER COLUMN created_by TYPE VARCHAR(255);

-- Change sender_id column type from UUID to VARCHAR if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'sender_id') THEN
    ALTER TABLE announcements ALTER COLUMN sender_id TYPE VARCHAR(255);
  END IF;
END $$;

COMMIT;
