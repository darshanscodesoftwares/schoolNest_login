/**
 * master-data.config.js
 *
 * Single source of truth for every reference/lookup table exposed via
 * the admin master-data CRUD endpoints.
 *
 * Each entry maps a URL slug → table metadata. The generic controller,
 * service, and repository read this config to build queries.
 *
 * Adding a new lookup table = add one entry here, no new files needed.
 */

const RESOURCES = {
  'blood-groups': {
    table:        'blood_groups',
    nameColumn:   'blood_group',
    tenantScoped: false,    // universal — same blood groups everywhere
    hasOrder:     true,
    label:        'Blood Group',
  },
  'license-types': {
    table:        'license_types',
    nameColumn:   'license_name',
    tenantScoped: false,
    hasOrder:     true,
    label:        'License Type',
  },
  'school-classes': {
    table:        'school_classes',
    nameColumn:   'class_name',
    tenantScoped: true,
    hasOrder:     true,
    label:        'School Class',
  },
  'departments': {
    table:        'departments',
    nameColumn:   'department_name',
    tenantScoped: true,
    hasOrder:     true,
    label:        'Department',
  },
  'enquiry-sources': {
    table:        'enquiry_sources',
    nameColumn:   'source_name',
    tenantScoped: true,
    hasOrder:     true,
    label:        'Enquiry Source',
  },
  'sections': {
    table:        'sections',
    nameColumn:   'section_name',
    tenantScoped: true,
    hasOrder:     false,
    label:        'Section',
  },
  'subjects': {
    table:        'subjects',
    nameColumn:   'subject_name',
    tenantScoped: true,
    hasOrder:     false,
    label:        'Subject',
  },
  'staff-roles': {
    table:        'staff_roles',
    nameColumn:   'role_name',
    tenantScoped: true,
    hasOrder:     true,
    label:        'Staff Role',
  },
  'staff-departments': {
    table:        'staff_departments',
    nameColumn:   'department_name',
    tenantScoped: true,
    hasOrder:     true,
    label:        'Staff Department',
  },
  'staff-positions': {
    table:        'staff_positions',
    nameColumn:   'position_name',
    tenantScoped: true,
    hasOrder:     true,
    label:        'Staff Position',
  },
};

module.exports = { RESOURCES };
