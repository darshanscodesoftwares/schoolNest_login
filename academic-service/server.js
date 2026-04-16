require('dotenv').config();

const app = require('./src/app');
const pool = require('./src/config/db');
const authDbPool = require('./src/config/authDb');

const PORT = process.env.PORT || 4002;

// Migrations are manual — see CLAUDE.md for instructions.
// Do NOT add auto-migration here; it causes Render port-scan timeout.
const startServer = async () => {
  const server = app.listen(PORT, () => {
    console.log(`Academic service running on port ${PORT}`);
  });

  const shutdown = async () => {
    console.log('Shutting down academic service...');
    server.close(async () => {
      await Promise.all([pool.end(), authDbPool.end()]);
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer();
