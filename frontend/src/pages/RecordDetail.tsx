import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Download, Edit2, Map, ClipboardList, Check } from 'lucide-react';
import { mockLandRecords } from '../data/mockData';
import { useApp } from '../lib/AppContext';
import type { ValidationResult } from '../types';

const TABS = ['Land Details', 'Ownership', 'Registration', 'Mutation', 'Validation', 'Documents'];

function ValidationItem({ v }: { key?: string; v: ValidationResult }) {
  const icon = v.result === 'pass' ? (
    <CheckCircle size={13} style={{ color: 'var(--status-verified)', flexShrink: 0 }} />
  ) : v.result === 'warning' ? (
    <AlertTriangle size={13} style={{ color: 'var(--status-review)', flexShrink: 0 }} />
  ) : (
    <XCircle size={13} style={{ color: 'var(--status-error)', flexShrink: 0 }} />
  );

  return (
    <div className={`validation-item ${v.result}`}>
      {icon}
      <div className="validation-content">
        <div className="validation-rule">{v.rule}</div>
        <div className="validation-message">{v.message}</div>
        <div className="validation-meta">
          <span>Source: {v.source}</span>
          {v.action && (
            <button className="btn btn-ghost btn-sm" style={{ padding: '2px 8px' }}>
              {v.action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MutationTimeline({ entries }: { entries: typeof mockLandRecords[0]['mutation'] }) {
  return (
    <div className="mutation-timeline">
      {entries.map((entry, i) => (
        <motion.div
          key={entry.id}
          className="mutation-entry"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <div className="mutation-year">
            <span>{entry.year}</span>
            {i < entries.length - 1 && <div className="mutation-line" />}
          </div>
          <div className="mutation-card">
            <div className="mutation-type" style={{
              color: entry.type === 'verification' ? 'var(--accent-green-bright)' :
                entry.type === 'transfer' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            }}>
              {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
            </div>
            <div className="mutation-desc">{entry.description}</div>
            {entry.officer && (
              <div className="mutation-officer">Officer: {entry.officer}</div>
            )}
            {entry.notes && (
              <div className="mutation-notes">{entry.notes}</div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function RecordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast, landRecords } = useApp();
  const [activeTab, setActiveTab] = useState('Land Details');

  const record = landRecords.find(r => r.id === id) ?? mockLandRecords.find(r => r.id === id) ?? landRecords[0];

  return (
    <div className="page-record-detail">
      {/* Header */}
      <div className="record-detail-header">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/app/records')}
          style={{ marginBottom: 16 }}
        >
          <ArrowLeft size={14} /> Back to Records
        </button>

        <div className="record-detail-title-row">
          <div>
            <div className="page-label">Land Record</div>
            <h1 className="page-title" style={{ fontSize: 24 }}>{record.id}</h1>
            <div style={{ marginTop: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="badge badge-verified">
                <Check size={9} /> VERIFIED
              </span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                Verified by {record.verifiedBy || 'Verification Officer'} · {new Date(record.verifiedAt || record.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
          <div className="record-detail-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => addToast('info', 'Export initiated.')}>
              <Download size={14} /> Export
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/app/gis?gat=${encodeURIComponent(record.land.surveyNumber)}`)}>
              <Map size={14} /> View in GIS
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/app/audit')}>
              <ClipboardList size={14} /> Audit Trail
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => addToast('info', 'Edit mode enabled.')}>
              <Edit2 size={14} /> Edit Record
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="record-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`record-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === 'Validation' && record.validation.some(v => v.result === 'warning') && (
              <span className="tab-warning-dot" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="record-tab-content"
      >
        {activeTab === 'Land Details' && (
          <div className="detail-grid">
            <div className="panel">
              <div className="panel-header"><span className="panel-title">Land Details</span></div>
              <div className="panel-body">
                {[
                  { label: 'Survey Number', value: record.land.surveyNumber, mono: true },
                  { label: 'Khasra Number', value: record.land.khasraNumber, mono: true },
                  { label: 'Khata Number', value: record.land.khataNumber, mono: true },
                  { label: 'Plot Area', value: `${record.land.plotArea} ${record.land.areaUnit}` },
                  { label: 'Land Type', value: record.land.landType, capitalize: true },
                  { label: 'Usage', value: record.land.usage },
                ].map(f => (
                  <div key={f.label} className="detail-field">
                    <div className="detail-label">{f.label}</div>
                    <div className={`detail-value ${f.mono ? 'mono' : ''} ${f.capitalize ? 'capitalize' : ''}`}>
                      {f.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <div className="panel-header"><span className="panel-title">Location</span></div>
              <div className="panel-body">
                {[
                  { label: 'Village', value: record.location.village },
                  { label: 'Tehsil', value: record.location.tehsil },
                  { label: 'District', value: record.location.district },
                  { label: 'State', value: record.location.state },
                  { label: 'Pincode', value: record.location.pincode ?? '—' },
                ].map(f => (
                  <div key={f.label} className="detail-field">
                    <div className="detail-label">{f.label}</div>
                    <div className="detail-value">{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel" style={{ gridColumn: 'span 2' }}>
              <div className="panel-header"><span className="panel-title">Extraction Confidence</span></div>
              <div className="panel-body">
                <div className="confidence-overview">
                  <div className="confidence-score">
                    <div className="confidence-score-value">{record.confidence}%</div>
                    <div className="confidence-score-label">Overall Confidence</div>
                  </div>
                  <div className="confidence-breakdown">
                    {[
                      { label: 'Owner Name', value: 98.7 },
                      { label: 'Survey Number', value: 99.4 },
                      { label: 'Area', value: 78.4 },
                    ].map(c => (
                      <div key={c.label} className="confidence-breakdown-row">
                        <span className="confidence-breakdown-label">{c.label}</span>
                        <div style={{ flex: 1, margin: '0 12px' }}>
                          <div className="confidence-bar">
                            <div className="confidence-fill" style={{
                              width: `${c.value}%`,
                              background: c.value >= 90 ? 'var(--status-verified)' : c.value >= 75 ? 'var(--status-review)' : 'var(--status-error)',
                            }} />
                          </div>
                        </div>
                        <span className="confidence-breakdown-value">{c.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Ownership' && (
          <div className="panel" style={{ maxWidth: 640 }}>
            <div className="panel-header"><span className="panel-title">Ownership Details</span></div>
            <div className="panel-body">
              {[
                { label: 'Owner Name', value: record.ownership.ownerName },
                { label: 'Ownership Type', value: record.ownership.ownershipType, capitalize: true },
                { label: 'Share', value: `${record.ownership.sharePercentage || 100}%` },
                { label: 'Aadhaar Linked', value: record.ownership.aadharLinked ? 'Yes' : 'No' },
              ].map(f => (
                <div key={f.label} className="detail-field">
                  <div className="detail-label">{f.label}</div>
                  <div className={`detail-value ${f.capitalize ? 'capitalize' : ''}`}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Registration' && (
          <div className="panel" style={{ maxWidth: 640 }}>
            <div className="panel-header"><span className="panel-title">Registration Details</span></div>
            <div className="panel-body">
              {[
                { label: 'Registration Number', value: record.registration?.registrationNumber ?? '—', mono: true },
                { label: 'Registration Date', value: record.registration?.registrationDate ?? '—' },
                { label: 'Registration Office', value: record.registration?.registrationOffice ?? '—' },
                { label: 'Deed Type', value: record.registration?.deedType ?? '—' },
              ].map(f => (
                <div key={f.label} className="detail-field">
                  <div className="detail-label">{f.label}</div>
                  <div className={`detail-value ${f.mono ? 'mono' : ''}`}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Mutation' && (
          <MutationTimeline entries={record.mutation} />
        )}

        {activeTab === 'Validation' && (
          <div className="validation-list">
            {record.validation.map(v => (
              <ValidationItem key={v.id} v={v} />
            ))}
          </div>
        )}

        {activeTab === 'Documents' && (
          <div className="panel" style={{ maxWidth: 640 }}>
            <div className="panel-body">
              <div className="empty-state">
                <div className="empty-state-icon">📄</div>
                <div className="empty-state-title">Source Document</div>
                <div className="empty-state-desc">
                  Document ID: {record.documentId}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
