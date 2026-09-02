import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X, Check, Loader, Sparkles, Search, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../lib/AppContext';
import type { Document, LandRecord } from '../types';
import { processDocumentApi, checkBackendHealthApi } from '../services/api';
import { uploadDocumentToStorage, saveDocumentRecord } from '../services/firebaseService';
import { isFirebaseConfigured } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

const STATUS_LABEL: Record<Document['status'], string> = {
  pending: 'Pending',
  processing: 'Processing',
  extracting: 'Extracting',
  validating: 'Validating',
  needs_review: 'Needs Review',
  verified: 'Verified',
  error: 'Error',
};

const STATUS_CLASS: Record<Document['status'], string> = {
  pending: 'badge-pending',
  processing: 'badge-processing',
  extracting: 'badge-processing',
  validating: 'badge-processing',
  needs_review: 'badge-review',
  verified: 'badge-verified',
  error: 'badge-error',
};

const LANG_LABELS: Record<string, string> = {
  marathi: 'Marathi', hindi: 'Hindi', english: 'English',
  tamil: 'Tamil', telugu: 'Telugu', kannada: 'Kannada',
};

function formatFileSize(bytes: number) {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function Documents() {
  const { addToast, documents, addDocument, addLandRecord, setActiveProcessResult, setActiveRecord, setActiveDocumentFile } = useApp();
  const navigate = useNavigate();
  
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [provider, setProvider] = useState<'gemini' | 'groq' | 'ocr'>('gemini');
  const [searchQuery, setSearchQuery] = useState('');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [options, setOptions] = useState({
    autoLanguage: true,
    handwriting: true,
    tables: true,
    stamps: true,
    validation: true,
    duplicates: true,
  });

  // Periodically check backend health
  useEffect(() => {
    let mounted = true;
    const verifyHealth = async () => {
      const isHealthy = await checkBackendHealthApi();
      if (mounted) setBackendOnline(isHealthy);
    };
    verifyHealth();
    const interval = setInterval(verifyHealth, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) {
      setSelectedFiles(prev => [...prev, ...files]);
      addToast('success', `${files.length} document${files.length > 1 ? 's' : ''} added.`);
    }
  }, [addToast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      addToast('success', `${files.length} document${files.length > 1 ? 's' : ''} added.`);
      e.target.value = '';
    }
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStartProcessing = async () => {
    if (isUploading) return;

    if (selectedFiles.length === 0) {
      addToast('warning', 'Please select a document first.');
      return;
    }

    const fileToProcess = selectedFiles[0];

    // Allowed extension verification
    const ext = fileToProcess.name.slice(fileToProcess.name.lastIndexOf('.')).toLowerCase();
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.tif'];
    if (!allowed.includes(ext)) {
      addToast('error', 'Unsupported document format. Allowed: PDF, JPG, JPEG, PNG, TIFF.');
      return;
    }

    setIsUploading(true);
    setProgressStage('Uploading document...');

    const timer1 = setTimeout(() => setProgressStage('Running OCR & page preprocessing...'), 1500);
    const timer2 = setTimeout(() => setProgressStage('Analyzing document complexity & AI routing...'), 3500);
    const timer3 = setTimeout(() => setProgressStage('Validating extracted fields with rule engine...'), 6000);

    try {
      const res = await processDocumentApi(fileToProcess, provider);
      
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      setProgressStage('Processing complete!');

      setActiveProcessResult(res);

      const recordId = `LR-${res.document_id.slice(0, 8).toUpperCase()}`;

      const geminiFailed = res.extraction?.gemini_error;
      const actualSource = res.extraction?.source || 'rule_based_ocr';

      if (geminiFailed) {
        addToast('warning', 'Gemini processing failed. Local OCR fallback was used.');
      } else {
        addToast('success', `Document processed with ${actualSource.replace('_', ' ')}!`);
      }

      const isVerified = res.validation?.status === 'valid';

      const newDoc: Document = {
        id: res.document_id,
        filename: res.filename || fileToProcess.name,
        originalName: fileToProcess.name,
        status: isVerified ? 'verified' : 'needs_review',
        language: 'marathi',
        pages: res.pages?.length || 1,
        uploadedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        confidence: res.record?.survey_number?.confidence
          ? Math.round(res.record.survey_number.confidence * 100)
          : undefined,
        progress: 100,
        location: {
          village: res.record?.village?.value || '—',
          tehsil: res.record?.taluka?.value || '—',
          district: res.record?.district?.value || '—',
          state: 'Maharashtra',
        },
        extractedRecordId: recordId,
        fileSize: fileToProcess.size,
        mimeType: fileToProcess.type || 'application/pdf',
        rawApiData: res,
      };

      const newLandRecord: LandRecord = {
        id: recordId,
        documentId: res.document_id,
        status: isVerified ? 'verified' : 'partially_verified',
        confidence: res.record?.survey_number?.confidence
          ? Math.round(res.record.survey_number.confidence * 100)
          : 90,
        land: {
          surveyNumber: res.record?.survey_number?.value || '—',
          khasraNumber: '—',
          khataNumber: '—',
          plotArea: parseFloat(res.record?.area?.value || '0') || 0,
          areaUnit: 'ha',
          landType: 'agricultural',
          usage: res.record?.land_holding_type?.value || 'Holding',
        },
        location: {
          village: res.record?.village?.value || '—',
          tehsil: res.record?.taluka?.value || '—',
          district: res.record?.district?.value || '—',
          state: 'Maharashtra',
        },
        ownership: {
          ownerName: res.record?.owner_name?.value || '—',
          ownershipType: 'individual',
        },
        registration: {},
        mutation: [],
        validation: Object.entries(res.validation?.fields || {}).map(([key, v], idx) => ({
          id: `val-${idx}`,
          rule: key.replace('_', ' '),
          result: v.status === 'valid' ? 'pass' : 'warning',
          message: v.reasons?.join(', ') || `Field ${key}: ${v.status}`,
          source: res.extraction?.source || 'Rule Engine',
          field: key,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        extractionMetadata: res.extraction,
        complexity: res.complexity,
        rawPages: res.pages,
      };

      addDocument(newDoc);
      addLandRecord(newLandRecord);
      setActiveRecord(recordId);
      setActiveDocumentFile(fileToProcess);

      // Non-blocking Firebase upload (does not delay navigation)
      if (isFirebaseConfigured()) {
        (async () => {
          try {
            const storageUrl = await uploadDocumentToStorage(fileToProcess, res.document_id);
            await saveDocumentRecord(newDoc, newLandRecord, res, storageUrl);
            addToast('success', '☁ Document saved to Firebase.');
          } catch {
            addToast('info', '⚠ Could not save to Firebase — stored locally only.');
          }
        })();
      }

      setSelectedFiles([]);
      navigate('/app/verification');
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      console.error('Processing error:', err);
      addToast('error', err.message || 'Document processing failed. Please try again.');
    } finally {
      setIsUploading(false);
      setProgressStage('');
    }
  };

  // Filter recent documents
  const filteredDocuments = documents.filter(doc => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.filename.toLowerCase().includes(q) ||
      doc.location.village.toLowerCase().includes(q) ||
      doc.location.district.toLowerCase().includes(q) ||
      doc.language.toLowerCase().includes(q) ||
      doc.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-documents">
      {/* Page Header with Search & Sync Indicator */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="page-label">Digitization</div>
            <h1 className="page-title">Documents</h1>
            <p className="page-description">Upload scanned land records for AI-powered extraction and validation.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Sync Indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
              borderRadius: 'var(--radius-full)', background: 'var(--bg-surface)',
              border: '1px solid var(--border)', fontSize: 'var(--text-xs)'
            }}>
              {backendOnline === true ? (
                <>
                  <Wifi size={12} style={{ color: 'var(--accent-green-bright)' }} />
                  <span style={{ color: 'var(--accent-green-bright)', fontWeight: 600 }}>Backend Online</span>
                </>
              ) : backendOnline === false ? (
                <>
                  <WifiOff size={12} style={{ color: 'var(--status-error)' }} />
                  <span style={{ color: 'var(--status-error)', fontWeight: 600 }}>Backend Offline</span>
                </>
              ) : (
                <>
                  <Loader size={12} className="animate-spin" />
                  <span style={{ color: 'var(--text-muted)' }}>Checking API...</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="records-search-bar" style={{ marginTop: 16 }}>
          <div className="records-search-input-wrap">
            <Search size={14} className="records-search-icon" />
            <input
              type="text"
              className="records-search-input"
              placeholder="Search documents by filename, location, language, or status..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="documents-layout">
        {/* Upload panel */}
        <div className="upload-panel">
          {/* Provider Selector */}
          <div className="section-label" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={13} style={{ color: 'var(--accent-gold)' }} /> AI Provider Route
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
            <button
              type="button"
              className={`btn btn-sm ${provider === 'gemini' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setProvider('gemini')}
              style={{ fontSize: 'var(--text-xs)' }}
            >
              Gemini 2.5 Flash
            </button>
            <button
              type="button"
              className={`btn btn-sm ${provider === 'groq' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setProvider('groq')}
              style={{ fontSize: 'var(--text-xs)' }}
            >
              Groq Vision
            </button>
            <button
              type="button"
              className={`btn btn-sm ${provider === 'ocr' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setProvider('ocr')}
              style={{ fontSize: 'var(--text-xs)' }}
            >
              Local OCR
            </button>
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.png,.jpg,.jpeg,.tiff,.tif"
            style={{ display: 'none' }}
          />

          {/* Drop zone */}
          <div
            className={`upload-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            aria-label="Upload documents"
            tabIndex={0}
          >
            <div className="upload-zone-icon">
              <Upload size={22} />
            </div>
            <div className="upload-zone-text">
              <span className="upload-zone-primary">Drop files here</span>
              <span className="upload-zone-secondary">or click to browse files</span>
            </div>
            <div className="upload-formats">PDF · JPG · PNG · TIFF · Max 50 MB</div>
          </div>

          {/* Uploaded files preview */}
          {selectedFiles.length > 0 && (
            <div className="upload-files-list">
              {selectedFiles.map((f, i) => (
                <motion.div
                  key={`${f.name}-${i}`}
                  className="upload-file-item"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <FileText size={14} style={{ color: 'var(--text-muted)' }} />
                  <span className="upload-file-name">{f.name}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>({formatFileSize(f.size)})</span>
                  <button type="button" onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}>
                    <X size={12} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Processing options */}
          <div className="upload-options">
            <div className="section-label">Processing Options</div>
            {[
              { key: 'autoLanguage', label: 'Detect language automatically' },
              { key: 'handwriting', label: 'Extract handwritten text' },
              { key: 'tables', label: 'Detect and extract tables' },
              { key: 'stamps', label: 'Detect stamps and seals' },
              { key: 'validation', label: 'Run validation after extraction' },
              { key: 'duplicates', label: 'Check for duplicate records' },
            ].map(opt => (
              <label key={opt.key} className="upload-option">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={options[opt.key as keyof typeof options]}
                  className={`option-checkbox ${options[opt.key as keyof typeof options] ? 'checked' : ''}`}
                  onClick={() => toggleOption(opt.key as keyof typeof options)}
                >
                  {options[opt.key as keyof typeof options] && <Check size={10} />}
                </button>
                <span>{opt.label}</span>
              </label>
            ))}
          </div>

          {/* Progress Stage Message */}
          {isUploading && progressStage && (
            <div style={{
              padding: '8px 12px', background: 'rgba(74, 124, 89, 0.1)',
              border: '1px solid rgba(74, 124, 89, 0.2)', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)', color: 'var(--accent-green-bright)',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <Loader size={13} className="animate-spin" />
              <span>{progressStage}</span>
            </div>
          )}

          {/* Start Processing Button */}
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={isUploading || selectedFiles.length === 0}
            onClick={handleStartProcessing}
          >
            {isUploading ? (
              <>
                <Loader size={15} className="animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Upload size={15} /> Start Processing
              </>
            )}
          </button>
        </div>

        {/* Documents list */}
        <div className="documents-list-panel">
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Recent Documents</span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
              </span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Location</th>
                  <th>Language</th>
                  <th>Pages</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th>Size</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No documents found matching your search query.
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((doc, i) => (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        if (doc.rawApiData) {
                          setActiveProcessResult(doc.rawApiData);
                        }
                        if (doc.extractedRecordId) {
                          setActiveRecord(doc.extractedRecordId);
                          navigate('/app/verification');
                        } else {
                          addToast('info', `Opening ${doc.filename}...`);
                        }
                      }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FileText size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                          <span style={{ fontWeight: 500, fontSize: 'var(--text-base)' }}>{doc.filename}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                          {doc.location.village}, {doc.location.district}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                          {LANG_LABELS[doc.language] || doc.language}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{doc.pages}</td>
                      <td>
                        {doc.confidence ? (
                          <span style={{
                            color: doc.confidence > 95 ? 'var(--status-verified)' : doc.confidence > 80 ? 'var(--text-secondary)' : 'var(--status-review)',
                            fontWeight: 500, fontSize: 'var(--text-sm)',
                          }}>
                            {doc.confidence}%
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_CLASS[doc.status]}`}>
                          {doc.status === 'processing' || doc.status === 'extracting' ? (
                            <Loader size={9} className="animate-spin" />
                          ) : null}
                          {STATUS_LABEL[doc.status]}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                        {formatFileSize(doc.fileSize)}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
