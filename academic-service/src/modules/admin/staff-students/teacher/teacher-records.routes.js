const express = require('express');
const router = express.Router();
const teacherController = require('./teacher-records.controller');
const { validateAdminRole } = require('../../../../middleware/auth.middleware');
const { uploadTeacherMultiple } = require('../../../../middleware/multer.middleware');

// GET all teachers
// Query params: ?designation=xxx&department_id=xxx&employment_status=Active&limit=10&offset=0
router.get('/', validateAdminRole, teacherController.getAllTeachers);

// GET teacher by ID
router.get('/:teacherId', validateAdminRole, teacherController.getTeacherById);

// POST create new teacher with file uploads
// Accepts multiple file fields:
// - teacher_photo (image)
// - resume_cv (document)
// - qualification_certificates (document)
// - experience_certificates (document)
// - aadhar_card (document)
// - pan_card (document)
router.post(
  '/',
  validateAdminRole,
  uploadTeacherMultiple.fields([
    { name: 'teacher_photo', maxCount: 1 },
    { name: 'resume_cv', maxCount: 1 },
    { name: 'qualification_certificates', maxCount: 1 },
    { name: 'experience_certificates', maxCount: 1 },
    { name: 'aadhar_card', maxCount: 1 },
    { name: 'pan_card', maxCount: 1 }
  ]),
  teacherController.createTeacher
);

// PUT update teacher with file uploads
router.put(
  '/:teacherId',
  validateAdminRole,
  uploadTeacherMultiple.fields([
    { name: 'teacher_photo', maxCount: 1 },
    { name: 'resume_cv', maxCount: 1 },
    { name: 'qualification_certificates', maxCount: 1 },
    { name: 'experience_certificates', maxCount: 1 },
    { name: 'aadhar_card', maxCount: 1 },
    { name: 'pan_card', maxCount: 1 }
  ]),
  teacherController.updateTeacher
);

// DELETE teacher
router.delete('/:teacherId', validateAdminRole, teacherController.deleteTeacher);

module.exports = router;
