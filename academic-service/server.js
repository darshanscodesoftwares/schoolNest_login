require('dotenv').config();

const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 4002;

const server = app.listen(PORT, () => {
  console.log(`Academic service running on port ${PORT}`);
});

const shutdown = async () => {
  console.log('Shutting down academic service...');
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
