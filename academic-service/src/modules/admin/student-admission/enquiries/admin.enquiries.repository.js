const pool = require('../../../../config/db');

/**
 * Get all enquiries for a school with optional filtering
 */
const getAllEnquiries = async ({ schoolId, status, classId, fromDate, toDate, limit, offset }) => {
  let queryText = `
    SELECT
      id,
      school_id,
      student_name,
      father_name,
      contact_number,
      email,
      class_id,
      academic_year,
      preferred_medium,
      current_school_name,
      residential_area,
      source_id,
      transport_required,
      siblings_in_school,
      religion,
      community_category,
      remarks,
      enquiry_status,
      created_at,
      updated_at
    FROM student_enquiries
    WHERE school_id = $1
  `;

  const values = [schoolId];
  let paramCount = 1;

  // Dynamic filtering
  if (status) {
    paramCount++;
    queryText += ` AND enquiry_status = $${paramCount}`;
    values.push(status);
  }

  if (classId) {
    paramCount++;
    queryText += ` AND class_id = $${paramCount}`;
    values.push(classId);
  }

  if (fromDate) {
    paramCount++;
    queryText += ` AND created_at >= $${paramCount}`;
    values.push(fromDate);
  }

  if (toDate) {
    paramCount++;
    queryText += ` AND created_at <= $${paramCount}`;
    values.push(toDate);
  }

  queryText += ' ORDER BY created_at DESC';

  if (limit) {
    paramCount++;
    queryText += ` LIMIT $${paramCount}`;
    values.push(limit);
  }

  if (offset) {
    paramCount++;
    queryText += ` OFFSET $${paramCount}`;
    values.push(offset);
  }

  const { rows } = await pool.query({ text: queryText, values });
  return rows;
};

/**
 * Get single enquiry by ID
 */
const getEnquiryById = async ({ schoolId, enquiryId }) => {
  const query = {
    text: `
      SELECT
        id,
        school_id,
        student_name,
        father_name,
        contact_number,
        email,
        class_id,
        academic_year,
        preferred_medium,
        current_school_name,
        residential_area,
        source_id,
        transport_required,
        siblings_in_school,
        religion,
        community_category,
        remarks,
        enquiry_status,
        created_at,
        updated_at
      FROM student_enquiries
      WHERE school_id = $1 AND id = $2
      LIMIT 1
    `,
    values: [schoolId, enquiryId]
  };

  const { rows } = await pool.query(query);
  return rows[0] || null;
};

/**
 * Create new enquiry
 */
const createEnquiry = async (enquiryData) => {
  const query = {
    text: `
      INSERT INTO student_enquiries (
        school_id,
        student_name,
        father_name,
        contact_number,
        email,
        class_id,
        academic_year,
        preferred_medium,
        current_school_name,
        residential_area,
        source_id,
        transport_required,
        siblings_in_school,
        religion,
        community_category,
        remarks,
        enquiry_status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17
      )
      RETURNING
        id,
        school_id,
        student_name,
        father_name,
        contact_number,
        email,
        class_id,
        academic_year,
        preferred_medium,
        current_school_name,
        residential_area,
        source_id,
        transport_required,
        siblings_in_school,
        religion,
        community_category,
        remarks,
        enquiry_status,
        created_at,
        updated_at
    `,
    values: [
      enquiryData.school_id,
      enquiryData.student_name,
      enquiryData.father_name,
      enquiryData.contact_number,
      enquiryData.email || null,
      enquiryData.class_id,
      enquiryData.academic_year,
      enquiryData.preferred_medium,
      enquiryData.current_school_name || null,
      enquiryData.residential_area || null,
      enquiryData.source_id,
      enquiryData.transport_required || false,
      enquiryData.siblings_in_school || false,
      enquiryData.religion || null,
      enquiryData.community_category || null,
      enquiryData.remarks || null,
      enquiryData.enquiry_status || 'New'
    ]
  };

  const { rows } = await pool.query(query);
  return rows[0];
};

/**
 * Update enquiry
 */
