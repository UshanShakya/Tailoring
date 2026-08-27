import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  requiredPermission?: string;
  allowedRoleNames?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredPermission,
  allowedRoleNames,
}) => {
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

  const userPerms = user.role?.permissions || [];
  const roleName = user.role?.name || '';

  const hasPerm =
    !requiredPermission ||
    userPerms.includes('*') ||
    userPerms.includes(requiredPermission) ||
    userPerms.includes(`${requiredPermission.split(':')[0]}:*`);

  const hasRoleName = !allowedRoleNames || allowedRoleNames.includes(roleName) || roleName === 'Super Admin';

  if (!hasPerm || !hasRoleName) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6 text-center">
        <div className="bg-surface border border-border rounded-lg p-8 max-w-md shadow-sm">
          <h2 className="text-xl font-semibold text-error mb-2">Access Restricted</h2>
          <p className="text-xs text-muted mb-4">
            Your role (<strong className="text-ink">{roleName}</strong>) does not have permission to view this section.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-teal text-canvas rounded-md text-xs font-semibold hover:bg-teal-dark"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
