import pool from "../../1_config/db.js";

const toNullIfEmpty = (value) => {
    return (value === '' || value === undefined) ? null : value;
};

export const checkExist = async(user_id, title) => {
    const query = `SELECT id FROM tasks WHERE user_id = $1 AND title = $2`;
    const result = await pool.query(query, [user_id, title]);
    return result.rowCount > 0;
}

export const create = async(task) => {
    const {user_id, title, description, is_completed, start_time, deadline} = task;
    const query = `
        INSERT INTO tasks (user_id, title, description, is_completed, start_time, deadline)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`;
    const result = await pool.query(query, [user_id, title, toNullIfEmpty(description), is_completed || false, toNullIfEmpty(start_time), toNullIfEmpty(deadline)]);
    return result.rows[0];
}

export const findTasks = async(user_id) => {
    const query = `SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`;
    const result = await pool.query(query, [user_id]);
    return result.rows;
}

export const update = async(task) => {
    const {id, user_id, title, description, is_completed, start_time, deadline} = task;
    const query = `
        UPDATE tasks
        SET title = $1, description = $2, is_completed = $3, start_time = $4, deadline = $5, 
        WHERE id = $6 AND user_id = $7
        RETURNING *`;
    const result = await pool.query(query, [title, toNullIfEmpty(description), is_completed, toNullIfEmpty(start_time), toNullIfEmpty(deadline), id, user_id])
    return result.rows[0];
}

export const remove = async(id, user_id) => {
    const query = `DELETE FROM tasks WHERE id = $1 AND user_id = $2
    RETURNING *`;
    const result = await pool.query(query, [id, user_id]);
    return result.rows[0];
}