-- Migration: Create file_storage table for storing uploaded files in PostgreSQL

BEGIN;

CREATE TABLE IF NOT EXISTS file_storage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_name VARCHAR(100),
  original_name VARCHAR(255),
  mime_type VARCHAR(100) NOT NULL,
  file_size INT,
  file_data BYTEA NOT NULL,
  school_id INT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_file_storage_school ON file_storage(school_id);
CREATE INDEX IF NOT EXISTS idx_file_storage_created_at ON file_storage(created_at DESC);

COMMIT;
