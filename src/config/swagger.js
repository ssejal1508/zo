const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Dashboard API",
      version: "1.0.0",
      description: "API documentation for the Finance Dashboard backend assessment. Features JWT auth and full RBAC.",
      contact: {
        name: "Developer",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token to access protected endpoints. Obtain via /api/auth/login",
        },
      },
    },
  },
  apis: ["./src/routes/*.js"], // files containing annotations
};

module.exports = swaggerJsdoc(options);
