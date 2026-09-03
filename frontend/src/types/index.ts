// Core type definitions for Doc2Digital platform

export type DocumentStatus =
  | 'pending'
  | 'processing'
  | 'extracting'
  | 'validating'
  | 'needs_review'
  | 'verified'
  | 'error';

export type VerificationStatus = 'unverified' | 'partially_verified' | 'verified' | 'rejected';

export type LandType = 'agricultural' | 'residential' | 'commercial' | 'forest' | 'government' | 'waste';

export type Language =
  | 'hindi'
  | 'marathi'
  | 'english'
  | 'tamil'
  | 'telugu'
  | 'kannada'
  | 'bengali'
  | 'gujarati'
  | 'punjabi'
  | 'malayalam'
  | 'odia'
  | 'assamese'
  | 'urdu';

export type OwnershipType = 'individual' | 'joint' | 'government' | 'trust' | 'company';

export type ValidationSeverity = 'pass' | 'warning' | 'error';

export type UserRole =
  | 'administrator'
  | 'district_officer'
  | 'tehsil_officer'
  | 'verification_officer'
  | 'data_operator'
  | 'gis_analyst'
  | 'auditor';

export interface Document {
  id: string;
  filename: string;
  originalName: string;
  status: DocumentStatus;
  language: Language;
  pages: number;
  uploadedAt: string;
  processedAt?: string;
  confidence?: number;
  progress?: number;
  location: {
    village: string;
    tehsil: string;
    district: string;
    state: string;
  };
  extractedRecordId?: string;
  fileSize: number;
  mimeType: string;
  rawApiData?: ProcessResponse;
}

export interface LandRecord {
  id: string;
  documentId: string;
  status: VerificationStatus;
  confidence: number;
  land: {
    surveyNumber: string;
    khasraNumber: string;
    khataNumber: string;
    plotArea: number;
    areaUnit: 'ha' | 'acres' | 'sq_meters';
    landType: LandType;
    usage: string;
  };
  location: {
    village: string;
    tehsil: string;
    district: string;
    state: string;
    pincode?: string;
  };
  ownership: {
    ownerName: string;
    ownershipType: OwnershipType;
    sharePercentage?: number;
    aadharLinked?: boolean;
  };
  registration: {
    registrationNumber?: string;
    registrationDate?: string;
    registrationOffice?: string;
    deedType?: string;
  };
  mutation: MutationEntry[];
  validation: ValidationResult[];
  createdAt: string;
  updatedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  extractionMetadata?: ExtractionMetadata;
  complexity?: BackendComplexity;
  rawPages?: PageText[];
}

export interface MutationEntry {
  id: string;
  year: number;
  type: 'registration' | 'mutation' | 'transfer' | 'partition' | 'correction' | 'verification';
  description: string;
  officer?: string;
  notes?: string;
}

export interface ValidationResult {
  id: string;
  rule: string;
  result: ValidationSeverity;
  message: string;
  source: string;
  field?: string;
  action?: string;
}

export interface ExtractedField {
  fieldId: string;
  label: string;
  value: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
  };
  status: 'auto' | 'accepted' | 'edited' | 'rejected' | 'needs_review';
  originalValue?: string;
  editedValue?: string;
  suggestedValue?: string;
}

export interface ProcessingJob {
  id: string;
  documentId: string;
  document: Document;
  stage: ProcessingStage;
  progress: number;
  startedAt: string;
  estimatedCompletion?: string;
  stages: PipelineStage[];
}

export type ProcessingStage =
  | 'upload'
  | 'enhancement'
  | 'language_detection'
  | 'ocr'
  | 'handwriting'
  | 'field_extraction'
  | 'classification'
  | 'validation'
  | 'duplicate_detection'
  | 'verification'
  | 'complete';

export interface PipelineStage {
  id: ProcessingStage;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  duration?: number;
}

export interface KpiMetric {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  change?: number;
  changeLabel?: string;
  trend: 'up' | 'down' | 'neutral';
  positive: boolean;
}

export interface StateProgress {
  state: string;
  code: string;
  total: number;
  processed: number;
  verified: number;
  accuracy: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  district?: string;
  state?: string;
  avatar?: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  recordId?: string;
  documentId?: string;
  details?: string;
  ipAddress?: string;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync?: string;
  recordsSynced?: number;
  apiStatus: 'operational' | 'degraded' | 'down';
  icon: string;
}

export interface CommandItem {
  id: string;
  type: 'record' | 'document' | 'gis' | 'action' | 'navigation';
  title: string;
  subtitle?: string;
  location?: string;
  status?: string;
  action?: () => void;
  href?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  read: boolean;
}

// ═══════════════════════════════════════════
// BACKEND FASTAPI RESPONSE SCHEMAS
// ═══════════════════════════════════════════

export interface RecordField<T = string> {
  value: T;
  confidence: number;
}

export interface BackendRecord {
  district: RecordField;
  taluka: RecordField;
  village: RecordField;
  survey_number: RecordField;
  land_holding_type: RecordField;
  owner_name: RecordField;
  area: RecordField;
}

export interface FieldValidation {
  status: 'valid' | 'needs_review' | 'possible_error';
  confidence: number;
  extracted_value?: string;
  suggested_value?: string;
  reasons?: string[];
}

export interface BackendValidation {
  status: 'valid' | 'needs_review' | 'possible_error';
  fields: Record<string, FieldValidation>;
}

export interface ExtractionMetadata {
  source: 'gemini_vision' | 'groq_vision' | 'rule_based_ocr' | 'rule_based_ocr_fallback' | 'local_ocr';
  route: 'gemini' | 'groq' | 'ocr' | 'ai' | 'simple' | 'local_escalated_to_gemini';
  gemini_error?: string;
  groq_error?: string;
  fallback_reason?: string;
  escalation_reason?: string;
  extraction_coverage?: number;
}

export interface BackendComplexity {
  classification: 'simple' | 'complex';
  score: number;
  threshold: number;
  reasons: string[];
}

export interface PageText {
  page_number: number;
  text: string;
}

export interface ProcessResponse {
  message: string;
  document_id: string;
  filename: string;
  pages: PageText[];
  record: BackendRecord;
  validation: BackendValidation;
  extraction: ExtractionMetadata;
  complexity: BackendComplexity;
}

// ═══════════════════════════════════════════
// GIS & CADASTRAL PARCEL SCHEMAS
// ═══════════════════════════════════════════

export interface CadastralParcel {
  id: string;
  gat_number: string;
  gat_marathi: string;
  district: string;
  district_en: string;
  taluka: string;
  taluka_en: string;
  village: string;
  village_en: string;
  owner_name: string;
  owner_name_en: string;
  area_ha: number;
  area_guntha: number;
  area_acres: number;
  land_type: string;
  land_type_en: string;
  soil_class: string;
  status: 'verified' | 'needs_review' | 'unverified';
  record_id?: string | null;
  centroid: [number, number];
  bounds: [[number, number], [number, number]];
  village_code?: string;
  mutation_no?: string;
  crops?: string[];
  geojson: {
    type: 'Feature';
    properties: Record<string, any>;
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
  };
}

export interface GISSearchResponse {
  status: string;
  query: string;
  normalized_gat: string;
  marathi_gat: string;
  total_matches: number;
  parcels: CadastralParcel[];
}
