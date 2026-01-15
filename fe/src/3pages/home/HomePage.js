import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

const HomePage = () => {
    return (
        <div className={styles.homeContainer}>
            <div className={styles.backgroundAnimation}>
                <div className={styles.shape}></div>
                <div className={styles.shape}></div>
                <div className={styles.shape}></div>
            </div>

            <section className={styles.heroSection}>
                <h1 className={styles.title}>
                    Quản lý công việc <br /> 
                    <span className={styles.highlight}>Hiệu quả & Đơn giản</span>
                </h1>
                <p className={styles.description}>
                    Chào mừng đến với To-Do List. 
                    Một công cụ giúp bạn tổ chức cuộc sống, theo dõi tâm trạng và hoàn thành mục tiêu mỗi ngày.
                </p>
                
                <div className={styles.ctaGroup}>
                    <Link to="/todo" className={`${styles.btn} ${styles.primaryBtn}`}>
                        Bắt đầu ngay
                    </Link>
                    <Link to="/how" className={`${styles.btn} ${styles.secondaryBtn}`}>
                        Xem hướng dẫn
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HomePage;