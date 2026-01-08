import pool from "../../1_config/db.js";

// biến tất cả những cái "không nhập" (undefined, "") thành chuẩn NULL của SQL.
const toNullIfEmpty = (value) => {
    return (value === '' || value === undefined) ? null : value;
};

export const checkExist = async(field, value) => {
    const query = `SELECT id FROM users WHERE ${field} = $1`;
    const result = await pool.query(query, [value]);
    return result.rows.length > 0;
}

export const createUser = async(user) => {
    const {username, password_hash, email, phone, dob, first_name, last_name} = user;
    const query = `
        INSERT INTO users (username, password_hash, email, phone, dob, first_name, last_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`;
    const result = await pool.query(query, [username, password_hash, email, toNullIfEmpty(phone), toNullIfEmpty(dob), toNullIfEmpty(first_name), toNullIfEmpty(last_name)]);
    return result.rows[0];
}

// cho refreshTok
export const findUserbyId = async(id) => {
    const query = `SELECT id, username FROM users WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
}

// cho 1st login
export const findUsers = async(username, email) => {
    const query = `SELECT * FROM users WHERE username = $1 OR email = $2`;
    const result = await pool.query(query, [username, email]);
    return result.rows[0];
}