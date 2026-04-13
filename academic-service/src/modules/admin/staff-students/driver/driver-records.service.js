const driverRepository = require('./driver-records.repository');
const pool = require('../../../../config/db');

// Direct DB lookup helpers (replaced HTTP calls to common-api)
const enrichBloodGroupName = async (bloodGroupId) => {
  if (!bloodGroupId) return null;
  try {
    const res = await pool.query(`SELECT blood_group FROM blood_groups WHERE id = $1 LIMIT 1`, [bloodGroupId]);
    return (res.rows[0] && res.rows[0].blood_group) || null;
  } catch { return null; }
};

const enrichLicenseTypeName = async (licenseTypeId) => {
  if (!licenseTypeId) return null;
  try {
    const res = await pool.query(`SELECT license_name FROM license_types WHERE id = $1 LIMIT 1`, [licenseTypeId]);
    return (res.rows[0] && res.rows[0].license_name) || null;
  } catch { return null; }
};

// Helper function to convert absolute paths to full URLs and enrich driver data
const convertPathsToUrls = async (driver) => {
  if (!driver) return driver;

  const fileFields = [
    'driver_photo',
    'license_document',
    'aadhar_card',
    'police_clearance'
  ];

  // Get base URL from environment or construct it
  const baseUrl = process.env.BASE_URL || `http://localhost:4000`;

  const converted = { ...driver };

  fileFields.forEach(field => {
    if (converted[field]) {
      const uploadsIndex = converted[field].indexOf('/uploads/');
      if (uploadsIndex !== -1) {
        const relativePath = converted[field].substring(uploadsIndex);
        converted[field] = `${baseUrl}${relativePath}`;
      }
    }
  });

  // Enrich blood group name if blood_group_id exists
  if (converted.blood_group_id) {
    converted.blood_group = await enrichBloodGroupName(converted.blood_group_id);
    // Remove blood_group_id and keep only enriched blood group
    delete converted.blood_group_id;
  }

  // Enrich license type name if license_class exists
  if (converted.license_class) {
    const licenseTypeName = await enrichLicenseTypeName(converted.license_class);
    converted.license_class_name = licenseTypeName;
    // Keep license_class for updates
  }

  return converted;
};

