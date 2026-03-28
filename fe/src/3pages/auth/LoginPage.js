import React, { useState } from 'react';
import { useAuth } from '../../2context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        newPassword: '', 
        confirmNewPassword: '',
        otpCode: ''
    });

    const [view, setView] = useState('login'); 
    const [isLoading, setIsLoading] = useState(false);

    const { login, verifyOTP, resendOTP, forgot, reset } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await login(formData.username, formData.password);
        setIsLoading(false);

        if (result === true || result?.success) {
            navigate(from, { replace: true });
        } else if (result?.status === 'unverified') {
            setView('verify');
            await resendOTP(formData.username);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (formData.otpCode.length !== 6) {
            toast.warning("Mã OTP phải có đúng 6 số!");
            return;
        }

        setIsLoading(true);
        const success = await verifyOTP(formData.username, formData.otpCode);
        
        setIsLoading(false);
        if (success) 
            navigate(from, { replace: true });
    };

    const handleResend = async () => {
        setIsLoading(true);
        if (view === 'forgot' || view === 'reset') {
            await forgot(formData.username);
        } else {
            await resendOTP(formData.username);
        }
        setIsLoading(false);
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await forgot(formData.username);
        setIsLoading(false);
        if (success) 
            setView('reset');
    };

    // 5. Xử lý Đổi Mật Khẩu
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (formData.otpCode.length !== 6) {
            toast.warning("Mã OTP phải có đúng 6 số!");
            return;
        }
        if (formData.newPassword !== formData.confirmNewPassword) {
            toast.warning("Mật khẩu nhập lại không khớp!");
            return;
        }
        
        setIsLoading(true);
        const success = await reset(formData.username, formData.otpCode, formData.newPassword);
        setIsLoading(false);
        
        if (success) {
            setView('login');
            setFormData(prev => ({ ...prev, password: '', newPassword: '', otpCode: '' })); // Xóa pass cũ
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.box}>
                {view === 'login' && (
                    <>
                        <h2>Welcome Back!</h2>
                        <form onSubmit={handleLogin}>
                            <div className={styles.inputGroup}>
                                <label>Tài khoản <span style={{color: 'red'}}>*</span></label>
                                <input type="text" name="username" placeholder="Nhập username hoặc email" value={formData.username} onChange={handleChange} required />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Mật khẩu <span style={{color: 'red'}}>*</span></label>
                                <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                                {/* Nút quên mật khẩu */}
                                <div style={{ textAlign: 'right', marginTop: '5px' }}>
                                    <span onClick={() => setView('forgot')} style={{ fontSize: '14px', fontWeight: 'bold', color: '#B6AE9F', cursor: 'pointer' }}>
                                        Quên mật khẩu?
                                    </span>
                                </div>
                            </div>
                            <button type="submit" className={styles.btnLogin} disabled={isLoading}>
                                {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
                            </button>
                            <div style={{ fontSize: '15px', marginTop: '20px' }}>
                                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                            </div>
                        </form>
                    </>
                )}

                {view === 'verify' && (
                    <>
                        <h2>Xác Thực Email</h2>
                        <p style={{ color: '#888277', marginBottom: '25px', lineHeight: '1.5' }}>
                            Tài khoản chưa được kích hoạt.<br/> 
                            Chúng tôi đã gửi OTP đến email của <b>{formData.username}</b>.
                        </p>
                        <form onSubmit={handleVerify}>
                            <div className={styles.inputGroup}>
                                <input type="text" name="otpCode" placeholder="Nhập mã OTP" value={formData.otpCode} onChange={(e) => handleChange({ target: { name: 'otpCode', value: e.target.value.replace(/[^0-9]/g, '') } })} maxLength={6} required style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold' }} />
                            </div>
                            <button type="submit" className={styles.btnLogin} disabled={isLoading}>
                                {isLoading ? "Đang kiểm tra..." : "Xác Nhận"}
                            </button>
                        </form>
                        <div style={{ marginTop: '20px', fontSize: '14px' }}>
                            Chưa nhận được mã? <span onClick={!isLoading ? handleResend : undefined} style={{ color: '#B6AE9F', fontWeight: 'bold', cursor: isLoading ? 'wait' : 'pointer', textDecoration: 'underline' }}>Gửi lại</span>
                        </div>
                        <div style={{ marginTop: '15px' }}>
                            <span onClick={() => setView('login')} style={{ cursor: 'pointer', color: '#888' }}>← Quay lại</span>
                        </div>
                    </>
                )}

                {view === 'forgot' && (
                    <>
                        <h2>Quên Mật Khẩu</h2>
                        <p style={{ color: '#888277', marginBottom: '25px', lineHeight: '1.5' }}>
                            Vui lòng nhập Username hoặc Email. Chúng tôi sẽ gửi mã OTP để giúp bạn lấy lại tài khoản.
                        </p>
                        <form onSubmit={handleForgotPassword}>
                            <div className={styles.inputGroup}>
                                <label>Tài khoản của bạn <span style={{color: 'red'}}>*</span></label>
                                <input type="text" name="username" placeholder="Nhập username hoặc email..." value={formData.username} onChange={handleChange} required />
                            </div>
                            <button type="submit" className={styles.btnLogin} disabled={isLoading}>
                                {isLoading ? "Đang gửi mail..." : "Gửi mã xác nhận"}
                            </button>
                        </form>
                        <div style={{ marginTop: '20px' }}>
                            <span onClick={() => setView('login')} style={{ cursor: 'pointer', color: '#888' }}>← Quay lại đăng nhập</span>
                        </div>
                    </>
                )}

                {view === 'reset' && (
                    <>
                        <h2>Đặt Lại Mật Khẩu</h2>
                        <p style={{ color: '#888277', marginBottom: '20px', lineHeight: '1.5' }}>
                            Mã xác nhận đã được gửi đến email của <b>{formData.username}</b>.
                        </p>
                        <form onSubmit={handleResetPassword}>
                            <div className={styles.inputGroup}>
                                <label>Mã xác nhận (OTP) <span style={{color: 'red'}}>*</span></label>
                                <input type="text" name="otpCode" placeholder="Nhập mã OTP" value={formData.otpCode} onChange={(e) => handleChange({ target: { name: 'otpCode', value: e.target.value.replace(/[^0-9]/g, '') } })} maxLength={6} required style={{ letterSpacing: '4px', fontWeight: 'bold' }} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Mật khẩu mới <span style={{color: 'red'}}>*</span></label>
                                <input type="password" name="newPassword" placeholder="••••••••" value={formData.newPassword} onChange={handleChange} required />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Nhập lại mật khẩu mới <span style={{color: 'red'}}>*</span></label>
                                <input type="password" name="confirmNewPassword" placeholder="••••••••" value={formData.confirmNewPassword} onChange={handleChange} required />
                            </div>
                            <button type="submit" className={styles.btnLogin} disabled={isLoading}>
                                {isLoading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
                            </button>
                        </form>
                        <div style={{ marginTop: '20px', fontSize: '14px' }}>
                            Chưa nhận được mã? <span onClick={!isLoading ? handleResend : undefined} style={{ color: '#B6AE9F', fontWeight: 'bold', cursor: isLoading ? 'wait' : 'pointer', textDecoration: 'underline' }}>Gửi lại</span>
                        </div>
                        <div style={{ marginTop: '15px' }}>
                            <span onClick={() => setView('login')} style={{ cursor: 'pointer', color: '#888' }}>← Quay lại đăng nhập</span>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default LoginPage;