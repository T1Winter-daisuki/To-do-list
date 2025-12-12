import app from './app.js';
import pool from './1_config/db.js';

const port = process.env.PORT || 5001;

pool.connect().then(() => {
    console.log('PostgreSQL Connection Established!');
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch((err) => {
    console.error('Database connection error:', err.message);
    process.exit(1);
});