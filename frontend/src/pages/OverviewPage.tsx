import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { ShieldCheck, Building2, Users, CheckCircle } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-ink">Welcome back, {user?.name}</h2>
        <p className="text-xs text-muted">
          Active Workspace Overview — {user?.businessName || 'Platform Global'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Role Scope</span>
            <ShieldCheck className="w-4 h-4 text-teal" />
          </div>
          <p className="text-base font-semibold text-teal">{user?.role}</p>
        </Card>

        <Card className="p-5 space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Tenant Business</span>
            <Building2 className="w-4 h-4 text-brass" />
          </div>
          <p className="text-base font-semibold text-ink truncate">
            {user?.businessName || 'Super Admin (Global)'}
          </p>
        </Card>

        <Card className="p-5 space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Account ID</span>
            <Users className="w-4 h-4 text-muted" />
          </div>
          <p className="text-xs font-mono text-ink truncate">{user?.id}</p>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="text-base font-semibold text-ink flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-success" /> Milestone 2 Active Capabilities
        </h3>
        <p className="text-xs text-muted leading-relaxed">
          Business Tenant Management and User/Staff account management endpoints are live with multi-tenant isolation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-canvas border border-border rounded-lg space-y-1">
            <div className="font-semibold text-ink">Super Admin Role Capabilities</div>
            <p className="text-muted">
              Access to <code className="text-teal font-mono">/dashboard/admin/businesses</code> to register new tailoring businesses, assign initial Business Admins, and activate/deactivate tenant access.
            </p>
          </div>

          <div className="p-3 bg-canvas border border-border rounded-lg space-y-1">
            <div className="font-semibold text-ink">Business Admin & Staff Capabilities</div>
            <p className="text-muted">
              Access to <code className="text-teal font-mono">/dashboard/staff</code> to add team members (<code className="font-mono">STAFF_FULL</code> and <code className="font-mono">STAFF_BASIC</code>) strictly within their own business.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
