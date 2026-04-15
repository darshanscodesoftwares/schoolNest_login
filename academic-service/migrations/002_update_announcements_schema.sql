-- Migration: Update announcements schema to support recipient types
-- This migration adds missing columns to announcement_recipients table

BEGIN;

-- Drop old indexes
DROP INDEX IF EXISTS idx_ann_recipients_recipient;
DROP INDEX IF EXISTS idx_ann_recipients_announcement;

-- Drop the old announcement_recipients table
DROP TABLE IF EXISTS announcement_recipients;

-- Recreate announcements table with correct schema
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INT NOT NULL,
  created_by UUID NOT NULL,
  title VARCHAR(255),
  message TEXT NOT NULL,
  audience VARCHAR(50) NOT NULL CHECK (audience IN ('Teachers', 'Parents', 'Both')),
  scope VARCHAR(50) NOT NULL CHECK (scope IN ('Whole School', 'By Class', 'Specific Users')),
  is_important BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Scheduled')),
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_announcements_school ON announcements(school_id);
CREATE INDEX idx_announcements_status ON announcements(school_id, status);
CREATE INDEX idx_announcements_created_by ON announcements(created_by);
CREATE INDEX idx_announcements_created_at ON announcements(school_id, created_at DESC);

-- Recreate announcement_recipients table with all required columns
CREATE TABLE IF NOT EXISTS announcement_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INT NOT NULL,
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  recipient_type VARCHAR(50) NOT NULL CHECK (recipient_type IN ('Teacher', 'Parent', 'Class')),
  recipient_id UUID NOT NULL,
  teacher_id UUID,
  parent_id UUID,
  class_id UUID,
  read_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_announcement_recipients_school ON announcement_recipients(school_id);
CREATE INDEX idx_announcement_recipients_announcement ON announcement_recipients(announcement_id);
CREATE INDEX idx_announcement_recipients_recipient ON announcement_recipients(school_id, recipient_type, recipient_id);
CREATE INDEX idx_announcement_recipients_teacher ON announcement_recipients(school_id, teacher_id);
CREATE INDEX idx_announcement_recipients_parent ON announcement_recipients(school_id, parent_id);
CREATE INDEX idx_announcement_recipients_class ON announcement_recipients(school_id, class_id);
CREATE INDEX idx_announcement_recipients_unread ON announcement_recipients(school_id, read_at) WHERE read_at IS NULL;

-- Create announcement_classes linking table
CREATE TABLE IF NOT EXISTS announcement_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id INT NOT NULL,
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  class_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(announcement_id, class_id)
);

CREATE INDEX idx_announcement_classes_school ON announcement_classes(school_id);
CREATE INDEX idx_announcement_classes_announcement ON announcement_classes(announcement_id);
CREATE INDEX idx_announcement_classes_class ON announcement_classes(class_id);

-- Create announcement_history audit table
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

CREATE INDEX idx_announcement_history_school ON announcement_history(school_id);
CREATE INDEX idx_announcement_history_announcement ON announcement_history(announcement_id);
CREATE INDEX idx_announcement_history_sent_at ON announcement_history(school_id, sent_at DESC);

COMMIT;
