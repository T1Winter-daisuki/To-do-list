import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../2context/AuthContext';

// Component này nhận vào "children" (là cái trang muốn bảo vệ, vd: HomePage)
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // 1. Nếu đang kiểm tra (F5 trang) thì hiện loading chứ đừng đá ra login vội
    if (loading) return <div>Đang tải...</div>;

    // 2. Nếu kiểm tra xong mà không có user (chưa đăng nhập) -> Đá về Login
    if (!user)
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;

    // 3. Nếu có user -> Cho phép hiển thị nội dung bên trong
    return children;
};

export default PrivateRoute;