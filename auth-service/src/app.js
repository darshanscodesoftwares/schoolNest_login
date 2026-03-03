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
  return res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  return res.status(statusCode).json({ message });
});

module.exports = app;
