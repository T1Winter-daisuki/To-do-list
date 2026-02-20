import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../2context/AuthContext';
import styles from './Navbar.module.css';
import { FaUserCircle } from 'react-icons/fa';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import { updateAPI } from '../1services/authServices';

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [formData, setFormData] = useState({ first_name: '', last_name: '', phone: '', dob: '' });
   
    useEffect(() => {
        if (user && isProfileModalOpen) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                dob: user.dob ? user.dob.split('T')[0] : '' 
            });
        }
    }, [user, isProfileModalOpen]);

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
        const success = await updateAPI(formData);
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
                {AnimatedLogo("To-Do List")}
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
                                    Đăng xuất ({user.username})
                            </span>
                        </>
                    ) : (
                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>Đăng nhập</Link>
                    )}
                </div>
            </ul>

            <div className={styles.userAreaDesktop}>
            {user ? (
                <div className={styles.userContainer} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <div className={styles.avatarCircle}>
                        {user.username ? user.username.charAt(0).toUpperCase() : <FaUserCircle />}
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.greeting}>Hi, </span>
                        <span className={styles.username}>{user.username}</span>
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
                        <h3 style={{marginBottom: '20px', textAlign: 'center'}}>Cập nhật thông tin</h3>
                        
                        <form onSubmit={handleUpdateSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                            <div>
                                <label style={{fontSize:'14px', color:'#555'}}>Họ đệm:</label>
                                <input name="first_name" value={formData.first_name} onChange={handleFormChange} className={styles.inputField} />
                            </div>
                            <div>
                                <label style={{fontSize:'14px', color:'#555'}}>Tên:</label>
                                <input name="last_name" value={formData.last_name} onChange={handleFormChange} className={styles.inputField} />
                            </div>
                            <div>
                                <label style={{fontSize:'14px', color:'#555'}}>Số điện thoại:</label>
                                <input name="phone" value={formData.phone} onChange={handleFormChange} className={styles.inputField} />
                            </div>
                            <div>
                                <label style={{fontSize:'14px', color:'#555'}}>Ngày sinh:</label>
                                <input type="date" name="dob" value={formData.dob} onChange={handleFormChange} className={styles.inputField} />
                            </div>
                            
                            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px'}}>
                                <button type="button" onClick={() => setIsProfileModalOpen(false)} style={{padding: '8px 15px', borderRadius:'5px', border:'1px solid #ccc', background:'white', cursor:'pointer'}}>Hủy</button>
                                <button type="submit" style={{padding: '8px 15px', borderRadius:'5px', border:'none', background:'#4a90e2', color:'white', cursor:'pointer'}}>Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;