const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (_req, res) => {
  return res.status(200).json({ status: 'ok', service: 'auth-service' });
});

// Routes
app.use('/api/v1/auth', authRoutes);

// 404 handler
app.use((_req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'ROUTE_NOT_FOUND'
  });
});

// Global error handler (Frontend-friendly)
app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const isSuccess = statusCode < 400;

  return res.status(statusCode).json({
    success: isSuccess,
    message: error.message || 'Internal server error',
    code: error.code || (statusCode === 500 ? 'INTERNAL_ERROR' : 'UNKNOWN_ERROR'),
    details: error.details || null,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
