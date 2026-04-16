const express = require('express');
const router = express.Router();
const otherStaffController = require('./other-staff.controller');
const multer = require('multer');
const UPLOAD_FIELDS = require('../../../../config/upload.fields');

// Configure multer for file uploads - using memory storage for database persistence
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    console.log(`📁 Multer processing file: ${file.fieldname}, MIME: ${file.mimetype}`);
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'image/gif'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.error(`❌ Invalid MIME type: ${file.mimetype}`);
      cb(new Error('Invalid file type'));
    }
  }
});

// Routes
// GET all other staff
router.get('/', otherStaffController.getAllOtherStaff);

// GET other staff by ID
router.get('/:staffId', otherStaffController.getOtherStaffById);

// POST create new other staff with file uploads
router.post(
  '/',
  upload.fields(UPLOAD_FIELDS.otherStaff),
  otherStaffController.createOtherStaff
);

// PUT update other staff with file uploads
router.put(
  '/:staffId',
  upload.fields(UPLOAD_FIELDS.otherStaff),
  otherStaffController.updateOtherStaff
);

// DELETE other staff
router.delete('/:staffId', otherStaffController.deleteOtherStaff);

module.exports = router;
