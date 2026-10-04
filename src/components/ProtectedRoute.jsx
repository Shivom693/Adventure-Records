import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FullPageSpinner = () => (
  <div className="pt-32 flex flex-col items-center justify-center min-h-[70vh] text-zinc-100 font-outfit">
    <div className="w-10 h-10 rounded-full border-3 border-t-[#585589] border-zinc-800 animate-spin mb-4" />
    <span className="font-heading font-semibold text-zinc-400 text-xs tracking-widest uppercase animate-pulse">
      Restoring session...
    </span>
  </div>
);

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const { user, authLoading, isAuthenticated } = useAuth();

  // 1. Wait until Firebase finishes restoring persistent auth state
  if (authLoading) {
    return <FullPageSpinner />;
  }

  // 2. Not authenticated -> Redirect to /login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Admin Route Check
  if (adminOnly && user?.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
