import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowRight, CheckCircle, AlertTriangle, XCircle, Clock, MapPin } from 'lucide-react';
import { mockLandRecords } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG = {
  verified: { label: 'Verified', class: 'badge-verified', icon: <CheckCircle size={10} /> },
  partially_verified: { label: 'Partial', class: 'badge-review', icon: <AlertTriangle size={10} /> },
  unverified: { label: 'Unverified', class: 'badge-pending', icon: <Clock size={10} /> },
  rejected: { label: 'Rejected', class: 'badge-error', icon: <XCircle size={10} /> },
};

const FILTERS = ['All Records', 'Verified', 'Needs Review', 'Unverified'];

export default function LandRecords() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Records');
  const navigate = useNavigate();

  const filtered = mockLandRecords.filter(r => {
    const q = query.toLowerCase();
    const matchQ = !q ||
      r.land.surveyNumber.toLowerCase().includes(q) ||
      r.land.khasraNumber.toLowerCase().includes(q) ||
      r.ownership.ownerName.toLowerCase().includes(q) ||
      r.location.village.toLowerCase().includes(q) ||
      r.location.district.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q);
    const matchF = activeFilter === 'All Records' ||
      (activeFilter === 'Verified' && r.status === 'verified') ||
      (activeFilter === 'Needs Review' && r.validation.some(v => v.result === 'warning')) ||
      (activeFilter === 'Unverified' && r.status === 'unverified');
    return matchQ && matchF;
  });

  return (
    <div className="page-records">
      <div className="page-header">
        <div className="page-label">Records</div>
        <h1 className="page-title">Land Records</h1>
        <p className="page-description">
          Search, filter, and manage digitized land records across all jurisdictions.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="records-search-bar">
        <div className="records-search-input-wrap">
          <Search size={14} className="records-search-icon" />
          <input
            className="records-search-input"
            placeholder="Search by owner, survey no., khasra no., village, district…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary btn-sm">
          <Filter size={14} /> Filters
        </button>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`filter-tab ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 12 }}>
        {filtered.length} record{filtered.length !== 1 ? 's' : ''} found
      </div>

      {/* Records table */}
      <div className="panel">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No records found</div>
            <div className="empty-state-desc">Try adjusting your search or filters.</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Survey No.</th>
                <th>Owner</th>
                <th>Location</th>
                <th>Area</th>
                <th>Land Type</th>
                <th>Confidence</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((rec, i) => {
                const sc = STATUS_CONFIG[rec.status];
                return (
                  <motion.tr
                    key={rec.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/app/records/${rec.id}`)}
                  >
                    <td>
                      <span className="record-id">{rec.id}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--accent-green-bright)' }}>
                        {rec.land.surveyNumber}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{rec.ownership.ownerName}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={11} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                          {rec.location.village}, {rec.location.district}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {rec.land.plotArea} {rec.land.areaUnit}
                    </td>
                    <td>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                        {rec.land.landType}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 600,
                        fontSize: 'var(--text-sm)',
                        color: rec.confidence > 97 ? 'var(--status-verified)' : rec.confidence > 90 ? 'var(--text-secondary)' : 'var(--status-review)',
                      }}>
                        {rec.confidence}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${sc.class}`}>
                        {sc.icon}
                        {sc.label}
                      </span>
                    </td>
                    <td>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
