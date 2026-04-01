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
      { url: 'https://schoolnest-login-1.onrender.com', description: 'Production (Render)' },
      { url: 'http://localhost:4002', description: 'Local' }
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
      { name: 'Teacher - Attendance', description: 'Mark, view, edit, delete student attendance' },
      { name: 'Teacher - Homework', description: 'Create and manage homework assignments' },
      { name: 'Teacher - Timetable', description: 'View weekly class schedule' },
      { name: 'Teacher - Announcements', description: 'Send and manage announcements' },
      { name: 'Teacher - Leave', description: 'Review and approve leave requests' },
      { name: 'Teacher - Exams', description: 'Manage exams and enter marks' },
      { name: 'Teacher - Check-in', description: 'Self check-in with geofence' },
      { name: 'Parent - Attendance', description: 'View child attendance' }
    ]
  },
  apis: ['./src/docs/*.js']
};

module.exports = swaggerJsdoc(options);
