const express = require('express');
const adminController = require('./admin.teacher-edit-requests.controller');

const router = express.Router();

/**
 * GET /api/v1/academic/admin/teacher-edit-requests/stats
 * Get edit request statistics
 * Must come before /:requestId to avoid matching issues
 */
router.get('/teacher-edit-requests/stats', adminController.getEditRequestStats);

/**
 * GET /api/v1/academic/admin/teacher-edit-requests
 * Get all edit requests (with optional filters)
 * Query params:
 *   - status: PENDING | APPROVED | REJECTED
 *   - teacher_id: UUID of teacher
 *   - from_date: ISO date string
 *   - to_date: ISO date string
 *   - limit: number
 *   - offset: number
 */
router.get('/teacher-edit-requests', adminController.getAllEditRequests);

/**
 * GET /api/v1/academic/admin/teacher-edit-requests/:requestId
 * Get specific edit request
 */
router.get('/teacher-edit-requests/:requestId', adminController.getEditRequestById);

/**
 * PATCH /api/v1/academic/admin/teacher-edit-requests/:requestId/approve
 * Approve edit request
 * Request body:
 * {
 *   "admin_notes": "Verified with HR. Approved."
 * }
 */
router.patch('/teacher-edit-requests/:requestId/approve', adminController.approveEditRequest);

/**
 * PATCH /api/v1/academic/admin/teacher-edit-requests/:requestId/reject
 * Reject edit request
 * Request body:
 * {
 *   "rejection_reason": "Please provide valid address proof"
 * }
 */
router.patch('/teacher-edit-requests/:requestId/reject', adminController.rejectEditRequest);

module.exports = router;
