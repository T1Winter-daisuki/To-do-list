import * as moodModel from "../1models/moodsModel.js";
import pool from "../../config/db.js";

export const getMoods = async (user_id, year) => {
    const rows = await moodModel.getMoods(user_id, year);
    
    // Đổi mảng Database thành Object { "0-1": "A+", "1-15": "B" }
    const moodsData = {};
    rows.forEach(row => {
        const key = `${row.month_index}-${row.day}`;
        moodsData[key] = row.mood_letter;
    });
    
    return moodsData;
}

export const saveMoods = async (user_id, year, moods) => {
    const client = await pool.connect(); // Bắt buộc dùng client riêng để mở Transaction
    
    try {
        await client.query('BEGIN'); // Khóa an toàn: Lỗi là hoàn tác

        // Xóa dữ liệu cũ của năm đó để tránh rác
        await moodModel.deleteMoods(client, user_id, year);

        // Lọc và chuẩn bị dữ liệu mới để Insert
        const keys = Object.keys(moods);
        if (keys.length > 0) {
            let valuesArr = [];
            let placeholdersArr = [];
            let paramIndex = 1;

            keys.forEach((key) => {
                const [monthIndex, day] = key.split('-');
                const moodLetter = moods[key];
                
                // Format YYYY-MM-DD
                const monthStr = String(Number(monthIndex) + 1).padStart(2, '0');
                const dayStr = String(day).padStart(2, '0');
                const dateStr = `${year}-${monthStr}-${dayStr}`;

                placeholdersArr.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
                valuesArr.push(user_id, dateStr, moodLetter);
            });

            // Insert hàng loạt
            await moodModel.insertMoods(client, valuesArr, placeholdersArr.join(', '));
        }

        await client.query('COMMIT'); // Xác nhận thành công
        return true;
        
    } catch (error) {
        await client.query('ROLLBACK'); // Hoàn tác nếu có lỗi
        console.error("Lỗi khi saveMoods:", error);
        throw new Error("Không thể lưu nhật ký tâm trạng. Vui lòng thử lại!");
    } finally {
        client.release();
    }
}