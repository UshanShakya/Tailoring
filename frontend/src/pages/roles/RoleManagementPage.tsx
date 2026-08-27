import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { ShieldAlert, Plus, Check, Lock, Trash2 } from 'lucide-react';
import { Role } from '../../types/auth';

interface RoleItem extends Role {
  _count?: { users: number };
}

const AVAILABLE_PERMISSIONS = [
  { group: 'Menu Access', key: 'menu:dashboard', label: 'Dashboard Overview' },
  { group: 'Menu Access', key: 'menu:staff', label: 'Staff Team Management' },
  { group: 'Menu Access', key: 'menu:roles', label: 'Role & Permission Settings' },
  { group: 'Menu Access', key: 'menu:customers', label: 'Customers Section' },
  { group: 'Menu Access', key: 'menu:orders', label: 'Orders Section' },
  { group: 'Menu Access', key: 'menu:invoices', label: 'Invoices & Payments' },
  { group: 'Customer Actions', key: 'customer:view', label: 'View Customer Profiles' },
  { group: 'Customer Actions', key: 'customer:create', label: 'Create New Customers' },
  { group: 'Customer Actions', key: 'customer:edit', label: 'Edit Customer Records' },
  { group: 'Customer Actions', key: 'customer:delete', label: 'Delete Customer Records' },
  { group: 'Management Actions', key: 'staff:manage', label: 'Add/Deactivate Staff Members' },
  { group: 'Management Actions', key: 'role:manage', label: 'Configure Custom Roles' },
];

export const RoleManagementPage: React.FC = () => {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'menu:dashboard',
    'menu:customers',
    'customer:view',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRoles = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth<RoleItem[]>('/roles');
      setRoles(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const togglePermission = (key: string) => {
    if (selectedPermissions.includes(key)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== key));
    } else {
      setSelectedPermissions([...selectedPermissions, key]);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPermissions.length === 0) {
      alert('Please select at least one permission key.');
      return;
    }
    setIsSubmitting(true);
    try {
      await fetchWithAuth('/roles', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          permissions: selectedPermissions,
        }),
      });
      setName('');
      setDescription('');
      setSelectedPermissions(['menu:dashboard', 'menu:customers', 'customer:view']);
      setIsModalOpen(false);
      await loadRoles();
    } catch (err: any) {
      alert(err.message || 'Failed to create role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (role: RoleItem) => {
    if (role.isSystem) return;
    if (!confirm(`Are you sure you want to delete custom role "${role.name}"?`)) return;

    try {
      await fetchWithAuth(`/roles/${role.id}`, { method: 'DELETE' });
      await loadRoles();
    } catch (err: any) {
      alert(err.message || 'Failed to delete role');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-semibold text-ink flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-teal" /> Role & Permission Management
          </h2>
          <p className="text-xs text-muted">
            Define dynamic roles with custom menu access and button permissions for your staff
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2 text-xs">
          <Plus className="w-4 h-4" /> Create Custom Role
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-md text-xs font-medium">
          {error}
        </div>
      )}

      {/* Role Cards Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-sm text-muted">Loading role configurations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((r) => (
            <Card key={r.id} className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-ink">{r.name}</h3>
                    {r.isSystem ? (
                      <Badge variant="brass" className="text-[10px] gap-1">
                        <Lock className="w-3 h-3" /> System Built-in
                      </Badge>
                    ) : (
                      <Badge variant="teal" className="text-[10px]">
                        Custom Tenant Role
                      </Badge>
                    )}
                  </div>
                  {!r.isSystem && (
                    <button
                      onClick={() => handleDeleteRole(r)}
                      className="text-muted hover:text-error transition-colors p-1"
                      title="Delete Custom Role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-muted leading-relaxed mb-3">
                  {r.description || 'Custom configured staff role.'}
                </p>

                {/* Permissions Badges */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
                    Granted Permissions ({r.permissions.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {r.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="px-2 py-0.5 rounded bg-canvas border border-border text-[11px] font-mono text-ink"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
                <span>Assigned Users: <strong>{r._count?.users || 0}</strong></span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Create Role */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Configure New Custom Role">
        <form onSubmit={handleCreateRole} className="space-y-4">
          <Input
            label="Role Name"
            placeholder="e.g. Receptionist / Front Desk"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Description"
            placeholder="e.g. Manages customer intake and schedules measurements"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Permission Matrix (Select Granted Privileges)
            </label>
            <div className="border border-border rounded-lg p-3 max-h-60 overflow-y-auto space-y-3 bg-canvas/40">
              {['Menu Access', 'Customer Actions', 'Management Actions'].map((group) => (
                <div key={group} className="space-y-1.5">
                  <h4 className="text-[11px] font-bold text-teal uppercase tracking-wider">{group}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AVAILABLE_PERMISSIONS.filter((p) => p.group === group).map((perm) => {
                      const isChecked = selectedPermissions.includes(perm.key);
                      return (
                        <label
                          key={perm.key}
                          className={`flex items-center gap-2 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-teal/10 border-teal/40 text-ink font-medium'
                              : 'bg-surface border-border text-muted hover:bg-canvas'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(perm.key)}
                            className="hidden"
                          />
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isChecked ? 'bg-teal text-canvas border-teal' : 'border-border bg-surface'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{perm.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Custom Role
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
