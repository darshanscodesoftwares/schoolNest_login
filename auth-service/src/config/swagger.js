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
      { url: 'https://schoolnest-login.onrender.com', description: 'Production (Render)' },
      { url: 'http://localhost:3000', description: 'Local' }
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
