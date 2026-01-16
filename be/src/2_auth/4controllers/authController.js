import * as authService from "../2services/authService.js";

export const handleRegister = async(req, res) => {
    try {
        const { newUser: user, accessToken } = await authService.registerService(req.body);

        res.status(201).json({ 
            message: "Đăng kí thành công!",
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
                accessToken
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const handleLogin = async(req, res) => {
    try {
        const { user, accessToken } = await authService.loginService(req.body);

        res.status(200).json({
            message: "Đăng nhập thành công!",
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
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
        const { refreshToken } = req.body;
        const result = await authService.handleRefreshToken(refreshToken);

        res.status(200).json({ 
            message: "Cấp lại Access Token thành công", 
            data: result 
        });
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
};