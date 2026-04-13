const driverService = require('./driver-records.service');

// GET all drivers
const getAllDrivers = async (req, res, next) => {
  try {
    const schoolId = req.user.school_id;
    const filters = {
      employment_status: req.query.employment_status,
      bus_number: req.query.bus_number,
      limit: req.query.limit ? parseInt(req.query.limit, 10) : null,
      offset: req.query.offset ? parseInt(req.query.offset, 10) : null
    };

    const result = await driverService.getAllDrivers(schoolId, filters);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// GET driver by ID
const getDriverById = async (req, res, next) => {
  try {
    const schoolId = req.user.school_id;
    const { driverId } = req.params;

    if (!driverId) {
      const error = new Error('Driver ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await driverService.getDriverById(schoolId, driverId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// Helper function to convert absolute path to relative URL
const getFileUrl = (absolutePath) => {
  if (!absolutePath) return null;
  const uploadsIndex = absolutePath.indexOf('/uploads/');
  if (uploadsIndex === -1) return absolutePath;
  return absolutePath.substring(uploadsIndex);
};

// POST create new driver
const createDriver = async (req, res, next) => {
  try {
    const schoolId = req.user.school_id;
    const driverData = req.body;

    // Trim string fields to remove whitespace from FormData
    ['employment_type', 'gender', 'employment_status'].forEach(field => {
      if (driverData[field] && typeof driverData[field] === 'string') {
        driverData[field] = driverData[field].trim();
      }
    });

    // Auto-fill permanent address from current address if is_permanent_same is true
    if (driverData.is_permanent_same === true || driverData.is_permanent_same === 'true') {
      driverData.permanent_street = driverData.current_street;
      driverData.permanent_city = driverData.current_city;
      driverData.permanent_state = driverData.current_state;
      driverData.permanent_pincode = driverData.current_pincode;
    }

    // Auto-set employment_status to Active (ignore if user sends it)
    driverData.employment_status = 'Active';

    // Auto-set employment_type to Permanent if not provided
    if (!driverData.employment_type) {
      driverData.employment_type = 'Permanent';
    }

    // Handle file uploads - map file paths to driverData
    if (req.files) {
      if (req.files.driver_photo && req.files.driver_photo[0]) {
        driverData.driver_photo = getFileUrl(req.files.driver_photo[0].path);
      }
      if (req.files.license_document && req.files.license_document[0]) {
        driverData.license_document = getFileUrl(req.files.license_document[0].path);
      }
      if (req.files.aadhar_card && req.files.aadhar_card[0]) {
        driverData.aadhar_card = getFileUrl(req.files.aadhar_card[0].path);
      }
      if (req.files.police_clearance && req.files.police_clearance[0]) {
        driverData.police_clearance = getFileUrl(req.files.police_clearance[0].path);
      }
    }

    const result = await driverService.createDriver(schoolId, driverData);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

// PUT update driver
const updateDriver = async (req, res, next) => {
  try {
    const schoolId = req.user.school_id;
    const { driverId } = req.params;
    const updateData = req.body;

    // Trim string fields to remove whitespace from FormData
    ['employment_type', 'gender', 'employment_status'].forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        updateData[field] = updateData[field].trim();
      }
    });

    // Auto-fill permanent address from current address if is_permanent_same is true
    if (updateData.is_permanent_same === true || updateData.is_permanent_same === 'true') {
      updateData.permanent_street = updateData.current_street;
      updateData.permanent_city = updateData.current_city;
      updateData.permanent_state = updateData.current_state;
      updateData.permanent_pincode = updateData.current_pincode;
    }

    if (!driverId) {
      const error = new Error('Driver ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Handle file uploads - map file paths to updateData
    if (req.files) {
      if (req.files.driver_photo && req.files.driver_photo[0]) {
        updateData.driver_photo = getFileUrl(req.files.driver_photo[0].path);
      }
      if (req.files.license_document && req.files.license_document[0]) {
        updateData.license_document = getFileUrl(req.files.license_document[0].path);
      }
      if (req.files.aadhar_card && req.files.aadhar_card[0]) {
        updateData.aadhar_card = getFileUrl(req.files.aadhar_card[0].path);
      }
      if (req.files.police_clearance && req.files.police_clearance[0]) {
        updateData.police_clearance = getFileUrl(req.files.police_clearance[0].path);
      }
    }

    const result = await driverService.updateDriver(schoolId, driverId, updateData);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// DELETE driver
const deleteDriver = async (req, res, next) => {
  try {
    const schoolId = req.user.school_id;
    const { driverId } = req.params;

    if (!driverId) {
      const error = new Error('Driver ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await driverService.deleteDriver(schoolId, driverId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver
};
