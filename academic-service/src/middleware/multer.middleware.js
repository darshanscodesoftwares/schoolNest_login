const multer = require('multer');
const path = require('path');
const { uploadPaths, fileValidation, generateFilename } = require('../config/upload-config');

// Create storage engine for documents
const createDocumentStorage = (documentType) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const schoolId = req.user.school_id;
      let uploadDir;

      switch (documentType) {
        case 'birth-certificate':
          uploadDir = uploadPaths.birthCertificates(schoolId);
          break;
        case 'aadhaar-card':
          uploadDir = uploadPaths.aadhaarCards(schoolId);
          break;
        case 'transfer-certificate':
          uploadDir = uploadPaths.transferCertificates(schoolId);
          break;
        default:
          uploadDir = uploadPaths.birthCertificates(schoolId);
      }

      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const admissionId = req.params.admissionId;
      const schoolId = req.user.school_id;
      const ext = path.extname(file.originalname);
      const filename = generateFilename(schoolId, admissionId, documentType) + ext;
      cb(null, filename);
    }
  });
};

// Create storage engine for student photos
const studentPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const schoolId = req.user.school_id;
    const uploadDir = uploadPaths.studentPhotos(schoolId);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const admissionId = req.params.admissionId;
    const schoolId = req.user.school_id;
    const ext = path.extname(file.originalname);
    const filename = generateFilename(schoolId, admissionId, 'photo') + ext;
    cb(null, filename);
  }
});

// File filter for documents
const documentFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  console.log(`📄 Document upload - File: ${file.originalname}, MIME: ${mime}, Ext: ${ext}`);

  // Allow common MIME types for documents (including alternate MIME types)
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];

  if (!allowedMimes.includes(mime)) {
    console.log(`❌ MIME type rejected: ${mime}`);
    return cb(new Error('Invalid file type. Only PDF, JPG, PNG are allowed'), false);
  }

  if (!fileValidation.acceptedExtensions.documents.includes(ext)) {
    console.log(`❌ Extension rejected: ${ext}`);
    return cb(new Error('Invalid file extension'), false);
  }

  if (file.size > fileValidation.maxFileSize.documents) {
    return cb(new Error(`File size exceeds maximum limit of 5MB`), false);
  }

  console.log(`✅ Document validated: ${file.originalname}`);
  cb(null, true);
};

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  console.log(`🖼️  Image upload - File: ${file.originalname}, MIME: ${mime}, Ext: ${ext}`);

  // Allow common MIME types for images (including alternate MIME types)
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];

  if (!allowedMimes.includes(mime)) {
    console.log(`❌ MIME type rejected: ${mime}`);
    return cb(new Error('Invalid image type. Only JPG, PNG are allowed'), false);
  }

  if (!fileValidation.acceptedExtensions.images.includes(ext)) {
    console.log(`❌ Extension rejected: ${ext}`);
    return cb(new Error('Invalid image extension'), false);
  }

  if (file.size > fileValidation.maxFileSize.images) {
    return cb(new Error(`Image size exceeds maximum limit of 2MB`), false);
  }

  console.log(`✅ Image validated: ${file.originalname}`);
  cb(null, true);
};

// Create upload middleware for each document type
const uploadBirthCertificate = multer({
  storage: createDocumentStorage('birth-certificate'),
  fileFilter: documentFileFilter,
  limits: { fileSize: fileValidation.maxFileSize.documents }
});

const uploadAadhaarCard = multer({
  storage: createDocumentStorage('aadhaar-card'),
  fileFilter: documentFileFilter,
  limits: { fileSize: fileValidation.maxFileSize.documents }
});

const uploadTransferCertificate = multer({
  storage: createDocumentStorage('transfer-certificate'),
  fileFilter: documentFileFilter,
  limits: { fileSize: fileValidation.maxFileSize.documents }
});

const uploadStudentPhoto = multer({
  storage: studentPhotoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: fileValidation.maxFileSize.images }
});

// Multiple file upload for teacher documents
const uploadTeacherMultiple = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    // Photo field should be image only
    if (file.fieldname === 'teacher_photo') {
      imageFileFilter(req, file, cb);
    } else {
      // Other fields should be documents (PDF, JPG, PNG)
      documentFileFilter(req, file, cb);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB for all files
});

// Multiple file upload for driver documents
const uploadDriverMultiple = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    // Photo field should be image only
    if (file.fieldname === 'driver_photo') {
      imageFileFilter(req, file, cb);
    } else {
      // Other fields should be documents (PDF, JPG, PNG)
      documentFileFilter(req, file, cb);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB for all files
});

module.exports = {
  uploadBirthCertificate,
  uploadAadhaarCard,
  uploadTransferCertificate,
  uploadStudentPhoto,
  uploadTeacherMultiple,
  uploadDriverMultiple
};
