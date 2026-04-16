const express = require('express');
const router = express.Router();
const fileStorageUtil = require('../../../utils/fileStorage.util');

/**
 * GET /api/v1/academic/files/:fileId
 * Retrieve and serve a file from the database
 *
 * No authentication required (same as static file serving)
 * Sets appropriate Content-Type header based on stored MIME type
 * Streams file binary data in response
 */
router.get('/:fileId', async (req, res, next) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      const error = new Error('File ID is required');
      error.statusCode = 400;
      error.code = 'INVALID_INPUT';
      throw error;
    }

    // Retrieve file from database
    const fileData = await fileStorageUtil.getFileById(fileId);

    if (!fileData) {
      const error = new Error('File not found');
      error.statusCode = 404;
      error.code = 'FILE_NOT_FOUND';
      throw error;
    }

    // Set response headers
    res.setHeader('Content-Type', fileData.mime_type);
    res.setHeader('Content-Length', fileData.file_size);
    res.setHeader('Content-Disposition', `inline; filename="${fileData.original_name}"`);

    // Send file binary data
    res.send(fileData.file_data);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
