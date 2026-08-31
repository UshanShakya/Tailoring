import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../lib/api';
import { formatCurrency } from '../../lib/currency';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Select2Combobox } from '../../components/ui/Select2Combobox';
import {
  Ruler,
  Copy,
  Eye,
  Edit3,
  Plus,
  Lock,
  Languages,
  Tag,
  Shirt,
  Layers,
  Filter,
} from 'lucide-react';

interface TemplateField {
  id?: string;
  label: string;
  labelNp?: string;
  key: string;
  unit: string;
  dataType: string;
  order: number;
  required: boolean;
}

interface GarmentType {
  id: string;
  name: string;
  nameNp?: string;
  defaultPrice?: number | null;
  isSystemDefault: boolean;
  _count?: {
    templates: number;
  };
}

interface MeasurementTemplate {
  id: string;
  name: string;
  nameNp?: string;
  isSystemDefault: boolean;
  garmentTypeId: string;
  garmentType: GarmentType;
  fields: TemplateField[];
}

export const TemplateManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'productTypes' | 'templates'>('productTypes');

  const [templates, setTemplates] = useState<MeasurementTemplate[]>([]);
  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProductTypeFilter, setSelectedProductTypeFilter] = useState<string>('ALL');

  // Modals for Product Types
  const [isCreateProductTypeOpen, setIsCreateProductTypeOpen] = useState(false);
  const [editingProductType, setEditingProductType] = useState<GarmentType | null>(null);
  const [ptName, setPtName] = useState('');
  const [ptNameNp, setPtNameNp] = useState('');
  const [ptDefaultPrice, setPtDefaultPrice] = useState<string>('');
  const [isPtSubmitting, setIsPtSubmitting] = useState(false);

  // Modals for Templates
  const [viewingTemplate, setViewingTemplate] = useState<MeasurementTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<MeasurementTemplate | null>(null);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);

  // Form state for Template Edit / Clone / Create
  const [formGarmentTypeId, setFormGarmentTypeId] = useState('');
  const [formName, setFormName] = useState('');
  const [formNameNp, setFormNameNp] = useState('');
  const [formFields, setFormFields] = useState<TemplateField[]>([]);
  const [isTemplateSubmitting, setIsTemplateSubmitting] = useState(false);

  const perms = user?.role?.permissions || [];
  const isSuperAdmin = user?.role?.name === 'Super Admin';
  const canManageProductTypes = isSuperAdmin || perms.includes('*');
  const canManage = perms.includes('*') || perms.includes('template:manage') || perms.includes('template:*');

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [tData, gData] = await Promise.all([
        fetchWithAuth<MeasurementTemplate[]>('/measurement-templates'),
        fetchWithAuth<GarmentType[]>('/garment-types'),
      ]);
      setTemplates(tData);
      setGarmentTypes(gData);
      if (gData.length > 0 && !formGarmentTypeId) {
        setFormGarmentTypeId(gData[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load setup data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Product Type Handlers ---
  const handleOpenCreateProductType = () => {
    setPtName('');
    setPtNameNp('');
    setPtDefaultPrice('');
    setEditingProductType(null);
    setIsCreateProductTypeOpen(true);
  };

  const handleOpenEditProductType = (gt: GarmentType) => {
    setEditingProductType(gt);
    setPtName(gt.name);
    setPtNameNp(gt.nameNp || '');
    setPtDefaultPrice(gt.defaultPrice !== null && gt.defaultPrice !== undefined ? String(gt.defaultPrice) : '');
    setIsCreateProductTypeOpen(true);
  };

  const handleSaveProductType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ptName.trim()) {
      alert('Product Type name is required.');
      return;
    }
    setIsPtSubmitting(true);
    try {
      const payload = {
        name: ptName.trim(),
        nameNp: ptNameNp.trim() || undefined,
        defaultPrice: ptDefaultPrice !== '' ? Number(ptDefaultPrice) : null,
      };

      if (editingProductType) {
        await fetchWithAuth(`/garment-types/${editingProductType.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchWithAuth('/garment-types', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setIsCreateProductTypeOpen(false);
      setEditingProductType(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save Product Type');
    } finally {
      setIsPtSubmitting(false);
    }
  };

  // --- Template Handlers ---
  const handleStartClone = (t: MeasurementTemplate) => {
    setEditingTemplate(t);
    setFormGarmentTypeId(t.garmentTypeId);
    setFormName(`${t.name} (Custom)`);
    setFormNameNp(t.nameNp ? `${t.nameNp} (अनुकूलित)` : '');
    setFormFields(
      t.fields.map((f) => ({
        label: f.label,
        labelNp: f.labelNp || '',
        key: f.key,
        unit: f.unit || 'in',
        dataType: f.dataType || 'number',
        order: f.order,
        required: f.required,
      }))
    );
  };

  const handleStartEdit = (t: MeasurementTemplate) => {
    setEditingTemplate(t);
    setFormGarmentTypeId(t.garmentTypeId);
    setFormName(t.name);
    setFormNameNp(t.nameNp || '');
    setFormFields(
      t.fields.map((f) => ({
        label: f.label,
        labelNp: f.labelNp || '',
        key: f.key,
        unit: f.unit || 'in',
        dataType: f.dataType || 'number',
        order: f.order,
        required: f.required,
      }))
    );
  };

  const handleOpenCreateTemplateForProductType = (garmentTypeId: string) => {
    setEditingTemplate(null);
    setFormGarmentTypeId(garmentTypeId);
    const targetGt = garmentTypes.find((g) => g.id === garmentTypeId);
    setFormName(targetGt ? `${targetGt.name} Measurement Template` : 'Custom Template');
    setFormNameNp(targetGt?.nameNp ? `${targetGt.nameNp} नाप ढाँचा` : '');
    setFormFields([
      { label: 'Length', labelNp: 'लम्बाइ', key: 'length', unit: 'in', dataType: 'number', order: 1, required: true },
      { label: 'Chest / Bust', labelNp: 'छाती', key: 'chest', unit: 'in', dataType: 'number', order: 2, required: true },
    ]);
    setIsCreateTemplateOpen(true);
    setActiveTab('templates');
  };

  const handleAddFieldRow = () => {
    setFormFields([
      ...formFields,
      {
        label: '',
        labelNp: '',
        key: '',
        unit: 'in',
        dataType: 'number',
        order: formFields.length + 1,
        required: true,
      },
    ]);
  };

  const handleRemoveFieldRow = (index: number) => {
    setFormFields(formFields.filter((_, idx) => idx !== index));
  };

  const handleFieldChange = (index: number, keyName: keyof TemplateField, val: any) => {
    const updated = [...formFields];
    (updated[index] as any)[keyName] = val;
    if (keyName === 'label' && !updated[index].key) {
      updated[index].key = val.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
    setFormFields(updated);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formFields.length === 0) {
      alert('Please add at least one measurement field.');
      return;
    }
    setIsTemplateSubmitting(true);
    try {
      if (editingTemplate && !editingTemplate.isSystemDefault) {
        await fetchWithAuth(`/measurement-templates/${editingTemplate.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: formName,
            nameNp: formNameNp,
            fields: formFields,
          }),
        });
      } else {
        await fetchWithAuth('/measurement-templates', {
          method: 'POST',
          body: JSON.stringify({
            garmentTypeId: formGarmentTypeId,
            name: formName,
            nameNp: formNameNp,
            fields: formFields,
          }),
        });
      }
      setEditingTemplate(null);
      setIsCreateTemplateOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save template');
    } finally {
      setIsTemplateSubmitting(false);
    }
  };

  const filteredTemplates =
    selectedProductTypeFilter === 'ALL'
      ? templates
      : templates.filter((t) => t.garmentTypeId === selectedProductTypeFilter);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-semibold text-ink flex items-center gap-2">
            <Shirt className="w-6 h-6 text-teal" /> Product Types & Measurement Setup
          </h2>
          <p className="text-xs text-muted">
            Configure garment/product types (Shirt, Pant, Suit, Kurta, etc.), optional default pricing, and bilingual measurement templates
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            {activeTab === 'productTypes' ? (
              <Button onClick={handleOpenCreateProductType} className="gap-2 text-xs">
                <Plus className="w-4 h-4" /> Add Product Type
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setEditingTemplate(null);
                  setFormName('');
                  setFormNameNp('');
                  setFormFields([
                    { label: 'Chest / Length', labelNp: 'छाती / लम्बाइ', key: 'length', unit: 'in', dataType: 'number', order: 1, required: true },
                  ]);
                  setIsCreateTemplateOpen(true);
                }}
                className="gap-2 text-xs"
              >
                <Plus className="w-4 h-4" /> Create Custom Template
              </Button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-md text-xs font-medium">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1 border-b border-border">
        <button
          onClick={() => setActiveTab('productTypes')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'productTypes'
              ? 'border-teal text-teal'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Tag className="w-4 h-4" /> Product Types ({garmentTypes.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'templates'
              ? 'border-teal text-teal'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Ruler className="w-4 h-4" /> Measurement Templates ({templates.length})
        </button>
      </div>

      {/* TAB 1: PRODUCT TYPES SETUP */}
      {activeTab === 'productTypes' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted">Loading product types...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {garmentTypes.map((gt) => {
                const mappedTemplatesCount = gt._count?.templates || templates.filter((t) => t.garmentTypeId === gt.id).length;
                return (
                  <Card key={gt.id} className="p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            {gt.isSystemDefault ? (
                              <Badge variant="brass" className="text-[10px] gap-1">
                                <Lock className="w-3 h-3" /> System Standard
                              </Badge>
                            ) : (
                              <Badge variant="success" className="text-[10px]">
                                Custom Product Type
                              </Badge>
                            )}
                            <Badge variant="teal" className="text-[10px] gap-1">
                              <Layers className="w-3 h-3" /> {mappedTemplatesCount} {mappedTemplatesCount === 1 ? 'Template' : 'Templates'}
                            </Badge>
                          </div>
                          <h3 className="text-base font-semibold text-ink">{gt.name}</h3>
                          {gt.nameNp && <p className="text-xs text-teal font-medium">{gt.nameNp}</p>}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted font-medium">Default Unit Price:</span>
                          <span className="font-semibold text-ink">
                            {gt.defaultPrice !== null && gt.defaultPrice !== undefined
                              ? formatCurrency(gt.defaultPrice)
                              : <em className="text-muted font-normal">Optional / Unpriced</em>}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                      <Button
                        variant="secondary"
                        className="text-xs px-2.5 py-1 gap-1"
                        onClick={() => handleOpenCreateTemplateForProductType(gt.id)}
                      >
                        <Plus className="w-3.5 h-3.5 text-teal" /> Add Template
                      </Button>

                      {canManageProductTypes && (
                        <Button
                          variant="outline"
                          className="text-xs px-2.5 py-1 gap-1"
                          onClick={() => handleOpenEditProductType(gt)}
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit Pricing / Info
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEASUREMENT TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-canvas p-3 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-4 h-4 text-teal" />
              <span className="font-semibold text-ink shrink-0">Filter by Product Type:</span>
              <div className="w-64">
                <Select2Combobox
                  value={selectedProductTypeFilter}
                  onChange={(val) => setSelectedProductTypeFilter(val)}
                  options={[
                    { value: 'ALL', label: `All Product Types (${templates.length})` },
                    ...garmentTypes.map((gt) => ({
                      value: gt.id,
                      label: `${gt.name}${gt.nameNp ? ` (${gt.nameNp})` : ''}`,
                    })),
                  ]}
                  clearable={false}
                />
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted">Loading templates...</div>
          ) : filteredTemplates.length === 0 ? (
            <div className="p-8 text-center bg-canvas border border-border rounded-lg text-sm text-muted">
              No measurement templates found for this product type. Click "+ Create Custom Template" above to add one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((t) => (
                <Card key={t.id} className="p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="teal" className="text-[10px]">
                            {t.garmentType?.name} {t.garmentType?.nameNp ? `(${t.garmentType.nameNp})` : ''}
                          </Badge>
                          {t.isSystemDefault ? (
                            <Badge variant="brass" className="text-[10px] gap-1">
                              <Lock className="w-3 h-3" /> System Default
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-[10px]">
                              Custom Tenant Template
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-ink mt-1">
                          {t.name}
                        </h3>
                        {t.nameNp && <p className="text-xs text-teal font-medium">{t.nameNp}</p>}
                      </div>
                    </div>

                    {/* Field Snippets */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1">
                        <Languages className="w-3 h-3 text-teal" /> Measurement Fields ({t.fields?.length || 0}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {t.fields?.slice(0, 5).map((f) => (
                          <span
                            key={f.id || f.key}
                            className="px-2 py-0.5 rounded bg-canvas border border-border text-xs text-ink flex items-center gap-1"
                          >
                            <strong className="font-medium">{f.label}</strong>
                            {f.labelNp && <span className="text-teal text-[11px]">({f.labelNp})</span>}
                          </span>
                        ))}
                        {t.fields?.length > 5 && (
                          <span className="px-2 py-0.5 rounded bg-canvas text-xs text-muted">
                            +{t.fields.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <Button
                      variant="secondary"
                      className="text-xs px-2.5 py-1 gap-1"
                      onClick={() => setViewingTemplate(t)}
                    >
                      <Eye className="w-3.5 h-3.5 text-teal" /> View Fields
                    </Button>

                    {canManage && (
                      <div className="space-x-2">
                        {t.isSystemDefault ? (
                          <Button
                            variant="outline"
                            className="text-xs px-2.5 py-1 gap-1"
                            onClick={() => handleStartClone(t)}
                          >
                            <Copy className="w-3.5 h-3.5 text-brass" /> Clone & Customize
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            className="text-xs px-2.5 py-1 gap-1"
                            onClick={() => handleStartEdit(t)}
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit Template
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Create / Edit Product Type */}
      {isCreateProductTypeOpen && (
        <Modal
          isOpen={isCreateProductTypeOpen}
          onClose={() => {
            setIsCreateProductTypeOpen(false);
            setEditingProductType(null);
          }}
          title={editingProductType ? `Edit Product Type: ${editingProductType.name}` : 'Add New Product Type'}
        >
          <form onSubmit={handleSaveProductType} className="space-y-4">
            <Input
              label="Product Type Name (English)"
              placeholder="e.g. Waistcoat, Sherwani, Blazer"
              value={ptName}
              onChange={(e) => setPtName(e.target.value)}
              required
            />

            <Input
              label="Product Type Name (Nepali / नेपाली)"
              placeholder="e.g. वेस्टकोट, शेरवानी"
              value={ptNameNp}
              onChange={(e) => setPtNameNp(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1 flex items-center justify-between">
                <span>Default Unit Price (NPR / Rs.)</span>
                <span className="text-[10px] text-muted normal-case font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 2500.00 (Leave blank if price varies)"
                value={ptDefaultPrice}
                onChange={(e) => setPtDefaultPrice(e.target.value)}
                className="w-full bg-surface border border-border text-ink rounded-md p-2 text-xs focus:outline-none focus:border-teal"
              />
              <p className="text-[11px] text-muted mt-1">
                If provided, this price auto-fills when creating new orders for this product type.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsCreateProductTypeOpen(false);
                  setEditingProductType(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isPtSubmitting}>
                {editingProductType ? 'Update Product Type' : 'Create Product Type'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: View Template Fields */}
      {viewingTemplate && (
        <Modal
          isOpen={!!viewingTemplate}
          onClose={() => setViewingTemplate(null)}
          title={`${viewingTemplate.name} ${viewingTemplate.nameNp ? `(${viewingTemplate.nameNp})` : ''}`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="teal">{viewingTemplate.garmentType?.name}</Badge>
              {viewingTemplate.isSystemDefault ? (
                <Badge variant="brass">System Default</Badge>
              ) : (
                <Badge variant="success">Tenant Custom Copy</Badge>
              )}
            </div>

            <table className="w-full text-left text-xs border border-border rounded-lg overflow-hidden">
              <thead className="bg-canvas border-b border-border text-muted uppercase font-semibold">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">English Label</th>
                  <th className="p-2.5">Nepali Label (नेपाली)</th>
                  <th className="p-2.5">Key</th>
                  <th className="p-2.5">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink">
                {viewingTemplate.fields?.map((f, idx) => (
                  <tr key={f.id || idx}>
                    <td className="p-2.5 font-mono text-muted">{idx + 1}</td>
                    <td className="p-2.5 font-semibold">{f.label}</td>
                    <td className="p-2.5 text-teal font-medium">{f.labelNp || '—'}</td>
                    <td className="p-2.5 font-mono text-muted">{f.key}</td>
                    <td className="p-2.5 uppercase font-mono">{f.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setViewingTemplate(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Clone / Edit / Create Template */}
      {(editingTemplate || isCreateTemplateOpen) && (
        <Modal
          isOpen={!!editingTemplate || isCreateTemplateOpen}
          onClose={() => {
            setEditingTemplate(null);
            setIsCreateTemplateOpen(false);
          }}
          title={
            editingTemplate
              ? editingTemplate.isSystemDefault
                ? `Clone & Customize: ${editingTemplate.name}`
                : `Edit Custom Template: ${editingTemplate.name}`
              : 'Create Custom Measurement Template'
          }
        >
          <form onSubmit={handleSaveTemplate} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div>
              <Select2Combobox
                label="Mapped Product Type"
                required
                value={formGarmentTypeId}
                onChange={(val) => setFormGarmentTypeId(val)}
                options={garmentTypes.map((g) => ({
                  value: g.id,
                  label: `${g.name}${g.nameNp ? ` (${g.nameNp})` : ''}`,
                }))}
                clearable={false}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Template Name (English)"
                placeholder="e.g. Slim Fit Shirt Template"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
              <Input
                label="Template Name (Nepali / नेपाली)"
                placeholder="e.g. स्लिम फिट सर्ट ढाँचा"
                value={formNameNp}
                onChange={(e) => setFormNameNp(e.target.value)}
              />
            </div>

            {/* Field Rows Builder */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5 text-teal" /> Measurement Field Labels & Units
                </label>
                <Button type="button" variant="secondary" onClick={handleAddFieldRow} className="text-xs px-2 py-1 gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Field
                </Button>
              </div>

              <div className="space-y-2">
                {formFields.map((field, idx) => (
                  <div key={idx} className="p-3 bg-canvas border border-border rounded-lg space-y-2 text-xs">
                    <div className="flex items-center justify-between text-muted">
                      <span className="font-semibold text-ink">Field #{idx + 1}</span>
                      {formFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFieldRow(idx)}
                          className="text-error hover:underline text-[11px]"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-muted font-medium">English Label</label>
                        <input
                          type="text"
                          placeholder="e.g. Chest"
                          value={field.label}
                          onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                          className="w-full bg-surface border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-teal"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-teal font-medium">Nepali Label (नेपाली)</label>
                        <input
                          type="text"
                          placeholder="e.g. छाती"
                          value={field.labelNp || ''}
                          onChange={(e) => handleFieldChange(idx, 'labelNp', e.target.value)}
                          className="w-full bg-surface border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-teal"
                        />
                      </div>

                      <div>
                        <Select2Combobox
                          label="Unit"
                          value={field.unit}
                          onChange={(val) => handleFieldChange(idx, 'unit', val)}
                          options={[
                            { value: 'in', label: 'Inches (in)' },
                            { value: 'cm', label: 'Centimeters (cm)' },
                          ]}
                          clearable={false}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setEditingTemplate(null);
                  setIsCreateTemplateOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isTemplateSubmitting}>
                Save Template
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
