const driverService = require('./driver-records.service');
const fileStorageUtil = require('../../../../utils/fileStorage.util');

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

    // Handle file uploads - save to database and get file URLs
    if (req.files) {
      const fileFields = [
        'driver_photo',
        'license_document',
        'aadhar_card',
        'police_clearance'
      ];

      for (const field of fileFields) {
        if (req.files[field] && req.files[field][0]) {
          const fileId = await fileStorageUtil.saveFileToDB(
            req.files[field][0],
            schoolId,
            field
          );
          const protocol = req.protocol || 'https';
          const host = req.get('host');
          driverData[field] = `${protocol}://${host}/api/v1/academic/files/${fileId}`;
        }
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

    // Handle file uploads - save to database and get file URLs
    if (req.files) {
      const fileFields = [
        'driver_photo',
        'license_document',
        'aadhar_card',
        'police_clearance'
      ];

      for (const field of fileFields) {
        if (req.files[field] && req.files[field][0]) {
          const fileId = await fileStorageUtil.saveFileToDB(
            req.files[field][0],
            schoolId,
            field
          );
          updateData[field] = `/api/v1/academic/files/${fileId}`;
        }
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
