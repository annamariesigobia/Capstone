import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-semibold">Verifying access...</p>
        </div>
      </div>
    );
  }
// Not logged in — redirect to login, preserving intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

if (roles.length > 0 && !roles.includes(user.role)) {
    
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
