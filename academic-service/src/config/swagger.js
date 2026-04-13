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
      { url: 'https://schoolnest-login-1.onrender.com', description: 'Production (Render)' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }],
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

module.exports = swaggerJsdoc(options);
