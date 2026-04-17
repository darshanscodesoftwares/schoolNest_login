const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SchoolNest Auth Service API',
      version: '1.0.0',
      description: 'API documentation for the SchoolNest Authentication Service'
    },
    servers: [
      { url: '/', description: 'Current Host (auto)' },
      { url: 'http://localhost:3000', description: 'Local' },
      { url: 'https://schoolnest-auth.onrender.com', description: 'Production (Render)' }
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
    tags: [
      { name: 'Auth', description: 'Login and Logout (email + password) — works for Admin, Teacher, Parent' },
      { name: 'Teacher OTP', description: 'Teacher phone-based OTP login' },
      { name: 'Parent OTP', description: 'Parent phone-based OTP login — uses the phone from child admission records' }
    ]
  },
  apis: ['./src/docs/*.js']
};

module.exports = swaggerJsdoc(options);
