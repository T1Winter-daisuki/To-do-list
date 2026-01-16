import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'To-Do List API Documentation',
      version: '1.0.0',
      description: 'Tài liệu API cho ứng dụng To-Do List',
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        TaskInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', example: 'Học Toán' },
            description: { type: 'string', example: 'Học thuộc cửu chương' },
            is_completed: { type: 'boolean', example: false },
            deadline: { type: 'string', format: 'date-time', example: '2026-01-16T23:59:00Z' }
          }
        }
      },
    },
  },
  // Quan trọng: Chỉ định nơi chứa file code có viết chú thích API
  apis: ['./src/**/*.js', './src/**/routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;