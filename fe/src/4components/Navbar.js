import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../2context/AuthContext';
import styles from './Navbar.module.css';
import { FaUserCircle } from 'react-icons/fa';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import { getUserAPI } from '../1services/authServices';

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const { user, logout, update } = useAuth();
    const navigate = useNavigate();
    
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [formData, setFormData] = useState({ first_name: '', last_name: '', phone: '', dob: '' });

    const dropdownRef = useRef(null);

    // ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsProfileModalOpen(false);
                setIsDropdownOpen(false);
                setIsMenuOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // click chuột ra ngoài vùng Menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Nếu click không nằm trong mỏ neo
            if (dropdownRef.current && !dropdownRef.current.contains(event.target))
                setIsDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
   
    useEffect(() => {
        if (isProfileModalOpen && user) {
            const fetchProfile = async () => {
            setIsLoadingProfile(true);
            try {
                const res = await getUserAPI();
                const userData = res.data

                setFormData({
                    first_name: userData?.first_name || '',
                    last_name: userData?.last_name || '',
                    phone: userData?.phone || '',
                    dob: userData?.dob ? userData.dob.split('T')[0] : '' 
                });
            } catch (error) {
                setFormData({
                    first_name: user?.first_name || '',
                    last_name: user?.last_name || '',
                    phone: user?.phone || '',
                    dob: user?.dob ? user.dob.split('T')[0] : ''
                });
            } finally {
                setIsLoadingProfile(false);
            }
        };

            fetchProfile();
        }
    }, [isProfileModalOpen, user]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
        } finally {
            setIsDropdownOpen(false);
            setIsMenuOpen(false);
            navigate('/home');
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        const success = await update(formData);
        if (success)
            setIsProfileModalOpen(false);
    };

    const AnimatedLogo = (text) => {
        return text.split('').map((char, index) => (
        <span key={index} style={{ transitionDelay: `${index * 28}ms` }}>
            {char === ' ' ? '\u00A0' : char}
        </span>
        ));
    };

    return (
        <header className={styles.header}>
            <Link to="/home" className={styles.logo}>
                {AnimatedLogo("Self-help List")}
            </Link>

            <div className={styles.menuIcon} onClick={toggleMenu}>
                {isMenuOpen ? <RiCloseLine /> : <RiMenu3Line />}
            </div>

            <ul className={`${styles.navlist} ${isMenuOpen ? styles.open : ''}`}>
                <li>
                <NavLink to="/home" className={({ isActive }) => isActive ? styles.active : ''} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
                </li>
                <li>
                <NavLink to="/about" className={({ isActive }) => isActive ? styles.active : ''} onClick={() => setIsMenuOpen(false)}>About</NavLink>
                </li>
                <li>
                <NavLink to="/how" className={({ isActive }) => isActive ? styles.active : ''} onClick={() => setIsMenuOpen(false)}>How</NavLink>
                </li>
                <li>
                <NavLink to="/todo" className={({ isActive }) => isActive ? styles.active : ''} onClick={() => setIsMenuOpen(false)}>To-Do</NavLink>
                </li>
                <li>
                <NavLink to="/mood" className={({ isActive }) => isActive ? styles.active : ''} onClick={() => setIsMenuOpen(false)}>Mood</NavLink>
                </li>
        
                <div className={styles.mobileUserArea}>
                    {user ? (
                        <>
                            <span 
                                onClick={() => {setIsProfileModalOpen(true); setIsMenuOpen(false);}}
                                style={{color: 'white', cursor:'pointer', display:'block', marginBottom:'10px'}}>
                                    Cập nhật thông tin
                            </span>
                            <span 
                                onClick={handleLogout} 
                                style={{color: '#ff7e5f', cursor:'pointer', fontWeight: 'bold'}}>
                                    Đăng xuất ({user.first_name || user.username})
                            </span>
                        </>
                    ) : (
                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>Đăng nhập</Link>
                    )}
                </div>
            </ul>

            <div className={styles.userAreaDesktop}>
            {user ? (
                <div className={styles.userContainer} ref={dropdownRef} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <div className={styles.avatarCircle}>
                        {user.username ? user.username.charAt(0).toUpperCase() : <FaUserCircle />}
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.greeting}>Hi, </span>
                        <span className={styles.username}>{user.first_name || user.username}</span>
                    </div>
                    {isDropdownOpen && (
                    <div className={styles.dropdown}>
                        <div 
                            onClick={() => { setIsProfileModalOpen(true); setIsDropdownOpen(false); }}
                            className={styles.dropdownItem}
                            style={{cursor: 'pointer'}}>
                                Cập nhật thông tin
                        </div>
                        <div 
                            onClick={handleLogout} 
                            className={styles.dropdownItem} 
                            style={{cursor: 'pointer', color: 'red'}}>
                                Đăng xuất
                        </div>
                    </div>
                    )}
                </div>
            ) : (
                <Link to="/login" className={styles.loginBtn}>Đăng nhập</Link>
            )}
            </div>

            {isProfileModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsProfileModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2 style={{marginBottom: '25px', textAlign: 'center', color: '#333'}}>Cập nhật thông tin</h2>
                        
                        {isLoadingProfile ? (
                            <div style={{textAlign: 'center', padding: '40px 20px', color: '#666'}}>
                                ⏳ Đang tải thông tin cá nhân...
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateSubmit}>
                                
                                <div className={styles.row}>
                                    <div className={styles.inputGroup}>
                                        <label>Username (Tên đăng nhập)</label>
                                        <input 
                                            type="text" 
                                            value={user?.username || ''} 
                                            disabled 
                                            className={styles.inputDisabled}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Email</label>
                                        <input 
                                            type="email" 
                                            value={user?.email || ''} 
                                            disabled 
                                            className={styles.inputDisabled}
                                        />
                                    </div>
                                </div>

                                {/* Hàng 1: Họ và Tên */}
                                <div className={styles.row}>
                                    <div className={styles.inputGroup}>
                                        <label>Họ</label>
                                        <input 
                                            type="text" 
                                            name="last_name" 
                                            placeholder="Họ/Last name"
                                            value={formData.last_name} 
                                            onChange={handleFormChange} 
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Tên</label>
                                        <input 
                                            type="text" 
                                            name="first_name" 
                                            placeholder="Tên/First name"
                                            value={formData.first_name} 
                                            onChange={handleFormChange} 
                                        />
                                    </div>
                                </div>

                                {/* Hàng 2: Số điện thoại và Ngày sinh */}
                                <div className={styles.row}>
                                    <div className={styles.inputGroup}>
                                        <label>Số điện thoại</label>
                                        <input 
                                            type="text" 
                                            name="phone" 
                                            placeholder="SĐT/Phone number"
                                            value={formData.phone} 
                                            onChange={handleFormChange}
                                            pattern="[0-9]{10,11}"
                                            title="Số điện thoại phải từ 10-11 số"
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Ngày sinh</label>
                                        <input 
                                            type="date" 
                                            name="dob" 
                                            value={formData.dob} 
                                            onChange={handleFormChange}
                                            max={new Date().toISOString().split("T")[0]} 
                                        />
                                    </div>
                                </div>
                                
                                <div className={styles.modalActions}>
                                    <button type="button" onClick={() => setIsProfileModalOpen(false)} className={styles.btnCancel}>Hủy</button>
                                    <button type="submit" className={styles.btnSave}>Lưu thay đổi</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;