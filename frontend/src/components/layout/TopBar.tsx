import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { fetchWithAuth } from '../../lib/api';
import { Badge } from '../ui/Badge';
import {
  Search,
  Sun,
  Moon,
  User,
  Building2,
  ChevronRight,
  UserCheck,
  ShoppingBag,
  FileText,
  Ruler,
  X,
} from 'lucide-react';

interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  link: string;
}

interface SearchCategory {
  category: 'Customers' | 'Orders' | 'Invoices' | 'Templates' | 'Businesses';
  items: SearchResultItem[];
}

export const TopBar: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchCategory[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close popup on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced API Search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const data = await fetchWithAuth<SearchCategory[]>(
          `/search?q=${encodeURIComponent(searchQuery.trim())}`
        );
        setSearchResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectResult = (link: string) => {
    navigate(link);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Customers':
        return <UserCheck className="w-3.5 h-3.5 text-teal" />;
      case 'Orders':
        return <ShoppingBag className="w-3.5 h-3.5 text-brass" />;
      case 'Invoices':
        return <FileText className="w-3.5 h-3.5 text-teal" />;
      case 'Templates':
        return <Ruler className="w-3.5 h-3.5 text-brass" />;
      case 'Businesses':
        return <Building2 className="w-3.5 h-3.5 text-muted" />;
      default:
        return <Search className="w-3.5 h-3.5 text-muted" />;
    }
  };

  return (
    <header className="h-14 bg-surface border-b border-border px-4 flex items-center justify-between gap-4 sticky top-0 z-40 transition-colors print:hidden">
      {/* Global Search Input */}
      <div className="relative w-full max-w-md" ref={containerRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Global search orders, clients, invoices, templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setIsOpen(true);
            }}
            className="w-full bg-canvas border border-border text-ink rounded-md pl-9 pr-8 py-1.5 text-xs focus:outline-none focus:border-teal transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsOpen(false);
              }}
              className="absolute right-2.5 top-2.5 text-muted hover:text-ink"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Global Search Popup Results */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-md shadow-xl z-50 max-h-96 overflow-y-auto divide-y divide-border text-xs">
            {isSearching ? (
              <div className="p-4 text-center text-muted">Searching global workspace...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-muted italic">
                No matching results found for "{searchQuery}"
              </div>
            ) : (
              searchResults.map((cat) => (
                <div key={cat.category} className="p-2 space-y-1">
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5 bg-canvas/40 rounded">
                    {getCategoryIcon(cat.category)} {cat.category}
                  </div>
                  <div className="space-y-0.5">
                    {cat.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item.link)}
                        className="px-2.5 py-1.5 rounded hover:bg-canvas flex items-center justify-between cursor-pointer transition-colors group"
                      >
                        <div>
                          <div className="font-semibold text-ink group-hover:text-teal transition-colors">
                            {item.title}
                          </div>
                          {item.subtitle && (
                            <div className="text-[11px] text-muted">{item.subtitle}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {item.badge && <Badge variant="teal">{item.badge}</Badge>}
                          <ChevronRight className="w-3.5 h-3.5 text-muted group-hover:text-teal" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Theme Toggle & User Info */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 bg-canvas border border-border rounded-md text-ink hover:text-teal hover:border-teal transition-colors flex items-center gap-1.5 text-xs font-medium"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-brass" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-teal" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* User & Tenant Badge */}
        <div className="hidden md:flex items-center gap-2 border-l border-border pl-3">
          <div className="w-7 h-7 bg-teal/10 border border-teal/30 rounded-full flex items-center justify-center text-teal">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="text-left text-xs leading-tight">
            <span className="font-semibold text-ink block">{user?.name}</span>
            <span className="text-[10px] text-muted font-mono block">
              {user?.businessName || user?.role?.name}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
