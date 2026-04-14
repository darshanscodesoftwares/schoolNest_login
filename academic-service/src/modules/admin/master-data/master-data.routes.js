const express = require('express');
const controller = require('./master-data.controller');
const { validateAdminRole } = require('../../../middleware/auth.middleware');

const router = express.Router();

// All master-data routes require admin role
router.use(validateAdminRole);

// ONE-SHOT: fetch every lookup resource at once (for FE dropdowns & fast testing)
router.get('/admin/lookups/all',                controller.listAll);

// Generic CRUD over /admin/lookups/:resource
router.get('/admin/lookups/:resource',          controller.list);
router.get('/admin/lookups/:resource/:id',      controller.getById);
router.post('/admin/lookups/:resource',         controller.create);
router.put('/admin/lookups/:resource/:id',      controller.update);
router.delete('/admin/lookups/:resource/:id',   controller.remove);

// Local error handler — keeps generic shape across resources
router.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  res.status(status).json({
    success: false,
    code:    error.code || 'INTERNAL_ERROR',
    message: error.message || 'Internal server error',
  });
});

module.exports = router;
