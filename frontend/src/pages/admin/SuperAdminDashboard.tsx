import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Building2, UserPlus, Plus, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

interface BusinessItem {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  userCount: number;
  createdAt: string;
}

export const SuperAdminDashboard: React.FC = () => {
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateBusinessOpen, setIsCreateBusinessOpen] = useState(false);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');

  // Form inputs - Create Business
  const [bName, setBName] = useState('');
  const [bAddress, setBAddress] = useState('');
  const [bPhone, setBPhone] = useState('');
  const [isSubmittingB, setIsSubmittingB] = useState(false);

  // Form inputs - Create Admin
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);

  const loadBusinesses = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth<BusinessItem[]>('/admin/businesses');
      setBusinesses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch businesses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingB(true);
    try {
      await fetchWithAuth('/admin/businesses', {
        method: 'POST',
        body: JSON.stringify({ name: bName, address: bAddress, phone: bPhone }),
      });
      setBName('');
      setBAddress('');
      setBPhone('');
      setIsCreateBusinessOpen(false);
      await loadBusinesses();
    } catch (err: any) {
      alert(err.message || 'Failed to create business');
    } finally {
      setIsSubmittingB(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAdmin(true);
    try {
      await fetchWithAuth('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          businessId: selectedBusinessId,
          name: adminName,
          email: adminEmail,
          password: adminPassword,
        }),
      });
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      setIsCreateAdminOpen(false);
      await loadBusinesses();
      alert('Business Admin account created successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to create business admin');
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  const handleToggleStatus = async (business: BusinessItem) => {
    try {
      await fetchWithAuth(`/admin/businesses/${business.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !business.isActive }),
      });
      await loadBusinesses();
    } catch (err: any) {
      alert(err.message || 'Failed to update business status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-semibold text-ink flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal" /> Super Admin Control Center
          </h2>
          <p className="text-xs text-muted">Manage business tenants and assign business administrators</p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateBusinessOpen(true)} className="gap-2 text-xs">
            <Plus className="w-4 h-4" /> Create Business Tenant
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-md text-xs font-medium">
          {error}
        </div>
      )}

      {/* Businesses Table Card */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border bg-canvas/40 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal" /> All Registered Businesses ({businesses.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted">Loading business tenants...</div>
        ) : businesses.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">No business tenants found. Create one above!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-border text-muted font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Business Name</th>
                  <th className="px-4 py-3">Contact Phone</th>
                  <th className="px-4 py-3">Users</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink">
                {businesses.map((b) => (
                  <tr key={b.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="px-4 py-3 font-semibold">
                      <div>{b.name}</div>
                      {b.address && <div className="text-[11px] font-normal text-muted">{b.address}</div>}
                    </td>
                    <td className="px-4 py-3 text-muted">{b.phone || '—'}</td>
                    <td className="px-4 py-3 font-mono">{b.userCount} users</td>
                    <td className="px-4 py-3">
                      <Badge variant={b.isActive ? 'success' : 'error'}>
                        {b.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button
                        variant="secondary"
                        className="text-xs px-2.5 py-1 gap-1"
                        onClick={() => {
                          setSelectedBusinessId(b.id);
                          setIsCreateAdminOpen(true);
                        }}
                      >
                        <UserPlus className="w-3.5 h-3.5 text-teal" /> Add Admin
                      </Button>
                      <Button
                        variant="outline"
                        className="text-xs px-2 py-1"
                        onClick={() => handleToggleStatus(b)}
                      >
                        {b.isActive ? (
                          <span className="text-error flex items-center gap-1"><XCircle className="w-3 h-3"/> Deactivate</span>
                        ) : (
                          <span className="text-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Activate</span>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal 1: Create Business Tenant */}
      <Modal
        isOpen={isCreateBusinessOpen}
        onClose={() => setIsCreateBusinessOpen(false)}
        title="Create New Business Tenant"
      >
        <form onSubmit={handleCreateBusiness} className="space-y-4">
          <Input
            label="Business Name"
            placeholder="e.g. Royal Bespoke Tailors"
            value={bName}
            onChange={(e) => setBName(e.target.value)}
            required
          />
          <Input
            label="Address"
            placeholder="e.g. 45 Savile Row, London"
            value={bAddress}
            onChange={(e) => setBAddress(e.target.value)}
          />
          <Input
            label="Contact Phone"
            placeholder="e.g. +44 20 7123 4567"
            value={bPhone}
            onChange={(e) => setBPhone(e.target.value)}
          />
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsCreateBusinessOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmittingB}>
              Create Business
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Create Business Admin */}
      <Modal
        isOpen={isCreateAdminOpen}
        onClose={() => setIsCreateAdminOpen(false)}
        title="Assign Business Admin Account"
      >
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
              Target Business
            </label>
            <select
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              className="w-full bg-surface border border-border text-ink rounded-md px-3 py-2 text-sm focus:outline-none focus:border-teal"
              required
            >
              <option value="">Select a business...</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Admin Full Name"
            placeholder="e.g. John Doe"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            required
          />
          <Input
            label="Admin Email Address"
            type="email"
            placeholder="admin@business.com"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
          />
          <Input
            label="Initial Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsCreateAdminOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmittingAdmin}>
              Create Admin Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
