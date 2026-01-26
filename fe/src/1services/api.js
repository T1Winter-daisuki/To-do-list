import axios from "axios";

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 3000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) 
            config.headers['Authorization'] = `Bearer ${token}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => {
        return response.data; 
    },
    async (error) => {
        const originalRequest = error.config;
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await axios.post(
                    'http://localhost:5001/api/auth/refresh',
                    {},
                    { withCredentials: true }
                );
                
                const newAccessToken = res.data?.data?.newAccessToken;

                if (newAccessToken) {
                    localStorage.setItem('accessToken', newAccessToken);
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return instance(originalRequest);
                }
            } catch (refresherror) {
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refresherror);
            }
        }

        return Promise.reject(error);
    }
);

export default instance;