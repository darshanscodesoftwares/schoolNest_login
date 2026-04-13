const path = require('path');
const fs = require('fs');

// Base upload directory
const uploadBaseDir = path.join(__dirname, '../../uploads');

// Create directories if they don't exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Upload paths configuration
const uploadPaths = {
  // Documents
  birthCertificates: (schoolId) => {
    const dir = path.join(uploadBaseDir, 'documents', 'birth-certificates', `school-${schoolId}`);
    ensureDirectoryExists(dir);
    return dir;
  },

  aadhaarCards: (schoolId) => {
    const dir = path.join(uploadBaseDir, 'documents', 'aadhaar-cards', `school-${schoolId}`);
    ensureDirectoryExists(dir);
    return dir;
  },

  transferCertificates: (schoolId) => {
    const dir = path.join(uploadBaseDir, 'documents', 'transfer-certificates', `school-${schoolId}`);
    ensureDirectoryExists(dir);
    return dir;
  },

  // Student photos
  studentPhotos: (schoolId) => {
    const dir = path.join(uploadBaseDir, 'student-photos', `school-${schoolId}`);
    ensureDirectoryExists(dir);
    return dir;
  },

  // Teacher documents
  teacherPhotos: (schoolId) => {
    const dir = path.join(uploadBaseDir, 'teacher-photos', `school-${schoolId}`);
    ensureDirectoryExists(dir);
    return dir;
  },

  teacherResumeCVs: (schoolId) => {
    const dir = path.join(uploadBaseDir, 'teacher-documents', 'resumes', `school-${schoolId}`);
    ensureDirectoryExists(dir);
    return dir;
  },

  teacherQualificationCertificates: (schoolId) => {
    const dir = path.join(uploadBaseDir, 'teacher-documents', 'qualifications', `school-${schoolId}`);
    ensureDirectoryExists(dir);
    return dir;
  },

  teacherExperienceCertificates: (schoolId) => {
    const dir = path.join(uploadBaseDir, 'teacher-documents', 'experience', `school-${schoolId}`);
    ensureDirectoryExists(dir);
    return dir;
  },

  teacherAadhaarCards: (schoolId) => {
    const dir = path.join(uploadBaseDir, 'teacher-documents', 'aadhaar', `school-${schoolId}`);
    ensureDirectoryExists(dir);
    return dir;
  },

  teacherPANCards: (schoolId) => {
    const dir = path.join(uploadBaseDir, 'teacher-documents', 'pan', `school-${schoolId}`);
    ensureDirectoryExists(dir);
    return dir;
  },

  // Driver documents
  driverPhotos: (schoolId) => {
    const dir = path.join(uploadBaseDir, 'driver-photos', `school-${schoolId}`);
    ensureDirectoryExists(dir);
    return dir;
  },

  driverLicenseDocuments: (schoolId) => {
    const dir = path.join(uploadBaseDir, 'driver-documents', 'licenses', `school-${schoolId}`);
    ensureDirectoryExists(dir);
    return dir;
  },

  driverAadhaarCards: (schoolId) => {
    const dir = path.join(uploadBaseDir, 'driver-documents', 'aadhaar', `school-${schoolId}`);
    ensureDirectoryExists(dir);
    return dir;
  },

  driverPoliceClearance: (schoolId) => {
    const dir = path.join(uploadBaseDir, 'driver-documents', 'police-clearance', `school-${schoolId}`);
    ensureDirectoryExists(dir);
    return dir;
  }
};

// File validation
const fileValidation = {
  // Accepted MIME types
  acceptedMimeTypes: {
    documents: ['application/pdf', 'image/jpeg', 'image/png'],
    images: ['image/jpeg', 'image/png', 'image/jpg']
  },

  // Max file sizes (in bytes)
  maxFileSize: {
    documents: 5 * 1024 * 1024, // 5MB
    images: 2 * 1024 * 1024 // 2MB
  },

  // Accepted extensions
  acceptedExtensions: {
    documents: ['.pdf', '.jpg', '.jpeg', '.png'],
    images: ['.jpg', '.jpeg', '.png']
  }
};

// Generate unique filename
const generateFilename = (schoolId, admissionId, documentType) => {
  const timestamp = Date.now();
  return `${schoolId}-${admissionId}-${documentType}-${timestamp}`;
};

module.exports = {
  uploadBaseDir,
  uploadPaths,
  fileValidation,
  generateFilename,
  ensureDirectoryExists
};
