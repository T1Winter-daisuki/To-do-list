import axios from "./api.js";

const registerAPI = (userData) => {
    return axios.post('/auth/register', userData);
}

const loginAPI = (username, password) => {
    return axios.post('/auth/login', { username, password });
}

export { registerAPI, loginAPI };