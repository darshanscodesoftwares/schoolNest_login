const { Pool } = require('pg');

// auth-db pool — connects to auth_db for bridge operations:
// Bridge 1: admin creates teacher → INSERT into auth_db.users (so teacher can email-login)
// Bridge 2: admission approved  → INSERT parent into auth_db.users (so parent can login)

const authPool = new Pool({
  host: process.env.AUTH_DB_HOST || process.env.DB_HOST,
  port: Number(process.env.AUTH_DB_PORT || process.env.DB_PORT),
  user: process.env.AUTH_DB_USER || process.env.DB_USER,
  password: process.env.AUTH_DB_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.AUTH_DB_NAME || 'auth_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

authPool.on('error', (err) => {
  console.error('PostgreSQL auth-db pool error:', err);
});

module.exports = authPool;
