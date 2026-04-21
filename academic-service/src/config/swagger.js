const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SchoolNest Academic Service API',
      version: '1.0.0',
      description: 'API documentation for the SchoolNest Academic Service — Teacher & Parent modules'
    },
    servers: [
      { url: '/', description: 'Current Host (auto)' },
      { url: 'http://localhost:4002', description: 'Local' },
      { url: 'https://schoolnest-academic.onrender.com', description: 'Production (Render)' }
    ],
    components: {
      securitySchemes: {
        adminAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste an Admin JWT here. Only applies to Admin-tagged endpoints.',
        },
        teacherAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste a Teacher JWT here. Only applies to Teacher-tagged endpoints.',
        },
        parentAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste a Parent JWT here. Only applies to Parent-tagged endpoints.',
        },
      },
    },
    tags: [
      // Admin
      { name: 'Admin - Auth',                 description: 'Login (Admin / Teacher / Parent) — served by auth-service on port 3000' },
      { name: 'Admin - Enquiries',             description: 'Student enquiry management' },
      { name: 'Admin - Admissions',            description: 'Full admission lifecycle: Draft → Under Verification → Approved' },
      { name: 'Admin - Students',              description: 'Approved student records' },
      { name: 'Admin - Teacher Records',       description: 'Teacher CRUD + Bridge 1 auto-creates login credentials' },
      { name: 'Admin - Driver Records',        description: 'Driver CRUD with document uploads' },
      { name: 'Admin - Other Staff',           description: 'Non-teaching staff CRUD' },
      { name: 'Admin - Class Assignments',     description: 'Class-section-teacher mapping + Bridge 3 syncs to teacher/parent classes table' },
      { name: 'Admin - Subject Assignments',   description: 'Subject-class-teacher mapping' },
      { name: 'Admin - Exams',                 description: 'Exam management and result status' },
      { name: 'Admin - Announcements',         description: 'Compose and send school announcements + templates' },
      { name: 'Admin - Settings',              description: 'School profile settings' },
      { name: 'Admin - Teacher Edit Requests', description: 'Review and approve/reject teacher profile change requests' },
      { name: 'Admin - Master Data',           description: 'CRUD over reference/lookup tables (blood groups, classes, departments, sections, subjects, staff roles/depts/positions, license types, enquiry sources)' },
      { name: 'Admin - Timetable',             description: 'Configure period timings, fill timetable grid, publish/unpublish for teachers and parents' },
      { name: 'Admin - Class Templates',       description: 'Read-only global class catalogue (Nursery → Class 12) that feeds the Add New Class popup dropdown' },
      { name: 'Admin - Section Templates',     description: 'Read-only global section catalogue (A-F, A1-A5, B1-B5, colour houses) that feeds the Add New Class popup chips. A/B/C/D are defaults (is_default=true)' },
      { name: 'Admin - Classes',               description: 'Add class + sections atomically, list classes with section counts, per-class section CRUD. Sections must be attached as a contiguous prefix of the section_templates order' },
      // Teacher
      { name: 'Teacher - Attendance', description: 'Mark, view, edit, delete student attendance' },
      { name: 'Teacher - Homework', description: 'Create and manage homework assignments' },
      { name: 'Teacher - Timetable', description: 'View weekly class schedule' },
      { name: 'Teacher - Announcements', description: 'Send and manage announcements' },
      { name: 'Teacher - Leave', description: 'Review and approve leave requests' },
      { name: 'Teacher - Exams', description: 'Manage exams and enter marks' },
      { name: 'Teacher - Check-in', description: 'Self check-in with geofence' },
      { name: 'Teacher - Work Details', description: 'Teacher profile, work summary and assigned classes' },
      { name: 'Teacher - Edit Requests', description: 'Request profile changes — requires admin approval' },
      // Parent
      { name: 'Parent - Attendance', description: 'View child attendance' },
      { name: 'Parent - Homework', description: 'View child homework' },
      { name: 'Parent - Timetable', description: 'View child timetable' },
      { name: 'Parent - Announcements', description: 'View school announcements' },
      { name: 'Parent - Leave', description: 'Apply and track leave' },
      { name: 'Parent - Results', description: 'View exam results' },
      { name: 'Parent - Fees', description: 'View fees summary and payment history' }
    ]
  },
  apis: ['./src/docs/*.js']
};

const spec = swaggerJsdoc(options);

// ─── Per-tag security: assign the right auth scheme based on tag prefix ──
// Admin endpoints require adminAuth, Teacher endpoints require teacherAuth,
// Parent endpoints require parentAuth. Paste separate tokens in each locker
// and only the relevant one is used per request.
function schemeForTag(tag) {
  if (!tag) return null;
  if (tag.startsWith('Admin'))   return 'adminAuth';
  if (tag.startsWith('Teacher')) return 'teacherAuth';
  if (tag.startsWith('Parent'))  return 'parentAuth';
  return null;
}

for (const pathKey of Object.keys(spec.paths || {})) {
  for (const method of Object.keys(spec.paths[pathKey])) {
    const op = spec.paths[pathKey][method];
    if (!op || typeof op !== 'object') continue;
    const primaryTag = Array.isArray(op.tags) ? op.tags[0] : null;
    const scheme = schemeForTag(primaryTag);
    if (scheme) {
      op.security = [{ [scheme]: [] }];
    }
  }
}

module.exports = spec;
