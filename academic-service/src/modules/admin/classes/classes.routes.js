const express = require('express');
const ctrl    = require('./classes.controller');

const router = express.Router();

// "Add New Class" popup — pick a class template + optional extra sections
router.post('/', ctrl.createClassWithSections);

// Bulk save: apply one section list to many classes in a single transaction.
// Must come before the /:classId routes so 'structure' isn't read as a UUID.
router.post('/structure', ctrl.bulkSaveStructure);

// Flat list of every (class + sections[]) pair for this school — used by FE
// pickers (subject teacher assignment, etc.). Must come before /:classId.
router.get('/structure', ctrl.getStructure);

// List every class this school has onboarded (with section_count)
router.get('/', ctrl.listClasses);

// Per-class section management. Order matters: :classId routes below the
// specific literal routes, so `/next-available` doesn't get swallowed.
router.get('/:classId/sections/next-available', ctrl.nextAvailableSection);
router.get('/:classId/sections',                ctrl.listSections);
router.post('/:classId/sections',               ctrl.attachSection);
router.delete('/:classId/sections/:classSectionId', ctrl.detachSection);
router.delete('/:classId', ctrl.deleteClass);

module.exports = router;
