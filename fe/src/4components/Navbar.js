import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../2context/AuthContext';
import styles from './Navbar.module.css';
import { FaUserCircle } from 'react-icons/fa';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
        navigate('/home');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
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
                        <span onClick={handleLogout} style={{color: '#ff7e5f', cursor:'pointer', fontWeight: 'bold'}}>Đăng xuất ({user.username})</span>
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
                        <Link to="/profile" className={styles.dropdownItem}>Cập nhật thông tin</Link>
                        <div onClick={handleLogout} className={styles.dropdownItem} style={{cursor: 'pointer', color: 'red'}}>Đăng xuất</div>
                    </div>
                    )}
                </div>
            ) : (
                <Link to="/login" className={styles.loginBtn}>Đăng nhập</Link>
            )}
            </div>
        </header>
    );
};

export default Navbar;