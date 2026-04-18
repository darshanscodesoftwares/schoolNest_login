-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id   SERIAL      PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE
);

-- Create users table with multi-tenant structure
-- id is VARCHAR(50) to support both short IDs (ADM001, PAR001) and UUIDs (for teachers)
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(50)  PRIMARY KEY,
  school_id     INT          NOT NULL,
  role_id       INT          NOT NULL REFERENCES roles(id),
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_users_email     ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_school_id ON users (school_id);

-- Token blacklist for logout/revocation
-- Note: user_id has NO foreign key constraint so logout never fails
-- even if user is deleted or doesn't exist in users table
CREATE TABLE IF NOT EXISTS token_blacklist (
  id         BIGSERIAL    PRIMARY KEY,
  user_id    VARCHAR(50)  NOT NULL,
  issued_at  BIGINT       NOT NULL,
  expires_at TIMESTAMPTZ  NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_token_blacklist_user_iat ON token_blacklist (user_id, issued_at);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires ON token_blacklist (expires_at);
