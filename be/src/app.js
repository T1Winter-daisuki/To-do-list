import express from 'express';
import cors from 'cors';
// import authRoutes from './2_auth/routes/authRoutes.js';

const app = express();

// Cấu hình CORS: Cho phép ai được gọi API
// Khi lên Cloud, thay dấu '*' bằng tên miền Frontend (để bảo mật)
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*', // Mặc định cho phép tất cả nếu chưa có biến này
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
// app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ 
        message: 'To-Do List API is Running!',
        env: process.env.NODE_ENV || 'development' 
    });
});

export default app;