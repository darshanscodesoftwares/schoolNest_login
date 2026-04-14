const bloodGroupRepository = require('../repositories/blood-group.repository');

// Get all blood groups
const getAllBloodGroups = async () => {
  try {
    const bloodGroups = await bloodGroupRepository.getAllBloodGroups();
    return {
      success: true,
      data: bloodGroups,
      count: bloodGroups.length
    };
  } catch (error) {
    throw error;
  }
};

// Get blood group by ID
const getBloodGroupById = async (bloodGroupId) => {
  try {
    const bloodGroup = await bloodGroupRepository.getBloodGroupById(bloodGroupId);
    if (!bloodGroup) {
      return {
        success: false,
        error: 'Blood group not found'
      };
    }
    return {
      success: true,
      data: bloodGroup
    };
  } catch (error) {
    throw error;
  }
};

// Create a new blood group
const createBloodGroup = async (bloodGroup) => {
  try {
    if (!bloodGroup || bloodGroup.trim().length === 0) {
      return {
        success: false,
        error: 'Blood group is required'
      };
    }
    const newBloodGroup = await bloodGroupRepository.createBloodGroup(bloodGroup.trim().toUpperCase());
    return {
      success: true,
      data: newBloodGroup,
      message: 'Blood group created successfully'
    };
  } catch (error) {
    throw error;
  }
};

// Update a blood group
const updateBloodGroup = async (bloodGroupId, bloodGroup) => {
  try {
    if (!bloodGroup || bloodGroup.trim().length === 0) {
      return {
        success: false,
        error: 'Blood group is required'
      };
    }
    const updatedBloodGroup = await bloodGroupRepository.updateBloodGroup(bloodGroupId, bloodGroup.trim().toUpperCase());
    if (!updatedBloodGroup) {
      return {
        success: false,
        error: 'Blood group not found'
      };
    }
    return {
      success: true,
      data: updatedBloodGroup,
      message: 'Blood group updated successfully'
    };
  } catch (error) {
    throw error;
  }
};

// Delete a blood group
const deleteBloodGroup = async (bloodGroupId) => {
  try {
    const deletedBloodGroup = await bloodGroupRepository.deleteBloodGroup(bloodGroupId);
    if (!deletedBloodGroup) {
      return {
        success: false,
        error: 'Blood group not found'
      };
    }
    return {
      success: true,
      data: deletedBloodGroup,
      message: 'Blood group deleted successfully'
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllBloodGroups,
  getBloodGroupById,
  createBloodGroup,
  updateBloodGroup,
  deleteBloodGroup
};
