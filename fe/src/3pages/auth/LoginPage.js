import React, { useState } from 'react';
import { useAuth } from '../../2context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const success = await login(formData.username, formData.password);
        if (success) navigate('/');
    };

    return (
        <div className={styles.container}>
            <div className={styles.box}>
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
            </div>
        </div>
    );
};

export default LoginPage;