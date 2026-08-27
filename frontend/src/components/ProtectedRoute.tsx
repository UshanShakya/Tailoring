import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/auth';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center text-muted">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-muted">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6 text-center">
        <div className="bg-surface border border-border rounded-lg p-8 max-w-md">
          <h2 className="text-xl font-semibold text-error mb-2">Access Denied</h2>
          <p className="text-sm text-muted mb-4">
            Your role ({user.role}) does not have permission to view this section.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-teal text-canvas rounded-md text-sm hover:bg-teal-dark"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
