import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IT HelpDesk Management System API',
      version: '1.0.0',
      description: 'API documentation for the IT HelpDesk Management System',
      contact: {
        name: 'Support',
        email: 'support@helpdesk.local'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            username: {
              type: 'string',
              example: 'admin'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@example.com'
            },
            role: {
              type: 'string',
              enum: ['admin', 'user', 'technician'],
              example: 'admin'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              example: 'admin'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Login successful'
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        CreateUserRequest: {
          type: 'object',
          required: ['username', 'password', 'email'],
          properties: {
            username: {
              type: 'string',
              example: 'newuser'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'newuser@example.com'
            },
            role: {
              type: 'string',
              enum: ['admin', 'user', 'technician'],
              example: 'user'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Error message'
            }
          }
        }
      }
    },
    security: []
  },
  apis: ['./src/routes/*.js']
};

export const specs = swaggerJsdoc(options);
