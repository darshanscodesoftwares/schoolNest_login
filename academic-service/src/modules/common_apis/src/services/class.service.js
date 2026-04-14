const classRepository = require('../repositories/class.repository');

// Get all classes
const getAllClasses = async () => {
  try {
    const classes = await classRepository.getAllClasses();
    return {
      success: true,
      data: classes,
      count: classes.length
    };
  } catch (error) {
    throw error;
  }
};

// Get class by ID
const getClassById = async (classId) => {
  try {
    const classData = await classRepository.getClassById(classId);
    if (!classData) {
      return {
        success: false,
        error: 'Class not found'
      };
    }
    return {
      success: true,
      data: classData
    };
  } catch (error) {
    throw error;
  }
};

// Create a new class
const createClass = async (className) => {
  try {
    if (!className || className.trim().length === 0) {
      return {
        success: false,
        error: 'Class name is required'
      };
    }
    const newClass = await classRepository.createClass(className.trim());
    return {
      success: true,
      data: newClass,
      message: 'Class created successfully'
    };
  } catch (error) {
    throw error;
  }
};

// Update a class
const updateClass = async (classId, className) => {
  try {
    if (!className || className.trim().length === 0) {
      return {
        success: false,
        error: 'Class name is required'
      };
    }
    const updatedClass = await classRepository.updateClass(classId, className.trim());
    if (!updatedClass) {
      return {
        success: false,
        error: 'Class not found'
      };
    }
    return {
      success: true,
      data: updatedClass,
      message: 'Class updated successfully'
    };
  } catch (error) {
    throw error;
  }
};

// Delete a class
const deleteClass = async (classId) => {
  try {
    const deletedClass = await classRepository.deleteClass(classId);
    if (!deletedClass) {
      return {
        success: false,
        error: 'Class not found'
      };
    }
    return {
      success: true,
      data: deletedClass,
      message: 'Class deleted successfully'
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
};
