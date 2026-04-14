const { Pool } = require('pg');

/**
 * Separate pg Pool pointing to auth_db.
 * Used exclusively by auth.middleware.js to check the token blacklist.
 * Falls back to main DB_* env vars if AUTH_DB_* are not set
 * (works when both services share the same Postgres instance).
 */
const authDbPool = new Pool({
  host:     process.env.AUTH_DB_HOST     || process.env.DB_HOST,
  port:     Number(process.env.AUTH_DB_PORT || process.env.DB_PORT),
  user:     process.env.AUTH_DB_USER     || process.env.DB_USER,
  password: process.env.AUTH_DB_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.AUTH_DB_NAME     || 'auth_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

authDbPool.on('error', (err) => {
  console.error('auth_db pool error (blacklist):', err);
});

module.exports = authDbPool;
