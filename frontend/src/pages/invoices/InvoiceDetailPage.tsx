import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  ArrowLeft,
  User,
  Plus,
  Printer,
  Scissors,
  CreditCard,
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  amount: number;
  method: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'MOBILE_WALLET';
  referenceNote?: string;
  recordedBy: string;
  createdAt: string;
}

interface InvoiceDetailRecord {
  id: string;
  invoiceNumber: string;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    phone?: string;
    address?: string;
  };
  order: {
    id: string;
    orderNumber: string;
    items: Array<{
      id: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      fabricNotes?: string;
      garmentType: {
        name: string;
        nameNp?: string;
      };
    }>;
  };
  payments: PaymentRecord[];
}

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [invoice, setInvoice] = useState<InvoiceDetailRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Record Payment Modal
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CARD' | 'MOBILE_WALLET'>('CASH');
  const [referenceNote, setReferenceNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const perms = user?.role?.permissions || [];
  const canRecordPayment = perms.includes('*') || perms.includes('payment:create') || perms.includes('payment:*');

  const loadInvoice = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await fetchWithAuth<InvoiceDetailRecord>(`/invoices/${id}`);
      setInvoice(data);
      setPaymentAmount(Number(data.dueAmount));
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (paymentAmount <= 0) {
      alert('Payment amount must be greater than 0');
      return;
    }
    setIsSubmitting(true);
    try {
      await fetchWithAuth(`/invoices/${id}/payments`, {
        method: 'POST',
        body: JSON.stringify({
          amount: paymentAmount,
          method: paymentMethod,
          referenceNote,
        }),
      });
      setIsPaymentOpen(false);
      setReferenceNote('');
      await loadInvoice();
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: InvoiceDetailRecord['status']) => {
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

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-muted">Loading billing invoice...</div>;
  }

  if (error || !invoice) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-error font-medium text-sm">{error || 'Invoice not found'}</div>
        <Button variant="secondary" onClick={() => navigate('/dashboard/invoices')}>
          Return to Invoices List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="px-2.5 py-1 text-xs"
            onClick={() => navigate('/dashboard/invoices')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-ink font-mono">{invoice.invoiceNumber}</h2>
              {getStatusBadge(invoice.status)}
            </div>
            <p className="text-xs text-muted">Ref Order: {invoice.order?.orderNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="gap-2 text-xs"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4 text-teal" /> Print Invoice Receipt
          </Button>

          {canRecordPayment && Number(invoice.dueAmount) > 0 && (
            <Button onClick={() => setIsPaymentOpen(true)} className="gap-2 text-xs">
              <Plus className="w-4 h-4" /> Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Printable Invoice Container */}
      <Card className="p-8 space-y-6 bg-surface print:shadow-none print:border-none">
        {/* Invoice Branding Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-xl font-bold text-ink tracking-tight flex items-center gap-2">
              <Scissors className="w-5 h-5 text-teal" /> {user?.businessName || 'Tailoring Management Platform'}
            </h1>
            <p className="text-xs text-muted mt-1">Bespoke Tailoring & Garment Billing Receipt</p>
          </div>

          <div className="sm:text-right text-xs">
            <span className="font-mono text-sm font-bold text-teal block">{invoice.invoiceNumber}</span>
            <span className="text-muted block">Date: {new Date(invoice.createdAt).toLocaleDateString()}</span>
            {invoice.dueDate && (
              <span className="text-muted block">Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {/* Client & Order Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="p-4 bg-canvas/60 rounded-lg border border-border space-y-1">
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Billed To (Client):</span>
            <p className="font-bold text-ink text-sm flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal" /> {invoice.customer?.name}
            </p>
            {invoice.customer?.phone && <p className="text-muted">Phone: {invoice.customer.phone}</p>}
            {invoice.customer?.address && <p className="text-muted">Address: {invoice.customer.address}</p>}
          </div>

          <div className="p-4 bg-canvas/60 rounded-lg border border-border space-y-1">
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Order Information:</span>
            <p className="font-bold text-ink font-mono text-sm">Order #{invoice.order?.orderNumber}</p>
            <p className="text-muted">Total Garment Items: {invoice.order?.items?.length || 0}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-border rounded-lg overflow-hidden">
            <thead className="bg-canvas border-b border-border text-muted font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Garment Item</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-ink">
              {invoice.order?.items?.map((it, idx) => (
                <tr key={it.id}>
                  <td className="p-3 font-mono text-muted">{idx + 1}</td>
                  <td className="p-3 font-semibold">
                    {it.garmentType?.name}{' '}
                    {it.garmentType?.nameNp && <span className="text-teal text-[11px]">({it.garmentType.nameNp})</span>}
                    {it.fabricNotes && <p className="text-[11px] font-normal text-muted italic">Fabric: {it.fabricNotes}</p>}
                  </td>
                  <td className="p-3 text-center font-mono font-bold">{it.quantity}</td>
                  <td className="p-3 text-right font-mono text-muted">${Number(it.unitPrice).toFixed(2)}</td>
                  <td className="p-3 text-right font-mono font-bold text-teal">${Number(it.totalPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Totals */}
        <div className="flex justify-end pt-2">
          <div className="w-full max-w-xs space-y-2 text-xs border-t border-border pt-4">
            <div className="flex justify-between text-muted">
              <span>Subtotal Amount:</span>
              <span className="font-mono text-ink">${Number(invoice.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Paid Deposits / Payments:</span>
              <span className="font-mono text-success font-semibold">-${Number(invoice.paidAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-border pt-2 text-ink">
              <span>Remaining Balance Due:</span>
              <span className={`font-mono ${Number(invoice.dueAmount) > 0 ? 'text-error' : 'text-success'}`}>
                ${Number(invoice.dueAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment History Section */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-teal" /> Recorded Payment History ({invoice.payments?.length || 0})
        </h3>

        {invoice.payments?.length === 0 ? (
          <p className="text-xs text-muted italic">No payments recorded against this invoice yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-border text-muted font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Date & Time</th>
                  <th className="px-4 py-2.5">Method</th>
                  <th className="px-4 py-2.5 text-right">Amount Paid</th>
                  <th className="px-4 py-2.5">Recorded By</th>
                  <th className="px-4 py-2.5">Reference Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink">
                {invoice.payments?.map((p) => (
                  <tr key={p.id} className="hover:bg-canvas/50">
                    <td className="px-4 py-2.5">{new Date(p.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="teal">{p.method.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-success">
                      +${Number(p.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-muted">{p.recordedBy}</td>
                    <td className="px-4 py-2.5 text-muted italic">{p.referenceNote || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Record Payment Modal */}
      <Modal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} title="Record Payment">
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <Input
            label="Payment Amount ($)"
            type="number"
            min="0.01"
            max={Number(invoice.dueAmount)}
            step="0.01"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(Number(e.target.value))}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full bg-surface border border-border text-ink rounded-md p-2.5 text-xs focus:outline-none focus:border-teal"
              required
            >
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CARD">Debit / Credit Card</option>
              <option value="MOBILE_WALLET">Mobile Wallet / QR Payment</option>
            </select>
          </div>

          <Input
            label="Reference Note / Transaction ID"
            placeholder="e.g. Cash deposit or Bank ref #12345"
            value={referenceNote}
            onChange={(e) => setReferenceNote(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsPaymentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
