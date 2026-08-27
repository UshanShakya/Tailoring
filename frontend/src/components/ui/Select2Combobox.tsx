import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X, Loader2 } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

interface Select2ComboboxProps {
  options?: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  asyncSearch?: (query: string) => Promise<SelectOption[]>;
  placeholder?: string;
  label?: string;
  required?: boolean;
  clearable?: boolean;
}

export const Select2Combobox: React.FC<Select2ComboboxProps> = ({
  options = [],
  value,
  onChange,
  asyncSearch,
  placeholder = 'Select option...',
  label,
  required = false,
  clearable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<SelectOption[]>(options);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync static options
  useEffect(() => {
    if (!asyncSearch) {
      setItems(options);
    }
  }, [options, asyncSearch]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle Async Search after 3 chars with 300ms debounce
  useEffect(() => {
    if (!asyncSearch) return;

    if (searchQuery.trim().length < 3) {
      if (searchQuery.trim().length === 0) {
        setItems(options);
      }
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await asyncSearch(searchQuery.trim());
        setItems(res);
      } catch (err) {
        console.error('Select2 async search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, asyncSearch]);

  // Filter static options if no async search
  const displayedItems = asyncSearch
    ? items
    : items.filter((opt) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          opt.label.toLowerCase().includes(q) ||
          (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
        );
      });

  const selectedOption = items.find((o) => o.value === value) || options.find((o) => o.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative space-y-1" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}

      {/* Select Box Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-surface border rounded-md px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
          isOpen ? 'border-teal ring-1 ring-teal/30' : 'border-border hover:border-teal/50'
        }`}
      >
        {selectedOption ? (
          <span className="font-semibold text-ink truncate">{selectedOption.label}</span>
        ) : (
          <span className="text-muted italic">{placeholder}</span>
        )}

        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {clearable && selectedOption && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="text-muted hover:text-error p-0.5 rounded transition-colors"
              title="Clear option"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-md shadow-lg z-50 overflow-hidden text-xs">
          {/* Filter / Search input */}
          <div className="p-2 border-b border-border bg-canvas/40 relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-4 top-3.5" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={asyncSearch ? 'Type at least 3 characters to search API...' : 'Search options...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border text-ink rounded pl-8 pr-7 py-1.5 text-xs focus:outline-none focus:border-teal"
            />
            {isLoading && <Loader2 className="w-3.5 h-3.5 text-teal animate-spin absolute right-4 top-3.5" />}
          </div>

          {/* Options list */}
          <div className="max-h-56 overflow-y-auto divide-y divide-border/40">
            {displayedItems.length === 0 ? (
              <div className="p-4 text-center text-muted italic">No matching options found.</div>
            ) : (
              displayedItems.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-teal/10 text-teal font-semibold' : 'hover:bg-canvas text-ink'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{opt.label}</div>
                      {opt.sublabel && <div className="text-[11px] text-muted">{opt.sublabel}</div>}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-teal shrink-0 ml-2" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
