import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as authModel from "../1models/authModel.js";
import redisClient from "../../1_config/redis.js";

const genTok = async(user) => {
    const accessToken = jwt.sign(
        { id: user.id, username: user.username }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: '15m' }
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

    // tạo user mới
    const newUser = await authModel.createUser({
        username, password_hash, email, phone, dob, first_name, last_name
    });

    // tạo tok cho user này
    const token = await genTok(newUser);

    return {newUser, ...token};
}

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
        const user = await authModel.findUserById(decoded.id);
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
};

export const loginService = async(data) => {
    const {username, password} = data;

    const user = await authModel.findUsers(username, username);
    if (!user) 
        throw new Error('Tài khoản không tồn tại');
    
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
        }, 
        ...token
    };
}