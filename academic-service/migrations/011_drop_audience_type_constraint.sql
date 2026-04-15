-- Migration: Drop all CHECK constraints on audience_type column

BEGIN;

-- Drop the specific constraint if it exists
ALTER TABLE announcements
DROP CONSTRAINT IF EXISTS announcements_audience_type_check;

-- Also drop any other check constraints on this column
ALTER TABLE announcements
DROP CONSTRAINT IF EXISTS check_audience_type;

-- Drop by name pattern if there are others
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'announcements'
        AND constraint_type = 'CHECK'
        AND constraint_name LIKE '%audience%'
    LOOP
        EXECUTE 'ALTER TABLE announcements DROP CONSTRAINT ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

COMMIT;
