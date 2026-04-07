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
    tags: [
      { name: 'Auth', description: 'Authentication — Login and Logout' }
    ]
  },
  apis: ['./src/docs/*.js']
};

module.exports = swaggerJsdoc(options);
