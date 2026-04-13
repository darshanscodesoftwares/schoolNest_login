const express = require('express');
const router = express.Router();
const otherStaffController = require('./other-staff.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const UPLOAD_FIELDS = require('../../../../config/upload.fields');

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../../../../uploads/other-staff');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
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