// Get all drivers
const getAllDrivers = async (schoolId, filters = {}) => {
  try {
    const drivers = await driverRepository.getAllDrivers(schoolId, filters);
    const totalCount = await driverRepository.getTotalDriversCount(schoolId);

    if (!drivers || drivers.length === 0) {
      return {
        success: true,
        totalDrivers: totalCount,
        message: 'No drivers found',
        count: 0,
        data: []
      };
    }

    // Convert paths to URLs for all drivers (async operation)
    const convertedDrivers = await Promise.all(drivers.map(convertPathsToUrls));

    return {
      success: true,
      totalDrivers: totalCount,
      message: 'Drivers retrieved successfully',
      count: convertedDrivers.length,
      data: convertedDrivers
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Get driver by ID
const getDriverById = async (schoolId, driverId) => {
  try {
    const driver = await driverRepository.getDriverById(schoolId, driverId);

    if (!driver) {
      const error = new Error('Driver not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    const convertedDriver = await convertPathsToUrls(driver);

    return {
      success: true,
      data: convertedDriver,
      message: 'Driver retrieved successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Create new driver
const createDriver = async (schoolId, driverData) => {
  try {
    // Validate required fields
    if (!driverData.first_name || !driverData.date_of_birth || !driverData.gender || !driverData.assign_date) {
      const error = new Error('Missing required fields: first_name, date_of_birth, gender, assign_date');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Validate employment_type if provided
    const validEmploymentTypes = ['Permanent', 'Contractual', 'Temporary'];
    if (driverData.employment_type && !validEmploymentTypes.includes(driverData.employment_type)) {
      const error = new Error(`Invalid employment_type. Must be one of: ${validEmploymentTypes.join(', ')}`);
      error.statusCode = 400;
      error.code = 'INVALID_EMPLOYMENT_TYPE';
      throw error;
    }

    // Validate license number uniqueness if provided
    if (driverData.license_number) {
      const existingDriver = await driverRepository.getDriverByLicenseNumber(schoolId, driverData.license_number);
      if (existingDriver) {
        const error = new Error('License number already exists. Please use a unique license number.');
        error.statusCode = 400;
        error.code = 'DUPLICATE_LICENSE_NUMBER';
        throw error;
      }
    }

    // Validate aadhar number uniqueness if provided
    if (driverData.aadhar_number) {
      const existingDriver = await driverRepository.getDriverByAadharNumber(schoolId, driverData.aadhar_number);
      if (existingDriver) {
        const error = new Error('Aadhar number already exists. Please use a unique aadhar number.');
        error.statusCode = 400;
        error.code = 'DUPLICATE_AADHAR_NUMBER';
        throw error;
      }
    }

    // Validate PAN number uniqueness if provided
    if (driverData.pan_number) {
      const existingDriver = await driverRepository.getDriverByPanNumber(schoolId, driverData.pan_number);
      if (existingDriver) {
        const error = new Error('PAN number already exists. Please use a unique PAN number.');
        error.statusCode = 400;
        error.code = 'DUPLICATE_PAN_NUMBER';
        throw error;
      }
    }

    // Validate email uniqueness if provided
    if (driverData.primary_email) {
      const existingDriver = await driverRepository.getDriverByEmail(schoolId, driverData.primary_email);
      if (existingDriver) {
        const error = new Error('Email already exists. Please use a unique email address.');
        error.statusCode = 400;
        error.code = 'DUPLICATE_EMAIL';
        throw error;
      }
    }

    const newDriver = await driverRepository.createDriver(schoolId, driverData);
    const convertedDriver = await convertPathsToUrls(newDriver);

    return {
      success: true,
      data: convertedDriver,
      message: 'Driver created successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Update driver
const updateDriver = async (schoolId, driverId, updateData) => {
  try {
    // Validate license number uniqueness if being updated
    if (updateData.license_number) {
      const existingDriver = await driverRepository.getDriverByLicenseNumber(schoolId, updateData.license_number);
      // Allow if it's the same driver (same ID), otherwise it's a duplicate
      if (existingDriver && existingDriver.id !== driverId) {
        const error = new Error('License number already exists. Please use a unique license number.');
        error.statusCode = 400;
        error.code = 'DUPLICATE_LICENSE_NUMBER';
        throw error;
      }
    }

    // Validate aadhar number uniqueness if being updated
    if (updateData.aadhar_number) {
      const existingDriver = await driverRepository.getDriverByAadharNumber(schoolId, updateData.aadhar_number);
      if (existingDriver && existingDriver.id !== driverId) {
        const error = new Error('Aadhar number already exists. Please use a unique aadhar number.');
        error.statusCode = 400;
        error.code = 'DUPLICATE_AADHAR_NUMBER';
        throw error;
      }
    }

    // Validate PAN number uniqueness if being updated
    if (updateData.pan_number) {
      const existingDriver = await driverRepository.getDriverByPanNumber(schoolId, updateData.pan_number);
      if (existingDriver && existingDriver.id !== driverId) {
        const error = new Error('PAN number already exists. Please use a unique PAN number.');
        error.statusCode = 400;
        error.code = 'DUPLICATE_PAN_NUMBER';
        throw error;
      }
    }

    // Validate email uniqueness if being updated
    if (updateData.primary_email) {
      const existingDriver = await driverRepository.getDriverByEmail(schoolId, updateData.primary_email);
      if (existingDriver && existingDriver.id !== driverId) {
        const error = new Error('Email already exists. Please use a unique email address.');
        error.statusCode = 400;
        error.code = 'DUPLICATE_EMAIL';
        throw error;
      }
    }

    const updatedDriver = await driverRepository.updateDriver(schoolId, driverId, updateData);

    if (!updatedDriver) {
      const error = new Error('Driver not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    const convertedDriver = await convertPathsToUrls(updatedDriver);

    return {
      success: true,
      data: convertedDriver,
      message: 'Driver updated successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Delete driver
const deleteDriver = async (schoolId, driverId) => {
  try {
    const deletedDriver = await driverRepository.deleteDriver(schoolId, driverId);

    if (!deletedDriver) {
      const error = new Error('Driver not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    const convertedDriver = await convertPathsToUrls(deletedDriver);

    return {
      success: true,
      data: convertedDriver,
      message: 'Driver deleted successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver
};
