const departmentRepository = require('../repositories/department.repository');

// Get all departments
const getAllDepartments = async () => {
  try {
    const departments = await departmentRepository.getAllDepartments();
    return {
      success: true,
      data: departments,
      count: departments.length
    };
  } catch (error) {
    throw error;
  }
};

// Get department by ID
const getDepartmentById = async (departmentId) => {
  try {
    const departmentData = await departmentRepository.getDepartmentById(departmentId);
    if (!departmentData) {
      return {
        success: false,
        error: 'Department not found'
      };
    }
    return {
      success: true,
      data: departmentData
    };
  } catch (error) {
    throw error;
  }
};

// Create a new department
const createDepartment = async (departmentName) => {
  try {
    if (!departmentName || departmentName.trim().length === 0) {
      return {
        success: false,
        error: 'Department name is required'
      };
    }
    const newDepartment = await departmentRepository.createDepartment(departmentName.trim());
    return {
      success: true,
      data: newDepartment,
      message: 'Department created successfully'
    };
  } catch (error) {
    throw error;
  }
};

// Update a department
const updateDepartment = async (departmentId, departmentName) => {
  try {
    if (!departmentName || departmentName.trim().length === 0) {
      return {
        success: false,
        error: 'Department name is required'
      };
    }
    const updatedDepartment = await departmentRepository.updateDepartment(departmentId, departmentName.trim());
    if (!updatedDepartment) {
      return {
        success: false,
        error: 'Department not found'
      };
    }
    return {
      success: true,
      data: updatedDepartment,
      message: 'Department updated successfully'
    };
  } catch (error) {
    throw error;
  }
};

// Delete a department
const deleteDepartment = async (departmentId) => {
  try {
    const deletedDepartment = await departmentRepository.deleteDepartment(departmentId);
    if (!deletedDepartment) {
      return {
        success: false,
        error: 'Department not found'
      };
    }
    return {
      success: true,
      data: deletedDepartment,
      message: 'Department deleted successfully'
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
