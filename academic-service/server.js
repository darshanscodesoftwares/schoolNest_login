require('dotenv').config({ path: '.env' });

const app = require('./src/app');
const pool = require('./src/config/db');
const authDbPool = require('./src/config/authDb');
const { startAutoTransitionJob } = require('./src/jobs/enquiry-auto-transition.job');

const PORT = process.env.PORT || 4002;

const server = app.listen(PORT, () => {
  console.log(`Academic service running on port ${PORT}`);
  // Start auto-transition job for enquiries
  startAutoTransitionJob();
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
