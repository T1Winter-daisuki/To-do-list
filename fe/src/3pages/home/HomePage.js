import React from 'react';
import { useAuth } from '../../2context/AuthContext'; 

const HomePage = () => {
    // Lấy user và hàm logout từ "kho" Context
    const { user, logout } = useAuth();

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>🏡 Trang Chủ</h1>
            
            {/* Kiểm tra nếu có user thì hiện tên, không thì hiện khách */}
            {user ? (
                <div>
                    <h2>Xin chào, <span style={{color: 'blue'}}>{user.username}</span>! 👋</h2>
                    <p>Email: {user.email}</p>
                    
                    <button 
                        onClick={logout}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Đăng xuất
                    </button>
                </div>
            ) : (
                <p>Đang tải thông tin...</p>
            )}
        </div>
    );
};

export default HomePage;