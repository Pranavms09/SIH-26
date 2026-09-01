import { NavLink } from 'react-router-dom';
import { useApp } from '../../lib/AppContext';
import Doc2DigitalLogo from '../ui/Doc2DigitalLogo';
import {
  LayoutDashboard, FileStack, Cpu, ShieldCheck, ScrollText,
  Map, BarChart3, ClipboardList, Plug, ChevronLeft, ChevronRight,
  Users, Settings, CircleDot, Shield
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const primaryNav: NavItem[] = [
  { href: '/app/overview', icon: <LayoutDashboard size={16} />, label: 'Overview' },
  { href: '/app/documents', icon: <FileStack size={16} />, label: 'Documents' },
  { href: '/app/processing', icon: <Cpu size={16} />, label: 'Processing', badge: 3 },
  { href: '/app/verification', icon: <ShieldCheck size={16} />, label: 'Verification', badge: 12 },
  { href: '/app/records', icon: <ScrollText size={16} />, label: 'Land Records' },
  { href: '/app/gis', icon: <Map size={16} />, label: 'GIS' },
  { href: '/app/analytics', icon: <BarChart3 size={16} />, label: 'Analytics' },
  { href: '/app/audit', icon: <ClipboardList size={16} />, label: 'Audit Trail' },
  { href: '/app/integrations', icon: <Plug size={16} />, label: 'Integrations' },
];

const adminNav: NavItem[] = [
  { href: '/app/users', icon: <Users size={16} />, label: 'Users' },
  { href: '/app/roles', icon: <Shield size={16} />, label: 'Roles' },
  { href: '/app/settings', icon: <Settings size={16} />, label: 'Settings' },
];

export default function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useApp();

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} aria-label="Main navigation">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Doc2DigitalLogo size={20} color="#5a9e6f" />
        </div>
        {!sidebarCollapsed && (
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">Doc2Digital</span>
            <span className="sidebar-brand-tagline">LAND INTELLIGENCE</span>
          </div>
        )}
        <button
          className="sidebar-collapse-btn"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav" role="navigation">
        <ul className="sidebar-nav-list" role="list">
          {primaryNav.map(item => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                {!sidebarCollapsed && <span className="sidebar-nav-label">{item.label}</span>}
                {!sidebarCollapsed && item.badge && (
                  <span className="sidebar-nav-badge">{item.badge}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="sidebar-divider" />
        {!sidebarCollapsed && <div className="sidebar-section-label">Administration</div>}

        <ul className="sidebar-nav-list" role="list">
          {adminNav.map(item => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                {!sidebarCollapsed && <span className="sidebar-nav-label">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-status">
          <CircleDot size={9} className="sidebar-status-dot" />
          {!sidebarCollapsed && <span className="sidebar-status-text">All systems operational</span>}
        </div>
        {!sidebarCollapsed && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">SD</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">Sunita Deshmukh</span>
              <span className="sidebar-user-role">Verification Officer</span>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="sidebar-user-avatar-sm" title="Sunita Deshmukh">SD</div>
        )}
      </div>
    </aside>
  );
}
