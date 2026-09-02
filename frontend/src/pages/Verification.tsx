import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Edit3, X, AlertTriangle, Info, ChevronDown, ChevronUp, Cpu, Sparkles, FileText, ArrowLeft, ZoomIn, ZoomOut, RotateCcw, Upload } from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { useNavigate } from 'react-router-dom';
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

/** Real document preview panel: renders PDF in an iframe, images in an <img> */
function DocumentPreview({ file, filename }: { file: File | null; filename?: string }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const isPdf = file?.type === 'application/pdf' || filename?.toLowerCase().endsWith('.pdf');
  const isImage = file && (file.type.startsWith('image/') || /\.(png|jpe?g|tiff?|webp)$/i.test(file.name));

  useEffect(() => {
    if (!file) { setObjectUrl(null); return; }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!file || !objectUrl) {
    // Fallback: simulated OCR document skeleton
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 24,
          background: 'var(--bg-card)',
          borderRadius: 8,
          border: '1px dashed var(--border-color)',
          color: 'var(--text-muted)',
          minHeight: 280,
        }}
      >
        <FileText size={36} style={{ opacity: 0.3 }} />
        <span style={{ fontSize: 'var(--text-sm)' }}>No document preview available</span>
        <span style={{ fontSize: 'var(--text-xs)' }}>Upload a document to see it here</span>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 300 }}>
      {/* Zoom controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: '2px 6px', fontSize: 11 }}
          onClick={() => setZoom(z => Math.max(0.4, z - 0.2))}
          title="Zoom out"
        >
          <ZoomOut size={12} />
        </button>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', minWidth: 36, textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: '2px 6px', fontSize: 11 }}
          onClick={() => setZoom(z => Math.min(3, z + 0.2))}
          title="Zoom in"
        >
          <ZoomIn size={12} />
        </button>
        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: '2px 6px', fontSize: 11 }}
          onClick={() => setZoom(1)}
          title="Reset zoom"
        >
          <RotateCcw size={12} />
        </button>
      </div>

      {/* Document render area */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 8,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: 8,
        }}
      >
        {isPdf ? (
          <iframe
            src={objectUrl}
            title="Document Preview"
            style={{
              width: '100%',
              minHeight: 480,
              border: 'none',
              borderRadius: 4,
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
            }}
          />
        ) : isImage ? (
          <img
            src={objectUrl}
            alt="Document preview"
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 4,
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              display: 'block',
            }}
          />
        ) : (
          <div style={{ color: 'var(--text-muted)', padding: 24, fontSize: 'var(--text-sm)' }}>
            Preview not available for this file type.
          </div>
        )}
      </div>
    </div>
  );
}

