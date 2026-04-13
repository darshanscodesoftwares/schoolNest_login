const express = require("express");
const sectionsController = require("./sections.controller");

const router = express.Router();

// GET /sections/classes-sections - Get all classes with their sections
router.get(
  "/sections/classes-sections",
  sectionsController.getClassesSections
);

// GET /sections/all - Get all sections for a school
router.get("/sections/all", sectionsController.getAllSections);

// GET /sections/class/:classId - Get sections for a specific class
router.get(
  "/sections/class/:classId",
  sectionsController.getSectionsByClass
);

module.exports = router;
