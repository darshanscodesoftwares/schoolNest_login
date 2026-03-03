const express = require('express');
const authMiddleware = require('./middleware/auth.middleware');
const attendanceRoutes = require('./routes/attendance.routes');

const app = express();

app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'academic-service' });
});

app.use('/api/v1/academic', authMiddleware, attendanceRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || 'Internal server error'
  });
});

module.exports = app;
