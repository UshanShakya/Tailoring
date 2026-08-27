import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { formatCurrency } from '../lib/currency';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  ShieldCheck,
  UserCheck,
  ShoppingBag,
  DollarSign,
  FileText,
  Clock,
  ArrowRight,
  Scissors,
  Plus,
  Activity,
} from 'lucide-react';

interface AuditLogItem {
  id: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: any;
  createdAt: string;
}

interface DashboardStats {
  totalCustomers: number;
  activeOrdersCount: number;
  totalRevenue: number;
  outstandingDue: number;
  recentAuditLogs: AuditLogItem[];
}

export const OverviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth<DashboardStats>('/dashboard/stats');
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const getActionBadge = (action: string) => {
    if (action.includes('CREATED')) return <Badge variant="success">{action}</Badge>;
    if (action.includes('UPDATED')) return <Badge variant="teal">{action}</Badge>;
    if (action.includes('PAYMENT')) return <Badge variant="brass">{action}</Badge>;
    return <Badge variant="muted">{action}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-semibold text-ink flex items-center gap-2">
            <Scissors className="w-6 h-6 text-teal" /> Welcome back, {user?.name}
          </h2>
          <p className="text-xs text-muted">
            Workspace Executive Control Center —{' '}
            <span className="font-semibold text-ink">{user?.businessName || 'Platform Global'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/dashboard/orders')} className="gap-1.5 text-xs">
            <Plus className="w-4 h-4" /> Create Order
          </Button>
          <Button variant="secondary" onClick={() => navigate('/dashboard/customers')} className="gap-1.5 text-xs">
            <Plus className="w-4 h-4" /> Add Client
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-md text-xs font-medium">
          {error}
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          onClick={() => navigate('/dashboard/customers')}
          className="p-5 flex flex-col justify-between hover:border-teal/50 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Customers</span>
            <UserCheck className="w-5 h-5 text-teal" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-ink group-hover:text-teal transition-colors">
              {isLoading ? '...' : stats?.totalCustomers || 0}
            </span>
            <p className="text-[11px] text-muted mt-1 flex items-center gap-1">
              View customer directory <ArrowRight className="w-3 h-3 text-teal" />
            </p>
          </div>
        </Card>

        <Card
          onClick={() => navigate('/dashboard/orders')}
          className="p-5 flex flex-col justify-between hover:border-teal/50 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Orders in Production</span>
            <ShoppingBag className="w-5 h-5 text-brass" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-ink group-hover:text-teal transition-colors">
              {isLoading ? '...' : stats?.activeOrdersCount || 0}
            </span>
            <p className="text-[11px] text-muted mt-1 flex items-center gap-1">
              View tailoring orders workflow <ArrowRight className="w-3 h-3 text-teal" />
            </p>
          </div>
        </Card>

        <Card
          onClick={() => navigate('/dashboard/invoices')}
          className="p-5 flex flex-col justify-between hover:border-teal/50 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Revenue Collected</span>
            <DollarSign className="w-5 h-5 text-success" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-success">
              {isLoading ? '...' : formatCurrency(stats?.totalRevenue)}
            </span>
            <p className="text-[11px] text-muted mt-1 flex items-center gap-1">
              Total payment deposits received <ArrowRight className="w-3 h-3 text-teal" />
            </p>
          </div>
        </Card>

        <Card
          onClick={() => navigate('/dashboard/invoices')}
          className="p-5 flex flex-col justify-between hover:border-teal/50 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Outstanding Balance Due</span>
            <FileText className="w-5 h-5 text-error" />
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-bold font-mono ${(stats?.outstandingDue || 0) > 0 ? 'text-error' : 'text-success'}`}>
              {isLoading ? '...' : formatCurrency(stats?.outstandingDue)}
            </span>
            <p className="text-[11px] text-muted mt-1 flex items-center gap-1">
              View pending billing receipts <ArrowRight className="w-3 h-3 text-teal" />
            </p>
          </div>
        </Card>
      </div>

      {/* Role & Permissions Banner */}
      <Card className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-canvas/40 border border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal/10 border border-teal/20 rounded-lg text-teal">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-muted">Active Role</span>
              <span className="text-sm font-bold text-teal">{user?.role?.name}</span>
            </div>
            <p className="text-xs text-muted">
              Dynamic role permissions active ({user?.role?.permissions?.length || 0} granted keys)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {user?.role?.permissions?.slice(0, 6).map((p) => (
            <span key={p} className="px-2 py-0.5 bg-surface border border-border rounded text-[10px] font-mono text-ink">
              {p}
            </span>
          ))}
          {(user?.role?.permissions?.length || 0) > 6 && (
            <span className="text-[10px] text-muted italic self-center">
              +{(user?.role?.permissions?.length || 0) - 6} more
            </span>
          )}
        </div>
      </Card>

      {/* Recent Workspace Audit Log Activity Feed */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal" /> Recent Business Audit Trail
          </h3>
          <span className="text-[11px] text-muted">Automated action logging</span>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-xs text-muted">Loading audit log feed...</div>
        ) : stats?.recentAuditLogs?.length === 0 ? (
          <p className="text-xs text-muted italic p-4 text-center">No recent audit log activities recorded yet.</p>
        ) : (
          <div className="divide-y divide-border/60">
            {stats?.recentAuditLogs?.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getActionBadge(log.action)}</div>
                  <div className="space-y-0.5">
                    <p className="text-ink font-medium">
                      <span className="font-semibold text-teal">{log.actorEmail}</span> performed{' '}
                      <span className="font-mono text-xs">{log.action}</span> on <span className="font-semibold">{log.entityType}</span>
                    </p>
                    {log.details && (
                      <p className="text-[11px] text-muted font-mono">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-[11px] text-muted font-mono shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted" /> {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
