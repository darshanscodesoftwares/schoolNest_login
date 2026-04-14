const express = require('express');
const cors = require('cors');
require('dotenv').config();

const classRoutes = require('./routes/class.routes');
const enquirySourceRoutes = require('./routes/enquiry-source.routes');
const departmentRoutes = require('./routes/department.routes');
const bloodGroupRoutes = require('./routes/blood-group.routes');
const licenseTypesRoutes = require('./modules/master-data/license-types/license-types.routes');
const staffRolesRoutes = require('./modules/master-data/staff-roles/staff-roles.routes');
const staffDepartmentsRoutes = require('./modules/master-data/staff-departments/staff-departments.routes');
const staffPositionsRoutes = require('./modules/master-data/staff-positions/staff-positions.routes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/enquiry-sources', enquirySourceRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/blood-groups', bloodGroupRoutes);
app.use('/api/v1', licenseTypesRoutes);
app.use('/api/v1', staffRolesRoutes);
app.use('/api/v1', staffDepartmentsRoutes);
app.use('/api/v1', staffPositionsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'common-api',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'ROUTE_NOT_FOUND'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    code: error.code || 'INTERNAL_ERROR'
  });
});

module.exports = app;
