const staffPositionsRepository = require('./staff-positions.repository');

// Get all staff positions
const getAllStaffPositions = async () => {
  try {
    const staffPositions = await staffPositionsRepository.getAllStaffPositions();
    const totalCount = await staffPositionsRepository.getTotalStaffPositionsCount();

    if (!staffPositions || staffPositions.length === 0) {
      return {
        success: true,
        totalStaffPositions: totalCount,
        message: 'No staff positions found',
        count: 0,
        data: []
      };
    }

    return {
      success: true,
      totalStaffPositions: totalCount,
      message: 'Staff positions retrieved successfully',
      count: staffPositions.length,
      data: staffPositions
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Get staff position by ID
const getStaffPositionById = async (staffPositionId) => {
  try {
    const staffPosition = await staffPositionsRepository.getStaffPositionById(staffPositionId);

    if (!staffPosition) {
      const error = new Error('Staff position not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return {
      success: true,
      data: staffPosition,
      message: 'Staff position retrieved successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Create staff position
const createStaffPosition = async (staffPositionData) => {
  try {
    // Validate required fields
    if (!staffPositionData.other_staff_positions) {
      const error = new Error('Missing required field: other_staff_positions');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Auto-generate order_number if not provided
    if (!staffPositionData.order_number) {
      const maxOrder = await staffPositionsRepository.getMaxOrderNumber();
      staffPositionData.order_number = maxOrder + 1;
    }

    const newStaffPosition = await staffPositionsRepository.createStaffPosition(staffPositionData);

    return {
      success: true,
      data: newStaffPosition,
      message: 'Staff position created successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Update staff position
const updateStaffPosition = async (staffPositionId, updateData) => {
  try {
    const updatedStaffPosition = await staffPositionsRepository.updateStaffPosition(staffPositionId, updateData);

    if (!updatedStaffPosition) {
      const error = new Error('Staff position not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return {
      success: true,
      data: updatedStaffPosition,
      message: 'Staff position updated successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Delete staff position
const deleteStaffPosition = async (staffPositionId) => {
  try {
    const deletedStaffPosition = await staffPositionsRepository.deleteStaffPosition(staffPositionId);

    if (!deletedStaffPosition) {
      const error = new Error('Staff position not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return {
      success: true,
      data: deletedStaffPosition,
      message: 'Staff position deleted successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

module.exports = {
  getAllStaffPositions,
  getStaffPositionById,
  createStaffPosition,
  updateStaffPosition,
  deleteStaffPosition
};
