import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Social App REST API',
      version: '2.0.0',
      description: 'A comprehensive REST API for social media with Posts, Comments, and Users management'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'MongoDB ObjectId',
              example: '507f1f77bcf86cd799439011'
            },
            username: {
              type: 'string',
              description: 'Unique username (3-30 characters)',
              example: 'john_doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Unique email address',
              example: 'john@example.com'
            },
            firstName: {
              type: 'string',
              description: 'First name (optional)',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'Last name (optional)',
              example: 'Doe'
            },
            bio: {
              type: 'string',
              description: 'User biography (max 500 characters, optional)',
              example: 'A passionate developer'
            },
            profileImage: {
              type: 'string',
              description: 'Profile image URL (optional)',
              example: 'https://example.com/image.jpg'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of user creation',
              example: '2024-01-20T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of last update',
              example: '2024-01-20T10:30:00Z'
            }
          },
          required: ['_id', 'username', 'email', 'createdAt', 'updatedAt']
        },
        UserInput: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 30,
              description: 'Unique username'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Valid email address'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Password (minimum 6 characters)'
            },
            firstName: {
              type: 'string',
              description: 'First name (optional)'
            },
            lastName: {
              type: 'string',
              description: 'Last name (optional)'
            },
            bio: {
              type: 'string',
              maxLength: 500,
              description: 'Biography (optional)'
            },
            profileImage: {
              type: 'string',
              description: 'Profile image URL (optional)'
            }
          },
          required: ['username', 'email', 'password']
        },
        Post: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'MongoDB ObjectId'
            },
            message: {
              type: 'string',
              description: 'Post content'
            },
            userId: {
              $ref: '#/components/schemas/User'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of post creation'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of last update'
            }
          },
          required: ['_id', 'message', 'userId', 'createdAt', 'updatedAt']
        },
        PostInput: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Post content'
            },
            userId: {
              type: 'string',
              description: 'User ID (MongoDB ObjectId)'
            }
          },
          required: ['message', 'userId']
        },
        Comment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'MongoDB ObjectId'
            },
            postId: {
              $ref: '#/components/schemas/Post'
            },
            userId: {
              $ref: '#/components/schemas/User'
            },
            content: {
              type: 'string',
              description: 'Comment text'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of comment creation'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of last update'
            }
          },
          required: ['_id', 'postId', 'userId', 'content', 'createdAt', 'updatedAt']
        },
        CommentInput: {
          type: 'object',
          properties: {
            postId: {
              type: 'string',
              description: 'Post ID (MongoDB ObjectId)'
            },
            userId: {
              type: 'string',
              description: 'User ID (MongoDB ObjectId)'
            },
            content: {
              type: 'string',
              description: 'Comment text'
            }
          },
          required: ['postId', 'userId', 'content']
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'User registered successfully'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            accessToken: {
              type: 'string',
              description: 'JWT access token (expires in 15 minutes)'
            },
            refreshToken: {
              type: 'string',
              description: 'JWT refresh token (expires in 7 days)'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK'
            },
            message: {
              type: 'string',
              example: 'Server is running'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
