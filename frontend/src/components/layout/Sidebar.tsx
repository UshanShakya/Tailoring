import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldAlert,
  UserCheck,
  Ruler,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Scissors,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const hasPermission = (permKey: string) => {
    if (!user?.role?.permissions) return false;
    const perms = user.role.permissions;
    return perms.includes('*') || perms.includes(permKey) || perms.includes('menu:*');
  };

  const navItems = [
    {
      label: 'Overview',
      to: '/dashboard',
      icon: LayoutDashboard,
      show: hasPermission('menu:dashboard'),
      exact: true,
    },
    {
      label: 'Tenants & Admins',
      to: '/dashboard/admin/businesses',
      icon: Building2,
      show: user?.role?.name === 'Super Admin' || hasPermission('menu:tenants'),
    },
    {
      label: 'Staff Team',
      to: '/dashboard/staff',
      icon: Users,
      show: hasPermission('menu:staff'),
    },
    {
      label: 'Role Management',
      to: '/dashboard/roles',
      icon: ShieldAlert,
      show: hasPermission('menu:roles'),
    },
    {
      label: 'Customers',
      to: '/dashboard/customers',
      icon: UserCheck,
      show: hasPermission('menu:customers'),
    },
    {
      label: 'Templates',
      to: '/dashboard/templates',
      icon: Ruler,
      show: hasPermission('menu:templates'),
    },
  ];

  return (
    <aside
      className={`bg-surface border-r border-border flex flex-col justify-between transition-all duration-300 relative z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-surface border border-border rounded-full p-1 text-muted hover:text-ink shadow-sm transition-colors z-40"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal text-canvas flex items-center justify-center font-bold shadow-sm shrink-0">
            <Scissors className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden transition-opacity duration-200">
              <h1 className="text-sm font-bold text-ink tracking-tight truncate">Tailoring System</h1>
              <p className="text-[11px] text-muted truncate">
                {user?.businessName || 'Global Platform'}
              </p>
            </div>
          )}
        </div>

        {/* Dynamic Navigation Section */}
        <nav className="p-2 space-y-1 mt-2">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
              Workspace Navigation
            </p>
          )}

          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-teal/10 text-teal font-semibold'
                        : 'text-muted hover:text-ink hover:bg-canvas'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
        </nav>
      </div>

      {/* User Profile Footer Card */}
      <div className="p-3 border-t border-border bg-canvas/50">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-teal/20 text-teal font-semibold flex items-center justify-center text-xs shrink-0 border border-teal/30">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden text-left">
                <p className="text-xs font-semibold text-ink truncate">{user?.name}</p>
                <Badge variant="teal" className="text-[10px] px-1.5 py-0 mt-0.5">
                  {user?.role?.name}
                </Badge>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 text-muted hover:text-error hover:bg-error/10 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
