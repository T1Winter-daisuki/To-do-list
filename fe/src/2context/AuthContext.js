import React, { createContext, useState, useContext, useEffect } from "react";
import { loginAPI, registerAPI, logoutAPI } from "../1services/authServices.js";
import { toast } from "react-toastify"; // thông báo

// loa
const AuthContext = createContext();

// nhà đài
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // ch login = null
    const [loading, setLoading] = useState(true); // cho F5

    useEffect(() => {
        const saveUser = localStorage.getItem('user');
        if (saveUser) 
            setUser(JSON.parse(saveUser));
        setLoading(false);
    }, []);

    const login = async(username, password) => {
        try {
            const response = await loginAPI(username, password);
            if (response.data) {
                const { user } = response.data;
                const userData = { 
                    ...user
                };

                setUser(userData);
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('user', JSON.stringify(userData));

                toast.success("Đăng nhập thành công");
                return true;
            }
        } catch (error) {
            const message = error.response?.data?.message || "Đăng nhập thất bại";
            toast.error(message);
            return false;
        }
    };

    const register = async(userData) => {
        try {
            const response = await registerAPI(userData);
            if (response.data) {
                const { user } = response.data;
                const userData = { 
                    ...user
                };
                
                setUser(userData);
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('user', JSON.stringify(userData));

                toast.success("Đăng ký thành công");
                return true;
            }
        } catch (error) {
            const message = error.response?.data?.message || "Đăng ký thất bại";
            toast.error(message);
            return false;
        }
    };

    const logout = async () => {
        try {
            await logoutAPI();
        } catch (error) {
        } finally {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            toast.info("Đăng xuất thành công");
        };
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading
    };

    return(
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Hook chung để dùng, k phải gọi lại
export const useAuth = () => {
    return useContext(AuthContext);
};