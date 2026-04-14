const express = require('express');
const router = express.Router();
const licenseTypesController = require('./license-types.controller');

// GET all license types
router.get('/license-types', licenseTypesController.getAllLicenseTypes);

// GET license type by ID
router.get('/license-types/:licenseTypeId', licenseTypesController.getLicenseTypeById);

// POST create new license type
router.post('/license-types', licenseTypesController.createLicenseType);

// PUT update license type
router.put('/license-types/:licenseTypeId', licenseTypesController.updateLicenseType);

// DELETE license type
router.delete('/license-types/:licenseTypeId', licenseTypesController.deleteLicenseType);

module.exports = router;
