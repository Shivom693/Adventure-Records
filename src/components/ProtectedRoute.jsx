import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FullPageSpinner = () => (
  <div className="pt-32 flex flex-col items-center justify-center min-h-[70vh] text-zinc-100 font-outfit">
    <div className="w-10 h-10 rounded-full border-3 border-t-[#585589] border-zinc-800 animate-spin" />
  </div>
);

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const { user, authLoading, isAuthenticated } = useAuth();

  // Read activeUser fallback from localStorage if AuthContext hasn't synced yet (e.g. backend admin JWT)
  let activeUser = user;
  if (!activeUser) {
    try {
      const raw = localStorage.getItem('user');
      if (raw) activeUser = JSON.parse(raw);
    } catch (e) {}
  }

  const isUserAuthenticated = isAuthenticated || Boolean(activeUser);

  // 1. Wait until auth finishes restoring persistent state (if no user in memory or storage)
  if (authLoading && !activeUser) {
    return <FullPageSpinner />;
  }

  // 2. Not authenticated -> Redirect to /admin-login (if adminOnly) or /login
  if (!isUserAuthenticated || !activeUser) {
    return <Navigate to={adminOnly ? "/admin-login" : "/login"} state={{ from: location }} replace />;
  }

  // 3. Admin Route Check (allow role Admin or owner email)
  if (adminOnly && activeUser?.role !== 'Admin' && activeUser?.email?.toLowerCase().trim() !== 'adventureof693@gmail.com') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
