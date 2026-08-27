import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { Users, Plus, Shield, Edit3, Trash2, CheckCircle2 } from 'lucide-react';

interface RoleItem {
  id: string;
  name: string;
  description?: string;
}

interface RoleGroupItem {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  userCount: number;
  roles: RoleItem[];
}

export const RoleGroupManagementPage: React.FC = () => {
  const [groups, setGroups] = useState<RoleGroupItem[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [groupsData, rolesData] = await Promise.all([
        fetchWithAuth<RoleGroupItem[]>('/role-groups'),
        fetchWithAuth<RoleItem[]>('/roles'),
      ]);
      setGroups(groupsData);
      setAvailableRoles(rolesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load role groups');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingGroupId(null);
    setName('');
    setDescription('');
    setSelectedRoleIds([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (group: RoleGroupItem) => {
    setEditingGroupId(group.id);
    setName(group.name);
    setDescription(group.description || '');
    setSelectedRoleIds(group.roles.map((r) => r.id));
    setIsModalOpen(true);
  };

  const handleToggleRole = (roleId: string) => {
    if (selectedRoleIds.includes(roleId)) {
      setSelectedRoleIds(selectedRoleIds.filter((id) => id !== roleId));
    } else {
      setSelectedRoleIds([...selectedRoleIds, roleId]);
    }
  };

  const handleSubmitGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingGroupId) {
        await fetchWithAuth(`/role-groups/${editingGroupId}`, {
          method: 'PATCH',
          body: JSON.stringify({ name, description, roleIds: selectedRoleIds }),
        });
      } else {
        await fetchWithAuth('/role-groups', {
          method: 'POST',
          body: JSON.stringify({ name, description, roleIds: selectedRoleIds }),
        });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save role group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role group?')) return;
    try {
      await fetchWithAuth(`/role-groups/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete role group');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Users className="w-6 h-6 text-teal" /> Role Groups & Team Assignment
          </span>
        }
        subtitle="Group multiple roles together and assign role groups to staff members for combined permissions"
        actions={
          <Button onClick={handleOpenCreate} className="gap-2 text-xs">
            <Plus className="w-4 h-4" /> Create Role Group
          </Button>
        }
      />

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-md text-xs font-medium">
          {error}
        </div>
      )}

      {/* Role Groups List */}
      {isLoading ? (
        <div className="p-8 text-center text-sm text-muted">Loading role groups...</div>
      ) : groups.length === 0 ? (
        <Card className="p-8 text-center text-muted">
          <p className="text-sm">No role groups created yet.</p>
          <Button variant="secondary" onClick={handleOpenCreate} className="mt-3 text-xs">
            Create First Role Group
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((g) => (
            <Card key={g.id} className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-border pb-3 mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-ink flex items-center gap-2">
                      <Users className="w-4 h-4 text-teal" /> {g.name}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">{g.description || 'No description provided'}</p>
                  </div>
                  {g.isSystem ? <Badge variant="muted">System</Badge> : <Badge variant="teal">Custom Group</Badge>}
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase text-muted tracking-wider block">
                    Included Roles ({g.roles?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {g.roles?.length === 0 ? (
                      <span className="text-xs text-muted italic">No roles mapped to this group yet</span>
                    ) : (
                      g.roles.map((r) => (
                        <span key={r.id} className="px-2.5 py-1 bg-canvas border border-border rounded text-xs font-medium text-ink flex items-center gap-1">
                          <Shield className="w-3 h-3 text-teal" /> {r.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Assigned Users: <span className="font-bold text-ink">{g.userCount}</span>
                </span>

                {!g.isSystem && (
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => handleOpenEdit(g)} className="px-2 py-1 text-xs gap-1">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteGroup(g.id)}
                      className="px-2 py-1 text-xs gap-1 text-error border-error/30 hover:bg-error/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Role Group Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGroupId ? 'Edit Role Group' : 'Create Role Group'}
      >
        <form onSubmit={handleSubmitGroup} className="space-y-4">
          <Input
            label="Role Group Name"
            placeholder="e.g. Tailoring Operations Group"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="e.g. Combines Senior Tailor and Receptionist permissions for production staff"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface border border-border text-ink rounded-md p-2.5 text-xs focus:outline-none focus:border-teal"
            />
          </div>

          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Select Roles to Include in Group ({selectedRoleIds.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto border border-border rounded-md divide-y divide-border bg-canvas/40">
              {availableRoles.map((r) => {
                const isChecked = selectedRoleIds.includes(r.id);
                return (
                  <div
                    key={r.id}
                    onClick={() => handleToggleRole(r.id)}
                    className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isChecked ? 'bg-teal/10 text-teal font-semibold' : 'hover:bg-canvas text-ink'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-teal" /> {r.name}
                      </div>
                      {r.description && <div className="text-[11px] text-muted font-normal">{r.description}</div>}
                    </div>

                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded border-border text-teal focus:ring-teal"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingGroupId ? 'Update Group' : 'Create Group'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
