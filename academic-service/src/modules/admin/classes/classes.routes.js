const express = require('express');
const ctrl    = require('./classes.controller');

const router = express.Router();

// "Add New Class" popup — pick a class template + optional extra sections
router.post('/', ctrl.createClassWithSections);

// List every class this school has onboarded (with section_count)
router.get('/', ctrl.listClasses);

// Per-class section management. Order matters: :classId routes below the
// specific literal routes, so `/next-available` doesn't get swallowed.
router.get('/:classId/sections/next-available', ctrl.nextAvailableSection);
router.get('/:classId/sections',                ctrl.listSections);
router.post('/:classId/sections',               ctrl.attachSection);
router.delete('/:classId/sections/:classSectionId', ctrl.detachSection);

module.exports = router;
