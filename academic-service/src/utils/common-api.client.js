/**
 * common-api.client.js — adapter replacing jerin's HTTP-based common-api calls
 *
 * The common-api service is dropped entirely. All reference tables
 * (school_classes, enquiry_sources, blood_groups, etc.) now live in academic_db.
 * This file provides the same function signatures so caller code works unchanged.
 */

const pool = require('../config/db');

/**
 * Route an API endpoint pattern to a direct academic_db query.
 * Handles endpoints that jerin's code called via HTTP.
 *
 * Supported patterns:
 *   /api/v1/classes/:id           → school_classes
 *   /api/v1/enquiry-sources/:id   → enquiry_sources
 *   /api/v1/blood-groups/:id      → blood_groups
 *   /api/v1/departments/:id       → departments
 *   /api/v1/staff-roles/:id       → staff_roles
 *   /api/v1/staff-departments/:id → staff_departments
 *   /api/v1/staff-positions/:id   → staff_positions
 *   /api/v1/license-types/:id     → license_types
 *
 * @param {string} endpoint - API endpoint path
 * @param {string} _token   - Ignored (kept for API compatibility)
 * @returns {Object|null} Response in { success, data } shape, or null on error
 */
const commonApiGet = async (endpoint, _token) => {
  try {
    // Parse endpoint to extract resource type and ID
    // Pattern: /api/v1/{resource}/{id}
    const match = endpoint.match(/^\/api\/v1\/([\w-]+)\/([^/?]+)/);
    if (!match) return null;

    const [, resource, id] = match;

    const resourceMap = {
      'classes':           { table: 'school_classes',   column: 'class_name' },
      'enquiry-sources':   { table: 'enquiry_sources',  column: 'source_name' },
      'blood-groups':      { table: 'blood_groups',     column: 'blood_group' },
      'departments':       { table: 'departments',      column: 'department_name' },
      'staff-roles':       { table: 'staff_roles',      column: 'role_name' },
      'staff-departments': { table: 'staff_departments', column: 'department_name' },
      'staff-positions':   { table: 'staff_positions',  column: 'position_name' },
      'license-types':     { table: 'license_types',    column: 'license_name' },
    };

    const mapping = resourceMap[resource];
    if (!mapping) return null;

    const result = await pool.query(
      `SELECT * FROM ${mapping.table} WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];

    // Return in same shape as common-api HTTP response: { success, data }
    return {
      success: true,
      data: {
        id: row.id,
        class_name:       row.class_name,
        source_name:      row.source_name,
        blood_group:      row.blood_group,
        blood_type:       row.blood_group,   // alias jerin uses
        department_name:  row.department_name,
        other_staff_role: row.role_name,     // alias for staff_roles
        other_staff_departments: row.department_name, // alias for staff_departments
        other_staff_positions:   row.position_name,   // alias for staff_positions
        license_name:     row.license_name,
        name:             row[mapping.column]          // generic fallback
      }
    };
  } catch (error) {
    console.error('common-api.client DB error:', error.message);
    return null;
  }
};

/**
 * Validate that a class_id exists in school_classes table.
 * Used by enquiry and admission services before creating records.
 *
 * @param {string} classId - UUID of the class
 * @returns {Promise<boolean>}
 */
const validateClassExists = async (classId) => {
  try {
    if (!classId) return false;
    const result = await pool.query(
      `SELECT id FROM school_classes WHERE id = $1 LIMIT 1`,
      [classId]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('validateClassExists error:', error.message);
    return false;
  }
};

/**
 * Validate that a source_id exists in enquiry_sources table.
 * Used by enquiry service before creating records.
 *
 * @param {string} sourceId - UUID of the enquiry source
 * @returns {Promise<boolean>}
 */
const validateEnquirySourceExists = async (sourceId) => {
  try {
    if (!sourceId) return false;
    const result = await pool.query(
      `SELECT id FROM enquiry_sources WHERE id = $1 LIMIT 1`,
      [sourceId]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('validateEnquirySourceExists error:', error.message);
    return false;
  }
};

module.exports = { commonApiGet, validateClassExists, validateEnquirySourceExists };
