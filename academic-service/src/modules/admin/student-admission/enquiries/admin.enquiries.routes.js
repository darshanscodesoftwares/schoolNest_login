const express = require("express");
const enquiriesController = require("./admin.enquiries.controller");

const router = express.Router();

// Job endpoints (placed first to avoid conflict with :enquiryId)
router.post(
  "/admin/enquiries/jobs/trigger-auto-transition",
  enquiriesController.triggerAutoTransition
);

// Stats endpoint (placed before other GET endpoints)
router.get(
  "/admin/enquiries/stats/summary",
  enquiriesController.getEnquiryStats
);

// Email uniqueness check (placed before ID-based routes)
router.get(
  "/admin/enquiries/check-email",
  enquiriesController.checkEmailExists
);

// CRUD endpoints
//?limit=10&offset=0
router.get("/admin/enquiries", enquiriesController.getAllEnquiries);
router.get("/admin/enquiries/:enquiryId", enquiriesController.getEnquiryById);
router.post("/admin/enquiries", enquiriesController.createEnquiry);
router.put("/admin/enquiries/:enquiryId", enquiriesController.updateEnquiry);
router.patch(
  "/admin/enquiries/:enquiryId/status",
  enquiriesController.updateEnquiryStatus
);
router.delete("/admin/enquiries/:enquiryId", enquiriesController.deleteEnquiry);

module.exports = router;
