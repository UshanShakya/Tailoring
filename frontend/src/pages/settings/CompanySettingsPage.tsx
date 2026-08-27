import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { Building2, Upload, Trash2, Save, FileText, CheckCircle2, Scissors } from 'lucide-react';

interface CompanySettings {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  panNumber?: string;
  isVatRegistered: boolean;
  taxRate: number;
  logoUrl?: string;
  invoiceNote?: string;
}

export const CompanySettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [isVatRegistered, setIsVatRegistered] = useState(false);
  const [taxRate, setTaxRate] = useState(13);
  const [invoiceNote, setInvoiceNote] = useState('');

  // Logo State
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth<CompanySettings>('/settings/company');
      setSettings(data);
      setName(data.name || '');
      setAddress(data.address || '');
      setPhone(data.phone || '');
      setEmail(data.email || '');
      setPanNumber(data.panNumber || '');
      setIsVatRegistered(data.isVatRegistered || false);
      setTaxRate(data.taxRate || 13);
      setInvoiceNote(data.invoiceNote || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load company settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await fetchWithAuth<CompanySettings>('/settings/company', {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          address,
          phone,
          email,
          panNumber,
          isVatRegistered,
          taxRate: isVatRegistered ? Number(taxRate) : 0,
          invoiceNote,
        }),
      });
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update company settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setIsUploading(true);
      try {
        await fetchWithAuth('/settings/company/logo', {
          method: 'POST',
          body: JSON.stringify({ imageBase64: base64 }),
        });
        await loadSettings();
      } catch (err: any) {
        alert(err.message || 'Failed to upload logo');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = async () => {
    if (!confirm('Are you sure you want to remove the company logo?')) return;
    setIsUploading(true);
    try {
      await fetchWithAuth('/settings/company/logo', { method: 'DELETE' });
      await loadSettings();
    } catch (err: any) {
      alert(err.message || 'Failed to remove logo');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-muted">Loading company billing settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal" /> Company Profile & Billing Settings
          </span>
        }
        subtitle="Manage business branding, Nepalese PAN/VAT registration, tax rate %, and invoice receipts"
      />

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-md text-xs font-medium">
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 bg-success/10 border border-success/20 text-success rounded-md text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Company billing settings saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form Column */}
        <Card className="p-6 lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-ink border-b border-border pb-2">
                Business Profile Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  placeholder="e.g. Stitch & Style Bespoke Tailors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <Input
                  label="Nepalese PAN / VAT Number"
                  placeholder="e.g. 123456789"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Phone"
                  placeholder="e.g. +977-1-4200000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <Input
                  label="Billing Email"
                  type="email"
                  placeholder="billing@tailoring.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Input
                label="Full Address"
                placeholder="e.g. New Road, Ward #2, Kathmandu, Nepal"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Nepalese Tax & VAT Configuration */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold text-ink border-b border-border pb-2">
                Nepalese Tax & VAT Configuration
              </h3>

              <div className="flex items-center justify-between p-4 bg-canvas/60 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-ink block">VAT Registered Business</span>
                  <span className="text-[11px] text-muted block">
                    Enable to automatically compute Nepalese Value Added Tax (VAT) on order billing receipts
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVatRegistered}
                    onChange={(e) => setIsVatRegistered(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-canvas border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-muted after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal peer-checked:after:bg-white"></div>
                </label>
              </div>

              {isVatRegistered && (
                <div className="p-4 bg-teal/5 border border-teal/20 rounded-lg">
                  <Input
                    label="VAT Rate (%)"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    required
                  />
                  <p className="text-[11px] text-muted mt-1">Standard Nepalese VAT rate is 13.00%</p>
                </div>
              )}
            </div>

            {/* Receipt Footer Note */}
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-semibold text-ink border-b border-border pb-2">
                Invoice Footer Note
              </h3>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Default Invoice Terms / Note
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Thank you for choosing our bespoke tailoring services! Goods once sold cannot be returned without original receipt."
                  value={invoiceNote}
                  onChange={(e) => setInvoiceNote(e.target.value)}
                  className="w-full bg-surface border border-border text-ink rounded-md p-2.5 text-xs focus:outline-none focus:border-teal"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" isLoading={isSaving} className="gap-2 text-xs">
                <Save className="w-4 h-4" /> Save Company Settings
              </Button>
            </div>
          </form>
        </Card>

        {/* Company Branding & Logo Column */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4 text-center">
            <h3 className="text-sm font-semibold text-ink text-left flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal" /> Company Logo & Branding
            </h3>

            <div className="p-6 border-2 border-dashed border-border rounded-lg bg-canvas/40 flex flex-col items-center justify-center space-y-3">
              {settings?.logoUrl ? (
                <div className="relative group">
                  <img
                    src={settings.logoUrl}
                    alt="Company Logo"
                    className="max-h-32 object-contain rounded border border-border bg-surface p-2 shadow-sm"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center text-teal">
                  <Scissors className="w-8 h-8" />
                </div>
              )}

              <p className="text-xs text-muted">
                {settings?.logoUrl ? 'Uploaded Company Logo' : 'No logo uploaded yet. Upload transparent PNG or JPG.'}
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                <label className="cursor-pointer">
                  <span className="px-3 py-1.5 bg-teal text-white rounded text-xs font-medium flex items-center gap-1.5 hover:bg-teal-hover transition-colors">
                    <Upload className="w-3.5 h-3.5" /> {settings?.logoUrl ? 'Replace Logo' : 'Upload Logo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                {settings?.logoUrl && (
                  <Button
                    variant="outline"
                    onClick={handleRemoveLogo}
                    isLoading={isUploading}
                    className="px-3 py-1.5 text-xs text-error border-error/30 hover:bg-error/10 gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Billing Receipt Live Preview */}
          <Card className="p-5 space-y-3 text-xs">
            <h4 className="font-semibold text-ink flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal" /> Live Billing Header Preview
            </h4>
            <div className="p-4 bg-surface border border-border rounded-md space-y-2">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h5 className="font-bold text-ink text-sm">{name || 'Your Company Name'}</h5>
                  <p className="text-[11px] text-muted">{address || 'Company Address'}</p>
                  {panNumber && <p className="text-[11px] text-teal font-mono">PAN/VAT: {panNumber}</p>}
                </div>
                {settings?.logoUrl && (
                  <img src={settings.logoUrl} alt="Logo Preview" className="h-8 object-contain" />
                )}
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <Badge variant={isVatRegistered ? 'teal' : 'muted'}>
                  {isVatRegistered ? `VAT Registered (${taxRate}%)` : 'Non-VAT Billing'}
                </Badge>
                <span className="font-mono text-muted">INV-2026-0001</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
