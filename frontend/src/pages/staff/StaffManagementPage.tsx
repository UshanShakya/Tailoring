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
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersData, rolesData] = await Promise.all([
        fetchWithAuth<StaffUser[]>('/users'),
        fetchWithAuth<Role[]>('/roles'),
      ]);
      setStaffList(usersData);
      setAvailableRoles(rolesData);
      if (rolesData.length > 0) {
        setRoleId(rolesData[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load staff list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleId) {
      alert('Please select a role');
      return;
    }
    setIsSubmitting(true);
    try {
      await fetchWithAuth('/users', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, roleId }),
      });
      setName('');
      setEmail('');
      setPassword('');
      setIsAddStaffOpen(false);
      await loadData();
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
      await loadData();
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
          <p className="text-xs text-muted">Manage staff accounts and assign dynamic workspace roles</p>
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
                  <th className="px-4 py-3">Assigned Role</th>
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
                      <Badge
                        variant={
                          member.role?.name === 'Business Admin'
                            ? 'brass'
                            : member.role?.name === 'Super Admin'
                            ? 'error'
                            : 'teal'
                        }
                      >
                        {member.role?.name || 'Standard Staff'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={member.isActive ? 'success' : 'error'}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {member.role?.name !== 'Business Admin' && member.role?.name !== 'Super Admin' && (
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
              Select Configured Role
            </label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-full bg-surface border border-border text-ink rounded-md px-3 py-2 text-sm focus:outline-none focus:border-teal"
              required
            >
              {availableRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.isSystem ? '(Built-in)' : '(Custom Tenant)'}
                </option>
              ))}
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