export default function Verification() {
  const { addToast, activeRecord, landRecords, activeProcessResult, activeDocumentFile, setActiveProcessResult, setActiveDocumentFile } = useApp();
  const navigate = useNavigate();

  // Find active land record
  const currentRecord = landRecords.find(r => r.id === activeRecord);

  const handleGoBack = () => {
    setActiveProcessResult(null);
    setActiveDocumentFile(null);
    navigate('/app/documents');
  };

  if (!currentRecord && !activeProcessResult) {
    return (
      <div className="verification-workspace" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 420, gap: 16 }}>
        <FileText size={48} style={{ opacity: 0.3, color: 'var(--text-muted)' }} />
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-primary)' }}>No Document Selected</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', maxWidth: 420 }}>
          Upload a scanned 7/12 land record to extract structured data and perform authoritative verification.
        </p>
        <button className="btn btn-primary" onClick={handleGoBack} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Upload size={15} /> Upload Document
        </button>
      </div>
    );
  }

  // Helper to safely format extracted field status and confidence
  const getFieldProps = (fieldObj: { value?: string | null; confidence?: number } | undefined, defaultConf: number) => {
    const rawVal = fieldObj?.value;
    const strVal = rawVal ? String(rawVal).trim() : '';
    const isMissing = !strVal || strVal === '—' || strVal === '-' || strVal === 'null' || strVal === 'none';
    const val = isMissing ? '—' : strVal;
    const conf = isMissing ? 0 : Math.round((fieldObj?.confidence ?? defaultConf) * 100);
    const status: FieldStatus = isMissing ? 'needs_review' : (conf < 80 ? 'needs_review' : 'accepted');
    return { value: val, confidence: conf, status };
  };

  // Derive extracted fields from backend result or land record
  const initialFields: ExtractedField[] = activeProcessResult?.record
    ? [
        {
          fieldId: 'district',
          label: 'District (जिल्हा)',
          ...getFieldProps(activeProcessResult.record.district, 0.95),
        },
        {
          fieldId: 'taluka',
          label: 'Taluka / Tehsil (तालुका)',
          ...getFieldProps(activeProcessResult.record.taluka, 0.95),
        },
        {
          fieldId: 'village',
          label: 'Village (गाव)',
          ...getFieldProps(activeProcessResult.record.village, 0.95),
        },
        {
          fieldId: 'survey_number',
          label: 'Survey Number (गट क्रमांक)',
          ...getFieldProps(activeProcessResult.record.survey_number, 0.90),
        },
        {
          fieldId: 'owner_name',
          label: 'Owner Name (खातेदाराचे नाव)',
          ...getFieldProps(activeProcessResult.record.owner_name, 0.90),
        },
        {
          fieldId: 'land_holding_type',
          label: 'Land Holding Type (धारण प्रकार)',
          ...getFieldProps(activeProcessResult.record.land_holding_type, 0.90),
        },
        {
          fieldId: 'area',
          label: 'Area (क्षेत्रफल)',
          ...getFieldProps(activeProcessResult.record.area, 0.85),
        },
      ]
    : currentRecord
    ? [
        { fieldId: 'survey_number', label: 'Survey Number', value: currentRecord.land?.surveyNumber || '—', confidence: currentRecord.confidence || 90, status: 'accepted' as const },
        { fieldId: 'village', label: 'Village', value: currentRecord.location?.village || '—', confidence: 95, status: 'accepted' as const },
        { fieldId: 'tehsil', label: 'Tehsil', value: currentRecord.location?.tehsil || '—', confidence: 95, status: 'accepted' as const },
        { fieldId: 'district', label: 'District', value: currentRecord.location?.district || '—', confidence: 95, status: 'accepted' as const },
        { fieldId: 'state', label: 'State', value: currentRecord.location?.state || 'Maharashtra', confidence: 99, status: 'accepted' as const },
        { fieldId: 'owner_name', label: 'Owner Name', value: currentRecord.ownership?.ownerName || '—', confidence: 90, status: 'accepted' as const },
        { fieldId: 'area', label: 'Area', value: `${currentRecord.land?.plotArea || 0} ${currentRecord.land?.areaUnit || 'ha'}`, confidence: 85, status: 'accepted' as const },
      ]
    : [];

  const [fieldStates, setFieldStates] = useState<Record<string, FieldStatus>>(
    Object.fromEntries(initialFields.map(f => [f.fieldId, f.status as FieldStatus]))
  );
  const [selectedField, setSelectedField] = useState<string | null>(initialFields[0]?.fieldId || null);
  const [editValue, setEditValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [rawTextOpen, setRawTextOpen] = useState(false);

  const selectedFieldData = initialFields.find(f => f.fieldId === selectedField);
  const needsReviewFields = initialFields.filter(f => fieldStates[f.fieldId] === 'needs_review' || f.confidence < 80);

  const handleAction = useCallback((action: 'edit' | 'flag' | 'save' | 'cancel') => {
    if (!selectedField) return;
    if (action === 'edit') {
      setIsEditing(true);
      setEditValue(selectedFieldData?.value ?? '');
    } else if (action === 'flag') {
      // Toggle between needs_review and accepted
      const current = fieldStates[selectedField];
      if (current === 'needs_review') {
        setFieldStates(prev => ({ ...prev, [selectedField]: 'accepted' }));
        addToast('success', 'Field marked as accepted.');
      } else {
        setFieldStates(prev => ({ ...prev, [selectedField]: 'needs_review' }));
        addToast('info', 'Field flagged for review.');
      }
    } else if (action === 'save') {
      setFieldStates(prev => ({ ...prev, [selectedField]: 'edited' }));
      setIsEditing(false);
      addToast('success', 'Field updated.');
    } else if (action === 'cancel') {
      setIsEditing(false);
    }
  }, [selectedField, fieldStates, selectedFieldData, addToast]);

  // Keyboard shortcuts: E = edit, F = flag for review, Escape = cancel edit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'e' || e.key === 'E') handleAction('edit');
      if (e.key === 'f' || e.key === 'F') handleAction('flag');
      if (e.key === 'Escape') handleAction('cancel');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleAction]);

  // Determine extraction source message
  const extractionSource = activeProcessResult?.extraction?.source || currentRecord?.extractionMetadata?.source;
  const extractionRoute = activeProcessResult?.extraction?.route || currentRecord?.extractionMetadata?.route;
  const geminiError = activeProcessResult?.extraction?.gemini_error || currentRecord?.extractionMetadata?.gemini_error;

  const getSourceBadge = () => {
    if (extractionRoute === 'local_escalated_to_gemini') {
      return (
        <span className="badge badge-verified" style={{ background: 'rgba(74, 124, 89, 0.2)', border: '1px solid #4a7c59' }}>
          <Sparkles size={11} style={{ color: 'var(--accent-green-bright)' }} /> Processed with Gemini Vision (Escalated from Local OCR)
        </span>
      );
    }
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
        {/* Back button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleGoBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', padding: '4px 10px', flexShrink: 0 }}
          title="Go back to upload another document"
        >
          <ArrowLeft size={12} /> Upload Another Document
        </button>

        <div style={{ width: 1, height: 18, background: 'var(--border-color)', flexShrink: 0 }} />

        {getSourceBadge()}
        {complexity && (
          <span className={`badge ${complexity.classification === 'simple' ? 'badge-verified' : 'badge-review'}`}>
            Complexity: {complexity.classification.toUpperCase()} ({Math.round(complexity.score * 100)}%)
          </span>
        )}
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Record ID: <strong style={{ color: 'var(--text-primary)' }}>{currentRecord?.id || 'LR-DOC2DIGITAL'}</strong>
        </span>
      </div>

      {/* Left: Document Viewer & Raw Page OCR */}
      <div className="workspace-left">
        <div className="workspace-panel-header">
          <span className="workspace-panel-title">Source Document</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {activeProcessResult?.filename || activeDocumentFile?.name || currentRecord?.documentId || '7_12_Extract.pdf'}
          </span>
        </div>
        <div className="document-viewer-area" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Real Document Preview */}
          <DocumentPreview
            file={activeDocumentFile}
            filename={activeProcessResult?.filename || currentRecord?.documentId}
          />

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

              {/* Show edited value if field was modified */}
              {fieldStates[selectedField!] === 'edited' && editValue && (
                <div className="vap-row" style={{ marginTop: 4 }}>
                  <span className="vap-row-label" style={{ color: 'var(--accent-gold)' }}>Edited to:</span>
                  <span className="vap-row-value" style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                    {editValue}
                  </span>
                </div>
              )}

              <div className="vap-confidence" style={{ margin: '12px 0' }}>
                <Info size={12} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Confidence: {selectedFieldData.value === '—' ? '—' : `${selectedFieldData.confidence}%`}
                  {selectedFieldData.confidence >= 90 && selectedFieldData.value !== '—' && (
                    <span style={{ color: 'var(--status-verified)', marginLeft: 6 }}>● High confidence — auto-accepted</span>
                  )}
                  {selectedFieldData.value === '—' && (
                    <span style={{ color: 'var(--status-review)', marginLeft: 6 }}>● Missing value — needs review</span>
                  )}
                </span>
              </div>

              {isEditing ? (
                /* Edit mode */
                <div className="vap-edit">
                  <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Enter corrected value:
                  </label>
                  <input
                    className="input"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAction('save');
                      if (e.key === 'Escape') handleAction('cancel');
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleAction('save')}
                    >
                      <Check size={12} /> Save
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleAction('cancel')}>
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Default mode: Edit + optional Flag */
                <div className="vap-actions" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button
                    className="vap-btn edit"
                    onClick={() => handleAction('edit')}
                    style={{ flex: 1 }}
                    title="Edit this field value (E)"
                  >
                    <Edit3 size={13} /> Edit Value <kbd>E</kbd>
                  </button>
                  <button
                    className={`vap-btn ${fieldStates[selectedField!] === 'needs_review' ? 'accept' : 'reject'}`}
                    onClick={() => handleAction('flag')}
                    style={{ flex: 1 }}
                    title="Flag this field for manual review (F)"
                  >
                    {fieldStates[selectedField!] === 'needs_review' ? (
                      <><Check size={13} /> Mark OK <kbd>F</kbd></>
                    ) : (
                      <><AlertTriangle size={13} /> Flag <kbd>F</kbd></>
                    )}
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
