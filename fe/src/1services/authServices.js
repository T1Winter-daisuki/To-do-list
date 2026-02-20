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

const updateAPI = () => {
    return axios.put('/api/auth/update');
}

export { registerAPI, loginAPI, logoutAPI, updateAPI };