import 'dotenv/config'; 
import pg from 'pg';

const { Pool } = pg;

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    // Cái này quan trọng: Cloud bắt buộc phải có SSL
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

// Nếu trên Cloud dùng Connection String (đường dẫn dài) thay vì từng biến lẻ
if (process.env.DATABASE_URL) {
    config.connectionString = process.env.DATABASE_URL;
}

const pool = new Pool(config);

pool.on('error', (err) => {
    console.error('Unexpected Database Connection Error:', err);
    process.exit(-1);
});

export default pool;