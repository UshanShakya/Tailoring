import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../lib/api';
import { formatCurrency } from '../../lib/currency';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { Select2Combobox } from '../../components/ui/Select2Combobox';
import {
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
  companyName?: string;
  companyPan?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyLogoUrl?: string;
  isVatRegistered?: boolean;
  taxRate?: number;
  subtotal?: number;
  taxAmount?: number;
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

  const paymentMethodOptions = [
    { value: 'CASH', label: 'Cash Payment' },
    { value: 'BANK_TRANSFER', label: 'Bank Direct Transfer' },
    { value: 'CARD', label: 'Debit / Credit Card' },
    { value: 'MOBILE_WALLET', label: 'Mobile Wallet / QR Code' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        showBack
        backFallbackRoute="/dashboard/invoices"
        title={
          <div className="flex items-center gap-2">
            <span className="font-mono">{invoice.invoiceNumber}</span>
            {getStatusBadge(invoice.status)}
          </div>
        }
        subtitle={`Ref Order: ${invoice.order?.orderNumber}`}
        actions={
          <>
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
          </>
        }
      />

      {/* Printable Invoice Container */}
      <Card className="p-8 space-y-6 bg-surface print:shadow-none print:border-none">
        {/* Invoice Branding Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-border pb-6">
          <div className="flex items-start gap-4">
            {invoice.companyLogoUrl ? (
              <img src={invoice.companyLogoUrl} alt="Logo" className="h-12 object-contain rounded p-1 bg-surface border border-border" />
            ) : (
              <div className="w-10 h-10 rounded bg-teal/10 text-teal flex items-center justify-center font-bold">
                <Scissors className="w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-ink tracking-tight">
                {invoice.companyName || user?.businessName || 'Tailoring Management Platform'}
              </h1>
              {invoice.companyAddress && <p className="text-xs text-muted mt-0.5">{invoice.companyAddress}</p>}
              {invoice.companyPhone && <p className="text-xs text-muted">Phone: {invoice.companyPhone}</p>}
              {invoice.companyPan && (
                <p className="text-xs text-teal font-mono font-semibold mt-1">
                  PAN/VAT Reg No: {invoice.companyPan}
                </p>
              )}
            </div>
          </div>

          <div className="sm:text-right text-xs">
            <span className="font-mono text-sm font-bold text-teal block">{invoice.invoiceNumber}</span>
            <span className="text-muted block">Date: {new Date(invoice.createdAt).toLocaleDateString()}</span>
            {invoice.dueDate && (
              <span className="text-muted block">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</span>
            )}
            <Badge variant={invoice.isVatRegistered ? 'teal' : 'muted'} className="mt-1">
              {invoice.isVatRegistered ? `VAT Tax Invoice (${invoice.taxRate}%)` : 'Non-VAT Bill'}
            </Badge>
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
                  <td className="p-3 text-right font-mono text-muted">{formatCurrency(it.unitPrice)}</td>
                  <td className="p-3 text-right font-mono font-bold text-teal">{formatCurrency(it.totalPrice)}</td>
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
              <span className="font-mono text-ink">{formatCurrency(invoice.subtotal ?? invoice.totalAmount)}</span>
            </div>

            {invoice.isVatRegistered && Number(invoice.taxAmount) > 0 && (
              <div className="flex justify-between text-muted">
                <span>VAT ({invoice.taxRate}%):</span>
                <span className="font-mono text-teal">+{formatCurrency(invoice.taxAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-ink font-bold border-t border-border pt-2">
              <span>Total Invoice Amount:</span>
              <span className="font-mono text-teal text-sm">{formatCurrency(invoice.totalAmount)}</span>
            </div>

            <div className="flex justify-between text-muted">
              <span>Paid Payments / Deposits:</span>
              <span className="font-mono text-success font-semibold">-{formatCurrency(invoice.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-border pt-2 text-ink">
              <span>Remaining Balance Due:</span>
              <span className={`font-mono ${Number(invoice.dueAmount) > 0 ? 'text-error' : 'text-success'}`}>
                {formatCurrency(invoice.dueAmount)}
              </span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="pt-4 border-t border-border text-xs text-muted italic">
            <span className="font-semibold text-ink not-italic block">Invoice Terms & Notes:</span>
            "{invoice.notes}"
          </div>
        )}
      </Card>

      {/* Payment History Section */}
      <Card className="p-6 space-y-4 print:hidden">
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
                      +{formatCurrency(p.amount)}
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
            label="Payment Amount (NPR / Rs.)"
            type="number"
            min="0.01"
            max={Number(invoice.dueAmount)}
            step="0.01"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(Number(e.target.value))}
            required
          />

          <Select2Combobox
            label="Payment Method"
            options={paymentMethodOptions}
            value={paymentMethod}
            onChange={(val) => setPaymentMethod(val as any)}
            required
          />

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
