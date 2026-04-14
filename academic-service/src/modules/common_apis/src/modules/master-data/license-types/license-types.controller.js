const licenseTypesService = require('./license-types.service');

// GET all license types
const getAllLicenseTypes = async (req, res, next) => {
  try {
    const result = await licenseTypesService.getAllLicenseTypes();
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// GET license type by ID
const getLicenseTypeById = async (req, res, next) => {
  try {
    const { licenseTypeId } = req.params;

    if (!licenseTypeId) {
      const error = new Error('License type ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await licenseTypesService.getLicenseTypeById(licenseTypeId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// POST create license type
const createLicenseType = async (req, res, next) => {
  try {
    const licenseTypeData = req.body;

    const result = await licenseTypesService.createLicenseType(licenseTypeData);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

// PUT update license type
const updateLicenseType = async (req, res, next) => {
  try {
    const { licenseTypeId } = req.params;
    const updateData = req.body;

    if (!licenseTypeId) {
      const error = new Error('License type ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await licenseTypesService.updateLicenseType(licenseTypeId, updateData);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// DELETE license type
const deleteLicenseType = async (req, res, next) => {
  try {
    const { licenseTypeId } = req.params;

    if (!licenseTypeId) {
      const error = new Error('License type ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await licenseTypesService.deleteLicenseType(licenseTypeId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllLicenseTypes,
  getLicenseTypeById,
  createLicenseType,
  updateLicenseType,
  deleteLicenseType
};
