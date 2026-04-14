const express = require('express');
const router = express.Router();
const enquirySourceController = require('../controllers/enquiry-source.controller');

// Get all enquiry sources
router.get('/', enquirySourceController.getAllEnquirySources);

// Get enquiry source by ID
router.get('/:sourceId', enquirySourceController.getEnquirySourceById);

// Create a new enquiry source
router.post('/', enquirySourceController.createEnquirySource);

// Update an enquiry source
router.put('/:sourceId', enquirySourceController.updateEnquirySource);

// Delete an enquiry source
router.delete('/:sourceId', enquirySourceController.deleteEnquirySource);

module.exports = router;
