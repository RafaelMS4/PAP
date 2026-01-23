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

        // ============ TICKETS SCHEMAS ================
        Ticket: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Ticket ID',
              example: 1
            },
            title: {
              type: 'string',
              description: 'Ticket Title (auto-generated: Ticket 0001)',
              example: 'Ticket 0001'
            },
            description: {
              type: 'string',
              description: 'Ticket Description',
              example: 'Computer not turning on'
            },
            status: {
              type: 'string',
              enum: ['open', 'in_progress', 'waiting', 'resolved', 'closed'],
              description: 'Ticket status',
              example: 'open'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Ticket priority',
              example: 'high'
            },
            category: {
              type: 'string',
              description: 'Ticket category',
              example: 'Hardware',
              nullable: true
            },
            user_id: {
              type: 'integer',
              description: 'User who created the ticket',
              example: 2
            },
            assigned_to: {
              type: 'integer',
              description: 'Technician assigned to ticket',
              example: 1,
              nullable: true
            },
            primary_equipment_id: {
              type: 'integer',
              description: 'Primary equipment related to ticket',
              example: 1,
              nullable: true
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            },
            resolved_at: {
              type: 'string',
              format: 'date-time',
              description: 'Resolution timestamp',
              nullable: true
            }
          }
        },

        CreateTicketRequest: {
          type: 'object',
          required: ['description'],
          properties: {
            title: {
              type: 'string',
              description: 'Ticket title (optional, auto-generated if not provided)',
              example: 'Computer not working'
            },
            description: {
              type: 'string',
              description: 'Descrição detalhada do problema',
              example: 'O computador da sala 5 não liga quando pressiono o botão'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              default: 'medium',
              description: 'Prioridade definida pelo utilizador',
              example: 'high'
            },
            category: {
              type: 'string',
              description: 'Ticket category',
              example: 'Hardware',
              nullable: true
            },
            primary_equipment_id: {
              type: 'integer',
              description: 'ID do equipamento principal',
              example: 1,
              nullable: true
            }
          }
        },

      UpdateTicketRequest: {
        type: 'object',
        properties: {
          description: { type: 'string' },
          status: {
            type: 'string',
            enum: ['open', 'in_progress', 'waiting', 'resolved', 'closed']
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'urgent']
          },
          category: {
            type: 'string',
            description: 'Categoria definida pelo técnico',
            example: 'Hardware'
          },
          assigned_to: {
            type: 'integer',
            description: 'ID do técnico atribuído',
            example: 1
          },
          primary_equipment_id: {
            type: 'integer',
            description: 'ID do equipamento principal',
            example: 1
          }
        }
      },

        // ============ TICKET TIME LOGS ================
        TicketTimeLog: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            ticket_id: {
              type: 'integer',
              example: 1
            },
            user_id: {
              type: 'integer',
              example: 1
            },
            time_spent: {
              type: 'integer',
              description: 'Time in minutes',
              example: 120
            },
            description: {
              type: 'string',
              example: 'Diagnosed hardware issue',
              nullable: true
            },
            log_date: {
              type: 'string',
              format: 'date',
              example: '2026-01-14'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        CreateTimeLogRequest: {
          type: 'object',
          required: ['ticket_id', 'time_spent'],
          properties: {
            ticket_id: {
              type: 'integer',
              example: 1
            },
            time_spent: {
              type: 'integer',
              description: 'Time in minutes',
              example: 120
            },
            description: {
              type: 'string',
              example: 'Fixed hardware issue'
            },
            log_date: {
              type: 'string',
              format: 'date',
              example: '2026-01-14'
            }
          }
        },

        // ============ TICKET EQUIPMENT ================
        TicketEquipment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            ticket_id: {
              type: 'integer',
              example: 1
            },
            equipment_id: {
              type: 'integer',
              example: 1
            },
            added_by: {
              type: 'integer',
              example: 1
            },
            notes: {
              type: 'string',
              example: 'Related equipment',
              nullable: true
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // ============ TICKET COMMENTS ================
        TicketComment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            ticket_id: {
              type: 'integer',
              example: 1
            },
            user_id: {
              type: 'integer',
              example: 1
            },
            comment_type: {
              type: 'string',
              enum: ['comment', 'task', 'internal_note', 'solution'],
              example: 'comment'
            },
            message: {
              type: 'string',
              example: 'This is a comment'
            },
            is_internal: {
              type: 'boolean',
              example: false
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

        CreateCommentRequest: {
          type: 'object',
          required: ['ticket_id', 'message'],
          properties: {
            ticket_id: {
              type: 'integer',
              example: 1
            },
            comment_type: {
              type: 'string',
              enum: ['comment', 'task', 'internal_note', 'solution'],
              default: 'comment',
              example: 'comment'
            },
            message: {
              type: 'string',
              example: 'Added new comment'
            },
            is_internal: {
              type: 'boolean',
              default: false,
              example: false
            }
          }
        },

        // ============ TICKET ATTACHMENTS ================
        TicketAttachment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            ticket_id: {
              type: 'integer',
              example: 1
            },
            comment_id: {
              type: 'integer',
              example: 1,
              nullable: true
            },
            user_id: {
              type: 'integer',
              example: 1
            },
            filename: {
              type: 'string',
              example: 'screenshot.png'
            },
            filepath: {
              type: 'string',
              example: '/uploads/screenshot.png'
            },
            file_type: {
              type: 'string',
              example: 'image/png',
              nullable: true
            },
            file_size: {
              type: 'integer',
              example: 102400,
              nullable: true
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // ============ TICKET HISTORY ================
        TicketHistory: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            ticket_id: {
              type: 'integer',
              example: 1
            },
            user_id: {
              type: 'integer',
              example: 1
            },
            action: {
              type: 'string',
              example: 'status_changed'
            },
            field_changed: {
              type: 'string',
              example: 'status',
              nullable: true
            },
            old_value: {
              type: 'string',
              example: 'open',
              nullable: true
            },
            new_value: {
              type: 'string',
              example: 'in_progress',
              nullable: true
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        
        // ============ TIME LOG SCHEMAS ============
        AddTimeLogRequest: {
          type: 'object',
          required: ['time_spent'],
          properties: {
            time_spent: {
              type: 'integer',
              description: 'Time spent in minutes',
              example: 120
            },
            description: {
              type: 'string',
              description: 'Description of work done',
              example: 'Fixed hardware issue',
              nullable: true
            }
          }
        },

        // ============ COMMENT SCHEMAS ============
        AddCommentRequest: {
          type: 'object',
          required: ['message'],
          properties: {
            message: {
              type: 'string',
              description: 'Comment message',
              example: 'Added new comment'
            },
            comment_type: {
              type: 'string',
              enum: ['comment', 'task', 'internal_note', 'solution'],
              default: 'comment',
              description: 'Type of comment (task and solution for admins only)',
              example: 'comment'
            },
            is_internal: {
              type: 'boolean',
              default: false,
              description: 'Whether this comment is internal only',
              example: false
            }
          }
        },

        UpdateCommentRequest: {
          type: 'object',
          required: ['message'],
          properties: {
            message: {
              type: 'string',
              example: 'Updated comment'
            }
          }
        },

        // ============ CLOSE TICKET SCHEMAS ============
        CloseTicketRequest: {
          type: 'object',
          required: ['solution_message'],
          properties: {
            solution_message: {
              type: 'string',
              description: 'Solution message to close the ticket',
              example: 'Issue resolved - hardware replaced'
            }
          }
        },

        // ============ ASSIGN TICKET SCHEMAS ============
        AssignTicketRequest: {
          type: 'object',
          required: ['assigned_to'],
          properties: {
            assigned_to: {
              type: 'integer',
              description: 'User ID to assign the ticket to',
              example: 1
            }
          }
        },

        // ============ ADMIN HOURS RESPONSE ============
        AdminHoursResponse: {
          type: 'object',
          properties: {
            adminHours: {
              type: 'array',
              items: {
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
                  total_minutes: {
                    type: 'integer',
                    example: 480
                  },
                  total_hours: {
                    type: 'number',
                    example: 8.0
                  }
                }
              }
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
