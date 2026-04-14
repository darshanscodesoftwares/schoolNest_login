const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');

// Lookup tables endpoint — GET /api/v1/admin/lookup/{resource}
// Examples:
//   GET /api/v1/admin/lookup/enquiry-sources
//   GET /api/v1/admin/lookup/blood-groups
//   GET /api/v1/admin/lookup/school-classes?school_id=101

const resourceMap = {
  'enquiry-sources': {
    table: 'enquiry_sources',
    columns: 'id, school_id, source_name, order_number, created_at',
    schoolScoped: true
  },
  'blood-groups': {
    table: 'blood_groups',
    columns: 'id, blood_group, order_number, created_at',
    schoolScoped: false
  },
  'classes': {
    table: 'school_classes',
    columns: 'id, school_id, class_name, order_number, created_at',
    schoolScoped: true
  },
  'school-classes': {
    table: 'school_classes',
    columns: 'id, school_id, class_name, order_number, created_at',
    schoolScoped: true
  },
  'departments': {
    table: 'departments',
    columns: 'id, school_id, department_name, order_number, created_at',
    schoolScoped: true
  },
  'sections': {
    table: 'sections',
    columns: 'id, school_id, section_name, created_at',
    schoolScoped: true
  },
  'staff-roles': {
    table: 'staff_roles',
    columns: 'id, school_id, role_name, order_number, created_at',
    schoolScoped: true
  },
  'staff-departments': {
    table: 'staff_departments',
    columns: 'id, school_id, department_name, order_number, created_at',
    schoolScoped: true
  },
  'staff-positions': {
    table: 'staff_positions',
    columns: 'id, school_id, position_name, order_number, created_at',
    schoolScoped: true
  },
  'license-types': {
    table: 'license_types',
    columns: 'id, license_name, order_number, created_at',
    schoolScoped: false
  },
  'subjects': {
    table: 'subjects',
    columns: 'id, school_id, subject_name, created_at',
    schoolScoped: true
  }
};

/**
 * GET /api/v1/{resource}
 * List all records for a lookup table
 *
 * Query params:
 *   ?school_id=101 — filter by school (for school-scoped tables)
 *   ?limit=50&offset=0 — pagination
 */
router.get('/:resource', async (req, res, next) => {
  try {
    const { resource } = req.params;
    const { school_id, limit = 100, offset = 0 } = req.query;

    const mapping = resourceMap[resource];
    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: `Lookup table '${resource}' not found`,
        code: 'NOT_FOUND'
      });
    }

    let query = `SELECT ${mapping.columns} FROM ${mapping.table}`;
    const params = [];

    if (mapping.schoolScoped && school_id) {
      query += ` WHERE school_id = $${params.length + 1}`;
      params.push(parseInt(school_id, 10));
    }

    // Order by order_number or created_at
    if (mapping.table !== 'blood_groups' && mapping.table !== 'license_types') {
      query += ' ORDER BY order_number ASC, created_at DESC';
    } else {
      query += ' ORDER BY order_number ASC';
    }

    // Pagination
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        total: result.rows.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/{resource}
 * Create a new lookup record
 *
 * Body examples:
 *   { "source_name": "Phone Call", "school_id": 101 }
 *   { "blood_group": "O+", "order_number": 1 }
 *   { "class_name": "Class 13", "school_id": 101, "order_number": 16 }
 */
router.post('/:resource', async (req, res, next) => {
  try {
    const { resource } = req.params;
    const body = req.body;

    const mapping = resourceMap[resource];
    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: `Lookup table '${resource}' not found`,
        code: 'NOT_FOUND'
      });
    }

    // Map resource names to column names and values
    const columnMap = {
      'enquiry-sources': { col: 'source_name', key: 'source_name' },
      'blood-groups': { col: 'blood_group', key: 'blood_group' },
      'classes': { col: 'class_name', key: 'class_name' },
      'school-classes': { col: 'class_name', key: 'class_name' },
      'departments': { col: 'department_name', key: 'department_name' },
      'sections': { col: 'section_name', key: 'section_name' },
      'staff-roles': { col: 'role_name', key: 'role_name' },
      'staff-departments': { col: 'department_name', key: 'department_name' },
      'staff-positions': { col: 'position_name', key: 'position_name' },
      'license-types': { col: 'license_name', key: 'license_name' },
      'subjects': { col: 'subject_name', key: 'subject_name' }
    };

    const colMap = columnMap[resource];
    if (!colMap) {
      return res.status(400).json({
        success: false,
        message: `Cannot create in ${resource}`,
        code: 'INVALID_RESOURCE'
      });
    }

    // Build INSERT query
    let insertCols = [colMap.col];
    let values = [body[colMap.key]];
    let placeholders = ['$1'];

    // Add optional fields
    if (body.order_number !== undefined) {
      insertCols.push('order_number');
      values.push(body.order_number);
      placeholders.push(`$${values.length}`);
    }

    // Add school_id (defaults to 101 if not provided)
    if (mapping.schoolScoped) {
      insertCols.push('school_id');
      values.push(body.school_id || 101);
      placeholders.push(`$${values.length}`);
    }

    const query = `
      INSERT INTO ${mapping.table} (${insertCols.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING ${mapping.columns}
    `;

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: `${resource} created successfully`,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/{resource}/:id
 * Get a single lookup record by ID
 */
router.get('/:resource/:id', async (req, res, next) => {
  try {
    const { resource, id } = req.params;

    const mapping = resourceMap[resource];
    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: `Lookup table '${resource}' not found`,
        code: 'NOT_FOUND'
      });
    }

    const result = await pool.query(
      `SELECT ${mapping.columns} FROM ${mapping.table} WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Record not found in ${resource}`,
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
