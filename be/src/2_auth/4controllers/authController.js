import { findUserbyId } from "../1models/authModel.js";
import * as authService from "../2services/authService.js";

const cookieOptions = {
    httpOnly: true, // Chống XSS
    secure: true, // deploy lên https thì để true
    path: '/',
    sameSite: 'strict' // Chống CSRF
};

export const handleVerifyOTP = async(req, res) => {
    try {
        const { email, otp_code } = req.body;
        const { message, user, accessToken, refreshToken } = await authService.verifyOTP(email, otp_code);

        res.cookie('refreshToken', refreshToken, cookieOptions);

        res.status(200).json({
            message: message,
            data: {
                user: user,
                accessToken
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const handleResendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await authService.resendOTP(email);

        res.status(200).json({ 
            message: result.message 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const handleRegister = async(req, res) => {
    try {
        const result = await authService.registerService(req.body);

        res.status(201).json({ 
            message: result.message,
            data: { email: result.email }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const handleLogin = async(req, res) => {
    try {
        const { user, accessToken, refreshToken } = await authService.loginService(req.body);

        res.cookie('refreshToken', refreshToken, cookieOptions);

        res.status(200).json({
            message: "Đăng nhập thành công!",
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    first_name: user.first_name,
                    is_verified: user.is_verified
                },
                accessToken
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken)
            return res.status(401).json({ message: "Hãy đăng nhập để sử dụng tính năng này" });

        const result = await authService.handleRefreshToken(refreshToken);

        res.status(200).json({ 
            message: "Cấp lại Access Token thành công", 
            data: result 
        });
    } catch (error) {
        res.clearCookie('refreshToken');
        res.status(403).json({ message: error.message });
    }
};

export const logout = (req, res) => {
    res.clearCookie('refreshToken');
    res.status(200).json({ message: "Đăng xuất thành công" });
};

export const handleUpdate = async(req, res) => {
    try {
        const userId = req.user.id;
        const data = req.body;
        const user = await authService.updatePro5(userId, data);

        res.status(200).json({
            message: "Cập nhật hồ sơ thành công!",
            data: user
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const getUser = async(req, res) => {
    try {
        const userID = req.user.id;
        const user = await findUserbyId(userID);

        if (!user)
            return res.status(404).json({ message: "Hãy đăng nhập để sử dụng tính năng này"});

        res.status(200).json({
            message: "Lấy thông tin thành công",
            data: user
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const handleForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await authService.forgotPassword(email);

        res.status(200).json({ 
            message: result.message 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const handleResetPassword = async (req, res) => {
    try {
        const { email, otp_code, new_password } = req.body;
        const result = await authService.resetPassword(email, otp_code, new_password);

        res.status(200).json({ 
            message: result.message 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};