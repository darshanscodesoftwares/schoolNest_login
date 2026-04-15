-- Migration: Remove and recreate audience_type constraint properly

BEGIN;

-- Drop all existing constraints on audience_type
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find and drop all check constraints on audience_type column
    FOR constraint_name IN
        SELECT c.constraint_name
        FROM information_schema.table_constraints AS t
        JOIN information_schema.constraint_column_usage AS ccu ON t.constraint_name = ccu.constraint_name
        WHERE t.table_name = 'announcements'
        AND ccu.column_name = 'audience_type'
        AND t.constraint_type = 'CHECK'
    LOOP
        EXECUTE 'ALTER TABLE announcements DROP CONSTRAINT IF EXISTS ' || constraint_name;
    END LOOP;
END $$;

-- Now make sure the audience_type column exists and is VARCHAR
ALTER TABLE announcements
ALTER COLUMN audience_type TYPE VARCHAR(50);

-- Add a new, simpler constraint that accepts both formats
ALTER TABLE announcements
ADD CONSTRAINT check_audience_type
CHECK (audience_type IN ('Teachers', 'Parents', 'Both', 'all_teachers', 'parent', 'all_both', 'all_parents', 'all_both'));

COMMIT;
