import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Users, UserPlus, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { Role } from '../../types/auth';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export const StaffManagementPage: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STAFF_FULL' | 'STAFF_BASIC'>('STAFF_FULL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadStaff = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth<StaffUser[]>('/users');
      setStaffList(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load staff list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetchWithAuth('/users', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
      setName('');
      setEmail('');
      setPassword('');
      setRole('STAFF_FULL');
      setIsAddStaffOpen(false);
      await loadStaff();
    } catch (err: any) {
      alert(err.message || 'Failed to create staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStaffStatus = async (user: StaffUser) => {
    try {
      await fetchWithAuth(`/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      await loadStaff();
    } catch (err: any) {
      alert(err.message || 'Failed to update staff status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-semibold text-ink flex items-center gap-2">
            <Users className="w-6 h-6 text-teal" /> Staff Team Management
          </h2>
          <p className="text-xs text-muted">Manage staff accounts and access privileges for your tailoring business</p>
        </div>

        <Button onClick={() => setIsAddStaffOpen(true)} className="gap-2 text-xs">
          <UserPlus className="w-4 h-4" /> Add Staff Member
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-md text-xs font-medium">
          {error}
        </div>
      )}

      {/* Staff Table Card */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border bg-canvas/40 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal" /> Active Business Staff ({staffList.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted">Loading team members...</div>
        ) : staffList.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">No staff members found. Add your first team member above!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-border text-muted font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Staff Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Role & Permissions</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink">
                {staffList.map((member) => (
                  <tr key={member.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="px-4 py-3 font-semibold">{member.name}</td>
                    <td className="px-4 py-3 text-muted">{member.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={member.role === 'BUSINESS_ADMIN' ? 'brass' : member.role === 'STAFF_FULL' ? 'teal' : 'muted'}>
                        {member.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={member.isActive ? 'success' : 'error'}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {member.role !== 'BUSINESS_ADMIN' && (
                        <Button
                          variant="outline"
                          className="text-xs px-2.5 py-1"
                          onClick={() => handleToggleStaffStatus(member)}
                        >
                          {member.isActive ? (
                            <span className="text-error flex items-center gap-1"><XCircle className="w-3 h-3"/> Deactivate</span>
                          ) : (
                            <span className="text-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Activate</span>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        title="Add New Staff Member"
      >
        <form onSubmit={handleAddStaff} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Sarah Jenkins"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="sarah@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Initial Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
              Role & Access Level
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'STAFF_FULL' | 'STAFF_BASIC')}
              className="w-full bg-surface border border-border text-ink rounded-md px-3 py-2 text-sm focus:outline-none focus:border-teal"
            >
              <option value="STAFF_FULL">STAFF_FULL (Customers, Measurements, Orders, Payments)</option>
              <option value="STAFF_BASIC">STAFF_BASIC (Customers & Measurements Only)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsAddStaffOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Add Staff Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
