const staffPositionsService = require('./staff-positions.service');

// GET all staff positions
const getAllStaffPositions = async (req, res, next) => {
  try {
    const result = await staffPositionsService.getAllStaffPositions();
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// GET staff position by ID
const getStaffPositionById = async (req, res, next) => {
  try {
    const { staffPositionId } = req.params;

    if (!staffPositionId) {
      const error = new Error('Staff position ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await staffPositionsService.getStaffPositionById(staffPositionId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// POST create staff position
const createStaffPosition = async (req, res, next) => {
  try {
    const staffPositionData = req.body;

    const result = await staffPositionsService.createStaffPosition(staffPositionData);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

// PUT update staff position
const updateStaffPosition = async (req, res, next) => {
  try {
    const { staffPositionId } = req.params;
    const updateData = req.body;

    if (!staffPositionId) {
      const error = new Error('Staff position ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await staffPositionsService.updateStaffPosition(staffPositionId, updateData);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

// DELETE staff position
const deleteStaffPosition = async (req, res, next) => {
  try {
    const { staffPositionId } = req.params;

    if (!staffPositionId) {
      const error = new Error('Staff position ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    const result = await staffPositionsService.deleteStaffPosition(staffPositionId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllStaffPositions,
  getStaffPositionById,
  createStaffPosition,
  updateStaffPosition,
  deleteStaffPosition
};
