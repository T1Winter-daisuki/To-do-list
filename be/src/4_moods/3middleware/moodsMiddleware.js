import Joi from 'joi';

export const validateMoodsPayload = (req, res, next) => {
    const schema = Joi.object({
        year: Joi.number().integer().min(2020).max(2100).required().messages({
            'any.required': 'Vui lòng cung cấp năm',
            'number.base': 'Năm phải là số'
        }),
        moods: Joi.object().pattern(
            Joi.string().pattern(/^\d{1,2}-\d{1,2}$/), // Key phải có dạng "Tháng-Ngày" (VD: 0-1, 11-31)
            Joi.string().valid('A+', 'A', 'B+', 'B', 'C', 'D', 'F')
        ).required().messages({
            'any.required': 'Thiếu dữ liệu tâm trạng'
        })
    });

    const { error } = schema.validate(req.body);
    if (error)
        return res.status(400).json({ success: false, message: error.details[0].message });
    
    next();
};