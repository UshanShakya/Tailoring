import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Building2, Users, LayoutDashboard, LogOut } from 'lucide-react';

export const DashboardShellPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Top Header Navbar */}
      <header className="bg-surface border-b border-border px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal text-canvas flex items-center justify-center font-bold text-sm shadow-sm">
              T
            </div>
            <div>
              <h1 className="text-sm font-semibold text-ink leading-tight">
                {user?.businessName || 'Platform Global Workspace'}
              </h1>
              <p className="text-[11px] text-muted">Tailoring Management Platform</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-teal/10 text-teal font-semibold'
                    : 'text-muted hover:text-ink hover:bg-canvas'
                }`
              }
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Overview
            </NavLink>

            {user?.role === 'SUPER_ADMIN' && (
              <NavLink
                to="/dashboard/admin/businesses"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-teal/10 text-teal font-semibold'
                      : 'text-muted hover:text-ink hover:bg-canvas'
                  }`
                }
              >
                <Building2 className="w-3.5 h-3.5" /> Tenants & Admins
              </NavLink>
            )}

            {(user?.role === 'BUSINESS_ADMIN' || user?.role === 'STAFF_FULL') && (
              <NavLink
                to="/dashboard/staff"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-teal/10 text-teal font-semibold'
                      : 'text-muted hover:text-ink hover:bg-canvas'
                  }`
                }
              >
                <Users className="w-3.5 h-3.5" /> Staff Team
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-ink">{user?.name}</p>
            <p className="text-[11px] text-muted">{user?.email}</p>
          </div>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-teal/10 text-teal border border-teal/20">
            {user?.role}
          </span>
          <Button variant="secondary" onClick={handleLogout} className="text-xs px-2.5 py-1 gap-1">
            <LogOut className="w-3.5 h-3.5 text-muted" /> Exit
          </Button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};
