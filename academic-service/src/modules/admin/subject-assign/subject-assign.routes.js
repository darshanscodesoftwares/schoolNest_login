const express = require("express");
const subjectAssignController = require("./subject-assign.controller");

const router = express.Router();

// POST /subject-assign - Create subject with batch class assignments
router.post("/subject-assign", subjectAssignController.createSubject);

// GET /subject-assign - Get all subjects with assignments
router.get("/subject-assign", subjectAssignController.getAllSubjects);

// Specific routes MUST be defined before generic :subjectId/:classId routes
// to prevent path conflicts (Express matches routes in order)

// GET /subject-assign/classes/full-list - Get all classes with subjects and teachers
router.get(
  "/subject-assign/classes/full-list",
  subjectAssignController.getAllClassesWithSubjectsAndTeachers
);

// GET /subject-assign/class/:classId - Get all subjects and teachers for a class
router.get(
  "/subject-assign/class/:classId",
  subjectAssignController.getSubjectsAndTeachersByClass
);

// PATCH /subject-assign/class/:classId/subject/:subjectId - Update teacher for subject in class
router.patch(
  "/subject-assign/class/:classId/subject/:subjectId",
  subjectAssignController.updateTeacherByClassAndSubject
);

// PATCH /subject-assign/assignment/:assignmentId - Update assignment (change teacher)
router.patch(
  "/subject-assign/assignment/:assignmentId",
  subjectAssignController.updateAssignment
);

// DELETE /subject-assign/assignment/:assignmentId - Delete assignment
router.delete(
  "/subject-assign/assignment/:assignmentId",
  subjectAssignController.deleteAssignment
);

// Generic subject routes (must come after assignment-specific routes)

// GET /subject-assign/:subjectId - Get subject by ID with assignments
router.get("/subject-assign/:subjectId", subjectAssignController.getSubjectById);

// PATCH /subject-assign/:subjectId - Update subject name
router.patch("/subject-assign/:subjectId", subjectAssignController.updateSubject);

// DELETE /subject-assign/:subjectId - Delete subject (cascades to assignments)
router.delete("/subject-assign/:subjectId", subjectAssignController.deleteSubject);

module.exports = router;
