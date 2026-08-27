import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { ShieldCheck, Building2, Users, CheckCircle, Lock } from 'lucide-react';

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
            <span className="text-xs font-semibold uppercase tracking-wider">Dynamic Role</span>
            <ShieldCheck className="w-4 h-4 text-teal" />
          </div>
          <p className="text-base font-semibold text-teal">{user?.role?.name}</p>
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
          <CheckCircle className="w-5 h-5 text-success" /> Dynamic Roles & Permissions Active
        </h3>
        <p className="text-xs text-muted leading-relaxed">
          Your role (<span className="font-semibold text-teal">{user?.role?.name}</span>) is dynamically configured with granular menu access and button permissions.
        </p>

        <div className="space-y-2">
          <span className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-teal" /> Active Granted Permission Keys ({user?.role?.permissions?.length || 0}):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {user?.role?.permissions?.map((p) => (
              <span key={p} className="px-2.5 py-1 bg-canvas border border-border rounded text-xs font-mono text-ink">
                {p}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
