import Joi from "joi";
import escape from "escape-html";
import rateLimit from 'express-rate-limit';

const signupSchema = Joi.object({
    username: Joi.string().custom((value) => escape(value)).alphanum().min(4).max(30).required().trim().messages({
        'string.alphanum': 'Tên đăng nhập chỉ được chứa chữ và số',
        'string.base': 'Tên đăng nhập phải là chuỗi kí tự',
        'string.empty': 'Tên đăng nhập không được để trống',
        'string.min': 'Tên đăng nhập phải có ít nhất 4 kí tự',
        'string.max': 'Tên đăng nhập tối đa 30 kí tự',
        'any.required': 'Vui lòng nhập tên đăng nhập!'
    }),
    password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$')).min(8).required().messages({
        'string.min': 'Mật khẩu phải có ít nhất 8 kí tự',
        'string.empty': 'Mật khẩu không được để trống',
        'string.pattern.base': 'Mật khẩu phải có chữ hoa, chữ thường và số',
        'any.required': 'Vui lòng nhập mật khẩu!'
    }),
    passwordConfirm: Joi.any().valid(Joi.ref('password')).required().messages({
        'any.only': 'Mật khẩu không khớp!',
        'any.required': 'Vui lòng nhập lại mật khẩu!'
    }),
    email: Joi.string().custom((value) => escape(value)).email().required().trim().messages({
        'string.email': 'Email không hợp lệ!',
        'string.empty': 'Email không được để trống',
        'any.required': 'Vui lòng nhập Email!'
    }),
    first_name: Joi.string().custom((value) => escape(value)).max(50).allow(null, '').empty('').default(null).optional().trim().messages({
        'string.max': 'Họ đệm dài quá mức cho phép',
    }),
    last_name: Joi.string().custom((value) => escape(value)).max(50).allow(null, '').empty('').default(null).optional().trim().messages({
        'string.max': 'Tên dài quá mức cho phép',
    }),
    dob: Joi.date().iso().less('now').allow(null, '').empty('').default(null).optional().messages({
        'date.base': 'Ngày sinh không hợp lệ!',
        'date.format': 'Ngày sinh phải theo định dạng YYYY-MM-DD',
        'date.less': 'Ngày sinh không được lớn hơn hôm nay',
    }),
    phone: Joi.string().custom((value) => escape(value)).pattern(/^[0-9]{10,11}$/).allow(null, '').empty('').default(null).optional().messages({
        'string.pattern.base': 'Số điện thoại không hợp lệ!',
    })
});

export const validRegister = (req, res, next) => {
    // abortEarly: false: báo toàn bộ lỗi 1 lượt
    const { error, value } = signupSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
        const messages = error.details.map(detail => detail.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    req.body = value;

    next();
};

export const registerRateLimit = rateLimit({
    windowMs: 30 * 1000,
    max: 5,
    message: { message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 30 giây.' },
    standardHeaders: true,
    legacyHeaders: false,
});