const { Pool } = require('pg');

const academicPool = new Pool({
  host: process.env.ACADEMIC_DB_HOST || process.env.DB_HOST,
  port: Number(process.env.ACADEMIC_DB_PORT || process.env.DB_PORT),
  user: process.env.ACADEMIC_DB_USER || process.env.DB_USER,
  password: process.env.ACADEMIC_DB_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.ACADEMIC_DB_NAME || 'academic_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

academicPool.on('error', (err) => {
  console.error('PostgreSQL academic-db pool error:', err);
});

module.exports = academicPool;
