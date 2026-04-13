const express = require("express");
const router = express.Router();

const unifiedController = require("./admin.admissions.unified.controller");
const { validateAdminRole } = require("../../../../middleware/auth.middleware");

// ============================================================
// UNIFIED SAVE DRAFT ROUTE
// ============================================================
// ONE endpoint for all sections: personal, academic, contact, address, parent, guardian, emergency, medical

router.post(
  "/admin/admissions/:studentId/save-draft",
  validateAdminRole,
  unifiedController.saveDraft
);

module.exports = router;
