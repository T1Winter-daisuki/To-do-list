import React from 'react';
import { Routes, Route } from 'react-router-dom';

import PrivateRoute from './PrivateRoute';
import LoginPage from '../3pages/auth/LoginPage';
import RegisterPage from '../3pages/auth/RegisterPage';
import HomePage from '../3pages/home/HomePage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route 
        path="/" element={
          <PrivateRoute>
             <HomePage />
          </PrivateRoute>
        } 
      />
      
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;