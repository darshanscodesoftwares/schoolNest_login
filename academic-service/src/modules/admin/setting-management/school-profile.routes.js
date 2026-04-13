const express = require("express");
const schoolProfileController = require("./school-profile.controller");

const router = express.Router();

/**
 * GET /api/v1/academic/admin/settings/school-profile
 * Get school profile
 * Requires: Admin role
 */
router.get("/school-profile", schoolProfileController.getProfile);

/**
 * POST /api/v1/academic/admin/settings/school-profile
 * Create school profile
 * Requires: Admin role
 * Body: { school_name, affiliation_number, principal_name, contact_email, phone_number, established_year, address }
 */
router.post("/school-profile", schoolProfileController.createProfile);

/**
 * PATCH /api/v1/academic/admin/settings/school-profile
 * Update school profile
 * Requires: Admin role
 * Body: { school_name, affiliation_number, principal_name, contact_email, phone_number, established_year, address }
 */
router.patch("/school-profile", schoolProfileController.updateProfile);

/**
 * DELETE /api/v1/academic/admin/settings/school-profile
 * Delete school profile
 * Requires: Admin role
 */
router.delete("/school-profile", schoolProfileController.deleteProfile);

module.exports = router;
