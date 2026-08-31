import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Select2Combobox } from '../../components/ui/Select2Combobox';
import { Building2, UserPlus, Plus, ShieldCheck, CheckCircle2, XCircle, Users, Edit3 } from 'lucide-react';
import { Role } from '../../types/auth';

interface BusinessItem {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  userCount: number;
  createdAt: string;
}

interface RoleGroup {
  id: string;
  name: string;
  description?: string;
}

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  businessId?: string | null;
  business?: {
    id: string;
    name: string;
  } | null;
  role?: Role | null;
  roleGroup?: RoleGroup | null;
}

export const SuperAdminDashboard: React.FC = () => {
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [allUsers, setAllUsers] = useState<PlatformUser[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [allRoleGroups, setAllRoleGroups] = useState<RoleGroup[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateBusinessOpen, setIsCreateBusinessOpen] = useState(false);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');

  // Edit User / Assign Role Modal State
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRoleId, setEditRoleId] = useState<string>('');
  const [editRoleGroupId, setEditRoleGroupId] = useState<string>('');
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [isSubmittingEditUser, setIsSubmittingEditUser] = useState(false);

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

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [bData, uData, rData, rgData] = await Promise.all([
        fetchWithAuth<BusinessItem[]>('/admin/businesses'),
        fetchWithAuth<PlatformUser[]>('/admin/users'),
        fetchWithAuth<Role[]>('/roles'),
        fetchWithAuth<RoleGroup[]>('/role-groups'),
      ]);
      setBusinesses(bData);
      setAllUsers(uData);
      setAllRoles(rData);
      setAllRoleGroups(rgData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch platform dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
      await loadData();
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
      await loadData();
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
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update business status');
    }
  };

  const handleOpenEditUser = (userItem: PlatformUser) => {
    setEditingUserId(userItem.id);
    setEditName(userItem.name);
    setEditRoleId(userItem.role?.id || '');
    setEditRoleGroupId(userItem.roleGroup?.id || '');
    setEditIsActive(userItem.isActive);
    setIsEditUserOpen(true);
  };

  const handleSaveUserRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    setIsSubmittingEditUser(true);
    try {
      await fetchWithAuth(`/admin/users/${editingUserId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editName,
          roleId: editRoleId || undefined,
          roleGroupId: editRoleGroupId || null,
          isActive: editIsActive,
        }),
      });
      setIsEditUserOpen(false);
      await loadData();
      alert('User role & profile updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    } finally {
      setIsSubmittingEditUser(false);
    }
  };

  const roleOptions = allRoles.map((r) => ({
    value: r.id,
    label: r.name,
    sublabel: r.isSystem ? 'System Default Role' : 'Custom Tenant Role',
  }));

  const roleGroupOptions = allRoleGroups.map((g) => ({
    value: g.id,
    label: g.name,
    sublabel: g.description || 'Role Group',
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-semibold text-ink flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal" /> Super Admin Control Center
          </h2>
          <p className="text-xs text-muted">Manage business tenants, platform users, and global role assignments</p>
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

      {/* Platform Users & Role Assignment Directory Card */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border bg-canvas/40 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
            <Users className="w-4 h-4 text-teal" /> Platform Users & Role Assignments ({allUsers.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted">Loading platform users...</div>
        ) : allUsers.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">No users found on the platform.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-border text-muted font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">User Name & Email</th>
                  <th className="px-4 py-3">Tenant Business</th>
                  <th className="px-4 py-3">Assigned Role</th>
                  <th className="px-4 py-3">Role Group</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink">
                {allUsers.map((uItem) => (
                  <tr key={uItem.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="px-4 py-3 font-semibold">
                      <div>{uItem.name}</div>
                      <div className="text-[11px] font-normal text-muted">{uItem.email}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {uItem.business ? uItem.business.name : <span className="text-muted italic">Global HQ</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          uItem.role?.name === 'Super Admin'
                            ? 'error'
                            : uItem.role?.name === 'Business Admin'
                            ? 'brass'
                            : 'teal'
                        }
                      >
                        {uItem.role?.name || 'No Role'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {uItem.roleGroup ? (
                        <Badge variant="teal">{uItem.roleGroup.name}</Badge>
                      ) : (
                        <span className="text-muted italic text-[11px]">No group</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={uItem.isActive ? 'success' : 'error'}>
                        {uItem.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="secondary"
                        className="text-xs px-2.5 py-1 gap-1"
                        onClick={() => handleOpenEditUser(uItem)}
                      >
                        <Edit3 className="w-3.5 h-3.5 text-teal" /> Edit / Assign Role
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
            <Select2Combobox
              label="Target Business"
              required
              placeholder="Select a business..."
              value={selectedBusinessId}
              onChange={(val) => setSelectedBusinessId(val)}
              options={businesses.map((b) => ({
                value: b.id,
                label: b.name,
              }))}
              clearable={false}
            />
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

      {/* Modal 3: Super Admin Edit User & Assign Role */}
      <Modal
        isOpen={isEditUserOpen}
        onClose={() => setIsEditUserOpen(false)}
        title="Edit User Profile & Role Assignments"
      >
        <form onSubmit={handleSaveUserRoles} className="space-y-4">
          <Input
            label="User Full Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />

          <Select2Combobox
            label="Assigned Primary Role"
            options={roleOptions}
            value={editRoleId}
            onChange={(val) => setEditRoleId(val)}
            required
          />

          <Select2Combobox
            label="Assigned Role Group (Optional)"
            placeholder="Select Role Group..."
            options={roleGroupOptions}
            value={editRoleGroupId}
            onChange={(val) => setEditRoleGroupId(val)}
            clearable
          />

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="editIsActiveCheckbox"
              checked={editIsActive}
              onChange={(e) => setEditIsActive(e.target.checked)}
              className="rounded border-border text-teal focus:ring-teal"
            />
            <label htmlFor="editIsActiveCheckbox" className="text-xs font-semibold text-ink">
              User Account Active
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsEditUserOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmittingEditUser}>
              Save User Roles
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
