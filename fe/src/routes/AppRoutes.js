import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import PrivateRoute from './PrivateRoute';
import LoginPage from '../3pages/auth/LoginPage';
import RegisterPage from '../3pages/auth/RegisterPage';
import HomePage from '../3pages/home/HomePage';
import TodoPage from '../3pages/todo/todoPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/about" element={<div style={{padding: 50}}>About Page (Coming Soon)</div>} />
      <Route path="/how" element={<div style={{padding: 50}}>How to use (Coming Soon)</div>} />
      
      <Route 
        path="/todo" 
        element={
          <PrivateRoute>
             <TodoPage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/mood" 
        element={
          <PrivateRoute>
             <div style={{padding: 50}}>Mood Tracker (Coming Soon)</div>
          </PrivateRoute>
        } 
      />
      
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;