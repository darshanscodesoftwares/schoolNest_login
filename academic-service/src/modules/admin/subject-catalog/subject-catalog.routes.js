const express = require('express');
const ctrl = require('./subject-catalog.controller');

const router = express.Router();

// Global subject catalog (super-admin owned, like class_templates).
// Schools pick from this list — they cannot create their own subjects.
router.get('/subject-catalog',       ctrl.list);
router.post('/subject-catalog',      ctrl.create);
router.patch('/subject-catalog/:id', ctrl.update);

module.exports = router;
