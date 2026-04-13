const express = require('express');
const workDetailsController = require('./teacher.work-details.controller');

const router = express.Router();

/**
 * GET /api/v1/academic/teacher/my-work-details
 * Get logged-in teacher's work details
 * Auth: Requires JWT token from auth-service
 * Token payload: { user_id, role, school_id }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Teacher work details retrieved successfully",
 *   "data": {
 *     "teacher": {
 *       "id": "uuid",
 *       "name": "John Doe",
 *       "employee_id": "EMP001",
 *       "designation": "Math Teacher",
 *       "email": "john@school.com",
 *       "phone": "9876543210",
 *       "photo": "url",
 *       "qualification": "B.Sc, B.Ed",
 *       "specialization": "Mathematics",
 *       "date_of_joining": "2020-01-15"
 *     },
 *     "work_summary": {
 *       "total_classes": 5,
 *       "total_students": 120,
 *       "hours_per_week": 25
 *     },
 *     "assigned_classes": [
 *       {
 *         "id": "class-uuid",
 *         "name": "10th A",
 *         "section": "A",
 *         "academic_year": "2024-25",
 *         "student_count": 45
 *       }
 *     ]
 *   }
 * }
 */
router.get('/my-work-details', workDetailsController.getMyWorkDetails);

module.exports = router;
