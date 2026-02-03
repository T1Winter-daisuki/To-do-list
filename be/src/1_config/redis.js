import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        tls: process.env.REDIS_TLS === 'true',
        rejectUnauthorized: false // tránh lỗi chứng chỉ nếu có
    }
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Connected to Redis Success!'));

await client.connect();

export default client;