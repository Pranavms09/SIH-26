import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Edit3, X, AlertTriangle, Info, ChevronDown, ChevronUp, Cpu, Sparkles, FileText, ArrowLeft, ZoomIn, ZoomOut, RotateCcw, Upload, MapPin, Compass } from 'lucide-react';
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

  // Find active land record (or fallback to first available record)
  const currentRecord = landRecords.find(r => r.id === activeRecord) || landRecords[0];

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
  // User verified/edited values dictionary (Single Source of Truth: verifiedValue || extractedValue)
  const [verifiedValues, setVerifiedValues] = useState<Record<string, string>>({});
  const [selectedField, setSelectedField] = useState<string | null>(initialFields[0]?.fieldId || null);
  const [editValue, setEditValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [rawTextOpen, setRawTextOpen] = useState(false);

  // Helper to read effective value: verifiedValue || extractedValue
  const getEffectiveValue = useCallback((fieldId: string): string => {
    if (verifiedValues[fieldId] !== undefined && verifiedValues[fieldId] !== '') {
      return verifiedValues[fieldId];
    }
    const f = initialFields.find(item => item.fieldId === fieldId);
    const rawVal = f?.value;
    if (!rawVal || rawVal === '—' || rawVal === '-' || rawVal === 'null' || rawVal === 'none') {
      return '';
    }
    return rawVal.trim();
  }, [verifiedValues, initialFields]);

  const selectedFieldData = initialFields.find(f => f.fieldId === selectedField);
  const needsReviewFields = initialFields.filter(f => fieldStates[f.fieldId] === 'needs_review' || f.confidence < 80);

  // Check if any location information is available
  const hasLocationInfo = Boolean(
    getEffectiveValue('district') ||
    getEffectiveValue('taluka') ||
    getEffectiveValue('tehsil') ||
    getEffectiveValue('village') ||
    getEffectiveValue('survey_number') ||
    activeProcessResult?.record?.district?.value ||
    currentRecord?.location?.district
  );

  const handleAction = useCallback((action: 'edit' | 'flag' | 'save' | 'cancel') => {
    if (!selectedField) return;
    if (action === 'edit') {
      setIsEditing(true);
      const effectiveVal = getEffectiveValue(selectedField);
      setEditValue(effectiveVal === '—' || effectiveVal === '-' ? '' : effectiveVal);
    } else if (action === 'flag') {
      const current = fieldStates[selectedField];
      if (current === 'needs_review') {
        setFieldStates(prev => ({ ...prev, [selectedField]: 'accepted' }));
        addToast('success', 'Field marked as accepted.');
      } else {
        setFieldStates(prev => ({ ...prev, [selectedField]: 'needs_review' }));
        addToast('info', 'Field flagged for review.');
      }
    } else if (action === 'save') {
      const trimmed = editValue.trim();
      setVerifiedValues(prev => ({ ...prev, [selectedField]: trimmed }));
      setFieldStates(prev => ({ ...prev, [selectedField]: 'edited' }));
      setIsEditing(false);
      addToast('success', `${selectedFieldData?.label || 'Field'} updated to "${trimmed}".`);
    } else if (action === 'cancel') {
      setIsEditing(false);
    }
  }, [selectedField, fieldStates, selectedFieldData, editValue, getEffectiveValue, addToast]);

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

  // Navigate to GIS and auto-search & zoom into District, Taluka, Village, and Gat
  const handleViewOnMap = useCallback(() => {
    const getCleanField = (fieldId: string): string => {
      const val = getEffectiveValue(fieldId);
      if (!val || val === '—' || val === '-' || val === 'null' || val === 'none') {
        return '';
      }
      return val.trim();
    };

    let dist = getCleanField('district') || activeProcessResult?.record?.district?.value || currentRecord?.location?.district || '';
    let taluka = getCleanField('taluka') || getCleanField('tehsil') || activeProcessResult?.record?.taluka?.value || currentRecord?.location?.tehsil || '';
    let village = getCleanField('village') || activeProcessResult?.record?.village?.value || currentRecord?.location?.village || '';
    let gat = getCleanField('survey_number') || activeProcessResult?.record?.survey_number?.value || currentRecord?.land?.surveyNumber || '';

    if (dist === '—' || dist === '-') dist = '';
    if (taluka === '—' || taluka === '-') taluka = '';
    if (village === '—' || village === '-') village = '';
    if (gat === '—' || gat === '-') gat = '';

    if (!dist && !taluka && !village && !gat) {
      addToast('error', 'Location information required to view on map.');
      return;
    }

    const params = new URLSearchParams();
    if (dist) params.set('district', dist);
    if (taluka) params.set('taluka', taluka);
    if (village) params.set('village', village);
    if (gat) params.set('gat', gat);

    const searchTerms = [gat ? `Gat ${gat}` : '', village, taluka, dist].filter(Boolean).join(', ');
    if (searchTerms) params.set('search', searchTerms);

    addToast('info', `Searching Cadastral GIS for ${searchTerms || dist}...`);
    navigate(`/app/gis?${params.toString()}`);
  }, [getEffectiveValue, activeProcessResult, currentRecord, navigate, addToast]);

  // Extraction source metadata (kept for potential future use)
  const geminiError = activeProcessResult?.extraction?.gemini_error || currentRecord?.extractionMetadata?.gemini_error;

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

        {geminiError && (
          <span className="badge badge-review">
            <AlertTriangle size={11} /> Fallback OCR was used
          </span>
        )}
        {complexity && (
          <span className={`badge ${complexity.classification === 'simple' ? 'badge-verified' : 'badge-review'}`}>
            Complexity: {complexity.classification.toUpperCase()} ({Math.round(complexity.score * 100)}%)
          </span>
        )}
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Record ID: <strong style={{ color: 'var(--text-primary)' }}>{currentRecord?.id || 'LR-DOC2DIGITAL'}</strong>
        </span>

        {/* View on Map Button */}
        <button
          className="btn btn-primary btn-sm"
          onClick={handleViewOnMap}
          disabled={!hasLocationInfo}
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontSize: 'var(--text-xs)',
            padding: '5px 14px',
            background: hasLocationInfo ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'var(--bg-card)',
            color: hasLocationInfo ? '#ffffff' : 'var(--text-muted)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 6,
            fontWeight: 650,
            cursor: hasLocationInfo ? 'pointer' : 'not-allowed',
            boxShadow: hasLocationInfo ? '0 2px 10px rgba(16, 185, 129, 0.3)' : 'none',
            transition: 'all 0.2s ease',
          }}
          title={hasLocationInfo ? "View on Cadastral Map" : "Location information required to view on map."}
        >
          <MapPin size={14} style={{ color: hasLocationInfo ? '#ffffff' : 'var(--text-muted)' }} /> 📍 View on Map
        </button>
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

      {/* Center: Extracted Fields */}
      <div className="workspace-center">
        <div className="workspace-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="workspace-panel-title">Extracted Data</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="btn btn-secondary btn-xs"
              onClick={handleViewOnMap}
              disabled={!hasLocationInfo}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '11px', padding: '3px 9px', borderRadius: 4, cursor: hasLocationInfo ? 'pointer' : 'not-allowed' }}
              title={hasLocationInfo ? "View on Cadastral Map" : "Location information required to view on map."}
            >
              <Compass size={12} style={{ color: hasLocationInfo ? 'var(--accent-green-bright)' : 'var(--text-muted)' }} /> View on Map
            </button>
            <span className="badge badge-verified">{currentRecord?.id}</span>
          </div>
        </div>

        <div className="extraction-fields">
          {initialFields.map(f => {
            const status = fieldStates[f.fieldId] || 'auto';
            const displayVal = getEffectiveValue(f.fieldId) || f.value;
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
                    {displayVal}
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

              {verifiedValues[selectedField!] !== undefined && verifiedValues[selectedField!] !== selectedFieldData.value && (
                <div className="vap-row" style={{ marginTop: 4 }}>
                  <span className="vap-row-label" style={{ color: 'var(--accent-gold)' }}>Edited to:</span>
                  <span className="vap-row-value" style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                    {verifiedValues[selectedField!]}
                  </span>
                </div>
              )}

              <div className="vap-confidence" style={{ margin: '12px 0' }}>
                <Info size={12} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Confidence: {getEffectiveValue(selectedField!) ? `${selectedFieldData.confidence}%` : '—'}
                  {selectedFieldData.confidence >= 90 && getEffectiveValue(selectedField!) && (
                    <span style={{ color: 'var(--status-verified)', marginLeft: 6 }}>● High confidence — auto-accepted</span>
                  )}
                  {!getEffectiveValue(selectedField!) && (
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
                    placeholder="e.g. Pune, Nashik, Baramati, Vadgaon, 233"
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
                /* Default mode: Edit + Flag + View on Map */
                <div className="vap-actions" style={{ marginTop: 14 }}>
                  <div className="vap-actions-row">
                    <button
                      className="vap-btn edit"
                      onClick={() => handleAction('edit')}
                      title="Edit this field value (E)"
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Edit3 size={14} style={{ color: 'var(--accent-gold, #f59e0b)' }} />
                        <span>Edit Value</span>
                      </span>
                      <kbd>E</kbd>
                    </button>
                    <button
                      className={`vap-btn ${fieldStates[selectedField!] === 'needs_review' ? 'accept' : 'reject'}`}
                      onClick={() => handleAction('flag')}
                      title="Flag this field for manual review (F)"
                    >
                      {fieldStates[selectedField!] === 'needs_review' ? (
                        <>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Check size={14} />
                            <span>Mark OK</span>
                          </span>
                          <kbd>F</kbd>
                        </>
                      ) : (
                        <>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <AlertTriangle size={14} />
                            <span>Flag Review</span>
                          </span>
                          <kbd>F</kbd>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    className="vap-btn-map"
                    onClick={handleViewOnMap}
                    disabled={!hasLocationInfo}
                    title={hasLocationInfo ? "View on Cadastral Map" : "Location information required to view on map."}
                  >
                    <MapPin size={15} style={{ color: hasLocationInfo ? '#10b981' : 'var(--text-muted)' }} />
                    <span>View on Cadastral Map</span>
                    <Compass size={13} style={{ opacity: 0.7, marginLeft: 2 }} />
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
