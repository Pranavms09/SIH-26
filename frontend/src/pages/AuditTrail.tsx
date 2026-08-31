import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockAuditEvents } from '../data/mockData';
import { Shield, User2, Database, FileText, Filter, Search } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  administrator: 'Admin',
  district_officer: 'District Officer',
  tehsil_officer: 'Tehsil Officer',
  verification_officer: 'Verification Officer',
  data_operator: 'Data Operator',
  gis_analyst: 'GIS Analyst',
  auditor: 'Auditor',
};

const ROLE_COLORS: Record<string, string> = {
  administrator: 'var(--status-error)',
  district_officer: 'var(--accent-gold)',
  verification_officer: 'var(--status-verified)',
  data_operator: 'var(--status-processing)',
  gis_analyst: 'var(--text-secondary)',
  auditor: 'var(--text-muted)',
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AuditTrail() {
  const [query, setQuery] = useState('');

  const filtered = mockAuditEvents.filter(e =>
    !query || e.actor.toLowerCase().includes(query.toLowerCase()) ||
    e.action.toLowerCase().includes(query.toLowerCase()) ||
    e.recordId?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page-audit">
      <div className="page-header">
        <div className="page-label">Compliance</div>
        <h1 className="page-title">Audit Trail</h1>
        <p className="page-description">
          Complete, tamper-evident activity log for all system events.
        </p>
      </div>

      {/* Stats */}
      <div className="audit-stats">
        {[
          { label: 'Events Today', value: 1284, icon: <Database size={16} />, color: 'var(--text-primary)' },
          { label: 'Officers Active', value: 12, icon: <User2 size={16} />, color: 'var(--status-verified)' },
          { label: 'Records Modified', value: 48, icon: <FileText size={16} />, color: 'var(--accent-gold)' },
          { label: 'Security Alerts', value: 0, icon: <Shield size={16} />, color: 'var(--status-error)' },
        ].map(s => (
          <div key={s.label} className="audit-stat">
            <span style={{ color: s.color }}>{s.icon}</span>
            <div>
              <div className="audit-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="audit-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="records-search-bar" style={{ marginTop: 24 }}>
        <div className="records-search-input-wrap">
          <Search size={14} className="records-search-icon" />
          <input
            className="records-search-input"
            placeholder="Search by actor, action, record ID…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary btn-sm">
          <Filter size={14} /> Filter
        </button>
      </div>

      {/* Timeline */}
      <div className="audit-timeline">
        {filtered.map((event, i) => (
          <motion.div
            key={event.id}
            className="audit-event"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="audit-time-col">
              <span className="audit-time">{formatTime(event.timestamp)}</span>
              <span className="audit-date">{formatDate(event.timestamp)}</span>
            </div>
            <div className="audit-connector">
              <div className="audit-dot" />
              {i < filtered.length - 1 && <div className="audit-line" />}
            </div>
            <div className="audit-content">
              <div className="audit-action">{event.action}</div>
              <div className="audit-meta">
                <span className="audit-actor">{event.actor}</span>
                <span className="audit-role-badge" style={{
                  color: ROLE_COLORS[event.actorRole] || 'var(--text-muted)',
                }}>
                  {ROLE_LABELS[event.actorRole] || event.actorRole}
                </span>
                {event.recordId && (
                  <span className="audit-record-id">{event.recordId}</span>
                )}
                {event.ipAddress && (
                  <span className="audit-ip">{event.ipAddress}</span>
                )}
              </div>
              {event.details && (
                <div className="audit-details">{event.details}</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
