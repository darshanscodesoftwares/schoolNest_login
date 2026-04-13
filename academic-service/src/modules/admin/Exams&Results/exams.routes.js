const express = require("express");
const examsController = require("./exams.controller");

const router = express.Router();

// Main exam routes
router.post("/exams", examsController.createExam);
router.get("/exams", examsController.getAllExams);
router.get("/exams/:examId", examsController.getExamById);
router.patch("/exams/:examId", examsController.updateExam);
router.put("/exams/:examId", examsController.updateExamUnified);
router.delete("/exams/:examId", examsController.deleteExam);

// Exam details routes
router.get("/exams/:examId/details", examsController.getExamDetails);
router.post("/exams/:examId/details", examsController.addExamDetail);
router.patch("/exams/details/:detailId", examsController.updateExamDetail);
router.delete("/exams/details/:detailId", examsController.deleteExamDetail);

// Exam status routes (place before generic :examId routes to avoid conflicts)
router.get("/exams/status/:status", examsController.getExamsByStatus);
router.patch("/exams/:examId/status", examsController.updateExamStatus);

// Result status routes
router.patch("/exams/details/:detailId/result-status", examsController.updateResultStatus);
router.get("/exams/result-status/summary", examsController.getResultStatusSummary);

module.exports = router;
