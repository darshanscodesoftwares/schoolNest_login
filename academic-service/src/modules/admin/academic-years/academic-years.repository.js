const pool = require("../../../config/db");

const academicYearsRepository = {
  // Get all academic years for a school
  getAllYears: async (school_id) => {
    const query = {
      text: `SELECT id, school_id, year_name, start_date, end_date, is_active, created_at
             FROM academic_years
             WHERE school_id = $1
             ORDER BY year_name DESC`,
      values: [school_id],
    };
    const result = await pool.query(query);
    return result.rows;
  },

  // Get active academic year
  getActiveYear: async (school_id) => {
    const query = {
      text: `SELECT id, school_id, year_name, start_date, end_date, is_active, created_at
             FROM academic_years
             WHERE school_id = $1 AND is_active = true
             LIMIT 1`,
      values: [school_id],
    };
    const result = await pool.query(query);
    return result.rows[0] || null;
  },

  // Create new academic year
  createYear: async ({ school_id, year_name, start_date, end_date }) => {
    const query = {
      text: `INSERT INTO academic_years (school_id, year_name, start_date, end_date, is_active)
             VALUES ($1, $2, $3, $4, true)
             RETURNING *`,
      values: [school_id, year_name, start_date, end_date],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Check if year exists
  yearExists: async (school_id, year_name) => {
    const query = {
      text: `SELECT id FROM academic_years
             WHERE school_id = $1 AND year_name = $2 LIMIT 1`,
      values: [school_id, year_name],
    };
    const result = await pool.query(query);
    return result.rows.length > 0;
  },

  // Get year by name
  getYearByName: async (school_id, year_name) => {
    const query = {
      text: `SELECT id, school_id, year_name, start_date, end_date, is_active, created_at
             FROM academic_years
             WHERE school_id = $1 AND year_name = $2 LIMIT 1`,
      values: [school_id, year_name],
    };
    const result = await pool.query(query);
    return result.rows[0] || null;
  },

  // Activate next year (keep old years for historical access)
  transitionYear: async (school_id, toYear) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Deactivate all years first
      await client.query(
        `UPDATE academic_years SET is_active = false WHERE school_id = $1`,
        [school_id]
      );

      // Activate only the new year
      const result = await client.query(
        `UPDATE academic_years SET is_active = true WHERE school_id = $1 AND year_name = $2 RETURNING *`,
        [school_id, toYear]
      );

      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};

module.exports = academicYearsRepository;
