import pool from '../../config/db.js';

export const getMoods = async (userId, year) => {
    const query = `
        SELECT 
            EXTRACT(MONTH FROM record_date) - 1 AS month_index,
            EXTRACT(DAY FROM record_date) AS day,
            mood_letter
        FROM user_moods
        WHERE user_id = $1 AND EXTRACT(YEAR FROM record_date) = $2`;
    const { rows } = await pool.query(query, [userId, year]);
    return rows;
};

export const deleteMoods = async (client, userId, year) => {
    const query = `
        DELETE FROM user_moods 
        WHERE user_id = $1 AND EXTRACT(YEAR FROM record_date) = $2`;
    await client.query(query, [userId, year]);
};

export const insertMoods = async (client, valuesArr, placeholders) => {
    const query = `
        INSERT INTO user_moods (user_id, record_date, mood_letter)
        VALUES ${placeholders}`;
    await client.query(query, valuesArr);
};