-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id   SERIAL      PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE
);

-- Create users table with multi-tenant structure
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(20)  PRIMARY KEY,
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
