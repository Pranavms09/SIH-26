import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../lib/AppContext';
import { Search, FileText, MapPin, Zap, ArrowRight, Hash, User, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandResult {
  id: string;
  type: 'record' | 'document' | 'gis' | 'action' | 'page';
  title: string;
  subtitle?: string;
  meta?: string;
  href?: string;
  action?: () => void;
}

const staticItems: CommandResult[] = [
  { id: 'nav-overview', type: 'page', title: 'Overview', subtitle: 'Dashboard & metrics', href: '/app/overview' },
  { id: 'nav-documents', type: 'page', title: 'Documents', subtitle: 'Upload and manage documents', href: '/app/documents' },
  { id: 'nav-processing', type: 'page', title: 'Processing', subtitle: 'View processing queue', href: '/app/processing' },
  { id: 'nav-records', type: 'page', title: 'Land Records', subtitle: 'Search and view records', href: '/app/records' },
  { id: 'nav-gis', type: 'page', title: 'GIS', subtitle: 'Interactive cadastral map', href: '/app/gis' },
  { id: 'nav-analytics', type: 'page', title: 'Analytics', subtitle: 'Digitization intelligence', href: '/app/analytics' },
  { id: 'nav-audit', type: 'page', title: 'Audit Trail', subtitle: 'Full activity log', href: '/app/audit' },
  { id: 'rec-001', type: 'record', title: 'Survey 124/3A', subtitle: 'Pimpri · Haveli · Pune', meta: 'LR-MH-2026-018492', href: '/app/records/LR-MH-2026-018492' },
  { id: 'rec-002', type: 'record', title: 'Survey 88/2B', subtitle: 'Pandharpur · Pandharpur · Solapur', meta: 'LR-MH-2026-018493', href: '/app/records/LR-MH-2026-018493' },
  { id: 'rec-003', type: 'record', title: 'Survey 312/1A', subtitle: 'Thiruvallur · Thiruvallur', meta: 'LR-TN-2026-009821', href: '/app/records/LR-TN-2026-009821' },
  { id: 'doc-001', type: 'document', title: 'Survey_Register_1987.pdf', subtitle: 'Pimpri, Pune · Marathi · Processing', href: '/app/processing' },
  { id: 'doc-002', type: 'document', title: 'Khata_Register_Nashik_1994.pdf', subtitle: 'Dindori, Nashik · Verified', href: '/app/documents' },
  { id: 'gis-001', type: 'gis', title: 'GIS Parcel 124/3A', subtitle: 'Pimpri, Pune · 2.48 ha', href: '/app/gis' },
];

const typeIcons: Record<CommandResult['type'], React.ReactNode> = {
  record: <Hash size={14} />,
  document: <FileText size={14} />,
  gis: <MapPin size={14} />,
  action: <Zap size={14} />,
  page: <Navigation size={14} />,
};

const typeLabels: Record<CommandResult['type'], string> = {
  record: 'Land Record',
  document: 'Document',
  gis: 'GIS Parcel',
  action: 'Action',
  page: 'Page',
};

export default function CommandPalette() {
  const { commandOpen, setCommandOpen } = useApp();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim()
    ? staticItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
        item.meta?.toLowerCase().includes(query.toLowerCase())
      )
    : staticItems.slice(0, 8);

  useEffect(() => {
    if (commandOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandOpen]);

  const handleSelect = (item: CommandResult) => {
    if (item.href) navigate(item.href);
    if (item.action) item.action();
    setCommandOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (results[activeIndex]) handleSelect(results[activeIndex]);
    }
  };

  return (
    <AnimatePresence>
      {commandOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="command-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setCommandOpen(false)}
          />
          {/* Palette */}
          <motion.div
            className="command-palette"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Command palette"
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="command-search">
              <Search size={15} className="command-search-icon" />
              <input
                ref={inputRef}
                className="command-input"
                placeholder="Search records, documents, villages, survey numbers…"
                value={query}
                onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
                aria-label="Command search"
              />
              <span className="command-hint">ESC</span>
            </div>

            {/* Results */}
            <div className="command-results" role="listbox">
              {!query && (
                <div className="command-section-label">Quick Navigation</div>
              )}
              {results.length === 0 && (
                <div className="command-empty">
                  <User size={18} />
                  <span>No results for "{query}"</span>
                </div>
              )}
              {results.map((item, i) => (
                <button
                  key={item.id}
                  className={`command-item ${i === activeIndex ? 'active' : ''}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIndex(i)}
                  role="option"
                  aria-selected={i === activeIndex}
                >
                  <span className="command-item-icon">{typeIcons[item.type]}</span>
                  <span className="command-item-body">
                    <span className="command-item-title">{item.title}</span>
                    {item.subtitle && <span className="command-item-subtitle">{item.subtitle}</span>}
                  </span>
                  <span className="command-item-type">{typeLabels[item.type]}</span>
                  {i === activeIndex && <ArrowRight size={12} className="command-item-arrow" />}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="command-footer">
              <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
              <span><kbd>↵</kbd> Select</span>
              <span><kbd>Esc</kbd> Close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
