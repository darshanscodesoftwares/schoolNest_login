const { Pool, types } = require('pg');

// Return DATE as plain string (e.g. "2026-03-09") — prevents UTC offset shift
types.setTypeParser(1082, val => val);
// Return TIMESTAMP as 12-hour IST string (e.g. "2026-03-09 05:49 PM")
const formatTo12Hour = (val) => {
  if (!val) return val;
  const [datePart, timePart] = val.split(' ');
  const [hours, minutes] = timePart.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${datePart} ${String(h12).padStart(2, '0')}:${minutes} ${ampm}`;
};
types.setTypeParser(1114, formatTo12Hour);
types.setTypeParser(1184, formatTo12Hour);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false
});

pool.on('connect', (client) => {
  client.query("SET timezone = 'Asia/Kolkata'");
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

module.exports = pool;
