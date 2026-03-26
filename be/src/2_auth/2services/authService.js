import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as authModel from "../1models/authModel.js";
import redisClient from "../../1_config/redis.js";
import { sendOTP } from "../../1_config/mail.js";

const genTok = async(user) => {
    const accessToken = jwt.sign(
        { id: user.id, username: user.username }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: '10m' }
    );
    const refreshToken = jwt.sign(
        { id: user.id }, 
        process.env.REFRESH_TOKEN_SECRET, 
        { expiresIn: '7d'}
    );

    await redisClient.set(
        `refresh_token:${user.id}`, 
        refreshToken, 
        { EX: 7 * 24 * 60 * 60 }
    );

    return { accessToken, refreshToken };
};  

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const getOTPExpireTime = () => new Date(Date.now() + 1 * 60 * 1000); 

export const registerService = async(data) => {
    const {username, password, email, phone, dob, first_name, last_name} = data;

    // ktra tồn tại
    const userExist = await authModel.checkExist('username', username);
        if (userExist) throw new Error("Username đã tồn tại!");

    const mailExist = await authModel.checkExist('email', email);
        if (mailExist) throw new Error("Email đã được sử dụng!");

    if (phone) {
        const phoneExist = await authModel.checkExist('phone', phone);
        if (phoneExist) throw new Error("Số điện thoại đã được sử dụng!");
    }
    
    // Hash pass
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Sinh OTP
    const otp_code = generateOTP();
    const otp_expires_at = getOTPExpireTime();

    // tạo user mới
    const newUser = await authModel.createUser({
        username, password_hash, email, phone, dob, first_name, last_name
    });

    // gửi OTP
    await sendOTP(email, otp_code);

    return {
        message: "Đăng ký thành công! Mã xác nhận đã được gửi đến email của bạn.",
        email: newUser.email
    };
}

export const verifyOTP = async(email, otp_code) => {
    const user = await authModel.findUsers(email, email);

    if (!user) 
        throw new Error('Tài khoản không tồn tại');
    if (user.is_verified)
        throw new Error('Tài khoản đã được xác thực');
    if (String(user.otp_code).trim() !== String(otp_code).trim())
        throw new Error('Mã xác thực không chính xác');
    if (new Date() > new Date(user.otp_expires_at))
        throw new Error('Mã xác thực quá hạn');

    const verifiedUser = await authModel.verifyUser(user.id);
    // tạo tok cho user này
    const token = await genTok(user);

    return {
        message: "Xác thực thành công!",
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            is_verified: verifiedUser.is_verified
        }, 
        ...token
    }
}

export const resendOTP = async (email) => {
    const user = await authModel.findUsers(email, email);

    if (!user) 
        throw new Error("Tài khoản không tồn tại");
    if (user.is_verified) 
        throw new Error("Tài khoản đã được xác thực");

    // Tạo mã mới
    const otp_code = generateOTP();
    const otp_expires_at = getOTPExpireTime();

    // Lưu vào DB và gửi mail
    await authModel.newOTP(email, otp_code, otp_expires_at);
    await sendOTP(email, otp_code);

    return { message: "Mã xác nhận mới đã được gửi đến email của bạn." };
};

export const handleRefreshToken = async (refreshToken) => {
    if (!refreshToken) 
        throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');

    try {
        const decoded = jwt.verify(
            refreshToken, 
            process.env.REFRESH_TOKEN_SECRET
        );

        // Check xem token này có nằm trong Redis không?
        const storedToken = await redisClient.get(`refresh_token:${decoded.id}`);
        if (!storedToken || refreshToken !== storedToken)
            throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');

        // Cập nhật tài khoản còn k
        const user = await authModel.findUserbyId(decoded.id);
        if (!user) 
            throw new Error('Tài khoản không tồn tại');

        // Cấp lại Access Token mới
        const newAccessToken = jwt.sign(
            { id: user.id, username: user.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        return { newAccessToken };
    } catch (error) {
        throw new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
    }
}

export const loginService = async(data) => {
    const {username, password} = data;

    const user = await authModel.findUsers(username, username);
    if (!user) 
        throw new Error('Tài khoản không tồn tại');
    if (!user.is_verified)
        throw new Error('Tài khoản chưa được xác thực');
    
    // so sánh pass
    const validPass = await bcrypt.compare(password, user.password_hash);
    if (!validPass)
        throw new Error('Mật khẩu không chính xác');

    const token = await genTok(user);

    return { 
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            is_verified: user.is_verified
        }, 
        ...token
    };
}

export const updatePro5 = async(userId, data) => {
    const pro5 = await authModel.updateUser(userId, data);
    if (!pro5) 
        throw new Error('Cập nhật thất bại');
    
    return pro5;
}