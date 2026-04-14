const admissionsService = require('./admissions.service');

// Extract token from headers
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader;
};

// Create new admission (Draft)
const createAdmissionDraft = async (req, res, next) => {
  try {
    const result = await admissionsService.createAdmissionDraft(req.user);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

// Get admission by ID
const getAdmissionById = async (req, res, next) => {
  try {
    const { admissionId } = req.params;

    if (!admissionId) {
      const error = new Error('Admission ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await admissionsService.getAdmissionById(req.user, admissionId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// Get admissions by status
const getAdmissionsByStatus = async (req, res, next) => {
  try {
    const { status, limit, offset } = req.query;

    if (!status) {
      const error = new Error('Status is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await admissionsService.getAdmissionsByStatus(
      req.user,
      status,
      parseInt(limit) || 20,
      parseInt(offset) || 0
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// Get all admissions with complete draft data
const getAllAdmissionsWithDraft = async (req, res, next) => {
  try {
    const { limit, offset, status } = req.query;

    const result = await admissionsService.getAllAdmissionsWithDraft(
      req.user,
      parseInt(limit) || 20,
      parseInt(offset) || 0,
      status || null
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// Save personal information
const savePersonalInfo = async (req, res, next) => {
  try {
    const { admissionId } = req.params;
    const { first_name, last_name, date_of_birth, gender, blood_group_id, nationality, religion, category } = req.body;

    if (!admissionId) {
      const error = new Error('Admission ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Handle file upload
    let student_photo = null;
    if (req.file) {
      student_photo = `/uploads/student-photos/school-${req.user.school_id}/${req.file.filename}`;
    }

    const personalData = {
      first_name,
      last_name,
      date_of_birth,
      gender,
      blood_group_id,
      nationality,
      religion,
      category,
      student_photo
    };

    const result = await admissionsService.savePersonalInfo(req.user, admissionId, personalData);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// Save academic information
const saveAcademicInfo = async (req, res, next) => {
  try {
    const { admissionId } = req.params;
    const { admission_date, class_id, section, roll_number, previous_school } = req.body;
    const token = extractToken(req);

    if (!admissionId) {
      const error = new Error('Admission ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const academicData = {
      admission_date,
      class_id,
      section,
      roll_number,
      previous_school
    };

    const result = await admissionsService.saveAcademicInfo(req.user, admissionId, academicData, token);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// Submit admission for verification
const submitAdmission = async (req, res, next) => {
  try {
    const { admissionId } = req.params;

    if (!admissionId) {
      const error = new Error('Admission ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await admissionsService.submitAdmission(req.user, admissionId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// Approve admission (Assistant Admin)
const approveAdmission = async (req, res, next) => {
  try {
    const { admissionId } = req.params;

    if (!admissionId) {
      const error = new Error('Admission ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await admissionsService.approveAdmission(req.user, admissionId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const rejectAdmission = async (req, res, next) => {
  try {
    const { admissionId } = req.params;

    if (!admissionId) {
      const error = new Error('Admission ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await admissionsService.rejectAdmission(req.user, admissionId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// Upload birth certificate
const uploadBirthCertificate = async (req, res, next) => {
  try {
    const { admissionId } = req.params;

    if (!admissionId) {
      const error = new Error('Admission ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    if (!req.file) {
      const error = new Error('File is required');
      error.statusCode = 400;
      error.code = 'NO_FILE';
      throw error;
    }

    const filePath = `/uploads/documents/birth-certificates/school-${req.user.school_id}/${req.file.filename}`;
    const result = await admissionsService.saveDocument(req.user, admissionId, 'birth-certificate', filePath);

    return res.status(200).json({
      success: true,
      data: {
        document_type: 'birth_certificate',
        file_path: filePath,
        file_url: `${process.env.UPLOAD_BASE_URL || process.env.BASE_URL || 'http://localhost:4002'}${filePath}`,
        status: 'Verified'
      },
      message: 'Birth certificate uploaded successfully'
    });
  } catch (error) {
    return next(error);
  }
};

// Upload aadhaar card
const uploadAadhaarCard = async (req, res, next) => {
  try {
    const { admissionId } = req.params;

    if (!admissionId) {
      const error = new Error('Admission ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    if (!req.file) {
      const error = new Error('File is required');
      error.statusCode = 400;
      error.code = 'NO_FILE';
      throw error;
    }

    const filePath = `/uploads/documents/aadhaar-cards/school-${req.user.school_id}/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      data: {
        document_type: 'aadhaar_card',
        file_path: filePath,
        file_url: `${process.env.UPLOAD_BASE_URL || process.env.BASE_URL || 'http://localhost:4002'}${filePath}`,
        status: 'Verified'
      },
      message: 'Aadhaar card uploaded successfully'
    });
  } catch (error) {
    return next(error);
  }
};

// Upload transfer certificate
const uploadTransferCertificate = async (req, res, next) => {
  try {
    const { admissionId } = req.params;

    if (!admissionId) {
      const error = new Error('Admission ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    if (!req.file) {
      const error = new Error('File is required');
      error.statusCode = 400;
      error.code = 'NO_FILE';
      throw error;
    }

    const filePath = `/uploads/documents/transfer-certificates/school-${req.user.school_id}/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      data: {
        document_type: 'transfer_certificate',
        file_path: filePath,
        file_url: `${process.env.UPLOAD_BASE_URL || process.env.BASE_URL || 'http://localhost:4002'}${filePath}`,
        status: 'Optional'
      },
      message: 'Transfer certificate uploaded successfully'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createAdmissionDraft,
  getAdmissionById,
  getAdmissionsByStatus,
  getAllAdmissionsWithDraft,
  savePersonalInfo,
  saveAcademicInfo,
  submitAdmission,
  approveAdmission,
  rejectAdmission,
  uploadBirthCertificate,
  uploadAadhaarCard,
  uploadTransferCertificate
};
