import React from 'react';
import { motion } from 'framer-motion';
import { mockIntegrations } from '../data/mockData';
import { Database, Globe, Map, FileText, Server, ShieldAlert, RefreshCw, ExternalLink, CheckCircle, AlertTriangle, XCircle, Loader } from 'lucide-react';

const ICONS: Record<string, React.ReactNode> = {
  Database: <Database size={20} />,
  Globe: <Globe size={20} />,
  Map: <Map size={20} />,
  FileText: <FileText size={20} />,
  Server: <Server size={20} />,
  ShieldAlert: <ShieldAlert size={20} />,
};

const STATUS_CONFIG = {
  connected: { label: 'Connected', color: 'var(--status-verified)', icon: <CheckCircle size={12} /> },
  disconnected: { label: 'Disconnected', color: 'var(--status-error)', icon: <XCircle size={12} /> },
  error: { label: 'Error', color: 'var(--status-error)', icon: <AlertTriangle size={12} /> },
  syncing: { label: 'Syncing', color: 'var(--status-processing)', icon: <Loader size={12} className="animate-spin" /> },
};

const API_STATUS = {
  operational: { label: 'Operational', color: 'var(--status-verified)' },
  degraded: { label: 'Degraded', color: 'var(--status-review)' },
  down: { label: 'Down', color: 'var(--status-error)' },
};

export default function Integrations() {
  return (
    <div className="page-integrations">
      <div className="page-header">
        <div className="page-label">Connected Systems</div>
        <h1 className="page-title">Integrations</h1>
        <p className="page-description">
          Real-time status of all external system connections and synchronization.
        </p>
      </div>

      <div className="integrations-grid">
        {mockIntegrations.map((integ, i) => {
          const sc = STATUS_CONFIG[integ.status];
          const ac = API_STATUS[integ.apiStatus];

          return (
            <motion.div
              key={integ.id}
              className="integration-card panel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="integration-header">
                <div className="integration-icon" style={{
                  color: integ.status === 'connected' || integ.status === 'syncing' ? 'var(--accent-green-bright)' : 'var(--text-muted)',
                }}>
                  {ICONS[integ.icon] || <Database size={20} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="integration-name">{integ.name}</div>
                  <div className="integration-desc">{integ.description}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: sc.color }}>
                  {sc.icon}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>{sc.label}</span>
                </div>
              </div>

              <div className="integration-metrics">
                {integ.lastSync && (
                  <div className="integration-metric">
                    <span>Last sync</span>
                    <span>{new Date(integ.lastSync).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
                {integ.recordsSynced && (
                  <div className="integration-metric">
                    <span>Records synced</span>
                    <span>{integ.recordsSynced.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="integration-metric">
                  <span>API status</span>
                  <span style={{ color: ac.color, fontWeight: 500 }}>{ac.label}</span>
                </div>
              </div>

              <div className="integration-actions">
                <button className="btn btn-secondary btn-sm">
                  <RefreshCw size={12} /> Sync Now
                </button>
                <button className="btn btn-ghost btn-sm">
                  Configure
                </button>
                <button className="btn btn-ghost btn-sm">
                  <ExternalLink size={12} /> Docs
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
