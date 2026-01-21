import * as authService from "../2services/authService.js";

const cookieOptions = {
    httpOnly: true, // Chống XSS
    secure: false, // deploy lên https thì để true
    path: '/',
    sameSite: 'strict' // Chống CSRF
};

export const handleRegister = async(req, res) => {
    try {
        const { newUser: user, accessToken, refreshToken } = await authService.registerService(req.body);

        res.cookie('refreshToken', refreshToken, cookieOptions);

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
        const { user, accessToken, refreshToken } = await authService.loginService(req.body);

        res.cookie('refreshToken', refreshToken, cookieOptions);

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