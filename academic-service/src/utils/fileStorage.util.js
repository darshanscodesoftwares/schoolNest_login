const pool = require('../config/db');

const fileStorageUtil = {
  // Save file to database and return the file ID
  saveFileToDB: async (file, schoolId, fieldName) => {
    if (!file || !file.buffer) {
      return null;
    }

    try {
      const query = {
        text: `INSERT INTO file_storage
               (field_name, original_name, mime_type, file_size, file_data, school_id)
               VALUES ($1, $2, $3, $4, $5, $6)
               RETURNING id`,
        values: [
          fieldName || file.fieldname,
          file.originalname,
          file.mimetype,
          file.size,
          file.buffer,
          schoolId
        ]
      };

      const result = await pool.query(query);
      return result.rows[0].id;
    } catch (error) {
      console.error('Error saving file to database:', error);
      throw error;
    }
  },

  // Get file from database by ID
  getFileById: async (fileId) => {
    try {
      const query = {
        text: `SELECT id, original_name, mime_type, file_size, file_data, created_at
               FROM file_storage
               WHERE id = $1`,
        values: [fileId]
      };

      const result = await pool.query(query);
      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error retrieving file from database:', error);
      throw error;
    }
  },

  // Generate file URL (used to store in database columns)
  generateFileUrl: (fileId) => {
    return `/api/v1/academic/files/${fileId}`;
  }
};

module.exports = fileStorageUtil;
