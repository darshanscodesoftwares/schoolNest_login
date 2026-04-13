const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const admissionsController = require('./admissions.controller');
const unifiedController = require('./admin.admissions.unified.controller');
const simpleController = require('./admin.admissions.simple.controller');
const fullController = require('./admin.admissions.full.controller');
const { validateAdminRole } = require('../../../../middleware/auth.middleware');

// Define absolute uploads path
// File is at: src/modules/admin/student-admission/admissions/admissions.routes.js
// Uploads is at: academic-service/uploads/ (at project root level)
// From admissions/ go up 5 levels to reach academic-service/, then into uploads/
const uploadsDir = path.join(__dirname, '../../../../../uploads');

// Setup multer for file uploads (photo + documents)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const schoolId = (req.user && req.user.school_id) || 'unknown';

    // Determine subdirectory based on field name
    let subDir = 'student-photos'; // default for student_photo
    if (file.fieldname === 'birth_certificate') {
      subDir = 'documents/birth-certificates';
    } else if (file.fieldname === 'aadhaar_card') {
      subDir = 'documents/aadhaar-cards';
    } else if (file.fieldname === 'transfer_certificate') {
      subDir = 'documents/transfer-certificates';
    }

    // Use absolute path
    const uploadPath = path.join(uploadsDir, subDir, `school-${schoolId}`);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      console.log(`📁 Creating directory:`, uploadPath);
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(`✅ Directory created successfully`);
    }

    console.log(`💾 Destination set for ${file.fieldname}:`, uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fieldName = file.fieldname.replace(/_/g, '-'); // student_photo → student-photo
    const filename = fieldName + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log(`📝 Filename set for ${file.fieldname}:`, filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max per file
  fileFilter: (req, file, cb) => {
    // Allow images: jpeg, jpg, png, gif
    // Allow documents: pdf
    const allowedExtensions = /\.(jpeg|jpg|png|gif|pdf)$/i;
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

    const ext = path.extname(file.originalname).toLowerCase();
    const isValidExt = allowedExtensions.test(ext);
    const isValidMime = allowedMimeTypes.includes(file.mimetype);

    console.log(`📄 File Upload Check:`, {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      ext: ext,
      isValidExt: isValidExt,
      isValidMime: isValidMime
    });

    if (isValidExt && isValidMime) {
      console.log(`✅ File accepted:`, file.originalname);
      cb(null, true);
    } else {
      console.log(`❌ File rejected:`, file.originalname);
      cb(new Error(`File type not allowed. Accepted: JPEG, PNG, GIF, PDF. Got: ${file.mimetype}`));
    }
  }
});

const router = express.Router();

// Create new admission (Draft)
router.post('/admin/admissions', admissionsController.createAdmissionDraft);

// Get all admissions with complete draft data
router.get('/admin/admissions/all/draft', admissionsController.getAllAdmissionsWithDraft);

// Get admission by ID
router.get('/admin/admissions/:admissionId', admissionsController.getAdmissionById);

// Get admissions by status
router.get('/admin/admissions', admissionsController.getAdmissionsByStatus);

// ============================================================
// COMPLETE ADMISSION SAVE - Normal Form with All Details
// ============================================================
// POST /admin/admissions/complete-save
// Saves COMPLETE admission form with all details and unified image paths
// Returns full student profile with all images in unified response
router.post('/admin/admissions/complete-save', validateAdminRole, upload.fields([
  { name: 'student_photo', maxCount: 1 },
  { name: 'birth_certificate', maxCount: 1 },
  { name: 'aadhaar_card', maxCount: 1 },
  { name: 'transfer_certificate', maxCount: 1 }
]), fullController.completeSaveAdmission);

// ============================================================
// FULL TABLE COLUMNS SAVE DRAFT ROUTE (Recommended - Save Everything!)
// ============================================================
// ONE endpoint - Save ALL columns from ALL tables in ONE call!
// Supports multiple file uploads: POST with multipart/form-data
// Accepts: student_photo, birth_certificate, aadhaar_card, transfer_certificate
router.post('/admin/admissions/save-draft', validateAdminRole, upload.fields([
  { name: 'student_photo', maxCount: 1 },
  { name: 'birth_certificate', maxCount: 1 },
  { name: 'aadhaar_card', maxCount: 1 },
  { name: 'transfer_certificate', maxCount: 1 }
]), fullController.saveDraftFull);

// ============================================================
// UPDATE DRAFT ROUTE - PUT (Prevents Duplicate Data!)
// ============================================================
// PUT /admin/admissions/:studentId/save-draft
// Use this for subsequent saves to prevent creating duplicate records
// Always updates the SAME student record (studentId from URL)
// Accepts multiple file uploads (student_photo, documents)
router.put('/admin/admissions/:studentId/save-draft', validateAdminRole, upload.fields([
  { name: 'student_photo', maxCount: 1 },
  { name: 'birth_certificate', maxCount: 1 },
  { name: 'aadhaar_card', maxCount: 1 },
  { name: 'transfer_certificate', maxCount: 1 }
]), fullController.updateDraftFull);

// ============================================================
// UNIFIED SAVE DRAFT ROUTE (Alternative - Save by Section)
// ============================================================
// ONE endpoint for all sections with studentId in URL
router.post('/admin/admissions/:studentId/save-draft', validateAdminRole, unifiedController.saveDraft);

// Submit admission for verification
router.put('/admin/admissions/:admissionId/submit', admissionsController.submitAdmission);

// Approve admission (Assistant Admin)
router.put('/admin/admissions/:admissionId/approve', admissionsController.approveAdmission);

// Reject admission (Assistant Admin)
router.put('/admin/admissions/:admissionId/reject', admissionsController.rejectAdmission);

// ============================================================
// MULTER ERROR HANDLING
// ============================================================
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('❌ Multer Error:', error);
    return res.status(400).json({
      success: false,
      message: `File upload error: ${error.message}`,
      code: error.code
    });
  } else if (error) {
    console.error('❌ Upload Error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
      code: 'UPLOAD_ERROR'
    });
  }
  next();
});

module.exports = router;
