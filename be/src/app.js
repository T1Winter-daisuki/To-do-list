import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// 1. Import Swagger
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './1_config/swagger.js';

import authRoutes from '../src/2_auth/5routes/authRoutes.js';
import taskRoutes from '../src/3_tasks/5routes/taskRoutes.js';

const app = express();
app.use(cookieParser());

app.use(express.json());

// Cấu hình CORS: Cho phép ai được gọi API
// Khi lên Cloud, thay dấu '*' bằng tên miền Frontend (để bảo mật)
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
    res.json({ 
        message: 'To-Do List API is Running!',
        env: process.env.NODE_ENV || 'development' 
    });
});

export default app;