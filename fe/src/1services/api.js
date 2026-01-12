import axios from "axios";

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 3000,
});

instance.interceptors.response.use(
    (response) => {
        return response.data; 
    },
    (error) => {
        // lỗi (400, 401...), dùng reject để hàm catch bên ngoài hiểu được
        return Promise.reject(error);
    }
);

export default instance;