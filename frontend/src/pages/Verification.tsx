import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Edit3, X, AlertTriangle, Info, ChevronDown, ChevronUp, Cpu, Sparkles, FileText } from 'lucide-react';
import { useApp } from '../lib/AppContext';
import type { ExtractedField } from '../types';

type FieldStatus = 'auto' | 'accepted' | 'edited' | 'rejected' | 'needs_review';

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 90 ? 'var(--status-verified)' : value >= 75 ? 'var(--status-review)' : 'var(--status-error)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="confidence-bar" style={{ flex: 1 }}>
        <div className="confidence-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span style={{ fontSize: 'var(--text-xs)', color, fontWeight: 600, minWidth: 38 }}>
        {value}%
      </span>
    </div>
  );
}

export default function Verification() {
  const { addToast, activeRecord, landRecords, activeProcessResult } = useApp();

  // Find active land record
  const currentRecord = landRecords.find(r => r.id === activeRecord) || landRecords[0];

  // Derive extracted fields from backend result or land record
  const initialFields: ExtractedField[] = activeProcessResult?.record
    ? [
        {
          fieldId: 'district',
          label: 'District (जिल्हा)',
          value: activeProcessResult.record.district?.value || '—',
          confidence: Math.round((activeProcessResult.record.district?.confidence || 0.95) * 100),
          status: 'auto',
        },
        {
          fieldId: 'taluka',
          label: 'Taluka / Tehsil (तालुका)',
          value: activeProcessResult.record.taluka?.value || '—',
          confidence: Math.round((activeProcessResult.record.taluka?.confidence || 0.95) * 100),
          status: 'auto',
        },
        {
          fieldId: 'village',
          label: 'Village (गाव)',
          value: activeProcessResult.record.village?.value || '—',
          confidence: Math.round((activeProcessResult.record.village?.confidence || 0.95) * 100),
          status: 'auto',
        },
        {
          fieldId: 'survey_number',
          label: 'Survey Number (गट क्रमांक)',
          value: activeProcessResult.record.survey_number?.value || '—',
          confidence: Math.round((activeProcessResult.record.survey_number?.confidence || 0.90) * 100),
          status: 'auto',
        },
        {
          fieldId: 'owner_name',
          label: 'Owner Name (खातेदाराचे नाव)',
          value: activeProcessResult.record.owner_name?.value || '—',
          confidence: Math.round((activeProcessResult.record.owner_name?.confidence || 0.90) * 100),
          status: 'auto',
        },
        {
          fieldId: 'land_holding_type',
          label: 'Land Holding Type (धारण प्रकार)',
          value: activeProcessResult.record.land_holding_type?.value || '—',
          confidence: Math.round((activeProcessResult.record.land_holding_type?.confidence || 0.90) * 100),
          status: 'auto',
        },
        {
          fieldId: 'area',
          label: 'Area (क्षेत्रफल)',
          value: activeProcessResult.record.area?.value || '—',
          confidence: Math.round((activeProcessResult.record.area?.confidence || 0.85) * 100),
          status: 'auto',
        },
      ]
    : [
        { fieldId: 'survey_no', label: 'Survey Number', value: currentRecord?.land?.surveyNumber || '124/3A', confidence: 99, status: 'accepted' },
        { fieldId: 'khasra_no', label: 'Khasra Number', value: currentRecord?.land?.khasraNumber || 'K-4821', confidence: 97, status: 'accepted' },
        { fieldId: 'khata_no', label: 'Khata Number', value: currentRecord?.land?.khataNumber || 'KH-29382', confidence: 96, status: 'auto' },
        { fieldId: 'plot_area', label: 'Plot Area', value: `${currentRecord?.land?.plotArea || 2.48} ${currentRecord?.land?.areaUnit || 'ha'}`, confidence: 78, status: 'needs_review' },
        { fieldId: 'village', label: 'Village', value: currentRecord?.location?.village || 'Pimpri', confidence: 99, status: 'accepted' },
        { fieldId: 'tehsil', label: 'Tehsil', value: currentRecord?.location?.tehsil || 'Haveli', confidence: 99, status: 'accepted' },
        { fieldId: 'district', label: 'District', value: currentRecord?.location?.district || 'Pune', confidence: 99, status: 'accepted' },
        { fieldId: 'state', label: 'State', value: currentRecord?.location?.state || 'Maharashtra', confidence: 99, status: 'accepted' },
        { fieldId: 'owner_name', label: 'Owner Name', value: currentRecord?.ownership?.ownerName || 'Rajendra Patil', confidence: 98, status: 'accepted' },
      ];

  const [fieldStates, setFieldStates] = useState<Record<string, FieldStatus>>(
    Object.fromEntries(initialFields.map(f => [f.fieldId, f.status as FieldStatus]))
  );
  const [selectedField, setSelectedField] = useState<string | null>(initialFields[0]?.fieldId || null);
  const [editValue, setEditValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [rawTextOpen, setRawTextOpen] = useState(false);

  const selectedFieldData = initialFields.find(f => f.fieldId === selectedField);
  const needsReviewFields = initialFields.filter(f => fieldStates[f.fieldId] === 'needs_review' || f.confidence < 80);

  const handleAction = useCallback((action: 'accept' | 'edit' | 'reject') => {
    if (!selectedField) return;
    if (action === 'accept') {
      setFieldStates(prev => ({ ...prev, [selectedField]: 'accepted' }));
      addToast('success', 'Field accepted.');
      const next = initialFields.find(f => f.fieldId !== selectedField && fieldStates[f.fieldId] !== 'accepted');
      if (next) setSelectedField(next.fieldId);
    } else if (action === 'edit') {
      setIsEditing(true);
      setEditValue(selectedFieldData?.value ?? '');
    } else if (action === 'reject') {
      setFieldStates(prev => ({ ...prev, [selectedField]: 'rejected' }));
      addToast('info', 'Field rejected.');
    }
  }, [selectedField, initialFields, fieldStates, selectedFieldData, addToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'a' || e.key === 'A') handleAction('accept');
      if (e.key === 'e' || e.key === 'E') handleAction('edit');
      if (e.key === 'r' || e.key === 'R') handleAction('reject');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleAction]);

  // Determine extraction source message
  const extractionSource = activeProcessResult?.extraction?.source || currentRecord?.extractionMetadata?.source;
  const extractionRoute = activeProcessResult?.extraction?.route || currentRecord?.extractionMetadata?.route;
  const geminiError = activeProcessResult?.extraction?.gemini_error || currentRecord?.extractionMetadata?.gemini_error;

  const getSourceBadge = () => {
    if (extractionSource === 'gemini_vision' || extractionRoute === 'gemini') {
      return (
        <span className="badge badge-verified" style={{ background: 'rgba(74, 124, 89, 0.2)', border: '1px solid #4a7c59' }}>
          <Sparkles size={11} style={{ color: 'var(--accent-green-bright)' }} /> Processed with Gemini Vision
        </span>
      );
    }
    if (extractionSource === 'groq_vision' || extractionRoute === 'groq') {
      return (
        <span className="badge badge-processing">
          <Cpu size={11} /> Processed with Groq Vision
        </span>
      );
    }
    if (geminiError) {
      return (
        <span className="badge badge-review">
          <AlertTriangle size={11} /> Gemini unavailable — Local OCR fallback used
        </span>
      );
    }
    return (
      <span className="badge badge-processing">
        <Cpu size={11} /> Processed with Local OCR
      </span>
    );
  };

  const complexity = activeProcessResult?.complexity || currentRecord?.complexity;
  const rawPages = activeProcessResult?.pages || currentRecord?.rawPages;

  return (
    <div className="verification-workspace">
      {/* Top Banner: Pipeline & Route Metadata */}
      <div style={{ gridColumn: '1 / -1', marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {getSourceBadge()}
        {complexity && (
          <span className={`badge ${complexity.classification === 'simple' ? 'badge-verified' : 'badge-review'}`}>
            Complexity: {complexity.classification.toUpperCase()} ({Math.round(complexity.score * 100)}%)
          </span>
        )}
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Record ID: <strong style={{ color: 'var(--text-primary)' }}>{currentRecord?.id || 'LR-BHULEKHA'}</strong>
        </span>
      </div>

      {/* Left: Document Viewer & Raw Page OCR */}
      <div className="workspace-left">
        <div className="workspace-panel-header">
          <span className="workspace-panel-title">Source Document</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {activeProcessResult?.filename || currentRecord?.documentId || '7_12_Extract.pdf'}
          </span>
        </div>
        <div className="document-viewer-area" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Scanned document simulation */}
          <div className="doc-sim" style={{ flex: 1, minHeight: 300 }}>
            <div className="doc-sim-inner">
              <div className="doc-header-row">
                <div className="doc-stamp" />
                <div>
                  <div className="doc-title-line" style={{ width: 180 }} />
                  <div className="doc-title-line" style={{ width: 140, marginTop: 4 }} />
                </div>
              </div>
              <div className="doc-content-sim" style={{ marginTop: 24 }}>
                {initialFields.map(f => (
                  <div
                    key={f.fieldId}
                    className={`ocr-box-sim ${selectedField === f.fieldId ? 'active' : ''}`}
                    style={{ margin: '8px 0', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}
                    onClick={() => setSelectedField(f.fieldId)}
                  >
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-green-bright)' }}>
                      {f.label}: {f.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Raw Collapsible Page OCR View */}
          {rawPages && rawPages.length > 0 && (
            <div className="panel" style={{ padding: 12 }}>
              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'space-between' }}
                onClick={() => setRawTextOpen(!rawTextOpen)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)' }}>
                  <FileText size={13} /> Raw OCR Text ({rawPages.length} pages)
                </span>
                {rawTextOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
              {rawTextOpen && (
                <div style={{ marginTop: 8, maxHeight: 200, overflowY: 'auto', fontSize: 'var(--text-xs)', background: 'var(--bg-card)', padding: 8, borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
                  {rawPages.map(p => (
                    <div key={p.page_number} style={{ marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, color: 'var(--accent-green-bright)' }}>--- Page {p.page_number} ---</div>
                      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-secondary)' }}>{p.text}</pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center: Extracted Fields (Preserve Marathi Unicode Strings) */}
      <div className="workspace-center">
        <div className="workspace-panel-header">
          <span className="workspace-panel-title">Extracted Data</span>
          <span className="badge badge-verified">{currentRecord?.id}</span>
        </div>

        <div className="extraction-fields">
          {initialFields.map(f => {
            const status = fieldStates[f.fieldId] || 'auto';
            return (
              <motion.div
                key={f.fieldId}
                className={`field-row ${selectedField === f.fieldId ? 'selected' : ''} ${status}`}
                onClick={() => setSelectedField(f.fieldId)}
                whileHover={{ x: 2 }}
                style={{ padding: '12px 16px', marginBottom: 8, borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
              >
                <div className="field-label" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{f.label}</div>
                <div className="field-value-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span className={`field-value ${status === 'rejected' ? 'rejected' : ''}`} style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {f.value}
                  </span>
                  <span className={`field-status-badge ${status}`} style={{ fontSize: 'var(--text-xs)' }}>
                    {status === 'accepted' && <Check size={10} />}
                    {status === 'rejected' && <X size={10} />}
                    {status === 'needs_review' && <AlertTriangle size={10} />}
                    <span style={{ textTransform: 'capitalize' }}>{status.replace('_', ' ')}</span>
                  </span>
                </div>
                {f.confidence < 90 && (
                  <div className="field-confidence-bar" style={{ marginTop: 6 }}>
                    <ConfidenceBar value={f.confidence} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Right: Validation & Actions */}
      <div className="workspace-right">
        <div className="workspace-panel-header">
          <span className="workspace-panel-title">Authoritative Validation</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {needsReviewFields.length > 0 ? `${needsReviewFields.length} field(s) need review` : `Status: ${activeProcessResult?.validation?.status || currentRecord?.status}`}
          </span>
        </div>

        {/* Validation List */}
        <div className="confidence-list" style={{ marginBottom: 16 }}>
          {initialFields.map(f => (
            <div key={f.fieldId} className={`confidence-item ${selectedField === f.fieldId ? 'selected' : ''}`} onClick={() => setSelectedField(f.fieldId)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{f.label}</span>
                <span className="badge badge-verified" style={{ fontSize: 9 }}>{f.confidence}%</span>
              </div>
              <ConfidenceBar value={f.confidence} />
            </div>
          ))}
        </div>

        {/* Verification action panel */}
        {selectedFieldData && (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedField}
              className="verification-action-panel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              <div className="vap-title">{selectedFieldData.label}</div>

              <div className="vap-row" style={{ marginTop: 8 }}>
                <span className="vap-row-label">Extracted Value:</span>
                <span className="vap-row-value" style={{ fontWeight: 600, color: 'var(--accent-green-bright)' }}>
                  {selectedFieldData.value}
                </span>
              </div>

              <div className="vap-confidence" style={{ margin: '12px 0' }}>
                <Info size={12} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Confidence: {selectedFieldData.confidence}%
                </span>
              </div>

              {isEditing ? (
                <div className="vap-edit">
                  <input
                    className="input"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => {
                        setFieldStates(prev => ({ ...prev, [selectedField!]: 'edited' }));
                        setIsEditing(false);
                        addToast('success', 'Field updated.');
                      }}
                    >
                      Save
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="vap-actions" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="vap-btn accept" onClick={() => handleAction('accept')} style={{ flex: 1 }}>
                    <Check size={13} /> Accept <kbd>A</kbd>
                  </button>
                  <button className="vap-btn edit" onClick={() => handleAction('edit')} style={{ flex: 1 }}>
                    <Edit3 size={13} /> Edit <kbd>E</kbd>
                  </button>
                  <button className="vap-btn reject" onClick={() => handleAction('reject')} style={{ flex: 1 }}>
                    <X size={13} /> Reject <kbd>R</kbd>
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
