require('dotenv').config();

const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const os = require('os');

/**
 * Get local IP address for logging
 */
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const localIP = getLocalIP();

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`\n🚀 SchoolNest Auth Service is running!\n`);
  console.log(`Local:   http://localhost:${PORT}`);
  console.log(`Network: http://${localIP}:${PORT}\n`);
  console.log(`Health check: http://${localIP}:${PORT}/health\n`);
});

/**
 * Graceful shutdown
 */
const shutdown = async () => {
  console.log('\n📴 Shutting down gracefully...');
  server.close(async () => {
    try {
      await pool.end();
      console.log('✓ Database connection closed');
      process.exit(0);
    } catch (error) {
      console.error('Error closing database:', error);
      process.exit(1);
    }
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
