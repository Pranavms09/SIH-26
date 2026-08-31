import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../lib/AppContext';
import { Search, Bell, HelpCircle, ChevronDown, BotMessageSquare, Sun, Moon } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/app/overview': 'Overview',
  '/app/documents': 'Documents',
  '/app/processing': 'Processing',
  '/app/verification': 'Verification',
  '/app/records': 'Land Records',
  '/app/gis': 'GIS',
  '/app/analytics': 'Analytics',
  '/app/audit': 'Audit Trail',
  '/app/integrations': 'Integrations',
  '/app/users': 'Users',
  '/app/roles': 'Roles',
  '/app/settings': 'Settings',
};

export default function Topbar() {
  const { setCommandOpen, copilotOpen, setCopilotOpen } = useApp();
  const location = useLocation();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light-mode');
      setTheme('light');
    } else {
      document.documentElement.classList.remove('light-mode');
      setTheme('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  const pageTitle = (() => {
    const base = '/' + location.pathname.split('/').slice(1, 3).join('/');
    return pageTitles[base] || 'BHUMI AI';
  })();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-title">{pageTitle}</span>
      </div>

      <div className="topbar-right">
        {/* Search trigger */}
        <button
          className="topbar-search"
          onClick={() => setCommandOpen(true)}
          aria-label="Open command palette (Ctrl+K)"
        >
          <Search size={14} />
          <span>Search…</span>
          <kbd className="topbar-kbd">⌘K</kbd>
        </button>

        {/* Sync status */}
        <div className="topbar-sync" title="Last synced 2 minutes ago">
          <span className="dot-pulse" style={{ background: 'var(--status-verified)' }} />
          <span className="topbar-sync-text">Synced 2m ago</span>
        </div>

        <div className="topbar-divider" />

        {/* Theme Toggle */}
        <button
          className="topbar-btn"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <button className="topbar-btn" aria-label="Notifications">
          <Bell size={15} />
          <span className="topbar-notif-dot" />
        </button>

        {/* Help */}
        <button className="topbar-btn" aria-label="Help">
          <HelpCircle size={15} />
        </button>

        {/* Copilot */}
        <button
          className={`topbar-btn ${copilotOpen ? 'active' : ''}`}
          onClick={() => setCopilotOpen(!copilotOpen)}
          aria-label="BHUMI Copilot"
          title="BHUMI Copilot"
        >
          <BotMessageSquare size={15} />
        </button>

        {/* Avatar */}
        <button className="topbar-avatar" aria-label="User menu">
          <div className="topbar-avatar-circle">SD</div>
          <ChevronDown size={12} className="topbar-avatar-chevron" />
        </button>
      </div>
    </header>
  );
}
