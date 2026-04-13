const express = require("express");
const composeController = require("./compose.controller");

const router = express.Router();

// GET /api/v1/academic/admin/announcements/compose/classes/all
// Get all classes for dropdown
router.get("/classes/all", composeController.getAllClasses);

// GET /api/v1/academic/admin/announcements/compose
// Get all announcements
router.get("/", composeController.getAllAnnouncements);

// POST /api/v1/academic/admin/announcements/compose
// Send announcement immediately
router.post("/", composeController.sendAnnouncement);

// POST /api/v1/academic/admin/announcements/compose/save-draft
// Save announcement as draft
router.post("/save-draft", composeController.saveDraft);

// DELETE /api/v1/academic/admin/announcements/compose
// Delete all announcements for the school
router.delete("/", composeController.deleteAllAnnouncements);

// GET /api/v1/academic/admin/announcements/compose/:id
// Get announcement by ID
router.get("/:id", composeController.getAnnouncementById);

// PUT /api/v1/academic/admin/announcements/compose/:id
// Update announcement (only if status is Draft)
router.put("/:id", composeController.updateAnnouncement);

// DELETE /api/v1/academic/admin/announcements/compose/:id
// Delete announcement by ID
router.delete("/:id", composeController.deleteAnnouncement);

module.exports = router;
