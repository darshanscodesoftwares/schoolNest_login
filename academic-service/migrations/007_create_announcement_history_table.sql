-- Migration: Create announcement_history table

BEGIN;

-- Create announcement_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS announcement_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INT NOT NULL,
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  total_recipients INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Sent' CHECK (status IN ('Pending', 'Sent', 'Failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_announcement_history_school ON announcement_history(school_id);
CREATE INDEX IF NOT EXISTS idx_announcement_history_announcement ON announcement_history(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_history_sent_at ON announcement_history(school_id, sent_at DESC);

COMMIT;
