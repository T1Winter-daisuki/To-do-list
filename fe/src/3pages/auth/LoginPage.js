import React, { useState } from 'react';
import { useAuth } from '../../2context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const [isOtpStep, setIsOtpStep] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, verifyOTP, resendOTP } = useAuth();
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
            setIsOtpStep(true);
            await resendOTP(formData.username);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otpCode.length !== 6) {
            toast.warning("Mã OTP phải có đúng 6 số!");
            return;
        }

        setIsLoading(true);
        const success = await verifyOTP(formData.username, otpCode);
        
        setIsLoading(false);
        if (success) 
            navigate(from, { replace: true });
    };

    const handleResend = async () => {
        setIsLoading(true);
        await resendOTP(formData.username);
        setIsLoading(false);
    }

    return (
        <div className={styles.container}>
            <div className={styles.box}>
                {!isOtpStep ? (
                    <>
                        <h2>Welcome Back!</h2>
                        <form onSubmit={handleLogin}>
                            
                            <div className={styles.inputGroup}>
                                <label>Tài khoản <span style={{color: 'red'}}>*</span></label>
                                <input 
                                    type="text" 
                                    name="username"
                                    placeholder="Nhập username hoặc email" 
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label>Mật khẩu <span style={{color: 'red'}}>*</span></label>
                                <input 
                                    type="password" 
                                    name="password"
                                    placeholder="••••••••" 
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button type="submit" className={styles.btnLogin}>
                                Đăng Nhập
                            </button>

                            <div style={{ marginTop: '20px' }}>
                                Chưa có tài khoản? 
                                <Link to="/register">Đăng ký ngay</Link>
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        <h2>Xác Thực Email</h2>
                        <p style={{ color: '#888277', marginBottom: '25px', lineHeight: '1.5' }}>
                            Chúng tôi đã gửi một mã OTP đến email của <b>{formData.username}</b>.<br/> 
                            Vui lòng nhập vào ô bên dưới.
                        </p>
                        <form onSubmit={handleVerify}>
                            <div className={styles.inputGroup}>
                                <input 
                                    type="text" 
                                    placeholder="Nhập mã OTP" 
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                    maxLength={6}
                                    required
                                    style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold' }}
                                />
                            </div>
                            
                            <button type="submit" className={styles.btnLogin} disabled={isLoading}>
                                {isLoading ? "Đang kiểm tra..." : "Xác Nhận"}
                            </button>
                        </form>

                        <div style={{ marginTop: '20px', fontSize: '14px' }}>
                            Chưa nhận được mã?{' '}
                            <span 
                                onClick={!isLoading ? handleResend : undefined} 
                                style={{ color: '#B6AE9F', fontWeight: 'bold', cursor: isLoading ? 'wait' : 'pointer', textDecoration: 'underline' }}
                            >
                                Gửi lại
                            </span>
                        </div>
                        <div style={{ marginTop: '15px' }}>
                            <span onClick={() => setIsOtpStep(false)} style={{ cursor: 'pointer', color: '#888' }}>
                                ← Quay lại đăng nhập
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginPage;