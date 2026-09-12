import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  allowedRole?: 'ADMIN' | 'WORKER';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-graphite-950 flex flex-col items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-amber-brand border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs text-graphite-300">AUTHENTICATING SESSION...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role.toUpperCase() !== allowedRole.toUpperCase()) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
