const staffDepartmentsRepository = require('./staff-departments.repository');

// Get all staff departments
const getAllStaffDepartments = async () => {
  try {
    const staffDepartments = await staffDepartmentsRepository.getAllStaffDepartments();
    const totalCount = await staffDepartmentsRepository.getTotalStaffDepartmentsCount();

    if (!staffDepartments || staffDepartments.length === 0) {
      return {
        success: true,
        totalStaffDepartments: totalCount,
        message: 'No staff departments found',
        count: 0,
        data: []
      };
    }

    return {
      success: true,
      totalStaffDepartments: totalCount,
      message: 'Staff departments retrieved successfully',
      count: staffDepartments.length,
      data: staffDepartments
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Get staff department by ID
const getStaffDepartmentById = async (staffDepartmentId) => {
  try {
    const staffDepartment = await staffDepartmentsRepository.getStaffDepartmentById(staffDepartmentId);

    if (!staffDepartment) {
      const error = new Error('Staff department not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return {
      success: true,
      data: staffDepartment,
      message: 'Staff department retrieved successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Create staff department
const createStaffDepartment = async (staffDepartmentData) => {
  try {
    // Validate required fields
    if (!staffDepartmentData.other_staff_departments) {
      const error = new Error('Missing required field: other_staff_departments');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Auto-generate order_number if not provided
    if (!staffDepartmentData.order_number) {
      const maxOrder = await staffDepartmentsRepository.getMaxOrderNumber();
      staffDepartmentData.order_number = maxOrder + 1;
    }

    const newStaffDepartment = await staffDepartmentsRepository.createStaffDepartment(staffDepartmentData);

    return {
      success: true,
      data: newStaffDepartment,
      message: 'Staff department created successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Update staff department
const updateStaffDepartment = async (staffDepartmentId, updateData) => {
  try {
    const updatedStaffDepartment = await staffDepartmentsRepository.updateStaffDepartment(staffDepartmentId, updateData);

    if (!updatedStaffDepartment) {
      const error = new Error('Staff department not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return {
      success: true,
      data: updatedStaffDepartment,
      message: 'Staff department updated successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Delete staff department
const deleteStaffDepartment = async (staffDepartmentId) => {
  try {
    const deletedStaffDepartment = await staffDepartmentsRepository.deleteStaffDepartment(staffDepartmentId);

    if (!deletedStaffDepartment) {
      const error = new Error('Staff department not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return {
      success: true,
      data: deletedStaffDepartment,
      message: 'Staff department deleted successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

module.exports = {
  getAllStaffDepartments,
  getStaffDepartmentById,
  createStaffDepartment,
  updateStaffDepartment,
  deleteStaffDepartment
};
