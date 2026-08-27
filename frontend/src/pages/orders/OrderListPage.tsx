import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { CustomerSearchSelect } from '../../components/ui/CustomerSearchSelect';
import {
  ShoppingBag,
  Plus,
  Search,
  ChevronRight,
  User,
  Calendar,
  Scissors,
  Trash2,
} from 'lucide-react';

interface CustomerItem {
  id: string;
  name: string;
  phone?: string;
}

interface GarmentTypeItem {
  id: string;
  name: string;
  nameNp?: string;
}

interface OrderItemPayload {
  garmentTypeId: string;
  quantity: number;
  unitPrice: number;
  fabricNotes?: string;
  specialInstructions?: string;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  status: 'DRAFT' | 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  customer: CustomerItem;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    garmentType: GarmentTypeItem;
  }>;
}

export const OrderListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [garmentTypes, setGarmentTypes] = useState<GarmentTypeItem[]>([]);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItemPayload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const perms = user?.role?.permissions || [];
  const canCreate = perms.includes('*') || perms.includes('order:create') || perms.includes('order:*');

  const loadData = async () => {
    try {
      setIsLoading(true);
      let url = '/orders';
      const params: string[] = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (selectedStatus !== 'ALL') params.push(`status=${selectedStatus}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const [ordersData, custData, garmentData] = await Promise.all([
        fetchWithAuth<OrderItem[]>(url),
        fetchWithAuth<CustomerItem[]>('/customers'),
        fetchWithAuth<GarmentTypeItem[]>('/garment-types'),
      ]);

      setOrders(ordersData);
      setCustomers(custData);
      setGarmentTypes(garmentData);

      if (custData.length > 0 && !customerId) setCustomerId(custData[0].id);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedStatus]);

  const handleStartCreate = () => {
    if (customers.length > 0) setCustomerId(customers[0].id);
    setDueDate('');
    setOrderNotes('');
    setOrderItems([
      {
        garmentTypeId: garmentTypes.length > 0 ? garmentTypes[0].id : '',
        quantity: 1,
        unitPrice: 50,
        fabricNotes: '',
        specialInstructions: '',
      },
    ]);
    setIsCreateOpen(true);
  };

  const handleAddItemRow = () => {
    setOrderItems([
      ...orderItems,
      {
        garmentTypeId: garmentTypes.length > 0 ? garmentTypes[0].id : '',
        quantity: 1,
        unitPrice: 50,
        fabricNotes: '',
        specialInstructions: '',
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setOrderItems(orderItems.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof OrderItemPayload, value: any) => {
    const updated = [...orderItems];
    (updated[index] as any)[field] = value;
    setOrderItems(updated);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      alert('Please select a customer');
      return;
    }
    if (orderItems.length === 0) {
      alert('Please add at least one garment item to the order');
      return;
    }
    setIsSubmitting(true);
    try {
      await fetchWithAuth('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerId,
          dueDate: dueDate || undefined,
          notes: orderNotes,
          items: orderItems,
        }),
      });
      setIsCreateOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: OrderItem['status']) => {
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

  const totalCalculated = orderItems.reduce((acc, curr) => acc + (curr.quantity || 0) * (curr.unitPrice || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-semibold text-ink flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-teal" /> Tailoring Orders
          </h2>
          <p className="text-xs text-muted">Manage bespoke tailoring orders, line items, production status, and delivery dates</p>
        </div>

        {canCreate && (
          <Button onClick={handleStartCreate} className="gap-2 text-xs">
            <Plus className="w-4 h-4" /> Create New Order
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-md text-xs font-medium">
          {error}
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 border-b md:border-b-0 border-border overflow-x-auto pb-2 md:pb-0 text-xs font-medium">
          {['ALL', 'DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                selectedStatus === st
                  ? 'bg-teal text-canvas font-semibold'
                  : 'text-muted hover:text-ink hover:bg-canvas'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search order # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border text-ink rounded-md pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-teal"
          />
        </div>
      </div>

      {/* Order List Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-sm text-muted">Loading orders...</div>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center text-muted">
          <p className="text-sm">No tailoring orders found.</p>
          {canCreate && (
            <Button variant="secondary" onClick={handleStartCreate} className="mt-3 text-xs">
              Create First Order
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((o) => (
            <Card
              key={o.id}
              onClick={() => navigate(`/dashboard/orders/${o.id}`)}
              className="p-5 flex flex-col justify-between space-y-4 hover:border-teal/50 cursor-pointer transition-colors group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-border pb-2.5 mb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-teal">{o.orderNumber}</span>
                    <h3 className="text-sm font-semibold text-ink flex items-center gap-1.5 mt-0.5 group-hover:text-teal transition-colors">
                      <User className="w-3.5 h-3.5 text-muted" /> {o.customer?.name}
                    </h3>
                  </div>
                  {getStatusBadge(o.status)}
                </div>

                {/* Items preview */}
                <div className="space-y-1.5 text-xs text-muted">
                  <div className="flex items-center justify-between text-ink">
                    <span className="font-medium flex items-center gap-1">
                      <Scissors className="w-3.5 h-3.5 text-teal" /> Items ({o.items?.length || 0}):
                    </span>
                    <span className="font-mono font-bold text-teal text-sm">
                      ${Number(o.totalAmount).toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-1 pt-1">
                    {o.items?.slice(0, 3).map((it) => (
                      <div key={it.id} className="flex items-center justify-between text-[11px] bg-canvas/60 px-2 py-1 rounded">
                        <span>
                          {it.quantity}x {it.garmentType?.name}
                        </span>
                        <span className="font-mono">${Number(it.totalPrice).toFixed(2)}</span>
                      </div>
                    ))}
                    {o.items?.length > 3 && (
                      <span className="text-[10px] text-muted block italic">
                        +{o.items.length - 3} more items...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted">
                {o.dueDate ? (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-brass" /> Due: {new Date(o.dueDate).toLocaleDateString()}
                  </span>
                ) : (
                  <span>Created: {new Date(o.createdAt).toLocaleDateString()}</span>
                )}
                <span className="text-teal font-medium flex items-center gap-0.5 group-hover:underline">
                  View Detail <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Order Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Tailoring Order">
        <form onSubmit={handleCreateOrder} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <CustomerSearchSelect
            customers={customers}
            value={customerId}
            onChange={(val) => setCustomerId(val)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Target Delivery Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-surface border border-border text-ink rounded-md p-2 text-xs focus:outline-none focus:border-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Order Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Rush order for wedding"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full bg-surface border border-border text-ink rounded-md p-2 text-xs focus:outline-none focus:border-teal"
              />
            </div>
          </div>

          {/* Line Items Builder */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1">
                <Scissors className="w-3.5 h-3.5 text-teal" /> Order Garment Line Items
              </label>
              <Button type="button" variant="secondary" onClick={handleAddItemRow} className="text-xs px-2 py-1 gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Garment Item
              </Button>
            </div>

            <div className="space-y-2">
              {orderItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-canvas border border-border rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between text-muted">
                    <span className="font-semibold text-ink">Item #{idx + 1}</span>
                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="text-error hover:underline text-[11px] flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-muted font-medium">Garment Type</label>
                      <select
                        value={item.garmentTypeId}
                        onChange={(e) => handleItemChange(idx, 'garmentTypeId', e.target.value)}
                        className="w-full bg-surface border border-border text-ink rounded px-2 py-1 text-xs focus:outline-none focus:border-teal"
                      >
                        {garmentTypes.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name} {g.nameNp ? `(${g.nameNp})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-muted font-medium">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        className="w-full bg-surface border border-border text-ink rounded px-2 py-1 text-xs focus:outline-none focus:border-teal"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-muted font-medium">Unit Price ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                        className="w-full bg-surface border border-border text-ink rounded px-2 py-1 text-xs focus:outline-none focus:border-teal"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Fabric / Cloth Notes (e.g. Navy Italian Wool)"
                      value={item.fabricNotes || ''}
                      onChange={(e) => handleItemChange(idx, 'fabricNotes', e.target.value)}
                      className="w-full bg-surface border border-border text-ink rounded px-2 py-1 text-xs focus:outline-none focus:border-teal"
                    />
                    <input
                      type="text"
                      placeholder="Special Styling Instructions"
                      value={item.specialInstructions || ''}
                      onChange={(e) => handleItemChange(idx, 'specialInstructions', e.target.value)}
                      className="w-full bg-surface border border-border text-ink rounded px-2 py-1 text-xs focus:outline-none focus:border-teal"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-teal/10 border border-teal/20 rounded-md flex items-center justify-between text-xs font-semibold text-ink">
              <span>Total Calculated Amount:</span>
              <span className="text-teal font-mono text-sm">${totalCalculated.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
