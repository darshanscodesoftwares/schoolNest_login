require('dotenv').config();

const app = require('./src/app');
const pool = require('./src/config/db');
const authDbPool = require('./src/config/authDb');
const { startAutoTransitionJob } = require('./src/jobs/enquiry-auto-transition.job');

const PORT = process.env.PORT || 4002;
let autoTransitionJob = null;

// Migrations are manual — see CLAUDE.md for instructions.
// Do NOT add auto-migration here; it causes Render port-scan timeout.
const startServer = async () => {
  const server = app.listen(PORT, () => {
    console.log(`Academic service running on port ${PORT}`);

    // Start enquiry auto-transition cron job
    autoTransitionJob = startAutoTransitionJob();
  });

  const shutdown = async () => {
    console.log('Shutting down academic service...');

    // Stop the auto-transition job
    if (autoTransitionJob) {
      autoTransitionJob.stop();
      console.log('Auto-transition job stopped');
    }

    server.close(async () => {
      await Promise.all([pool.end(), authDbPool.end()]);
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer();
