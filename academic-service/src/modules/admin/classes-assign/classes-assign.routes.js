const express = require("express");
const classesAssignController = require("./classes-assign.controller");

const router = express.Router();

// SPECIFIC ROUTES FIRST (before parameterized routes)
// GET /classes-assign/sections - Get all unique sections
router.get("/classes-assign/sections", classesAssignController.getAllSections);

// GET /classes-assign/class - Get all unique classes
router.get("/classes-assign/class", classesAssignController.getAllClasses);

// GET /teachers-list - Get all active teachers list for a school
router.get("/teachers-list", classesAssignController.getTeachersList);

// GET /parents-list - Get all parents list for a school
router.get("/parents-list", classesAssignController.getParentsList);

// GET /classes-assign/by-class - Get assignments for a specific class
router.get("/classes-assign/by-class", classesAssignController.getAssignmentsByClass);

// GENERIC/PARAMETERIZED ROUTES (after specific routes)
// POST /classes-assign - Create batch assignments for a class
router.post("/classes-assign", classesAssignController.createAssignments);

// GET /classes-assign - Get all assignments (with school_id query param)
router.get("/classes-assign", classesAssignController.getAllAssignments);

// GET /classes-assign/:assignmentId - Get single assignment
router.get("/classes-assign/:assignmentId", classesAssignController.getAssignmentById);

// PATCH /classes-assign/:assignmentId - Update assignment
router.patch("/classes-assign/:assignmentId", classesAssignController.updateAssignment);

// DELETE /classes-assign/:assignmentId - Delete assignment
router.delete("/classes-assign/:assignmentId", classesAssignController.deleteAssignment);

module.exports = router;
