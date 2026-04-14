const staffRolesRepository = require('./staff-roles.repository');

// Get all staff roles
const getAllStaffRoles = async () => {
  try {
    const staffRoles = await staffRolesRepository.getAllStaffRoles();
    const totalCount = await staffRolesRepository.getTotalStaffRolesCount();

    if (!staffRoles || staffRoles.length === 0) {
      return {
        success: true,
        totalStaffRoles: totalCount,
        message: 'No staff roles found',
        count: 0,
        data: []
      };
    }

    return {
      success: true,
      totalStaffRoles: totalCount,
      message: 'Staff roles retrieved successfully',
      count: staffRoles.length,
      data: staffRoles
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Get staff role by ID
const getStaffRoleById = async (staffRoleId) => {
  try {
    const staffRole = await staffRolesRepository.getStaffRoleById(staffRoleId);

    if (!staffRole) {
      const error = new Error('Staff role not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return {
      success: true,
      data: staffRole,
      message: 'Staff role retrieved successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Create staff role
const createStaffRole = async (staffRoleData) => {
  try {
    // Validate required fields
    if (!staffRoleData.other_staff_role) {
      const error = new Error('Missing required field: other_staff_role');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Auto-generate order_number if not provided
    if (!staffRoleData.order_number) {
      const maxOrder = await staffRolesRepository.getMaxOrderNumber();
      staffRoleData.order_number = maxOrder + 1;
    }

    const newStaffRole = await staffRolesRepository.createStaffRole(staffRoleData);

    return {
      success: true,
      data: newStaffRole,
      message: 'Staff role created successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Update staff role
const updateStaffRole = async (staffRoleId, updateData) => {
  try {
    const updatedStaffRole = await staffRolesRepository.updateStaffRole(staffRoleId, updateData);

    if (!updatedStaffRole) {
      const error = new Error('Staff role not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return {
      success: true,
      data: updatedStaffRole,
      message: 'Staff role updated successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

// Delete staff role
const deleteStaffRole = async (staffRoleId) => {
  try {
    const deletedStaffRole = await staffRolesRepository.deleteStaffRole(staffRoleId);

    if (!deletedStaffRole) {
      const error = new Error('Staff role not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return {
      success: true,
      data: deletedStaffRole,
      message: 'Staff role deleted successfully'
    };
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
};

module.exports = {
  getAllStaffRoles,
  getStaffRoleById,
  createStaffRole,
  updateStaffRole,
  deleteStaffRole
};
