import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Select2Combobox } from '../../components/ui/Select2Combobox';
import { PageHeader } from '../../components/ui/PageHeader';
import { Users, UserPlus, Shield, CheckCircle2, XCircle, Edit3 } from 'lucide-react';
import { Role } from '../../types/auth';

interface RoleGroup {
  id: string;
  name: string;
  description?: string;
}

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleGroup?: RoleGroup | null;
  isActive: boolean;
  createdAt: string;
}

export const StaffManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role?.name === 'Super Admin';

  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [availableRoleGroups, setAvailableRoleGroups] = useState<RoleGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<string>('');
  const [roleGroupId, setRoleGroupId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assignableRoles = isSuperAdmin
    ? availableRoles
    : availableRoles.filter((r) => r.name !== 'Business Admin' && r.name !== 'Super Admin');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersData, rolesData, groupsData] = await Promise.all([
        fetchWithAuth<StaffUser[]>('/users'),
        fetchWithAuth<Role[]>('/roles'),
        fetchWithAuth<RoleGroup[]>('/role-groups'),
      ]);
      setStaffList(usersData);
      setAvailableRoles(rolesData);
      setAvailableRoleGroups(groupsData);
      const validRoles = isSuperAdmin
        ? rolesData
        : rolesData.filter((r) => r.name !== 'Business Admin' && r.name !== 'Super Admin');
      if (validRoles.length > 0 && !roleId) {
        setRoleId(validRoles[0].id);
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

  const handleOpenAdd = () => {
    setEditingStaffId(null);
    setName('');
    setEmail('');
    setPassword('');
    if (assignableRoles.length > 0) setRoleId(assignableRoles[0].id);
    setRoleGroupId('');
    setIsAddStaffOpen(true);
  };

  const handleOpenEdit = (user: StaffUser) => {
    setEditingStaffId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword('');
    setRoleId(user.role?.id || '');
    setRoleGroupId(user.roleGroup?.id || '');
    setIsAddStaffOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleId) {
      alert('Please select a role');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingStaffId) {
        await fetchWithAuth(`/users/${editingStaffId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name,
            roleId,
            roleGroupId: roleGroupId || null,
          }),
        });
      } else {
        await fetchWithAuth('/users', {
          method: 'POST',
          body: JSON.stringify({
            name,
            email,
            password,
            roleId,
            roleGroupId: roleGroupId || undefined,
          }),
        });
      }
      setIsAddStaffOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save staff member');
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

  const roleOptions = assignableRoles.map((r) => ({
    value: r.id,
    label: r.name,
    sublabel: r.isSystem ? 'System Default Role' : 'Custom Tenant Role',
  }));

  const roleGroupOptions = availableRoleGroups.map((g) => ({
    value: g.id,
    label: g.name,
    sublabel: g.description || 'Role Group',
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Users className="w-6 h-6 text-teal" /> Staff Team Management
          </span>
        }
        subtitle="Manage staff accounts, primary workspace roles, and assigned role groups"
        actions={
          <Button onClick={handleOpenAdd} className="gap-2 text-xs">
            <UserPlus className="w-4 h-4" /> Add Staff Member
          </Button>
        }
      />

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
                  <th className="px-4 py-3">Primary Role</th>
                  <th className="px-4 py-3">Assigned Role Group</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink">
                {staffList.map((member) => {
                  const isAdminMember =
                    member.role?.name === 'Business Admin' || member.role?.name === 'Super Admin';
                  const canEditMember = isSuperAdmin || !isAdminMember;

                  return (
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
                        {member.roleGroup ? (
                          <Badge variant="teal">{member.roleGroup.name}</Badge>
                        ) : (
                          <span className="text-muted italic text-[11px]">No group assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={member.isActive ? 'success' : 'error'}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {canEditMember ? (
                          <Button
                            variant="secondary"
                            className="text-xs px-2.5 py-1 gap-1"
                            onClick={() => handleOpenEdit(member)}
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit Role
                          </Button>
                        ) : (
                          <span className="text-[11px] text-muted font-medium italic px-2 py-1 bg-canvas border border-border rounded">
                            Admin Account
                          </span>
                        )}

                        {canEditMember && (
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Staff Modal */}
      <Modal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        title={editingStaffId ? 'Edit Staff Member' : 'Add New Staff Member'}
      >
        <form onSubmit={handleSaveStaff} className="space-y-4">
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
            disabled={!!editingStaffId}
            required
          />
          {!editingStaffId && (
            <Input
              label="Initial Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          <Select2Combobox
            label="Primary Configured Role"
            options={roleOptions}
            value={roleId}
            onChange={(val) => setRoleId(val)}
            required
          />

          <Select2Combobox
            label="Assigned Role Group (Optional)"
            placeholder="Select Role Group for combined permissions..."
            options={roleGroupOptions}
            value={roleGroupId}
            onChange={(val) => setRoleGroupId(val)}
            clearable
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsAddStaffOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingStaffId ? 'Update Staff Member' : 'Add Staff Member'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
