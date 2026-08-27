import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import {
  User,
  Phone,
  MapPin,
  Edit3,
  ArrowLeft,
  Ruler,
  ShoppingBag,
  Calendar,
  Plus,
  Eye,
  FileText,
  Clock,
  Languages,
} from 'lucide-react';

interface CustomerDetail {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

interface TemplateField {
  id: string;
  label: string;
  labelNp?: string;
  key: string;
  unit: string;
  dataType: string;
  order: number;
  required: boolean;
}

interface MeasurementTemplate {
  id: string;
  name: string;
  nameNp?: string;
  garmentType: {
    name: string;
    nameNp?: string;
  };
  fields: TemplateField[];
}

interface MeasurementRecord {
  id: string;
  version: number;
  templateId: string;
  template: MeasurementTemplate;
  values: Record<string, any>;
  notes?: string;
  takenBy: string;
  createdAt: string;
}

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<MeasurementTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'measurements' | 'orders'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Customer Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Take Measurement Modal
  const [isTakeMeasurementOpen, setIsTakeMeasurementOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [measurementValues, setMeasurementValues] = useState<Record<string, any>>({});
  const [measurementNotes, setMeasurementNotes] = useState('');

  // View Measurement Modal
  const [viewingRecord, setViewingRecord] = useState<MeasurementRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const perms = user?.role?.permissions || [];
  const canEdit = perms.includes('*') || perms.includes('customer:edit') || perms.includes('customer:*');

  const loadData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [custData, measData, tplData] = await Promise.all([
        fetchWithAuth<CustomerDetail>(`/customers/${id}`),
        fetchWithAuth<MeasurementRecord[]>(`/customers/${id}/measurements`),
        fetchWithAuth<MeasurementTemplate[]>('/measurement-templates'),
      ]);
      setCustomer(custData);
      setMeasurements(measData);
      setAvailableTemplates(tplData);
      setName(custData.name);
      setPhone(custData.phone || '');
      setAddress(custData.address || '');
      setNotes(custData.notes || '');

      if (tplData.length > 0) {
        setSelectedTemplateId(tplData[0].id);
        initFormValues(tplData[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load customer profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const initFormValues = (template: MeasurementTemplate) => {
    const initial: Record<string, any> = {};
    template.fields?.forEach((f) => {
      initial[f.key] = '';
    });
    setMeasurementValues(initial);
  };

  const handleTemplateSelectChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const found = availableTemplates.find((t) => t.id === templateId);
    if (found) {
      initFormValues(found);
    }
  };

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
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedTemplateId) return;
    setIsSubmitting(true);
    try {
      await fetchWithAuth(`/customers/${id}/measurements`, {
        method: 'POST',
        body: JSON.stringify({
          templateId: selectedTemplateId,
          values: measurementValues,
          notes: measurementNotes,
        }),
      });
      setIsTakeMeasurementOpen(false);
      setMeasurementNotes('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to record measurement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTemplate = availableTemplates.find((t) => t.id === selectedTemplateId);

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
          <Ruler className="w-3.5 h-3.5" /> Measurements History ({measurements.length})
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

      {/* Tab 1: Profile Overview */}
      {activeTab === 'profile' && (
        <Card className="p-6 space-y-3">
          <h3 className="text-sm font-semibold text-ink">Special Preferences & Tailoring Notes</h3>
          <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap">
            {customer.notes || 'No specific notes recorded for this customer.'}
          </p>
        </Card>
      )}

      {/* Tab 2: Measurements History */}
      {activeTab === 'measurements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <Ruler className="w-4 h-4 text-teal" /> Tailoring Measurement Sessions
            </h3>
            {canEdit && (
              <Button onClick={() => setIsTakeMeasurementOpen(true)} className="gap-2 text-xs">
                <Plus className="w-4 h-4" /> Take New Measurement
              </Button>
            )}
          </div>

          {measurements.length === 0 ? (
            <Card className="p-8 text-center text-muted space-y-2">
              <Ruler className="w-8 h-8 text-teal mx-auto opacity-50" />
              <p className="text-sm font-semibold text-ink">No Measurements Recorded Yet</p>
              <p className="text-xs text-muted">
                Take client measurements using standard garment templates with bilingual English & Nepali labels.
              </p>
              {canEdit && (
                <Button onClick={() => setIsTakeMeasurementOpen(true)} className="mt-2 text-xs">
                  Record First Measurement
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {measurements.map((m) => (
                <Card key={m.id} className="p-5 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b border-border pb-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="teal" className="text-[10px]">
                            {m.template?.garmentType?.name}{' '}
                            {m.template?.garmentType?.nameNp ? `(${m.template.garmentType.nameNp})` : ''}
                          </Badge>
                          <Badge variant="brass" className="text-[10px]">
                            Version #{m.version}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-semibold text-ink mt-1">
                          {m.template?.name}
                        </h4>
                        {m.template?.nameNp && (
                          <p className="text-xs text-teal font-medium">{m.template.nameNp}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-muted flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" /> {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Preview Key Values */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      {m.template?.fields?.slice(0, 4).map((f) => (
                        <div key={f.key} className="p-2 bg-canvas rounded border border-border">
                          <span className="text-[10px] text-muted block truncate font-medium">
                            {f.label} {f.labelNp ? `(${f.labelNp})` : ''}
                          </span>
                          <span className="font-semibold text-ink text-xs">
                            {m.values[f.key] ? `${m.values[f.key]} ${f.unit}` : '—'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {m.notes && (
                      <p className="text-xs text-muted italic pt-2 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-muted shrink-0" /> "{m.notes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
                    <span>Taken by: <strong className="text-ink">{m.takenBy}</strong></span>
                    <Button
                      variant="secondary"
                      className="px-2.5 py-1 text-xs gap-1"
                      onClick={() => setViewingRecord(m)}
                    >
                      <Eye className="w-3.5 h-3.5 text-teal" /> View All Values
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Orders Placeholder */}
      {activeTab === 'orders' && (
        <Card className="p-8 text-center text-muted space-y-2">
          <ShoppingBag className="w-8 h-8 text-brass mx-auto opacity-50" />
          <p className="text-sm font-semibold text-ink">Customer Orders & Billing</p>
          <p className="text-xs text-muted">
            Order management and invoice generation will be enabled in <strong>Milestone 6 & 7</strong>.
          </p>
        </Card>
      )}

      {/* Modal 1: Edit Customer */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Customer Details">
        <form onSubmit={handleEditCustomer} className="space-y-4">
          <Input label="Customer Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
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

      {/* Modal 2: Take New Measurement */}
      <Modal
        isOpen={isTakeMeasurementOpen}
        onClose={() => setIsTakeMeasurementOpen(false)}
        title={`Take Measurement for ${customer.name}`}
      >
        <form onSubmit={handleSaveMeasurement} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
              Select Garment Measurement Template
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateSelectChange(e.target.value)}
              className="w-full bg-surface border border-border text-ink rounded-md p-2.5 text-xs focus:outline-none focus:border-teal"
              required
            >
              {availableTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.garmentType?.name} — {t.name} {t.nameNp ? `(${t.nameNp})` : ''}
                </option>
              ))}
            </select>
          </div>

          {currentTemplate && (
            <div className="space-y-3 pt-2 border-t border-border">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider block flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-teal" /> Record Measurement Values ({currentTemplate.fields?.length || 0} fields)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentTemplate.fields?.map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-ink mb-1 flex items-center justify-between">
                      <span>
                        {f.label} {f.labelNp && <strong className="text-teal font-medium">({f.labelNp})</strong>}
                      </span>
                      <span className="text-[10px] text-muted uppercase font-mono">{f.unit}</span>
                    </label>
                    <input
                      type={f.dataType === 'number' ? 'number' : 'text'}
                      step="any"
                      placeholder={`e.g. 38.5`}
                      value={measurementValues[f.key] || ''}
                      onChange={(e) =>
                        setMeasurementValues({
                          ...measurementValues,
                          [f.key]: e.target.value,
                        })
                      }
                      className="w-full bg-surface border border-border text-ink rounded-md px-3 py-2 text-xs focus:outline-none focus:border-teal"
                      required={f.required}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Fitting Notes & Tailor Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Add 0.5 inch extra room in shoulders"
                  value={measurementNotes}
                  onChange={(e) => setMeasurementNotes(e.target.value)}
                  className="w-full bg-surface border border-border text-ink rounded-md p-2.5 text-xs focus:outline-none focus:border-teal"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsTakeMeasurementOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Measurement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: View Full Measurement Record */}
      {viewingRecord && (
        <Modal
          isOpen={!!viewingRecord}
          onClose={() => setViewingRecord(null)}
          title={`Measurement Record — Version #${viewingRecord.version}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div>
                <h4 className="text-sm font-semibold text-ink">{viewingRecord.template?.name}</h4>
                <p className="text-xs text-teal font-medium">{viewingRecord.template?.nameNp}</p>
              </div>
              <Badge variant="teal">Garment: {viewingRecord.template?.garmentType?.name}</Badge>
            </div>

            <table className="w-full text-left text-xs border border-border rounded-lg overflow-hidden">
              <thead className="bg-canvas border-b border-border text-muted uppercase font-semibold">
                <tr>
                  <th className="p-2.5">English Label</th>
                  <th className="p-2.5">Nepali Label (नेपाली)</th>
                  <th className="p-2.5">Recorded Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink">
                {viewingRecord.template?.fields?.map((f) => (
                  <tr key={f.key}>
                    <td className="p-2.5 font-semibold">{f.label}</td>
                    <td className="p-2.5 text-teal font-medium">{f.labelNp || '—'}</td>
                    <td className="p-2.5 font-mono font-bold text-teal">
                      {viewingRecord.values[f.key] ? `${viewingRecord.values[f.key]} ${f.unit}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {viewingRecord.notes && (
              <div className="p-3 bg-canvas border border-border rounded-lg space-y-1">
                <span className="text-[10px] text-muted font-semibold uppercase">Notes</span>
                <p className="text-xs text-ink italic">{viewingRecord.notes}</p>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center text-xs text-muted">
              <span>Taken by: <strong className="text-ink">{viewingRecord.takenBy}</strong></span>
              <Button variant="secondary" onClick={() => setViewingRecord(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
