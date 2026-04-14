const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');

// Admin-only lookup table management endpoints
// POST /api/v1/admin/lookup/{resource}      — Create new record
// PUT  /api/v1/admin/lookup/{resource}/{id} — Update record
// DELETE /api/v1/admin/lookup/{resource}/{id} — Delete record

const resourceMap = {
  'enquiry-sources': {
    table: 'enquiry_sources',
    columns: 'id, school_id, source_name, order_number, created_at',
    schoolScoped: true,
    insertColumns: 'school_id, source_name, order_number',
    updateColumns: ['source_name', 'order_number']
  },
  'blood-groups': {
    table: 'blood_groups',
    columns: 'id, blood_group, order_number, created_at',
    schoolScoped: false,
    insertColumns: 'blood_group, order_number',
    updateColumns: ['blood_group', 'order_number']
  },
  'school-classes': {
    table: 'school_classes',
    columns: 'id, school_id, class_name, order_number, created_at',
    schoolScoped: true,
    insertColumns: 'school_id, class_name, order_number',
    updateColumns: ['class_name', 'order_number']
  },
  'departments': {
    table: 'departments',
    columns: 'id, school_id, department_name, order_number, created_at',
    schoolScoped: true,
    insertColumns: 'school_id, department_name, order_number',
    updateColumns: ['department_name', 'order_number']
  },
  'sections': {
    table: 'sections',
    columns: 'id, school_id, section_name, created_at',
    schoolScoped: true,
    insertColumns: 'school_id, section_name',
    updateColumns: ['section_name']
  },
  'staff-roles': {
    table: 'staff_roles',
    columns: 'id, school_id, role_name, order_number, created_at',
    schoolScoped: true,
    insertColumns: 'school_id, role_name, order_number',
    updateColumns: ['role_name', 'order_number']
  },
  'staff-departments': {
    table: 'staff_departments',
    columns: 'id, school_id, department_name, order_number, created_at',
    schoolScoped: true,
    insertColumns: 'school_id, department_name, order_number',
    updateColumns: ['department_name', 'order_number']
  },
  'staff-positions': {
    table: 'staff_positions',
    columns: 'id, school_id, position_name, order_number, created_at',
    schoolScoped: true,
    insertColumns: 'school_id, position_name, order_number',
    updateColumns: ['position_name', 'order_number']
  },
  'license-types': {
    table: 'license_types',
    columns: 'id, license_name, order_number, created_at',
    schoolScoped: false,
    insertColumns: 'license_name, order_number',
    updateColumns: ['license_name', 'order_number']
  },
  'subjects': {
    table: 'subjects',
    columns: 'id, school_id, subject_name, created_at',
    schoolScoped: true,
    insertColumns: 'school_id, subject_name',
    updateColumns: ['subject_name']
  }
};

/**
 * POST /api/v1/admin/lookup/:resource
 * Create a new lookup record
 *
 * Body examples:
 *   { "source_name": "Phone Call", "school_id": 101 }
 *   { "blood_group": "O+", "order_number": 1 }
 *   { "class_name": "Class 13", "school_id": 101, "order_number": 16 }
 */
router.post('/admin/lookup/:resource', async (req, res, next) => {
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

    // Build INSERT query dynamically
    const columns = mapping.insertColumns.split(', ');
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const values = columns.map(col => {
      // Map camelCase/snake_case from body to column names
      const key = col === 'source_name' ? 'source_name' :
                  col === 'class_name' ? 'class_name' :
                  col === 'department_name' ? 'department_name' :
                  col === 'role_name' ? 'role_name' :
                  col === 'position_name' ? 'position_name' :
                  col === 'section_name' ? 'section_name' :
                  col === 'subject_name' ? 'subject_name' :
                  col === 'blood_group' ? 'blood_group' :
                  col === 'license_name' ? 'license_name' :
                  col;

      return body[key] !== undefined ? body[key] : body[col];
    });

    const query = `
      INSERT INTO ${mapping.table} (${mapping.insertColumns})
      VALUES (${placeholders})
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
 * PUT /api/v1/admin/lookup/:resource/:id
 * Update a lookup record
 */
router.put('/admin/lookup/:resource/:id', async (req, res, next) => {
  try {
    const { resource, id } = req.params;
    const body = req.body;

    const mapping = resourceMap[resource];
    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: `Lookup table '${resource}' not found`,
        code: 'NOT_FOUND'
      });
    }

    // Build UPDATE query
    const setClauses = mapping.updateColumns
      .map((col, i) => `${col} = $${i + 1}`)
      .join(', ');

    const values = mapping.updateColumns.map(col => body[col]);
    values.push(id);

    const query = `
      UPDATE ${mapping.table}
      SET ${setClauses}, updated_at = NOW()
      WHERE id = $${values.length}
      RETURNING ${mapping.columns}
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Record not found in ${resource}`,
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: `${resource} updated successfully`,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/admin/lookup/:resource/:id
 * Delete a lookup record
 */
router.delete('/admin/lookup/:resource/:id', async (req, res, next) => {
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
      `DELETE FROM ${mapping.table} WHERE id = $1 RETURNING id`,
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
      message: `${resource} deleted successfully`,
      data: { id: result.rows[0].id }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
