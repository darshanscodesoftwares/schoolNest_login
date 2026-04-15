require('dotenv').config();

const app = require('./src/app');
const pool = require('./src/config/db');
const authDbPool = require('./src/config/authDb');
const runMigrations = require('./src/utils/runMigrations');

const PORT = process.env.PORT || 4002;

// Run migrations before starting the server
const startServer = async () => {
  try {
    console.log('Running database migrations...');
    await runMigrations();
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error.message);
  }

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
