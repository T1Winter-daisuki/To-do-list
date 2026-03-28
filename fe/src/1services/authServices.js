import axios from "./api.js";

const registerAPI = (userData) => {
    return axios.post('/api/auth/register', userData);
}

const loginAPI = (username, password) => {
    return axios.post('/api/auth/login', { username, password });
}

const logoutAPI = () => {
    return axios.post('/api/auth/logout');
}

const updateAPI = (userData) => {
    return axios.put('/api/auth/update', userData);
}

const getUserAPI = () => {
    return axios.get('/api/auth/user');
}

const verifyOTPAPI = async (data) => {
    return axios.post('/api/auth/verify-otp', data);
};

const resendOTPAPI = async (data) => {
    return axios.post('/api/auth/resend-otp', data);
};

const forgotPasswordAPI = async (email) => {
    return axios.post('/api/auth/forgot-password', { email });
};

const resetPasswordAPI = async (email, otp_code, new_password) => {
    return axios.post('/api/auth/reset-password', { email, otp_code, new_password });
};

export { registerAPI, loginAPI, logoutAPI, 
    updateAPI, getUserAPI, 
    verifyOTPAPI, resendOTPAPI,
    forgotPasswordAPI, resetPasswordAPI };