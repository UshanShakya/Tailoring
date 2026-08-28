import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../lib/api';
import { formatCurrency } from '../../lib/currency';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  FileText,
  Search,
  ChevronRight,
  User,
  Building2,
} from 'lucide-react';

interface BusinessTenant {
  id: string;
  name: string;
}

interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  dueDate?: string;
  createdAt: string;
  business?: BusinessTenant;
  customer: {
    id: string;
    name: string;
    phone?: string;
  };
  order: {
    id: string;
    orderNumber: string;
  };
}

export const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.name === 'Super Admin';

  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [businesses, setBusinesses] = useState<BusinessTenant[]>([]);
  const [selectedBusinessFilter, setSelectedBusinessFilter] = useState<string>('ALL');

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchWithAuth<BusinessTenant[]>('/admin/businesses')
        .then((data) => setBusinesses(data))
        .catch((err) => console.error('Failed to load businesses list:', err));
    }
  }, [isSuperAdmin]);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      let url = '/invoices';
      const params: string[] = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (selectedStatus !== 'ALL') params.push(`status=${selectedStatus}`);
      if (isSuperAdmin && selectedBusinessFilter !== 'ALL') {
        params.push(`businessId=${selectedBusinessFilter}`);
      }
      if (params.length > 0) url += `?${params.join('&')}`;

      const data = await fetchWithAuth<InvoiceListItem[]>(url);
      setInvoices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadInvoices();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedStatus, selectedBusinessFilter]);

  const getStatusBadge = (status: InvoiceListItem['status']) => {
    switch (status) {
      case 'UNPAID':
        return <Badge variant="error">Unpaid</Badge>;
      case 'PARTIALLY_PAID':
        return <Badge variant="warning">Partially Paid</Badge>;
      case 'PAID':
        return <Badge variant="success">Paid in Full</Badge>;
      case 'CANCELLED':
        return <Badge variant="muted">Cancelled</Badge>;
      default:
        return <Badge variant="muted">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-semibold text-ink flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal" /> Invoices & Billing
          </h2>
          <p className="text-xs text-muted">Manage client invoices, track partial deposits, and record payments</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-md text-xs font-medium">
          {error}
        </div>
      )}

      {/* Filter Tabs & Search & Super Admin Business Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 border-b md:border-b-0 border-border overflow-x-auto pb-2 md:pb-0 text-xs font-medium">
          {['ALL', 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                selectedStatus === st
                  ? 'bg-teal text-canvas font-semibold'
                  : 'text-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              {st === 'ALL' ? 'All Invoices' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {isSuperAdmin && (
            <div className="flex items-center gap-1.5 bg-canvas border border-border rounded-md px-2.5 py-1 text-xs">
              <Building2 className="w-4 h-4 text-teal" />
              <select
                value={selectedBusinessFilter}
                onChange={(e) => setSelectedBusinessFilter(e.target.value)}
                className="bg-transparent text-ink font-semibold focus:outline-none text-xs"
              >
                <option value="ALL">All Tenant Businesses ({businesses.length})</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search invoice #, order #, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-border text-ink rounded-md pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-teal"
            />
          </div>
        </div>
      </div>

      {/* Invoices List Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-sm text-muted">Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <Card className="p-8 text-center text-muted">
          <p className="text-sm">No invoices found.</p>
          <p className="text-xs text-muted mt-1">Generate invoices directly from Confirmed Orders in the Orders section.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invoices.map((inv) => (
            <Card
              key={inv.id}
              onClick={() => navigate(`/dashboard/invoices/${inv.id}`)}
              className="p-5 flex flex-col justify-between space-y-4 hover:border-teal/50 cursor-pointer transition-colors group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-border pb-2.5 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-mono text-xs font-bold text-teal">{inv.invoiceNumber}</span>
                      {inv.business && (
                        <Badge variant="teal" className="text-[9px] px-1.5 py-0">
                          {inv.business.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted font-mono">Ref Order: {inv.order?.orderNumber}</p>
                  </div>
                  {getStatusBadge(inv.status)}
                </div>

                <div className="space-y-2 text-xs">
                  <h3 className="font-semibold text-ink flex items-center gap-1.5 group-hover:text-teal transition-colors">
                    <User className="w-3.5 h-3.5 text-muted" /> {inv.customer?.name}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2 bg-canvas rounded border border-border">
                      <span className="text-[10px] text-muted block">Total Amount</span>
                      <span className="font-mono font-bold text-ink text-xs">{formatCurrency(inv.totalAmount)}</span>
                    </div>

                    <div className="p-2 bg-canvas rounded border border-border">
                      <span className="text-[10px] text-muted block">Balance Due</span>
                      <span className={`font-mono font-bold text-xs ${Number(inv.dueAmount) > 0 ? 'text-error' : 'text-success'}`}>
                        {formatCurrency(inv.dueAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted">
                <span>Created: {new Date(inv.createdAt).toLocaleDateString()}</span>
                <span className="text-teal font-medium flex items-center gap-0.5 group-hover:underline">
                  View Billing Detail <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
