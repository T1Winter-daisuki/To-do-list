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
    const {username, password_hash, email, phone, dob, first_name, last_name, otp_code, otp_expires_at} = user;
    const query = `
        INSERT INTO users (username, password_hash, email, phone, dob, first_name, last_name, is_verified, otp_code, otp_expires_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8, $9)
        RETURNING *`;
    const result = await pool.query(query, 
        [username, password_hash, 
            email, toNullIfEmpty(phone), toNullIfEmpty(dob), 
            toNullIfEmpty(first_name), toNullIfEmpty(last_name), 
            otp_code, otp_expires_at]);
    return result.rows[0];
}

// cho refreshTok
export const findUserbyId = async(id) => {
    const query = `SELECT id, username, email, first_name, last_name, phone, dob, is_verified FROM users WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
}

// cho 1st login
export const findUsers = async(username, email) => {
    const query = `SELECT * FROM users WHERE username = $1 OR email = $2`;
    const result = await pool.query(query, [username, email]);
    return result.rows[0];
}

// setUser
export const updateUser = async(id, user) => {
    const {phone, dob, first_name, last_name} = user;
    const query = `
        UPDATE users
        SET phone = COALESCE($1, phone), dob = COALESCE($2, dob), first_name = COALESCE($3, first_name), last_name = COALESCE($4, last_name)
        WHERE id = $5
        RETURNING id, username, email, phone, dob, first_name, last_name;`
    const result = await pool.query(query, [toNullIfEmpty(phone), toNullIfEmpty(dob), toNullIfEmpty(first_name), toNullIfEmpty(last_name), id]);
    return result.rows[0];
} 

// verify
export const verifyUser = async(id) => {
    const query = `
        UPDATE users
        SET is_verified = true, otp_code = NULL, otp_expires_at = NULL
        WHERE id = $1
        RETURNING id, email, is_verified`
    const result = await pool.query(query, [id]);
    return result.rows[0];
}

// update OTP
export const newOTP = async(email, otp_code, otp_expires_at) => {
    const query = `
        UPDATE users
        SET otp_code = $1, otp_expires_at = $2
        WHERE email = $3
        RETURNING id, email`
    const result = await pool.query(query, [otp_code, otp_expires_at, email]);
    return result.rows[0];
}

// Đổi pass
export const updatePassword = async (email, password_hash) => {
    const query = `
        UPDATE users
        SET password_hash = $1, otp_code = NULL, otp_expires_at = NULL
        WHERE email = $2
        RETURNING id, email, username`
    const result = await pool.query(query, [password_hash, email]);
    return result.rows[0];
};