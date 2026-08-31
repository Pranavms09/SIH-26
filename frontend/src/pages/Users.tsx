import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockUsers } from '../data/mockData';
import { UserPlus, Search, Shield, Check, X } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  administrator: 'Administrator',
  district_officer: 'District Officer',
  tehsil_officer: 'Tehsil Officer',
  verification_officer: 'Verification Officer',
  data_operator: 'Data Operator',
  gis_analyst: 'GIS Analyst',
  auditor: 'Auditor',
};

const PERMISSIONS = ['View', 'Upload', 'Edit', 'Verify', 'Export', 'Manage Users', 'Audit'];

const ROLE_PERMS: Record<string, boolean[]> = {
  administrator:       [true, true, true, true, true, true, true],
  district_officer:    [true, true, true, true, true, false, true],
  tehsil_officer:      [true, true, true, false, true, false, false],
  verification_officer:[true, false, true, true, false, false, false],
  data_operator:       [true, true, false, false, false, false, false],
  gis_analyst:         [true, false, false, false, true, false, false],
  auditor:             [true, false, false, false, true, false, true],
};

export default function Users() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  const filtered = mockUsers.filter(u =>
    !query ||
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase()) ||
    ROLE_LABELS[u.role]?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page-users">
      <div className="page-header">
        <div className="page-label">Administration</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Users</h1>
            <p className="page-description">Manage user accounts and role-based access control.</p>
          </div>
          <button className="btn btn-primary btn-sm">
            <UserPlus size={14} /> Add User
          </button>
        </div>
      </div>

      <div className="filter-tabs" style={{ marginBottom: 24 }}>
        <button className={`filter-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
        <button className={`filter-tab ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveTab('roles')}>Permissions Matrix</button>
      </div>

      {activeTab === 'users' && (
        <>
          <div className="records-search-bar" style={{ marginBottom: 16 }}>
            <div className="records-search-input-wrap">
              <Search size={14} className="records-search-icon" />
              <input
                className="records-search-input"
                placeholder="Search users…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="panel">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Jurisdiction</th>
                  <th>Last Active</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'rgba(74, 124, 89, 0.1)',
                          border: '1px solid rgba(74, 124, 89, 0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 600, color: 'var(--accent-green-bright)', flexShrink: 0,
                        }}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 'var(--text-base)' }}>{user.name}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      {user.district ? `${user.district}, ${user.state}` : user.state || '—'}
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                      {new Date(user.lastActive).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <span className={`badge ${user.status === 'active' ? 'badge-verified' : 'badge-pending'}`}>
                        {user.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'roles' && (
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Permissions Matrix</span>
            <Shield size={15} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="panel-body" style={{ overflowX: 'auto', padding: 0 }}>
            <table className="data-table permissions-table">
              <thead>
                <tr>
                  <th>Role</th>
                  {PERMISSIONS.map(p => <th key={p}>{p}</th>)}
                </tr>
              </thead>
              <tbody>
                {Object.entries(ROLE_LABELS).map(([role, label], i) => (
                  <motion.tr key={role} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</td>
                    {ROLE_PERMS[role]?.map((allowed, j) => (
                      <td key={j} style={{ textAlign: 'center' }}>
                        {allowed
                          ? <Check size={13} style={{ color: 'var(--status-verified)' }} />
                          : <X size={13} style={{ color: 'var(--text-disabled)' }} />}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
