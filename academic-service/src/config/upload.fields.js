// Multer upload field configurations for different modules

const UPLOAD_FIELDS = {
  otherStaff: [
    { name: 'staff_photo', maxCount: 1 },
    { name: 'adhar_document', maxCount: 1 },
    { name: 'pan_card', maxCount: 1 },
    { name: 'education_certificate', maxCount: 1 }
  ],
  teacher: [
    { name: 'teacher_photo', maxCount: 1 },
    { name: 'degree_certificate', maxCount: 1 },
    { name: 'id_proof', maxCount: 1 }
  ],
  driver: [
    { name: 'driver_photo', maxCount: 1 },
    { name: 'license_document', maxCount: 1 },
    { name: 'insurance_document', maxCount: 1 }
  ]
};

module.exports = UPLOAD_FIELDS;
