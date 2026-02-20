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

export { registerAPI, loginAPI, logoutAPI, updateAPI, getUserAPI };