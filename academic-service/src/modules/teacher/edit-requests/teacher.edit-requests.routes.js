const express = require('express');
const editRequestsController = require('./teacher.edit-requests.controller');

const router = express.Router();

/**
 * POST /api/v1/academic/teacher/edit-requests
 * Create new edit request
 * Request body:
 * {
 *   "changed_fields": {
 *     "primary_phone": "9876543210",
 *     "primary_email": "newemail@example.com"
 *   },
 *   "reason": "Updated phone number"
 * }
 */
router.post('/edit-requests', editRequestsController.createEditRequest);

/**
 * GET /api/v1/academic/teacher/edit-requests
 * Get own edit requests
 * Query params: status (PENDING, APPROVED, REJECTED)
 */
router.get('/edit-requests', editRequestsController.getMyEditRequests);

/**
 * GET /api/v1/academic/teacher/edit-requests/:requestId
 * Get specific edit request
 */
router.get('/edit-requests/:requestId', editRequestsController.getEditRequestById);

/**
 * DELETE /api/v1/academic/teacher/edit-requests/:requestId
 * Cancel pending edit request
 */
router.delete('/edit-requests/:requestId', editRequestsController.cancelEditRequest);

module.exports = router;
