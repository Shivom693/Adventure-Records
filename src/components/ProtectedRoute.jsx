import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuthStatus } from '../services/authService';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const { isAuthenticated, user } = getAuthStatus();

  // 1. Not authenticated -> Redirect to /login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Admin Route Check
  if (adminOnly && user?.role !== 'Admin' && user?.email !== 'adventureof693@gmail.com') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
