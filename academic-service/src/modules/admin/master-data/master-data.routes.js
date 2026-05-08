const express = require('express');
const controller = require('./master-data.controller');
const { validateAdminRole } = require('../../../middleware/auth.middleware');

const router = express.Router();

// All master-data routes require admin role
router.use(validateAdminRole);

// Subjects are now globally managed via /admin/subject-catalog. Block all
// per-school write operations on the legacy /lookups/subjects endpoint with
// 410 Gone — GET remains for back-compat reads.
const blockSubjectsWrites = (req, res, next) => {
  if (req.params.resource === 'subjects') {
    return res.status(410).json({
      success: false,
      code:    'GONE',
      message: 'Subjects are now globally managed. Use /api/v1/academic/admin/subject-catalog instead.'
    });
  }
  return next();
};

// ONE-SHOT: fetch every lookup resource at once (for FE dropdowns & fast testing)
router.get('/admin/lookups/all',                controller.listAll);

// Generic CRUD over /admin/lookups/:resource
router.get('/admin/lookups/:resource',          controller.list);
router.get('/admin/lookups/:resource/:id',      controller.getById);
router.post('/admin/lookups/:resource',         blockSubjectsWrites, controller.create);
router.put('/admin/lookups/:resource/:id',      blockSubjectsWrites, controller.update);
router.delete('/admin/lookups/:resource/:id',   blockSubjectsWrites, controller.remove);

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