const updateEnquiry = async ({ schoolId, enquiryId, updateData }) => {
  const query = {
    text: `
      UPDATE student_enquiries
      SET
        student_name = $3,
        father_name = $4,
        contact_number = $5,
        email = $6,
        class_id = $7,
        academic_year = $8,
        preferred_medium = $9,
        current_school_name = $10,
        residential_area = $11,
        source_id = $12,
        transport_required = $13,
        siblings_in_school = $14,
        religion = $15,
        community_category = $16,
        remarks = $17,
        enquiry_status = $18,
        updated_at = NOW()
      WHERE school_id = $1 AND id = $2
      RETURNING
        id,
        school_id,
        student_name,
        father_name,
        contact_number,
        email,
        class_id,
        academic_year,
        preferred_medium,
        current_school_name,
        residential_area,
        source_id,
        transport_required,
        siblings_in_school,
        religion,
        community_category,
        remarks,
        enquiry_status,
        created_at,
        updated_at
    `,
    values: [
      schoolId,
      enquiryId,
      updateData.student_name,
      updateData.father_name,
      updateData.contact_number,
      updateData.email || null,
      updateData.class_id,
      updateData.academic_year,
      updateData.preferred_medium,
      updateData.current_school_name || null,
      updateData.residential_area || null,
      updateData.source_id,
      updateData.transport_required !== undefined ? updateData.transport_required : false,
      updateData.siblings_in_school !== undefined ? updateData.siblings_in_school : false,
      updateData.religion || null,
      updateData.community_category || null,
      updateData.remarks || null,
      updateData.enquiry_status
    ]
  };

  const { rows } = await pool.query(query);
  return rows[0] || null;
};

/**
 * Update only enquiry status
 */
const updateEnquiryStatus = async ({ schoolId, enquiryId, status }) => {
  const query = {
    text: `
      UPDATE student_enquiries
      SET enquiry_status = $3, updated_at = NOW()
      WHERE school_id = $1 AND id = $2
      RETURNING id, enquiry_status, updated_at
    `,
    values: [schoolId, enquiryId, status]
  };

  const { rows } = await pool.query(query);
  return rows[0] || null;
};

/**
 * Delete enquiry
 */
const deleteEnquiry = async ({ schoolId, enquiryId }) => {
  const query = {
    text: `
      DELETE FROM student_enquiries
      WHERE school_id = $1 AND id = $2
      RETURNING id, student_name, enquiry_status
    `,
    values: [schoolId, enquiryId]
  };

  const { rows } = await pool.query(query);
  return rows[0] || null;
};

/**
 * Get enquiry count by status (for dashboard/stats)
 */
const getEnquiryCountByStatus = async ({ schoolId }) => {
  const query = {
    text: `
      SELECT enquiry_status, COUNT(*) as count
      FROM student_enquiries
      WHERE school_id = $1
      GROUP BY enquiry_status
    `,
    values: [schoolId]
  };

  const { rows } = await pool.query(query);
  return rows;
};

/**
 * Auto-update old "New" enquiries to "Follow-up" status (after 24 hours)
 * Called by scheduled job (node-cron) - no school_id filter needed as this is a system job
 * Uses IST (Indian Standard Time: UTC+5:30) for timestamp comparison
 */
const updateOldNewEnquiries = async () => {
  const query = {
    text: `
      UPDATE student_enquiries
      SET enquiry_status = 'Follow-up', updated_at = NOW()
      WHERE enquiry_status = 'New'
        AND created_at AT TIME ZONE 'Asia/Kolkata' <= (NOW() AT TIME ZONE 'Asia/Kolkata') - INTERVAL '24 hours'
      RETURNING id, school_id, student_name, enquiry_status, created_at, updated_at
    `
  };

  const { rows } = await pool.query(query);
  return rows;
};

module.exports = {
  getAllEnquiries,
  getEnquiryById,
  createEnquiry,
  updateEnquiry,
  updateEnquiryStatus,
  deleteEnquiry,
  getEnquiryCountByStatus,
  updateOldNewEnquiries
};
