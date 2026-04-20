const express = require('express');
const ctrl    = require('./admin.timetable.controller');

const router = express.Router();

// Period config (settings modal — applies to all sections of a class)
router.get('/period-config',  ctrl.getPeriodConfig);
router.put('/period-config',  ctrl.upsertPeriodConfig);

// Timetable grid — GET ?class_name=Class+12&section=A[&day=Monday]
router.get('/',               ctrl.getTimetableGrid);

// Individual cell (Edit Period modal)
router.put('/period',         ctrl.upsertPeriod);
router.delete('/period',      ctrl.deletePeriod);

// Publish / unpublish — makes timetable visible to teachers and parents
router.post('/publish',       ctrl.publish);
router.post('/unpublish',     ctrl.unpublish);

module.exports = router;
