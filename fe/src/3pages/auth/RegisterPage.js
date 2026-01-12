import React, { useState } from 'react';
import { useAuth } from '../../2context/AuthContext';
import { useNavigate, Link  } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        passwordConfirm: '',
        first_name: '',
        last_name: '',
        phone: '',
        dob: ''
    });
    
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.passwordConfirm) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }

        const success = await register(formData);
        if (success) navigate('/');
    };

    return (
        <div className={styles.container}>
            <div className={styles.box}>
                <h2>Tạo Tài Khoản Mới</h2>
                <form onSubmit={handleRegister}>
                    
                    {/* Hàng 1: Họ và Tên */}
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label>Họ</label>
                            <input 
                                type="text" 
                                name="first_name" 
                                placeholder="Nguyễn Văn"
                                value={formData.first_name} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Tên</label>
                            <input 
                                type="text" 
                                name="last_name" 
                                placeholder="A"
                                value={formData.last_name} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>

                    {/* Hàng 2: Username & Phone */}
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label>Username <span style={{color: 'red'}}>*</span></label>
                            <input 
                                type="text" 
                                name="username" 
                                placeholder="min4max30"
                                value={formData.username} 
                                onChange={handleChange} 
                                required 
                                minLength={4}
                                maxLength={30}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>SĐT</label>
                            <input 
                                type="text" 
                                name="phone" 
                                placeholder="0987654321"
                                value={formData.phone} 
                                onChange={handleChange}
                                pattern="[0-9]{10,11}"
                                title="Số điện thoại phải từ 10-11 số"
                            />
                        </div>
                    </div>

                    {/* Hàng 3: Email & Ngày sinh */}
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label>Email <span style={{color: 'red'}}>*</span></label>
                            <input 
                                type="email" 
                                name="email" 
                                placeholder="abc@gmail.com"
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Ngày sinh</label>
                            <input 
                                type="date" 
                                name="dob" 
                                value={formData.dob} 
                                onChange={handleChange}
                                max={new Date().toISOString().split("T")[0]} // Không chọn được ngày tương lai
                            />
                        </div>
                    </div>
                    
                    {/* Hàng 4: Mật khẩu */}
                    <div className={styles.inputGroup}>
                        <label>Mật khẩu <span style={{color: 'red'}}>*</span></label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Itnhat8kitu"
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            minLength={8}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Nhập lại mật khẩu <span style={{color: 'red'}}>*</span></label>
                        <input 
                            type="password" 
                            name="passwordConfirm" 
                            placeholder="Xác nhận mật khẩu"
                            value={formData.passwordConfirm} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <button type="submit" className={styles.btnLogin}>Đăng Ký Ngay</button>
                </form>

                <div style={{ marginTop: '15px' }}>
                    Đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;