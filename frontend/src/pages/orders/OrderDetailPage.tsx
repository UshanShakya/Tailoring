import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../lib/api';
import { formatCurrency } from '../../lib/currency';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import {
  User,
  Phone,
  Calendar,
  CheckCircle2,
  Play,
  PackageCheck,
  Truck,
  XCircle,
  Scissors,
  FileText,
  Receipt,
} from 'lucide-react';

interface GarmentTypeItem {
  id: string;
  name: string;
  nameNp?: string;
}

interface OrderItemDetail {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  fabricNotes?: string;
  specialInstructions?: string;
  garmentType: GarmentTypeItem;
}

interface OrderDetailRecord {
  id: string;
  orderNumber: string;
  status: 'DRAFT' | 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    phone?: string;
    address?: string;
  };
  items: OrderItemDetail[];
}

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState<OrderDetailRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  const perms = user?.role?.permissions || [];
  const canEdit = perms.includes('*') || perms.includes('order:edit') || perms.includes('order:*');
  const canInvoice = perms.includes('*') || perms.includes('invoice:create') || perms.includes('invoice:*');

  const loadOrder = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await fetchWithAuth<OrderDetailRecord>(`/orders/${id}`);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleUpdateStatus = async (nextStatus: OrderDetailRecord['status']) => {
    if (!id) return;
    setIsUpdatingStatus(true);
    try {
      await fetchWithAuth(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      await loadOrder();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!id) return;
    setIsGeneratingInvoice(true);
    try {
      const invoice = await fetchWithAuth<any>(`/invoices/generate/${id}`, {
        method: 'POST',
      });
      navigate(`/dashboard/invoices/${invoice.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to generate invoice');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const getStatusBadge = (status: OrderDetailRecord['status']) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="muted">Draft</Badge>;
      case 'CONFIRMED':
        return <Badge variant="brass">Confirmed</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="teal">In Production</Badge>;
      case 'READY':
        return <Badge variant="success">Ready for Pickup</Badge>;
      case 'DELIVERED':
        return <Badge variant="success">Delivered</Badge>;
      case 'CANCELLED':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge variant="muted">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-muted">Loading order detail...</div>;
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-error font-medium text-sm">{error || 'Order not found'}</div>
        <Button variant="secondary" onClick={() => navigate('/dashboard/orders')}>
          Return to Orders List
        </Button>
      </div>
    );
  }

  const steps: OrderDetailRecord['status'][] = ['DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED'];
  const currentStepIdx = steps.indexOf(order.status);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        showBack
        backFallbackRoute="/dashboard/orders"
        title={
          <div className="flex items-center gap-2 font-mono">
            <span>{order.orderNumber}</span>
            {getStatusBadge(order.status)}
          </div>
        }
        subtitle={`Created on ${new Date(order.createdAt).toLocaleDateString()}`}
        actions={
          <>
            {canInvoice && order.status !== 'CANCELLED' && (
              <Button
                variant="outline"
                isLoading={isGeneratingInvoice}
                onClick={handleGenerateInvoice}
                className="gap-1.5 text-xs text-teal border-teal/40 hover:bg-teal/10"
              >
                <Receipt className="w-4 h-4" /> Generate Invoice
              </Button>
            )}

            {canEdit && order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
              <>
                {order.status === 'DRAFT' && (
                  <Button
                    isLoading={isUpdatingStatus}
                    onClick={() => handleUpdateStatus('CONFIRMED')}
                    className="gap-1 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Confirm Order
                  </Button>
                )}

                {order.status === 'CONFIRMED' && (
                  <Button
                    isLoading={isUpdatingStatus}
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    className="gap-1 text-xs"
                  >
                    <Play className="w-4 h-4" /> Start Production
                  </Button>
                )}

                {order.status === 'IN_PROGRESS' && (
                  <Button
                    isLoading={isUpdatingStatus}
                    onClick={() => handleUpdateStatus('READY')}
                    className="gap-1 text-xs"
                  >
                    <PackageCheck className="w-4 h-4" /> Mark Ready for Pickup
                  </Button>
                )}

                {order.status === 'READY' && (
                  <Button
                    isLoading={isUpdatingStatus}
                    onClick={() => handleUpdateStatus('DELIVERED')}
                    className="gap-1 text-xs"
                  >
                    <Truck className="w-4 h-4" /> Mark Delivered
                  </Button>
                )}

                <Button
                  variant="outline"
                  isLoading={isUpdatingStatus}
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel this order?')) {
                      handleUpdateStatus('CANCELLED');
                    }
                  }}
                  className="gap-1 text-xs text-error hover:bg-error/10"
                >
                  <XCircle className="w-4 h-4" /> Cancel
                </Button>
              </>
            )}
          </>
        }
      />

      {/* Production Workflow Progression Bar */}
      {order.status !== 'CANCELLED' && (
        <Card className="p-4 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[500px]">
            {steps.map((st, idx) => {
              const isPassed = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;

              return (
                <div key={st} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border transition-colors ${
                        isCurrent
                          ? 'bg-teal text-canvas border-teal ring-2 ring-teal/30'
                          : isPassed
                          ? 'bg-teal/20 text-teal border-teal/40'
                          : 'bg-canvas text-muted border-border'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-[10px] font-medium mt-1 uppercase tracking-wider ${
                        isCurrent ? 'text-teal font-bold' : isPassed ? 'text-ink' : 'text-muted'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-colors ${
                        currentStepIdx > idx ? 'bg-teal' : 'bg-border'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Client Overview Card */}
      <Card className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Customer Name</span>
          <p
            onClick={() => navigate(`/dashboard/customers/${order.customer?.id}`)}
            className="text-sm font-semibold text-teal hover:underline cursor-pointer flex items-center gap-2"
          >
            <User className="w-4 h-4 text-teal" /> {order.customer?.name}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Phone Number</span>
          <p className="text-sm font-semibold text-ink flex items-center gap-2">
            <Phone className="w-4 h-4 text-teal" /> {order.customer?.phone || 'Not provided'}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Target Due Date</span>
          <p className="text-sm font-semibold text-ink flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brass" />{' '}
            {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'No due date set'}
          </p>
        </div>
      </Card>

      {/* Order Line Items Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border bg-canvas/40 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
            <Scissors className="w-4 h-4 text-teal" /> Garment Order Line Items ({order.items?.length || 0})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas border-b border-border text-muted font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Garment Type</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-right">Total Price</th>
                <th className="px-4 py-3">Fabric & Styling Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-ink">
              {order.items?.map((it) => (
                <tr key={it.id} className="hover:bg-canvas/50 transition-colors">
                  <td className="px-4 py-3 font-semibold">
                    {it.garmentType?.name}{' '}
                    {it.garmentType?.nameNp && <span className="text-teal font-normal text-[11px]">({it.garmentType.nameNp})</span>}
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold">{it.quantity}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted">{formatCurrency(it.unitPrice)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-teal">
                    {formatCurrency(it.totalPrice)}
                  </td>
                  <td className="px-4 py-3 text-muted space-y-0.5">
                    {it.fabricNotes && <div>Cloth: <span className="text-ink font-medium">{it.fabricNotes}</span></div>}
                    {it.specialInstructions && (
                      <div className="italic text-[11px] text-teal">Note: {it.specialInstructions}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-canvas/60 border-t border-border flex items-center justify-between">
          <div className="text-xs text-muted">
            {order.notes && (
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Special Order Note: "{order.notes}"
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-semibold text-muted">Total Order Amount:</span>
            <span className="text-lg font-mono font-bold text-teal">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
