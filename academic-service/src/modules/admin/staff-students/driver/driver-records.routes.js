const express = require('express');
const router = express.Router();
const driverController = require('./driver-records.controller');
const { validateAdminRole } = require('../../../../middleware/auth.middleware');
const { uploadDriverMultiple } = require('../../../../middleware/multer.middleware');

// GET all drivers
// Query params: ?employment_status=Active&bus_number=xxx&limit=10&offset=0
router.get('/', validateAdminRole, driverController.getAllDrivers);

// GET driver by ID
router.get('/:driverId', validateAdminRole, driverController.getDriverById);

// POST create new driver with file uploads
// Accepts multiple file fields:
// - driver_photo (image)
// - license_document (document)
// - aadhar_card (document)
// - police_clearance (document)
router.post(
  '/',
  validateAdminRole,
  uploadDriverMultiple.fields([
    { name: 'driver_photo', maxCount: 1 },
    { name: 'license_document', maxCount: 1 },
    { name: 'aadhar_card', maxCount: 1 },
    { name: 'police_clearance', maxCount: 1 }
  ]),
  driverController.createDriver
);

// PUT update driver with file uploads
router.put(
  '/:driverId',
  validateAdminRole,
  uploadDriverMultiple.fields([
    { name: 'driver_photo', maxCount: 1 },
    { name: 'license_document', maxCount: 1 },
    { name: 'aadhar_card', maxCount: 1 },
    { name: 'police_clearance', maxCount: 1 }
  ]),
  driverController.updateDriver
);

// DELETE driver
router.delete('/:driverId', validateAdminRole, driverController.deleteDriver);

module.exports = router;
