const express = require('express');
const authMiddleware = require('./middleware/auth.middleware');
const attendanceRoutes = require('./modules/teacher/attendance/teacher.attendance.routes');
const parentRoutes = require('./modules/parent/attendance/parent.attendance.routes');
const parentTimetableRoutes = require('./modules/parent/timetable/parent.timetable.routes');

const app = express();

app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'academic-service' });
});

app.use('/api/v1/academic', authMiddleware, attendanceRoutes);
app.use('/api/v1/academic', authMiddleware, parentTimetableRoutes);
app.use('/api/v1/parent', authMiddleware, parentRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'ROUTE_NOT_FOUND'
  });
});

// Global error handler (Frontend-friendly)
app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const isSuccess = statusCode < 400;

  res.status(statusCode).json({
    success: isSuccess,
    message: error.message || 'Internal server error',
    code: error.code || (statusCode === 500 ? 'INTERNAL_ERROR' : 'UNKNOWN_ERROR'),
    details: error.details || null,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
