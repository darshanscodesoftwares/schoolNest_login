const express = require("express");
const ctrl = require("./academic-years.controller");

const router = express.Router();

// Get all academic years for school
router.get("/", ctrl.getAllYears);

// Get currently active academic year
router.get("/active", ctrl.getActiveYear);

// Create new academic year manually
router.post("/", ctrl.createYear);

// Auto-generate next academic year
router.post("/auto-generate", ctrl.autoGenerateNextYear);

// Transition to next year (deactivate current, activate next)
router.post("/transition", ctrl.transitionYear);

module.exports = router;
