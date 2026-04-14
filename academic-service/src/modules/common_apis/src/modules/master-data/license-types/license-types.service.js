const licenseTypesRepository = require('./license-types.repository');

// Get all license types
const getAllLicenseTypes = async () => {
  try {
    const licenseTypes = await licenseTypesRepository.getAllLicenseTypes();
    const totalCount = await licenseTypesRepository.getTotalLicenseTypesCount();

    if (!licenseTypes || licenseTypes.length === 0) {
      return {
        success: true,
        totalLicenseTypes: totalCount,
        message: 'No license types found',
        count: 0,
        data: []
      };
    }

    return {
      success: true,
      totalLicenseTypes: totalCount,
      message: 'License types retrieved successfully',
      count: licenseTypes.length,
      data: licenseTypes
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Get license type by ID
const getLicenseTypeById = async (licenseTypeId) => {
  try {
    const licenseType = await licenseTypesRepository.getLicenseTypeById(licenseTypeId);

    if (!licenseType) {
      const error = new Error('License type not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return {
      success: true,
      data: licenseType,
      message: 'License type retrieved successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Create license type
const createLicenseType = async (licenseTypeData) => {
  try {
    // Validate required fields
    if (!licenseTypeData.license_name) {
      const error = new Error('Missing required field: license_name');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Auto-generate order_number if not provided
    if (!licenseTypeData.order_number) {
      const maxOrder = await licenseTypesRepository.getMaxOrderNumber();
      licenseTypeData.order_number = maxOrder + 1;
    }

    const newLicenseType = await licenseTypesRepository.createLicenseType(licenseTypeData);

    return {
      success: true,
      data: newLicenseType,
      message: 'License type created successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Update license type
const updateLicenseType = async (licenseTypeId, updateData) => {
  try {
    const updatedLicenseType = await licenseTypesRepository.updateLicenseType(licenseTypeId, updateData);

    if (!updatedLicenseType) {
      const error = new Error('License type not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return {
      success: true,
      data: updatedLicenseType,
      message: 'License type updated successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Delete license type
const deleteLicenseType = async (licenseTypeId) => {
  try {
    const deletedLicenseType = await licenseTypesRepository.deleteLicenseType(licenseTypeId);

    if (!deletedLicenseType) {
      const error = new Error('License type not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return {
      success: true,
      data: deletedLicenseType,
      message: 'License type deleted successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

module.exports = {
  getAllLicenseTypes,
  getLicenseTypeById,
  createLicenseType,
  updateLicenseType,
  deleteLicenseType
};
