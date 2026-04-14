const enquirySourceRepository = require('../repositories/enquiry-source.repository');

// Get all enquiry sources
const getAllEnquirySources = async () => {
  try {
    const sources = await enquirySourceRepository.getAllEnquirySources();
    return {
      success: true,
      data: sources,
      count: sources.length
    };
  } catch (error) {
    throw error;
  }
};

// Get enquiry source by ID
const getEnquirySourceById = async (sourceId) => {
  try {
    const sourceData = await enquirySourceRepository.getEnquirySourceById(sourceId);
    if (!sourceData) {
      return {
        success: false,
        error: 'Enquiry source not found'
      };
    }
    return {
      success: true,
      data: sourceData
    };
  } catch (error) {
    throw error;
  }
};

// Create a new enquiry source
const createEnquirySource = async (sourceName) => {
  try {
    if (!sourceName || sourceName.trim().length === 0) {
      return {
        success: false,
        error: 'Source name is required'
      };
    }
    const newSource = await enquirySourceRepository.createEnquirySource(sourceName.trim());
    return {
      success: true,
      data: newSource,
      message: 'Enquiry source created successfully'
    };
  } catch (error) {
    throw error;
  }
};

// Update an enquiry source
const updateEnquirySource = async (sourceId, sourceName) => {
  try {
    if (!sourceName || sourceName.trim().length === 0) {
      return {
        success: false,
        error: 'Source name is required'
      };
    }
    const updatedSource = await enquirySourceRepository.updateEnquirySource(sourceId, sourceName.trim());
    if (!updatedSource) {
      return {
        success: false,
        error: 'Enquiry source not found'
      };
    }
    return {
      success: true,
      data: updatedSource,
      message: 'Enquiry source updated successfully'
    };
  } catch (error) {
    throw error;
  }
};

// Delete an enquiry source
const deleteEnquirySource = async (sourceId) => {
  try {
    const deletedSource = await enquirySourceRepository.deleteEnquirySource(sourceId);
    if (!deletedSource) {
      return {
        success: false,
        error: 'Enquiry source not found'
      };
    }
    return {
      success: true,
      data: deletedSource,
      message: 'Enquiry source deleted successfully'
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllEnquirySources,
  getEnquirySourceById,
  createEnquirySource,
  updateEnquirySource,
  deleteEnquirySource
};
