    import React, { createContext, useState, useContext, useEffect } from "react";
    import { loginAPI, registerAPI, logoutAPI, updateAPI, verifyOTPAPI, resendOTPAPI, forgotPasswordAPI, resetPasswordAPI } from "../1services/authServices.js";
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
                    setUser({ ...user });
                    localStorage.setItem('accessToken', response.data.accessToken);
                    localStorage.setItem('user', JSON.stringify(user));

                    toast.success("Đăng nhập thành công");
                    return true;
                }
            } catch (error) {
                const message = error.response?.data?.message || "Đăng nhập thất bại";
                
                if (message === 'Tài khoản chưa được xác thực') {
                    toast.warning("Tài khoản chưa xác thực. Vui lòng nhập mã OTP!");
                    return { success: false, status: 'unverified' }; 
                }

                toast.error(message);
                return false;
            }
        };

        const register = async(userData) => {
            try {
                const response = await registerAPI(userData);
                toast.success(response.message || "Đăng ký thành công! Vui lòng kiểm tra email.");
                return true;
            } catch (error) {
                const message = error.response?.data?.message || "Đăng ký thất bại";
                toast.error(message);
                return false;
            }
        };

        const verifyOTP = async (email, otp_code) => {
            try {
                const response = await verifyOTPAPI({ email, otp_code });
                if (response.data) {
                    const { user, accessToken } = response.data;
                    
                    setUser(user);
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('user', JSON.stringify(user));

                    toast.success("Xác thực email thành công!");
                    return true;
                }
            } catch (error) {
                const message = error.response?.data?.message || "Xác thực thất bại";
                toast.error(message);
                return false;
            }
        };

        const resendOTP = async (email) => {
            try {
                const response = await resendOTPAPI({ email });
                toast.info(response.message || "Đã gửi lại mã OTP. Vui lòng kiểm tra email.");
                return true;
            } catch (error) {
                const message = error.response?.data?.message || "Lỗi gửi lại mã";
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

        const update = async(userData) => {
            try {
                const response = await updateAPI(userData);
                if (response.data) {
                    const updateData = response.data;
                    const updateUser = { ...user, ...updateData };

                    localStorage.setItem('user', JSON.stringify(updateUser));
                    setUser(updateUser);

                    toast.success("Cập nhật thành công");
                    return true;
                }
            } catch (error) {
                const message = error.response?.data?.message || "Cập nhật thất bại";
                toast.error(message);
                return false;
            }
        };

        const forgot = async (email) => {
            try {
                await forgotPasswordAPI(email);
                toast.success("Mã xác nhận đã được gửi đến email của bạn.");
                return true;
            } catch (error) {
                const message = error.response?.data?.message || "Lỗi khi gửi yêu cầu";
                toast.error(message);
                return false;
            }
        };

        const reset = async (email, otpCode, newPassword) => {
            try {
                await resetPasswordAPI(email, otpCode, newPassword);
                toast.success("Đổi mật khẩu thành công");
                return true;
            } catch (error) {
                const message = error.response?.data?.message || "Đổi mật khẩu thất bại";
                toast.error(message);
                return false;
            }
        };

        const value = {
            user,
            login, register, logout,
            update,
            verifyOTP, resendOTP,
            forgot, reset,
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