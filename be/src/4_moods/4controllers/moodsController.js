import * as moodService from '../2services/moodsService.js';

export const getMoods = async (req, res) => {
    try {
        const userId = req.user.id;
        const year = req.query.year;

        if (!year)
            return res.status(400).json({ success: false, message: "Dữ liệu tra cứu không hợp lệ. Vui lòng thử lại!" });

        const data = await moodService.moodService(userId, year);
        res.status(200).json({
            success: true, 
            data 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const saveMoods = async (req, res) => {
    try {
        const userId = req.user.id;
        const { year, moods } = req.body;

        await moodService.saveMoods(userId, year, moods);
        res.status(200).json({ 
            success: true, 
            message: "Đã lưu nhật ký tâm trạng thành công!" 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};