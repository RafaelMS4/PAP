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
        // ============ USER SCHEMAS ============
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
            },
            updated_at: {
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
              example: 'newuser',
              description: 'Unique username'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123',
              description: 'User password (min 6 characters)'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'newuser@example.com',
              description: 'User email address'
            },
            role: {
              type: 'string',
              enum: ['admin', 'user', 'technician'],
              default: 'user',
              example: 'user',
              description: 'User role in the system'
            }
          }
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'User name',
              example: 'David Moura'
            },
            email: {
              type: 'string',
              description: 'User Email',
              example: 'david.moura@gmail.com'
            },
            role: {
              type: 'string',
              description: 'role',
              example: 'user'
            },
          },
          description: 'All fields are optional. Only provided fields will be updated.'
        },
        
        // ============ EQUIPMENT SCHEMAS ============
        CreateEquipmentRequest: {
          type: 'object',
          required: ['name', 'type', 'serialNumber', 'assignedTo', 'maintenance'],
          properties: {
            name: {
              type: 'string',
              description: 'Equipment name',
              example: 'Dell Laptop XPS 15'
            },
            type: {
              type: 'string',
              description: 'Equipment type',
              example: 'Laptop'
            },
            serialNumber: {
              type: 'string',
              description: 'Unique serial number',
              example: 'SN123456789'
            },
            assignedTo: {
              type: 'integer',
              description: 'User ID assigned to',
              example: 2
            },
            maintenance: {
              type: 'string',
              format: 'date',
              description: 'Maintenance expiration date',
              example: '2024-12-31'
            }
          }
        },
        UpdateEquipmentRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Equipment name',
              example: 'Dell Laptop XPS 15'
            },
            type: {
              type: 'string',
              description: 'Equipment type',
              example: 'Laptop'
            },
            serialNumber: {
              type: 'string',
              description: 'Unique serial number',
              example: 'SN123456789'
            },
            assignedTo: {
              type: 'integer',
              description: 'User ID assigned to (null to unassign)',
              example: 2,
              nullable: true
            },
            maintenance: {
              type: 'string',
              format: 'date',
              description: 'Maintenance expiration date',
              example: '2025-06-30'
            }
          },
          description: 'All fields are optional. Only provided fields will be updated.'
        },
        Equipment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Equipment ID',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Equipment name',
              example: 'Dell Laptop XPS 15'
            },
            type: {
              type: 'string',
              description: 'Equipment type',
              example: 'Laptop'
            },
            serialNumber: {
              type: 'string',
              description: 'Unique serial number',
              example: 'SN123456789'
            },
            assignedTo: {
              type: 'integer',
              description: 'User ID assigned to',
              example: 1,
              nullable: true
            },
            username: {
              type: 'string',
              description: 'Username of assigned user',
              example: 'joao.silva',
              nullable: true
            },
            maintenance: {
              type: 'string',
              format: 'date',
              description: 'Maintenance expiration date',
              example: '2024-12-31'
            }
          }
        },
        
        // ============ ERROR SCHEMA ============
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
