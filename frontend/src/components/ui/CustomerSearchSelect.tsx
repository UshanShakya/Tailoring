import React, { useState, useRef, useEffect } from 'react';
import { User, Phone, MapPin, Search, ChevronDown, Check, X } from 'lucide-react';

export interface CustomerOption {
  id: string;
  name: string;
  phone?: string;
  address?: string;
}

interface CustomerSearchSelectProps {
  customers: CustomerOption[];
  value: string;
  onChange: (customerId: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export const CustomerSearchSelect: React.FC<CustomerSearchSelectProps> = ({
  customers,
  value,
  onChange,
  placeholder = 'Search customer by Name, Phone, or Address...',
  label = 'Select Client / Customer',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCustomer = customers.find((c) => c.id === value);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // 3-field text search filter (Name, Phone, Address)
  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchName = c.name?.toLowerCase().includes(q);
    const matchPhone = c.phone?.toLowerCase().includes(q);
    const matchAddress = c.address?.toLowerCase().includes(q);
    return matchName || matchPhone || matchAddress;
  });

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative space-y-1" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted flex items-center justify-between">
          <span>
            {label} {required && <span className="text-error">*</span>}
          </span>
          <span className="text-[10px] text-teal lowercase font-normal">
            (3-field search: name, phone, address)
          </span>
        </label>
      )}

      {/* Trigger Box (Select2 Style) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-surface border rounded-md px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
          isOpen ? 'border-teal ring-1 ring-teal/30' : 'border-border hover:border-teal/50'
        }`}
      >
        {selectedCustomer ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <User className="w-4 h-4 text-teal shrink-0" />
            <span className="font-semibold text-ink truncate">{selectedCustomer.name}</span>
            {selectedCustomer.phone && (
              <span className="text-[11px] text-muted flex items-center gap-1 shrink-0 font-mono">
                <Phone className="w-3 h-3 text-teal" /> {selectedCustomer.phone}
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted italic">{placeholder}</span>
        )}

        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {selectedCustomer && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="text-muted hover:text-error p-0.5 rounded transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Select2 Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-md shadow-lg z-50 overflow-hidden text-xs">
          {/* Header Search Box */}
          <div className="p-2 border-b border-border bg-canvas/40 relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-4 top-3.5" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Type Name, Phone, or Address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border text-ink rounded pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-teal"
            />
          </div>

          {/* Customer Options List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-border/50">
            {filteredCustomers.length === 0 ? (
              <div className="p-4 text-center text-muted italic text-xs">
                No matching customers found for "{searchQuery}"
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const isSelected = c.id === value;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelect(c.id)}
                    className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-teal/10 text-teal font-semibold' : 'hover:bg-canvas text-ink'
                    }`}
                  >
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="font-semibold flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-teal shrink-0" />
                        <span className="truncate">{c.name}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
                        {c.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-teal shrink-0" /> {c.phone}
                          </span>
                        )}
                        {c.address && (
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="w-3 h-3 text-brass shrink-0" /> {c.address}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-teal shrink-0 ml-2" />}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Info */}
          <div className="p-2 border-t border-border bg-canvas/40 text-[10px] text-muted text-right">
            Showing {filteredCustomers.length} of {customers.length} clients
          </div>
        </div>
      )}
    </div>
  );
};
