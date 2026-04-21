const express = require('express');
const ctrl    = require('./class-templates.controller');

const router = express.Router();

// Populates the "Select Class" dropdown in the Add New Class popup.
// POST/PATCH/DELETE intentionally omitted — future super-admin portal.
router.get('/', ctrl.list);

module.exports = router;
