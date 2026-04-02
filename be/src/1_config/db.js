import 'dotenv/config'; 
import pg from 'pg';

const { Pool } = pg;

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 10, // Tối đa 10 kết nối cùng lúc, k nên cao quá với sv free
    idleTimeoutMillis: 30000, // Đóng kết nối nếu không hoạt động trong 30 giây (giúp dọn rác khi máy Sleep)
    connectionTimeoutMillis: 5000, // Chỉ đợi 5s khi tạo kết nối mới, quá hạn là báo lỗi
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
};

const pool = new Pool(config);

pool.on('error', (err) => {
    console.error('Unexpected Database Connection Error:', err);
});

export default pool;