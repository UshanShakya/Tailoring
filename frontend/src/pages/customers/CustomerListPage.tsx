import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { UserCheck, Plus, Search, Phone, MapPin, ChevronRight, FileText } from 'lucide-react';

interface CustomerItem {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export const CustomerListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const perms = user?.role?.permissions || [];
  const canCreate = perms.includes('*') || perms.includes('customer:create') || perms.includes('customer:*');

  const loadCustomers = async (searchQuery: string = '') => {
    try {
      setIsLoading(true);
      const url = searchQuery ? `/customers?search=${encodeURIComponent(searchQuery)}` : '/customers';
      const data = await fetchWithAuth<CustomerItem[]>(url);
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetchWithAuth('/customers', {
        method: 'POST',
        body: JSON.stringify({ name, phone, address, notes }),
      });
      setName('');
      setPhone('');
      setAddress('');
      setNotes('');
      setIsAddOpen(false);
      await loadCustomers(search);
    } catch (err: any) {
      alert(err.message || 'Failed to add customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-semibold text-ink flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-teal" /> Customer Directory
          </h2>
          <p className="text-xs text-muted">Manage client records, contact details, and measurement history</p>
        </div>

        {canCreate && (
          <Button onClick={() => setIsAddOpen(true)} className="gap-2 text-xs">
            <Plus className="w-4 h-4" /> Add Customer
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-md text-xs font-medium">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search by customer name or phone number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface border border-border text-ink rounded-md pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-teal"
        />
      </div>

      {/* Customer List Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-sm text-muted">Searching customers...</div>
      ) : customers.length === 0 ? (
        <Card className="p-8 text-center text-muted">
          <p className="text-sm">No customers found.</p>
          {canCreate && (
            <Button variant="secondary" onClick={() => setIsAddOpen(true)} className="mt-3 text-xs">
              Add First Customer
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customers.map((c) => (
            <Card
              key={c.id}
              onClick={() => navigate(`/dashboard/customers/${c.id}`)}
              className="p-5 flex flex-col justify-between hover:border-teal/50 cursor-pointer transition-colors group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-ink group-hover:text-teal transition-colors">
                    {c.name}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-muted group-hover:text-teal transition-colors" />
                </div>

                <div className="space-y-1 text-xs text-muted">
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-teal" /> {c.phone}
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-muted" /> {c.address}
                    </div>
                  )}
                  {c.notes && (
                    <div className="flex items-start gap-2 pt-1">
                      <FileText className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
                      <span className="italic line-clamp-1">{c.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-[11px] text-muted">
                <span>Added: {new Date(c.createdAt).toLocaleDateString()}</span>
                <span className="text-teal font-medium group-hover:underline">View Profile &rarr;</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Customer">
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <Input
            label="Customer Full Name"
            placeholder="e.g. Robert Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            placeholder="e.g. +1 (555) 234-5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            label="Address"
            placeholder="e.g. 742 Evergreen Terrace, Springfield"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
              Customer Notes / Preferences
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Prefers slim fit jackets, allergic to wool lining"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface border border-border text-ink rounded-md p-3 text-xs focus:outline-none focus:border-teal"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
