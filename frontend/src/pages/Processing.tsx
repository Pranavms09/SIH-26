import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../lib/AppContext';
import type { ProcessingStage } from '../types';

const STAGES: { id: ProcessingStage; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'enhancement', label: 'Image Enhancement' },
  { id: 'language_detection', label: 'Language Detection' },
  { id: 'ocr', label: 'OCR' },
  { id: 'handwriting', label: 'Handwriting Recognition' },
  { id: 'field_extraction', label: 'Field Extraction' },
  { id: 'classification', label: 'Classification' },
  { id: 'validation', label: 'Validation' },
  { id: 'duplicate_detection', label: 'Duplicate Detection' },
  { id: 'verification', label: 'Verification' },
];

const getStageProgress = (docProgress: number, stageIndex: number, totalStages: number) => {
  const stageSize = 100 / totalStages;
  const stageStart = stageIndex * stageSize;
  const stageEnd = stageStart + stageSize;
  if (docProgress >= stageEnd) return 'complete';
  if (docProgress >= stageStart) return 'active';
  return 'pending';
};

function ProcessingDocument({ doc, index }: { key?: string; doc: any; index: number }) {
  const [localProgress, setLocalProgress] = useState(doc.progress ?? 0);

  useEffect(() => {
    if (doc.status === 'processing' || doc.status === 'extracting') {
      const interval = setInterval(() => {
        setLocalProgress(p => Math.min(p + Math.random() * 2, 99));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [doc.status]);

  return (
    <motion.div
      className="processing-doc-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <div className="processing-doc-header">
        <div>
          <div className="processing-doc-name">{doc.filename}</div>
          <div className="processing-doc-meta">
            {doc.location.village}, {doc.location.district} ·{' '}
            <span style={{ textTransform: 'capitalize' }}>{doc.language}</span> ·{' '}
            {doc.pages} pages
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {doc.confidence && (
            <div style={{ fontWeight: 600, fontSize: 'var(--text-md)', color: 'var(--accent-green-bright)' }}>
              {doc.confidence}%
            </div>
          )}
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>confidence</div>
        </div>
      </div>

      <div className="processing-progress-bar">
        <div
          className="processing-progress-fill"
          style={{ width: `${localProgress}%` }}
        />
      </div>

      {(doc.status === 'processing' || doc.status === 'extracting' || doc.status === 'validating') && (
        <div className="pipeline-stages">
          {STAGES.map((stage, i) => {
            const status = getStageProgress(localProgress, i, STAGES.length);
            return (
              <div key={stage.id} className={`pipeline-stage ${status}`}>
                <div className="pipeline-stage-icon">
                  {status === 'complete' && <CheckCircle size={11} />}
                  {status === 'active' && <Loader size={11} className="animate-spin" />}
                  {status === 'pending' && <div className="pipeline-dot" />}
                </div>
                <span className="pipeline-stage-label">{stage.label}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="processing-doc-footer">
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {localProgress.toFixed(0)}% complete
          {doc.status === 'processing' && ' · estimating ~2 min remaining'}
        </span>
        <span className={`badge ${
          doc.status === 'verified' ? 'badge-verified' :
          doc.status === 'error' ? 'badge-error' :
          doc.status === 'needs_review' ? 'badge-review' : 'badge-processing'
        }`}>
          {doc.status === 'processing' && <Loader size={9} className="animate-spin" />}
          {doc.status === 'verified' && <CheckCircle size={9} />}
          {doc.status === 'error' && <AlertCircle size={9} />}
          <span style={{ textTransform: 'capitalize' }}>{doc.status.replace('_', ' ')}</span>
        </span>
      </div>
    </motion.div>
  );
}

export default function Processing() {
  const { documents } = useApp();
  const processingDocs = documents.filter(d =>
    ['processing', 'extracting', 'validating', 'pending'].includes(d.status)
  );
  const completedDocs = documents.filter(d =>
    ['verified', 'needs_review', 'error'].includes(d.status)
  );

  return (
    <div className="page-processing">
      <div className="page-header">
        <div className="page-label">Pipeline</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Processing</h1>
            <p className="page-description">Monitor document processing pipeline and extraction status.</p>
          </div>
          <button className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="processing-stats">
        {[
          { label: 'In Queue', value: processingDocs.length, color: 'var(--status-processing)' },
          { label: 'Completed Today', value: completedDocs.length + 482, color: 'var(--status-verified)' },
          { label: 'Avg. Processing Time', value: '4.2 min', color: 'var(--text-secondary)' },
          { label: 'Success Rate', value: '96.8%', color: 'var(--accent-green-bright)' },
        ].map(s => (
          <div key={s.label} className="processing-stat">
            <div className="processing-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="processing-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {processingDocs.length > 0 && (
        <>
          <div className="section-label" style={{ marginTop: 24 }}>Active Processing</div>
          <div className="processing-list">
            {processingDocs.map((doc, i) => (
              <ProcessingDocument key={doc.id} doc={doc} index={i} />
            ))}
          </div>
        </>
      )}

      <div className="section-label" style={{ marginTop: 24 }}>Completed</div>
      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Location</th>
              <th>Language</th>
              <th>Pages</th>
              <th>Confidence</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {completedDocs.map((doc, i) => (
              <motion.tr key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                <td style={{ fontWeight: 500 }}>{doc.filename}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  {doc.location.village}, {doc.location.district}
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', textTransform: 'capitalize' }}>
                  {doc.language}
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{doc.pages}</td>
                <td style={{ fontWeight: 600, color: doc.confidence && doc.confidence > 95 ? 'var(--status-verified)' : 'var(--status-review)' }}>
                  {doc.confidence ? `${doc.confidence}%` : '—'}
                </td>
                <td>
                  <span className={`badge ${
                    doc.status === 'verified' ? 'badge-verified' :
                    doc.status === 'error' ? 'badge-error' : 'badge-review'
                  }`}>
                    {doc.status.replace('_', ' ')}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
