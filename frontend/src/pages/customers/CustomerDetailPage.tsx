import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { User, Phone, MapPin, Edit3, ArrowLeft, Ruler, ShoppingBag, Calendar } from 'lucide-react';

interface CustomerDetail {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'measurements' | 'orders'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const perms = user?.role?.permissions || [];
  const canEdit = perms.includes('*') || perms.includes('customer:edit') || perms.includes('customer:*');

  const loadCustomer = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await fetchWithAuth<CustomerDetail>(`/customers/${id}`);
      setCustomer(data);
      setName(data.name);
      setPhone(data.phone || '');
      setAddress(data.address || '');
      setNotes(data.notes || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load customer profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    try {
      await fetchWithAuth(`/customers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name, phone, address, notes }),
      });
      setIsEditOpen(false);
      await loadCustomer();
    } catch (err: any) {
      alert(err.message || 'Failed to update customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-muted">Loading customer profile...</div>;
  }

  if (error || !customer) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-error font-medium text-sm">{error || 'Customer not found'}</div>
        <Button variant="secondary" onClick={() => navigate('/dashboard/customers')}>
          Return to Customer List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button & Header Banner */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="px-2.5 py-1 text-xs"
            onClick={() => navigate('/dashboard/customers')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-ink flex items-center gap-2">
              <User className="w-5 h-5 text-teal" /> {customer.name}
            </h2>
            <p className="text-xs text-muted">Customer ID: {customer.id}</p>
          </div>
        </div>

        {canEdit && (
          <Button onClick={() => setIsEditOpen(true)} className="gap-2 text-xs">
            <Edit3 className="w-4 h-4" /> Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Overview Card */}
      <Card className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Phone Number</span>
          <p className="text-sm font-semibold text-ink flex items-center gap-2">
            <Phone className="w-4 h-4 text-teal" /> {customer.phone || 'Not provided'}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Address</span>
          <p className="text-sm font-semibold text-ink flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brass" /> {customer.address || 'Not provided'}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Date Added</span>
          <p className="text-sm font-semibold text-ink flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted" /> {new Date(customer.createdAt).toLocaleDateString()}
          </p>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <div className="border-b border-border flex items-center gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-2 border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-teal text-teal font-semibold'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Overview & Notes
        </button>
        <button
          onClick={() => setActiveTab('measurements')}
          className={`pb-2 border-b-2 transition-colors flex items-center gap-1 ${
            activeTab === 'measurements'
              ? 'border-teal text-teal font-semibold'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" /> Measurements History
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2 border-b-2 transition-colors flex items-center gap-1 ${
            activeTab === 'orders'
              ? 'border-teal text-teal font-semibold'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" /> Orders & Invoices
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card className="p-6 space-y-3">
          <h3 className="text-sm font-semibold text-ink">Special Preferences & Tailoring Notes</h3>
          <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap">
            {customer.notes || 'No specific notes recorded for this customer.'}
          </p>
        </Card>
      )}

      {activeTab === 'measurements' && (
        <Card className="p-8 text-center text-muted space-y-2">
          <Ruler className="w-8 h-8 text-teal mx-auto opacity-50" />
          <p className="text-sm font-semibold text-ink">Measurement History</p>
          <p className="text-xs text-muted">
            Template-driven measurements feature will be enabled in <strong>Milestone 4 & 5</strong>.
          </p>
        </Card>
      )}

      {activeTab === 'orders' && (
        <Card className="p-8 text-center text-muted space-y-2">
          <ShoppingBag className="w-8 h-8 text-brass mx-auto opacity-50" />
          <p className="text-sm font-semibold text-ink">Customer Orders & Billing</p>
          <p className="text-xs text-muted">
            Order management and invoice generation will be enabled in <strong>Milestone 6 & 7</strong>.
          </p>
        </Card>
      )}

      {/* Edit Customer Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Customer Details">
        <form onSubmit={handleEditCustomer} className="space-y-4">
          <Input
            label="Customer Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
              Customer Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface border border-border text-ink rounded-md p-3 text-xs focus:outline-none focus:border-teal"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
