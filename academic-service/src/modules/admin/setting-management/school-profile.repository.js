const pool = require("../../../config/db");

const schoolProfileRepository = {
  // Get school profile by school_id
  getProfileBySchoolId: async (school_id) => {
    const query = {
      text: `SELECT * FROM school_admin_profile WHERE school_id = $1`,
      values: [school_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Create school profile
  createProfile: async (school_id, profileData) => {
    const {
      school_name,
      affiliation_number,
      principal_name,
      contact_email,
      phone_number,
      established_year,
      address,
    } = profileData;

    const query = {
      text: `INSERT INTO school_admin_profile
             (school_id, school_name, affiliation_number, principal_name, contact_email, phone_number, established_year, address)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
      values: [
        school_id,
        school_name,
        affiliation_number,
        principal_name,
        contact_email,
        phone_number,
        established_year,
        address,
      ],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  // Update school profile
  updateProfile: async (school_id, profileData) => {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (profileData.school_name !== undefined) {
      updates.push(`school_name = $${paramCount++}`);
      values.push(profileData.school_name);
    }
    if (profileData.affiliation_number !== undefined) {
      updates.push(`affiliation_number = $${paramCount++}`);
      values.push(profileData.affiliation_number);
    }
    if (profileData.principal_name !== undefined) {
      updates.push(`principal_name = $${paramCount++}`);
      values.push(profileData.principal_name);
    }
    if (profileData.contact_email !== undefined) {
      updates.push(`contact_email = $${paramCount++}`);
      values.push(profileData.contact_email);
    }
    if (profileData.phone_number !== undefined) {
      updates.push(`phone_number = $${paramCount++}`);
      values.push(profileData.phone_number);
    }
    if (profileData.established_year !== undefined) {
      updates.push(`established_year = $${paramCount++}`);
      values.push(profileData.established_year);
    }
    if (profileData.address !== undefined) {
      updates.push(`address = $${paramCount++}`);
      values.push(profileData.address);
    }

    if (updates.length === 0) {
      return await this.getProfileBySchoolId(school_id);
    }

    updates.push(`updated_at = NOW()`);
    values.push(school_id);

    const query = {
      text: `UPDATE school_admin_profile
             SET ${updates.join(", ")}
             WHERE school_id = $${paramCount++}
             RETURNING *`,
      values: values,
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  // Delete school profile
  deleteProfile: async (school_id) => {
    const query = {
      text: `DELETE FROM school_admin_profile WHERE school_id = $1 RETURNING *`,
      values: [school_id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },
};

module.exports = schoolProfileRepository;
