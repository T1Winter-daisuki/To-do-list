import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <p>v1.0 Made by <span>Bui Hoang Son.</span> 2026</p>
            </div>
        </footer>
    );
};

export default Footer;