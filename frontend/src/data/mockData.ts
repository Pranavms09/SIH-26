import type { Document, LandRecord, KpiMetric, StateProgress, AuditEvent, Integration, User, CadastralParcel } from '../types';

export const mockDocuments: Document[] = [
  {
    id: 'doc-001',
    filename: 'Survey_Register_1987.pdf',
    originalName: 'Survey_Register_1987.pdf',
    status: 'processing',
    language: 'marathi',
    pages: 24,
    uploadedAt: '2026-08-31T08:12:00Z',
    confidence: 96.4,
    progress: 87,
    location: { village: 'Pimpri', tehsil: 'Haveli', district: 'Pune', state: 'Maharashtra' },
    fileSize: 4200000,
    mimeType: 'application/pdf',
  },
  {
    id: 'doc-002',
    filename: 'Khata_Register_Nashik_1994.pdf',
    originalName: 'Khata_Register_Nashik_1994.pdf',
    status: 'verified',
    language: 'marathi',
    pages: 18,
    uploadedAt: '2026-08-31T07:40:00Z',
    processedAt: '2026-08-31T09:01:00Z',
    confidence: 98.2,
    progress: 100,
    location: { village: 'Dindori', tehsil: 'Dindori', district: 'Nashik', state: 'Maharashtra' },
    extractedRecordId: 'LR-MH-2026-018492',
    fileSize: 3100000,
    mimeType: 'application/pdf',
  },
  {
    id: 'doc-003',
    filename: 'Mutation_Record_Nagpur_2003.tiff',
    originalName: 'Mutation_Record_Nagpur_2003.tiff',
    status: 'needs_review',
    language: 'hindi',
    pages: 6,
    uploadedAt: '2026-08-31T06:55:00Z',
    confidence: 72.1,
    progress: 100,
    location: { village: 'Kamptee', tehsil: 'Kamptee', district: 'Nagpur', state: 'Maharashtra' },
    fileSize: 8900000,
    mimeType: 'image/tiff',
  },
  {
    id: 'doc-004',
    filename: 'RoR_Extract_Satara_2001.pdf',
    originalName: 'RoR_Extract_Satara_2001.pdf',
    status: 'extracting',
    language: 'marathi',
    pages: 12,
    uploadedAt: '2026-08-31T09:22:00Z',
    confidence: 91.8,
    progress: 63,
    location: { village: 'Wai', tehsil: 'Wai', district: 'Satara', state: 'Maharashtra' },
    fileSize: 2800000,
    mimeType: 'application/pdf',
  },
  {
    id: 'doc-005',
    filename: 'Cadastral_Map_Kolhapur_1978.pdf',
    originalName: 'Cadastral_Map_Kolhapur_1978.pdf',
    status: 'error',
    language: 'marathi',
    pages: 3,
    uploadedAt: '2026-08-31T10:05:00Z',
    confidence: 38.2,
    progress: 40,
    location: { village: 'Hatkanangle', tehsil: 'Hatkanangle', district: 'Kolhapur', state: 'Maharashtra' },
    fileSize: 12000000,
    mimeType: 'application/pdf',
  },
  {
    id: 'doc-006',
    filename: 'Partition_Deed_Solapur_2009.pdf',
    originalName: 'Partition_Deed_Solapur_2009.pdf',
    status: 'verified',
    language: 'marathi',
    pages: 8,
    uploadedAt: '2026-08-31T05:30:00Z',
    processedAt: '2026-08-31T07:15:00Z',
    confidence: 97.9,
    progress: 100,
    location: { village: 'Pandharpur', tehsil: 'Pandharpur', district: 'Solapur', state: 'Maharashtra' },
    extractedRecordId: 'LR-MH-2026-018493',
    fileSize: 2200000,
    mimeType: 'application/pdf',
  },
  {
    id: 'doc-007',
    filename: 'Patta_Register_Tamil_2015.pdf',
    originalName: 'Patta_Register_Tamil_2015.pdf',
    status: 'verified',
    language: 'tamil',
    pages: 4,
    uploadedAt: '2026-08-30T14:20:00Z',
    processedAt: '2026-08-30T16:45:00Z',
    confidence: 99.1,
    progress: 100,
    location: { village: 'Thiruvallur', tehsil: 'Thiruvallur', district: 'Thiruvallur', state: 'Tamil Nadu' },
    extractedRecordId: 'LR-TN-2026-009821',
    fileSize: 1800000,
    mimeType: 'application/pdf',
  },
];

export const mockLandRecords: LandRecord[] = [
  {
    id: 'LR-MH-2026-018492',
    documentId: 'doc-002',
    status: 'verified',
    confidence: 98.2,
    land: {
      surveyNumber: '124/3A',
      khasraNumber: 'K-4821',
      khataNumber: 'KH-29382',
      plotArea: 2.48,
      areaUnit: 'ha',
      landType: 'agricultural',
      usage: 'Cultivation',
    },
    location: {
      village: 'Pimpri',
      tehsil: 'Haveli',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '411018',
    },
    ownership: {
      ownerName: 'Rajendra Patil',
      ownershipType: 'individual',
      sharePercentage: 100,
      aadharLinked: true,
    },
    registration: {
      registrationNumber: 'REG-MH-1987-004821',
      registrationDate: '1987-04-15',
      registrationOffice: 'Sub-Registrar Office, Haveli',
      deedType: 'Sale Deed',
    },
    mutation: [
      { id: 'm-1', year: 1987, type: 'registration', description: 'Original record created at Sub-Registrar Office, Haveli.', officer: 'Shri. Dattatray Kulkarni' },
      { id: 'm-2', year: 1996, type: 'mutation', description: 'Ownership updated following inheritance.', officer: 'Smt. Lalita Patil', notes: 'Mutation No. 482' },
      { id: 'm-3', year: 2008, type: 'mutation', description: 'Record modified — area correction.', officer: 'Shri. Pramod Jadhav' },
      { id: 'm-4', year: 2017, type: 'transfer', description: 'Partial ownership transferred to son.', officer: 'Shri. Anil Shinde', notes: 'Gift Deed registered' },
      { id: 'm-5', year: 2026, type: 'verification', description: 'Record digitally verified by Doc2Digital platform.', officer: 'System / Verification Officer Sunita Deshmukh' }
    ],
    validation: [
      { id: 'v-1', rule: 'Survey number format valid', result: 'pass', message: 'Survey number 124/3A matches expected format.', source: 'Format Validator' },
      { id: 'v-2', rule: 'Owner exists in registry', result: 'pass', message: 'Rajendra Patil found in State Land Registry.', source: 'Registry Lookup' },
      { id: 'v-3', rule: 'Village matches district', result: 'pass', message: 'Pimpri is correctly associated with Haveli, Pune.', source: 'GIS Validator' },
      { id: 'v-4', rule: 'Area matches cadastral data', result: 'pass', message: 'Area 2.48 ha matches cadastral record ±0.02 ha tolerance.', source: 'Cadastral DB' },
      { id: 'v-5', rule: 'Duplicate ownership record', result: 'warning', message: 'Possible duplicate ownership entry detected. Review recommended.', source: 'Deduplication Engine', action: 'Review' },
      { id: 'v-6', rule: 'Registration number', result: 'pass', message: 'Registration REG-MH-1987-004821 verified.', source: 'IGR Maharashtra' },
    ],
    createdAt: '2026-08-31T07:40:00Z',
    updatedAt: '2026-08-31T09:01:00Z',
    verifiedBy: 'Sunita Deshmukh',
    verifiedAt: '2026-08-31T09:01:00Z',
  },
  {
    id: 'LR-MH-2026-018493',
    documentId: 'doc-006',
    status: 'verified',
    confidence: 97.9,
    land: {
      surveyNumber: '88/2B',
      khasraNumber: 'K-1204',
      khataNumber: 'KH-11842',
      plotArea: 1.22,
      areaUnit: 'ha',
      landType: 'agricultural',
      usage: 'Cultivation',
    },
    location: {
      village: 'Pandharpur',
      tehsil: 'Pandharpur',
      district: 'Solapur',
      state: 'Maharashtra',
      pincode: '413304',
    },
    ownership: {
      ownerName: 'Mahesh Jadhav',
      ownershipType: 'joint',
      sharePercentage: 60,
      aadharLinked: false,
    },
    registration: {
      registrationNumber: 'REG-MH-2009-008214',
      registrationDate: '2009-11-20',
      registrationOffice: 'Sub-Registrar Office, Pandharpur',
      deedType: 'Partition Deed',
    },
    mutation: [
      { id: 'm-1', year: 2009, type: 'partition', description: 'Partition deed registered.', officer: 'Shri. Vinayak More' },
      { id: 'm-2', year: 2026, type: 'verification', description: 'Digitally verified.', officer: 'Doc2Digital / Mahesh Patil' }
    ],
    validation: [
      { id: 'v-1', rule: 'Survey number format valid', result: 'pass', message: 'Format valid.', source: 'Format Validator' },
      { id: 'v-2', rule: 'Owner exists in registry', result: 'pass', message: 'Mahesh Jadhav found.', source: 'Registry Lookup' },
      { id: 'v-3', rule: 'Village matches district', result: 'pass', message: 'Pandharpur ↔ Solapur validated.', source: 'GIS Validator' },
      { id: 'v-4', rule: 'Mutation requires review', result: 'warning', message: 'Joint ownership share total exceeds 100%.', source: 'Ownership Validator', action: 'Review' },
    ],
    createdAt: '2026-08-31T05:30:00Z',
    updatedAt: '2026-08-31T07:15:00Z',
    verifiedBy: 'Mahesh Patil',
    verifiedAt: '2026-08-31T07:15:00Z',
  },
  {
    id: 'LR-TN-2026-009821',
    documentId: 'doc-007',
    status: 'verified',
    confidence: 99.1,
    land: {
      surveyNumber: '312/1A',
      khasraNumber: 'K-0092',
      khataNumber: 'KH-00421',
      plotArea: 0.84,
      areaUnit: 'ha',
      landType: 'agricultural',
      usage: 'Paddy cultivation',
    },
    location: {
      village: 'Thiruvallur',
      tehsil: 'Thiruvallur',
      district: 'Thiruvallur',
      state: 'Tamil Nadu',
      pincode: '602001',
    },
    ownership: {
      ownerName: 'Murugesan Rajan',
      ownershipType: 'individual',
      sharePercentage: 100,
      aadharLinked: true,
    },
    registration: {
      registrationNumber: 'REG-TN-2015-001842',
      registrationDate: '2015-03-08',
      registrationOffice: 'Sub-Registrar Office, Thiruvallur',
      deedType: 'Patta',
    },
    mutation: [
      { id: 'm-1', year: 2015, type: 'registration', description: 'Patta issued.', officer: 'Thiru. R. Kannan' },
      { id: 'm-2', year: 2026, type: 'verification', description: 'Digitally verified.', officer: 'Doc2Digital' }
    ],
    validation: [
      { id: 'v-1', rule: 'Survey number format valid', result: 'pass', message: 'Format valid.', source: 'Format Validator' },
      { id: 'v-2', rule: 'Owner exists in registry', result: 'pass', message: 'Murugesan Rajan found in TNEGA.', source: 'Registry Lookup' },
      { id: 'v-3', rule: 'Village matches district', result: 'pass', message: 'Validated.', source: 'GIS Validator' },
    ],
    createdAt: '2026-08-30T14:20:00Z',
    updatedAt: '2026-08-30T16:45:00Z',
    verifiedBy: 'Doc2Digital Auto-Verification',
    verifiedAt: '2026-08-30T16:45:00Z',
  },
];

export const mockKpiMetrics: KpiMetric[] = [
  { id: 'docs-processed', label: 'Documents Processed', value: 128492, change: 12.8, changeLabel: 'this month', trend: 'up', positive: true },
  { id: 'extraction-accuracy', label: 'Extraction Accuracy', value: '96.8%', change: 2.4, changeLabel: 'vs last month', trend: 'up', positive: true },
  { id: 'needs-verification', label: 'Needs Verification', value: 1284, change: -18.2, changeLabel: 'from last week', trend: 'down', positive: true },
  { id: 'validation-success', label: 'Validation Success', value: '94.2%', change: 4.7, changeLabel: 'vs last month', trend: 'up', positive: true },
];

export const mockStateProgress: StateProgress[] = [
  { state: 'Maharashtra', code: 'MH', total: 38200, processed: 32482, verified: 28420, accuracy: 97.1 },
  { state: 'Uttar Pradesh', code: 'UP', total: 52000, processed: 28000, verified: 22400, accuracy: 94.8 },
  { state: 'Tamil Nadu', code: 'TN', total: 22400, processed: 18920, verified: 16482, accuracy: 96.2 },
  { state: 'Rajasthan', code: 'RJ', total: 31000, processed: 18200, verified: 14100, accuracy: 93.4 },
  { state: 'Karnataka', code: 'KA', total: 18200, processed: 14820, verified: 12800, accuracy: 95.7 },
  { state: 'Madhya Pradesh', code: 'MP', total: 24800, processed: 11200, verified: 9400, accuracy: 92.8 },
  { state: 'Gujarat', code: 'GJ', total: 14200, processed: 10820, verified: 9200, accuracy: 96.8 },
  { state: 'West Bengal', code: 'WB', total: 19200, processed: 8400, verified: 7100, accuracy: 94.1 },
];

export const mockDailyProcessing = [
  { date: 'Aug 24', documents: 3820, verified: 3480, accuracy: 96.2 },
  { date: 'Aug 25', documents: 4210, verified: 3920, accuracy: 97.1 },
  { date: 'Aug 26', documents: 3980, verified: 3720, accuracy: 96.8 },
  { date: 'Aug 27', documents: 4820, verified: 4420, accuracy: 95.9 },
  { date: 'Aug 28', documents: 5120, verified: 4810, accuracy: 97.4 },
  { date: 'Aug 29', documents: 4480, verified: 4120, accuracy: 96.6 },
  { date: 'Aug 30', documents: 5280, verified: 4920, accuracy: 97.8 },
  { date: 'Aug 31', documents: 4920, verified: 4600, accuracy: 97.2 },
];

export const mockLanguageDistribution = [
  { language: 'Marathi', count: 42820, percentage: 33.3 },
  { language: 'Hindi', count: 38400, percentage: 29.9 },
  { language: 'English', count: 18200, percentage: 14.2 },
  { language: 'Tamil', count: 12480, percentage: 9.7 },
  { language: 'Telugu', count: 8200, percentage: 6.4 },
  { language: 'Kannada', count: 4820, percentage: 3.7 },
  { language: 'Others', count: 3572, percentage: 2.8 },
];

export const mockErrorCategories = [
  { category: 'Poor Image Quality', count: 428, percentage: 32 },
  { category: 'Handwriting Recognition', count: 322, percentage: 24 },
  { category: 'Damaged Document', count: 241, percentage: 18 },
  { category: 'Field Ambiguity', count: 188, percentage: 14 },
  { category: 'Language Detection', count: 161, percentage: 12 },
];

export const mockAuditEvents: AuditEvent[] = [
  { id: 'ae-001', timestamp: '2026-08-31T10:42:00Z', actor: 'Sunita Deshmukh', actorRole: 'verification_officer', action: 'Verified survey number 124/3A', recordId: 'LR-MH-2026-018492', documentId: 'doc-002', details: 'Field accepted after manual review.', ipAddress: '10.0.1.42' },
  { id: 'ae-002', timestamp: '2026-08-31T10:38:00Z', actor: 'Doc2Digital System', actorRole: 'data_operator', action: 'AI extraction completed', recordId: 'LR-MH-2026-018492', documentId: 'doc-002', details: '18 fields extracted. Confidence: 98.2%', ipAddress: '10.0.0.1' },
  { id: 'ae-003', timestamp: '2026-08-31T10:35:00Z', actor: 'Rajesh Kumar', actorRole: 'data_operator', action: 'Document uploaded', documentId: 'doc-002', details: 'Khata_Register_Nashik_1994.pdf — 18 pages, 3.1 MB', ipAddress: '10.0.2.18' },
  { id: 'ae-004', timestamp: '2026-08-31T10:33:00Z', actor: 'Doc2Digital System', actorRole: 'data_operator', action: 'OCR processing completed', documentId: 'doc-002', details: 'Marathi text recognized. 24 bounding boxes detected.', ipAddress: '10.0.0.1' },
  { id: 'ae-005', timestamp: '2026-08-31T10:28:00Z', actor: 'Anil Sharma', actorRole: 'district_officer', action: 'Exported record to PDF', recordId: 'LR-MH-2026-018493', details: 'Export format: PDF/A — Archival', ipAddress: '10.0.3.88' },
  { id: 'ae-006', timestamp: '2026-08-31T09:55:00Z', actor: 'Kavita Bhor', actorRole: 'gis_analyst', action: 'GIS parcel boundary updated', recordId: 'LR-MH-2026-018492', details: 'Boundary synchronized with DILRMP GIS.', ipAddress: '10.0.4.11' },
  { id: 'ae-007', timestamp: '2026-08-31T09:12:00Z', actor: 'Sunita Deshmukh', actorRole: 'verification_officer', action: 'Rejected area field value', recordId: 'LR-MH-2026-018493', documentId: 'doc-006', details: 'AI value: 1.24 ha — Rejected. Correct value: 1.22 ha entered.', ipAddress: '10.0.1.42' },
];

export const mockIntegrations: Integration[] = [
  { id: 'lrms', name: 'LRMS', description: 'Land Record Management System — State integration', status: 'connected', lastSync: '2026-08-31T10:30:00Z', recordsSynced: 82400, apiStatus: 'operational', icon: 'Database' },
  { id: 'dilrmp', name: 'DILRMP', description: 'Digital India Land Records Modernisation Programme', status: 'connected', lastSync: '2026-08-31T09:15:00Z', recordsSynced: 64200, apiStatus: 'operational', icon: 'Globe' },
  { id: 'gis-server', name: 'GeoServer / PostGIS', description: 'Cadastral GIS layers and spatial data', status: 'connected', lastSync: '2026-08-31T10:45:00Z', recordsSynced: 28420, apiStatus: 'operational', icon: 'Map' },
  { id: 'igr', name: 'IGR Maharashtra', description: 'Inspector General of Registration — MH', status: 'syncing', lastSync: '2026-08-31T08:00:00Z', recordsSynced: 18200, apiStatus: 'operational', icon: 'FileText' },
  { id: 'nlrmp', name: 'NIC NLRMP', description: 'National Land Records Modernisation Programme', status: 'connected', lastSync: '2026-08-30T23:00:00Z', recordsSynced: 128000, apiStatus: 'operational', icon: 'Server' },
  { id: 'cersai', name: 'CERSAI', description: 'Central Registry of Securitisation Asset Reconstruction', status: 'disconnected', apiStatus: 'down', icon: 'ShieldAlert' },
];

export const mockUsers: User[] = [
  { id: 'u-001', name: 'Sunita Deshmukh', email: 'sunita.deshmukh@doc2digital.gov.in', role: 'verification_officer', district: 'Pune', state: 'Maharashtra', lastActive: '2026-08-31T10:42:00Z', status: 'active' },
  { id: 'u-002', name: 'Rajesh Kumar', email: 'rajesh.kumar@doc2digital.gov.in', role: 'data_operator', district: 'Nashik', state: 'Maharashtra', lastActive: '2026-08-31T10:35:00Z', status: 'active' },
  { id: 'u-003', name: 'Anil Sharma', email: 'anil.sharma@doc2digital.gov.in', role: 'district_officer', district: 'Nagpur', state: 'Maharashtra', lastActive: '2026-08-31T09:28:00Z', status: 'active' },
  { id: 'u-004', name: 'Kavita Bhor', email: 'kavita.bhor@doc2digital.gov.in', role: 'gis_analyst', district: 'Pune', state: 'Maharashtra', lastActive: '2026-08-31T09:55:00Z', status: 'active' },
  { id: 'u-005', name: 'Pradeep Mane', email: 'pradeep.mane@doc2digital.gov.in', role: 'tehsil_officer', district: 'Solapur', state: 'Maharashtra', lastActive: '2026-08-30T17:20:00Z', status: 'active' },
  { id: 'u-006', name: 'Rekha Nair', email: 'rekha.nair@doc2digital.gov.in', role: 'auditor', state: 'Maharashtra', lastActive: '2026-08-31T08:00:00Z', status: 'active' },
  { id: 'u-007', name: 'Vikram Singh', email: 'vikram.singh@doc2digital.gov.in', role: 'administrator', lastActive: '2026-08-31T07:30:00Z', status: 'active' },
];

export const mockExtractedFields = [
  { fieldId: 'survey_no', label: 'Survey Number', value: '124/3A', confidence: 99.4, status: 'accepted', boundingBox: { x: 0.42, y: 0.18, width: 0.12, height: 0.03, page: 1 } },
  { fieldId: 'khasra_no', label: 'Khasra Number', value: 'K-4821', confidence: 97.8, status: 'accepted', boundingBox: { x: 0.42, y: 0.24, width: 0.10, height: 0.03, page: 1 } },
  { fieldId: 'khata_no', label: 'Khata Number', value: 'KH-29382', confidence: 96.2, status: 'auto', boundingBox: { x: 0.42, y: 0.30, width: 0.12, height: 0.03, page: 1 } },
  { fieldId: 'plot_area', label: 'Plot Area', value: '2.48 ha', confidence: 78.4, status: 'needs_review', boundingBox: { x: 0.42, y: 0.36, width: 0.10, height: 0.03, page: 1 }, originalValue: '2.4B ha' },
  { fieldId: 'village', label: 'Village', value: 'Pimpri', confidence: 99.8, status: 'accepted', boundingBox: { x: 0.12, y: 0.48, width: 0.10, height: 0.03, page: 1 } },
  { fieldId: 'tehsil', label: 'Tehsil', value: 'Haveli', confidence: 99.2, status: 'accepted', boundingBox: { x: 0.12, y: 0.54, width: 0.09, height: 0.03, page: 1 } },
  { fieldId: 'district', label: 'District', value: 'Pune', confidence: 99.8, status: 'accepted', boundingBox: { x: 0.12, y: 0.60, width: 0.08, height: 0.03, page: 1 } },
  { fieldId: 'state', label: 'State', value: 'Maharashtra', confidence: 99.9, status: 'accepted', boundingBox: { x: 0.12, y: 0.66, width: 0.14, height: 0.03, page: 1 } },
  { fieldId: 'owner_name', label: 'Owner Name', value: 'Rajendra Patil', confidence: 98.7, status: 'accepted', boundingBox: { x: 0.25, y: 0.78, width: 0.18, height: 0.03, page: 1 } },
  { fieldId: 'ownership_type', label: 'Ownership Type', value: 'Individual', confidence: 95.4, status: 'auto', boundingBox: { x: 0.25, y: 0.84, width: 0.12, height: 0.03, page: 1 } },
  { fieldId: 'reg_number', label: 'Registration Number', value: 'REG-MH-1987-004821', confidence: 81.3, status: 'needs_review', boundingBox: { x: 0.42, y: 0.72, width: 0.24, height: 0.03, page: 2 } },
  { fieldId: 'mutation_date', label: 'Mutation Date', value: '15/04/1987', confidence: 72.1, status: 'needs_review', boundingBox: { x: 0.42, y: 0.78, width: 0.14, height: 0.03, page: 2 } },
];

export const mockCadastralParcels: CadastralParcel[] = [
  {
    "id": "parcel-vadgaon-233",
    "gat_number": "233",
    "gat_marathi": "२३३",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "दत्तात्रय पांडुरंग घारे",
    "owner_name_en": "Dattatray Pandurang Ghare",
    "area_ha": 1.62,
    "area_guntha": 162,
    "area_acres": 4.0,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000233",
    "centroid": [
      18.759,
      73.645
    ],
    "bounds": [
      [
        18.75803,
        73.64375
      ],
      [
        18.75997,
        73.64625
      ]
    ],
    "mutation_no": "फेरफार क्र. १०० (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-233",
        "gat_number": "233",
        "gat_marathi": "२३३",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "दत्तात्रय पांडुरंग घारे",
        "area_ha": 1.62
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.643916,
              18.758226
            ],
            [
              73.644792,
              18.758113
            ],
            [
              73.646,
              18.758274
            ],
            [
              73.646146,
              18.759242
            ],
            [
              73.645938,
              18.759839
            ],
            [
              73.644583,
              18.759806
            ],
            [
              73.643854,
              18.759323
            ],
            [
              73.643916,
              18.758226
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-234",
    "gat_number": "234",
    "gat_marathi": "२३४",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "मारुती विठ्ठल मराठे",
    "owner_name_en": "Maruti Vitthal Marathe",
    "area_ha": 2.74,
    "area_guntha": 274,
    "area_acres": 6.77,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000234",
    "centroid": [
      18.76,
      73.648
    ],
    "bounds": [
      [
        18.75882,
        73.6469
      ],
      [
        18.76118,
        73.6491
      ]
    ],
    "mutation_no": "फेरफार क्र. १०१ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-234",
        "gat_number": "234",
        "gat_marathi": "२३४",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "मारुती विठ्ठल मराठे",
        "area_ha": 2.74
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.647046,
              18.759055
            ],
            [
              73.647817,
              18.758917
            ],
            [
              73.64888,
              18.759114
            ],
            [
              73.649009,
              18.760295
            ],
            [
              73.648825,
              18.761023
            ],
            [
              73.647633,
              18.760984
            ],
            [
              73.646991,
              18.760394
            ],
            [
              73.647046,
              18.759055
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-235",
    "gat_number": "235",
    "gat_marathi": "२३५",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "सखाराम बाळू बोडके",
    "owner_name_en": "Sakharam Balu Bodke",
    "area_ha": 2.03,
    "area_guntha": 202,
    "area_acres": 5.02,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000235",
    "centroid": [
      18.761,
      73.651
    ],
    "bounds": [
      [
        18.76001,
        73.64966
      ],
      [
        18.76199,
        73.65234
      ]
    ],
    "mutation_no": "फेरफार क्र. १०२ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-235",
        "gat_number": "235",
        "gat_marathi": "२३५",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "सखाराम बाळू बोडके",
        "area_ha": 2.03
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.649838,
              18.760211
            ],
            [
              73.650776,
              18.760096
            ],
            [
              73.652073,
              18.76026
            ],
            [
              73.652229,
              18.761247
            ],
            [
              73.652006,
              18.761855
            ],
            [
              73.650553,
              18.761822
            ],
            [
              73.649771,
              18.761329
            ],
            [
              73.649838,
              18.760211
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-240",
    "gat_number": "240",
    "gat_marathi": "२४०",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "ज्ञानोबा नामदेव गाडे",
    "owner_name_en": "Dnyanoba Namdev Gade",
    "area_ha": 3.2,
    "area_guntha": 320,
    "area_acres": 7.91,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000240",
    "centroid": [
      18.762,
      73.654
    ],
    "bounds": [
      [
        18.76097,
        73.65297
      ],
      [
        18.76303,
        73.65503
      ]
    ],
    "mutation_no": "फेरफार क्र. १०३ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-240",
        "gat_number": "240",
        "gat_marathi": "२४०",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "ज्ञानोबा नामदेव गाडे",
        "area_ha": 3.2
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.653107,
              18.76118
            ],
            [
              73.653828,
              18.76106
            ],
            [
              73.654825,
              18.761231
            ],
            [
              73.654945,
              18.762256
            ],
            [
              73.654773,
              18.762889
            ],
            [
              73.653656,
              18.762855
            ],
            [
              73.653055,
              18.762342
            ],
            [
              73.653107,
              18.76118
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-241",
    "gat_number": "241",
    "gat_marathi": "२४१",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "अनंत लक्ष्मण सावंत",
    "owner_name_en": "Anant Laxman Sawant",
    "area_ha": 2.67,
    "area_guntha": 267,
    "area_acres": 6.6,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000241",
    "centroid": [
      18.757,
      73.649
    ],
    "bounds": [
      [
        18.75598,
        73.64797
      ],
      [
        18.75802,
        73.65003
      ]
    ],
    "mutation_no": "फेरफार क्र. १०४ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-241",
        "gat_number": "241",
        "gat_marathi": "२४१",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "अनंत लक्ष्मण सावंत",
        "area_ha": 2.67
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.648108,
              18.756184
            ],
            [
              73.648828,
              18.756065
            ],
            [
              73.649824,
              18.756235
            ],
            [
              73.649944,
              18.757255
            ],
            [
              73.649772,
              18.757884
            ],
            [
              73.648657,
              18.75785
            ],
            [
              73.648056,
              18.75734
            ],
            [
              73.648108,
              18.756184
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-242",
    "gat_number": "242",
    "gat_marathi": "२४२",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "पार्वतीबाई रामभाऊ कडू",
    "owner_name_en": "Parvatibai Rambhau Kadu",
    "area_ha": 2.5,
    "area_guntha": 250,
    "area_acres": 6.18,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000242",
    "centroid": [
      18.758,
      73.652
    ],
    "bounds": [
      [
        18.75697,
        73.65078
      ],
      [
        18.75903,
        73.65322
      ]
    ],
    "mutation_no": "फेरफार क्र. १०५ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-242",
        "gat_number": "242",
        "gat_marathi": "२४२",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "पार्वतीबाई रामभाऊ कडू",
        "area_ha": 2.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.650946,
              18.757179
            ],
            [
              73.651797,
              18.757059
            ],
            [
              73.652973,
              18.75723
            ],
            [
              73.653115,
              18.758257
            ],
            [
              73.652912,
              18.758889
            ],
            [
              73.651595,
              18.758855
            ],
            [
              73.650885,
              18.758342
            ],
            [
              73.650946,
              18.757179
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-244",
    "gat_number": "244",
    "gat_marathi": "२४४",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "तुकाराम किसन शेळके",
    "owner_name_en": "Tukaram Kisan Shelke",
    "area_ha": 3.11,
    "area_guntha": 311,
    "area_acres": 7.68,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000244",
    "centroid": [
      18.759,
      73.656
    ],
    "bounds": [
      [
        18.75804,
        73.65469
      ],
      [
        18.75996,
        73.65731
      ]
    ],
    "mutation_no": "फेरफार क्र. १०६ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-244",
        "gat_number": "244",
        "gat_marathi": "२४४",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "तुकाराम किसन शेळके",
        "area_ha": 3.11
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.654863,
              18.75823
            ],
            [
              73.655781,
              18.758118
            ],
            [
              73.657049,
              18.758279
            ],
            [
              73.657202,
              18.75924
            ],
            [
              73.656984,
              18.759834
            ],
            [
              73.655563,
              18.759802
            ],
            [
              73.654798,
              18.759321
            ],
            [
              73.654863,
              18.75823
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-245",
    "gat_number": "245",
    "gat_marathi": "२४५",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "बाबूराव महादू दळवी",
    "owner_name_en": "Baburao Mahadu Dalvi",
    "area_ha": 1.29,
    "area_guntha": 129,
    "area_acres": 3.19,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000245",
    "centroid": [
      18.76,
      73.659
    ],
    "bounds": [
      [
        18.75894,
        73.65773
      ],
      [
        18.76106,
        73.66027
      ]
    ],
    "mutation_no": "फेरफार क्र. १०७ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-245",
        "gat_number": "245",
        "gat_marathi": "२४५",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "बाबूराव महादू दळवी",
        "area_ha": 1.29
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.657898,
              18.75915
            ],
            [
              73.658788,
              18.759026
            ],
            [
              73.660017,
              18.759203
            ],
            [
              73.660165,
              18.760266
            ],
            [
              73.659953,
              18.76092
            ],
            [
              73.658576,
              18.760885
            ],
            [
              73.657835,
              18.760354
            ],
            [
              73.657898,
              18.75915
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-255",
    "gat_number": "255",
    "gat_marathi": "२५५",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "शंकर गणपत उंबरे",
    "owner_name_en": "Shankar Ganpat Umbare",
    "area_ha": 1.11,
    "area_guntha": 111,
    "area_acres": 2.74,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000255",
    "centroid": [
      18.761,
      73.662
    ],
    "bounds": [
      [
        18.75994,
        73.66064
      ],
      [
        18.76206,
        73.66336
      ]
    ],
    "mutation_no": "फेरफार क्र. १०८ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-255",
        "gat_number": "255",
        "gat_marathi": "२५५",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "शंकर गणपत उंबरे",
        "area_ha": 1.11
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.660817,
              18.760151
            ],
            [
              73.661773,
              18.760027
            ],
            [
              73.663092,
              18.760204
            ],
            [
              73.663251,
              18.761265
            ],
            [
              73.663023,
              18.76192
            ],
            [
              73.661545,
              18.761884
            ],
            [
              73.660749,
              18.761354
            ],
            [
              73.660817,
              18.760151
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-256",
    "gat_number": "256",
    "gat_marathi": "२५६",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "कमल सोपान शिंदे",
    "owner_name_en": "Kamal Sopan Shinde",
    "area_ha": 2.54,
    "area_guntha": 254,
    "area_acres": 6.28,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000256",
    "centroid": [
      18.76,
      73.665
    ],
    "bounds": [
      [
        18.75879,
        73.66395
      ],
      [
        18.76121,
        73.66605
      ]
    ],
    "mutation_no": "फेरफार क्र. १०९ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-256",
        "gat_number": "256",
        "gat_marathi": "२५६",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "कमल सोपान शिंदे",
        "area_ha": 2.54
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.664086,
              18.759029
            ],
            [
              73.664824,
              18.758887
            ],
            [
              73.665844,
              18.759089
            ],
            [
              73.665967,
              18.760304
            ],
            [
              73.665791,
              18.761052
            ],
            [
              73.664648,
              18.761012
            ],
            [
              73.664033,
              18.760405
            ],
            [
              73.664086,
              18.759029
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-257",
    "gat_number": "257",
    "gat_marathi": "२५७",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "संजय बबन जाधव",
    "owner_name_en": "Sanjay Baban Jadhav",
    "area_ha": 2.35,
    "area_guntha": 235,
    "area_acres": 5.81,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000257",
    "centroid": [
      18.759,
      73.668
    ],
    "bounds": [
      [
        18.75782,
        73.66669
      ],
      [
        18.76018,
        73.66931
      ]
    ],
    "mutation_no": "फेरफार क्र. ११० (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-257",
        "gat_number": "257",
        "gat_marathi": "२५७",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "संजय बबन जाधव",
        "area_ha": 2.35
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.666864,
              18.758057
            ],
            [
              73.667782,
              18.757919
            ],
            [
              73.669048,
              18.758116
            ],
            [
              73.669201,
              18.759295
            ],
            [
              73.668983,
              18.760022
            ],
            [
              73.667563,
              18.759982
            ],
            [
              73.666799,
              18.759393
            ],
            [
              73.666864,
              18.758057
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-265",
    "gat_number": "265",
    "gat_marathi": "२६५",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "विष्णू भिकाजी पिंगळे",
    "owner_name_en": "Vishnu Bhikaji Pingle",
    "area_ha": 2.4,
    "area_guntha": 240,
    "area_acres": 5.93,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000265",
    "centroid": [
      18.758,
      73.671
    ],
    "bounds": [
      [
        18.75693,
        73.66963
      ],
      [
        18.75907,
        73.67237
      ]
    ],
    "mutation_no": "फेरफार क्र. १११ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-265",
        "gat_number": "265",
        "gat_marathi": "२६५",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "विष्णू भिकाजी पिंगळे",
        "area_ha": 2.4
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.669812,
              18.757141
            ],
            [
              73.670772,
              18.757016
            ],
            [
              73.672096,
              18.757195
            ],
            [
              73.672256,
              18.758268
            ],
            [
              73.672028,
              18.75893
            ],
            [
              73.670543,
              18.758895
            ],
            [
              73.669744,
              18.758358
            ],
            [
              73.669812,
              18.757141
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-21",
    "gat_number": "21",
    "gat_marathi": "२१",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "रघुनाथ हरी भांगरे",
    "owner_name_en": "Raghunath Hari Bhangare",
    "area_ha": 3.26,
    "area_guntha": 326,
    "area_acres": 8.06,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000021",
    "centroid": [
      18.756,
      73.673
    ],
    "bounds": [
      [
        18.75485,
        73.67168
      ],
      [
        18.75715,
        73.67432
      ]
    ],
    "mutation_no": "फेरफार क्र. ११२ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-21",
        "gat_number": "21",
        "gat_marathi": "२१",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "रघुनाथ हरी भांगरे",
        "area_ha": 3.26
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.671857,
              18.755084
            ],
            [
              73.67278,
              18.75495
            ],
            [
              73.674055,
              18.755141
            ],
            [
              73.674209,
              18.756286
            ],
            [
              73.673989,
              18.756993
            ],
            [
              73.67256,
              18.756955
            ],
            [
              73.671791,
              18.756382
            ],
            [
              73.671857,
              18.755084
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-22",
    "gat_number": "22",
    "gat_marathi": "२२",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "लिलावती दिनकर मोरे",
    "owner_name_en": "Lilawati Dinkar More",
    "area_ha": 0.98,
    "area_guntha": 98,
    "area_acres": 2.42,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000022",
    "centroid": [
      18.755,
      73.676
    ],
    "bounds": [
      [
        18.75383,
        73.67477
      ],
      [
        18.75617,
        73.67723
      ]
    ],
    "mutation_no": "फेरफार क्र. ११३ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-22",
        "gat_number": "22",
        "gat_marathi": "२२",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "लिलावती दिनकर मोरे",
        "area_ha": 0.98
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.674936,
              18.754063
            ],
            [
              73.675795,
              18.753926
            ],
            [
              73.676982,
              18.754121
            ],
            [
              73.677126,
              18.755293
            ],
            [
              73.676921,
              18.756015
            ],
            [
              73.675591,
              18.755976
            ],
            [
              73.674874,
              18.75539
            ],
            [
              73.674936,
              18.754063
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-25",
    "gat_number": "25",
    "gat_marathi": "२५",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "सुभाष नारायण वाघमारे",
    "owner_name_en": "Subhash Narayan Waghmare",
    "area_ha": 1.07,
    "area_guntha": 107,
    "area_acres": 2.64,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000025",
    "centroid": [
      18.753,
      73.679
    ],
    "bounds": [
      [
        18.75195,
        73.6779
      ],
      [
        18.75405,
        73.6801
      ]
    ],
    "mutation_no": "फेरफार क्र. ११४ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-25",
        "gat_number": "25",
        "gat_marathi": "२५",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "सुभाष नारायण वाघमारे",
        "area_ha": 1.07
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.678045,
              18.752163
            ],
            [
              73.678816,
              18.75204
            ],
            [
              73.679882,
              18.752215
            ],
            [
              73.68001,
              18.753262
            ],
            [
              73.679827,
              18.753907
            ],
            [
              73.678633,
              18.753872
            ],
            [
              73.67799,
              18.753349
            ],
            [
              73.678045,
              18.752163
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-26",
    "gat_number": "26",
    "gat_marathi": "२६",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "दत्तात्रय पांडुरंग घारे",
    "owner_name_en": "Dattatray Pandurang Ghare",
    "area_ha": 1.63,
    "area_guntha": 163,
    "area_acres": 4.03,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000026",
    "centroid": [
      18.75,
      73.677
    ],
    "bounds": [
      [
        18.74901,
        73.6759
      ],
      [
        18.75099,
        73.6781
      ]
    ],
    "mutation_no": "फेरफार क्र. ११५ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-26",
        "gat_number": "26",
        "gat_marathi": "२६",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "दत्तात्रय पांडुरंग घारे",
        "area_ha": 1.63
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.676043,
              18.749208
            ],
            [
              73.676816,
              18.749092
            ],
            [
              73.677883,
              18.749257
            ],
            [
              73.678012,
              18.750248
            ],
            [
              73.677828,
              18.750858
            ],
            [
              73.676632,
              18.750825
            ],
            [
              73.675988,
              18.75033
            ],
            [
              73.676043,
              18.749208
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-27",
    "gat_number": "27",
    "gat_marathi": "२७",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "मारुती विठ्ठल मराठे",
    "owner_name_en": "Maruti Vitthal Marathe",
    "area_ha": 1.89,
    "area_guntha": 189,
    "area_acres": 4.67,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000027",
    "centroid": [
      18.748,
      73.68
    ],
    "bounds": [
      [
        18.74693,
        73.67875
      ],
      [
        18.74907,
        73.68125
      ]
    ],
    "mutation_no": "फेरफार क्र. ११६ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-27",
        "gat_number": "27",
        "gat_marathi": "२७",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "मारुती विठ्ठल मराठे",
        "area_ha": 1.89
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.678918,
              18.747144
            ],
            [
              73.679792,
              18.74702
            ],
            [
              73.680999,
              18.747198
            ],
            [
              73.681145,
              18.748267
            ],
            [
              73.680937,
              18.748927
            ],
            [
              73.679584,
              18.748891
            ],
            [
              73.678855,
              18.748356
            ],
            [
              73.678918,
              18.747144
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-28",
    "gat_number": "28",
    "gat_marathi": "२८",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "सखाराम बाळू बोडके",
    "owner_name_en": "Sakharam Balu Bodke",
    "area_ha": 3.47,
    "area_guntha": 347,
    "area_acres": 8.57,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000028",
    "centroid": [
      18.746,
      73.676
    ],
    "bounds": [
      [
        18.74496,
        73.6749
      ],
      [
        18.74704,
        73.6771
      ]
    ],
    "mutation_no": "फेरफार क्र. ११७ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-28",
        "gat_number": "28",
        "gat_marathi": "२८",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "सखाराम बाळू बोडके",
        "area_ha": 3.47
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.675051,
              18.745168
            ],
            [
              73.675817,
              18.745047
            ],
            [
              73.676876,
              18.74522
            ],
            [
              73.677004,
              18.74626
            ],
            [
              73.676822,
              18.746901
            ],
            [
              73.675635,
              18.746867
            ],
            [
              73.674996,
              18.746347
            ],
            [
              73.675051,
              18.745168
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-29",
    "gat_number": "29",
    "gat_marathi": "२९",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "ज्ञानोबा नामदेव गाडे",
    "owner_name_en": "Dnyanoba Namdev Gade",
    "area_ha": 1.33,
    "area_guntha": 133,
    "area_acres": 3.29,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000029",
    "centroid": [
      18.743,
      73.678
    ],
    "bounds": [
      [
        18.74186,
        73.67675
      ],
      [
        18.74414,
        73.67925
      ]
    ],
    "mutation_no": "फेरफार क्र. ११८ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-29",
        "gat_number": "29",
        "gat_marathi": "२९",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "ज्ञानोबा नामदेव गाडे",
        "area_ha": 1.33
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.676914,
              18.742086
            ],
            [
              73.677791,
              18.741952
            ],
            [
              73.679003,
              18.742143
            ],
            [
              73.679149,
              18.743286
            ],
            [
              73.67894,
              18.74399
            ],
            [
              73.677582,
              18.743952
            ],
            [
              73.676851,
              18.743381
            ],
            [
              73.676914,
              18.742086
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-30",
    "gat_number": "30",
    "gat_marathi": "३०",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "अनंत लक्ष्मण सावंत",
    "owner_name_en": "Anant Laxman Sawant",
    "area_ha": 1.91,
    "area_guntha": 191,
    "area_acres": 4.72,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000030",
    "centroid": [
      18.74,
      73.679
    ],
    "bounds": [
      [
        18.73899,
        73.67772
      ],
      [
        18.74101,
        73.68028
      ]
    ],
    "mutation_no": "फेरफार क्र. ११९ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-30",
        "gat_number": "30",
        "gat_marathi": "३०",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "अनंत लक्ष्मण सावंत",
        "area_ha": 1.91
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.677889,
              18.739193
            ],
            [
              73.678786,
              18.739075
            ],
            [
              73.680026,
              18.739243
            ],
            [
              73.680176,
              18.740252
            ],
            [
              73.679962,
              18.740874
            ],
            [
              73.678573,
              18.740841
            ],
            [
              73.677824,
              18.740336
            ],
            [
              73.677889,
              18.739193
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-31",
    "gat_number": "31",
    "gat_marathi": "३१",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "पार्वतीबाई रामभाऊ कडू",
    "owner_name_en": "Parvatibai Rambhau Kadu",
    "area_ha": 2.41,
    "area_guntha": 241,
    "area_acres": 5.96,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000031",
    "centroid": [
      18.737,
      73.677
    ],
    "bounds": [
      [
        18.73585,
        73.67562
      ],
      [
        18.73815,
        73.67838
      ]
    ],
    "mutation_no": "फेरफार क्र. १२० (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-31",
        "gat_number": "31",
        "gat_marathi": "३१",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "पार्वतीबाई रामभाऊ कडू",
        "area_ha": 2.41
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.675807,
              18.736078
            ],
            [
              73.676771,
              18.735944
            ],
            [
              73.678101,
              18.736136
            ],
            [
              73.678262,
              18.737288
            ],
            [
              73.678032,
              18.737998
            ],
            [
              73.676541,
              18.73796
            ],
            [
              73.675738,
              18.737384
            ],
            [
              73.675807,
              18.736078
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-49",
    "gat_number": "49",
    "gat_marathi": "४९",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "तुकाराम किसन शेळके",
    "owner_name_en": "Tukaram Kisan Shelke",
    "area_ha": 3.02,
    "area_guntha": 302,
    "area_acres": 7.46,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000049",
    "centroid": [
      18.741,
      73.673
    ],
    "bounds": [
      [
        18.73979,
        73.67173
      ],
      [
        18.74221,
        73.67427
      ]
    ],
    "mutation_no": "फेरफार क्र. १२१ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-49",
        "gat_number": "49",
        "gat_marathi": "४९",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "तुकाराम किसन शेळके",
        "area_ha": 3.02
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.671902,
              18.74003
            ],
            [
              73.672789,
              18.739888
            ],
            [
              73.674013,
              18.74009
            ],
            [
              73.674161,
              18.741303
            ],
            [
              73.67395,
              18.742051
            ],
            [
              73.672578,
              18.742011
            ],
            [
              73.671839,
              18.741404
            ],
            [
              73.671902,
              18.74003
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-78",
    "gat_number": "78",
    "gat_marathi": "७८",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "बाबूराव महादू दळवी",
    "owner_name_en": "Baburao Mahadu Dalvi",
    "area_ha": 1.73,
    "area_guntha": 173,
    "area_acres": 4.27,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000078",
    "centroid": [
      18.734,
      73.675
    ],
    "bounds": [
      [
        18.73303,
        73.6739
      ],
      [
        18.73497,
        73.6761
      ]
    ],
    "mutation_no": "फेरफार क्र. १२२ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-78",
        "gat_number": "78",
        "gat_marathi": "७८",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "बाबूराव महादू दळवी",
        "area_ha": 1.73
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.674045,
              18.733224
            ],
            [
              73.674816,
              18.733111
            ],
            [
              73.675882,
              18.733273
            ],
            [
              73.676011,
              18.734242
            ],
            [
              73.675827,
              18.73484
            ],
            [
              73.674633,
              18.734808
            ],
            [
              73.673989,
              18.734323
            ],
            [
              73.674045,
              18.733224
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-101",
    "gat_number": "101",
    "gat_marathi": "१०१",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "शंकर गणपत उंबरे",
    "owner_name_en": "Shankar Ganpat Umbare",
    "area_ha": 3.49,
    "area_guntha": 349,
    "area_acres": 8.62,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000101",
    "centroid": [
      18.732,
      73.678
    ],
    "bounds": [
      [
        18.73098,
        73.67688
      ],
      [
        18.73302,
        73.67912
      ]
    ],
    "mutation_no": "फेरफार क्र. १२३ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-101",
        "gat_number": "101",
        "gat_marathi": "१०१",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "शंकर गणपत उंबरे",
        "area_ha": 3.49
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.677032,
              18.731181
            ],
            [
              73.677814,
              18.731062
            ],
            [
              73.678893,
              18.731233
            ],
            [
              73.679023,
              18.732256
            ],
            [
              73.678837,
              18.732887
            ],
            [
              73.677628,
              18.732853
            ],
            [
              73.676977,
              18.732341
            ],
            [
              73.677032,
              18.731181
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-102",
    "gat_number": "102",
    "gat_marathi": "१०२",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "कमल सोपान शिंदे",
    "owner_name_en": "Kamal Sopan Shinde",
    "area_ha": 2.69,
    "area_guntha": 269,
    "area_acres": 6.65,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000102",
    "centroid": [
      18.73,
      73.681
    ],
    "bounds": [
      [
        18.72895,
        73.67966
      ],
      [
        18.73105,
        73.68234
      ]
    ],
    "mutation_no": "फेरफार क्र. १२४ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-102",
        "gat_number": "102",
        "gat_marathi": "१०२",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "कमल सोपान शिंदे",
        "area_ha": 2.69
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.679843,
              18.729156
            ],
            [
              73.680777,
              18.729033
            ],
            [
              73.682068,
              18.729209
            ],
            [
              73.682224,
              18.730264
            ],
            [
              73.682002,
              18.730914
            ],
            [
              73.680555,
              18.730879
            ],
            [
              73.679776,
              18.730351
            ],
            [
              73.679843,
              18.729156
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-108",
    "gat_number": "108",
    "gat_marathi": "१०८",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "संजय बबन जाधव",
    "owner_name_en": "Sanjay Baban Jadhav",
    "area_ha": 2.13,
    "area_guntha": 213,
    "area_acres": 5.26,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000108",
    "centroid": [
      18.727,
      73.683
    ],
    "bounds": [
      [
        18.72577,
        73.68184
      ],
      [
        18.72823,
        73.68416
      ]
    ],
    "mutation_no": "फेरफार क्र. १२५ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-108",
        "gat_number": "108",
        "gat_marathi": "१०८",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "संजय बबन जाधव",
        "area_ha": 2.13
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.681993,
              18.726013
            ],
            [
              73.682806,
              18.725868
            ],
            [
              73.68393,
              18.726074
            ],
            [
              73.684066,
              18.727309
            ],
            [
              73.683872,
              18.72807
            ],
            [
              73.682613,
              18.728029
            ],
            [
              73.681934,
              18.727411
            ],
            [
              73.681993,
              18.726013
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-112",
    "gat_number": "112",
    "gat_marathi": "११२",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "विष्णू भिकाजी पिंगळे",
    "owner_name_en": "Vishnu Bhikaji Pingle",
    "area_ha": 1.59,
    "area_guntha": 159,
    "area_acres": 3.93,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000112",
    "centroid": [
      18.724,
      73.68
    ],
    "bounds": [
      [
        18.72148,
        73.67832
      ],
      [
        18.72652,
        73.68168
      ]
    ],
    "mutation_no": "फेरफार क्र. १२६ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-112",
        "gat_number": "112",
        "gat_marathi": "११२",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "विष्णू भिकाजी पिंगळे",
        "area_ha": 1.59
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.678544,
              18.721984
            ],
            [
              73.67972,
              18.72169
            ],
            [
              73.681344,
              18.72211
            ],
            [
              73.68154,
              18.72463
            ],
            [
              73.68126,
              18.726184
            ],
            [
              73.67944,
              18.7261
            ],
            [
              73.67846,
              18.72484
            ],
            [
              73.678544,
              18.721984
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-248",
    "gat_number": "248",
    "gat_marathi": "२४८",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "रघुनाथ हरी भांगरे",
    "owner_name_en": "Raghunath Hari Bhangare",
    "area_ha": 1.59,
    "area_guntha": 159,
    "area_acres": 3.93,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000248",
    "centroid": [
      18.753,
      73.653
    ],
    "bounds": [
      [
        18.75187,
        73.65189
      ],
      [
        18.75413,
        73.65411
      ]
    ],
    "mutation_no": "फेरफार क्र. १२७ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-248",
        "gat_number": "248",
        "gat_marathi": "२४८",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "रघुनाथ हरी भांगरे",
        "area_ha": 1.59
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.652039,
              18.752097
            ],
            [
              73.652815,
              18.751966
            ],
            [
              73.653887,
              18.752154
            ],
            [
              73.654016,
              18.753282
            ],
            [
              73.653832,
              18.753978
            ],
            [
              73.65263,
              18.75394
            ],
            [
              73.651984,
              18.753376
            ],
            [
              73.652039,
              18.752097
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-249",
    "gat_number": "249",
    "gat_marathi": "२४९",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "लिलावती दिनकर मोरे",
    "owner_name_en": "Lilawati Dinkar More",
    "area_ha": 1.97,
    "area_guntha": 197,
    "area_acres": 4.87,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000249",
    "centroid": [
      18.754,
      73.657
    ],
    "bounds": [
      [
        18.75277,
        73.65577
      ],
      [
        18.75523,
        73.65823
      ]
    ],
    "mutation_no": "फेरफार क्र. १२८ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-249",
        "gat_number": "249",
        "gat_marathi": "२४९",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "लिलावती दिनकर मोरे",
        "area_ha": 1.97
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.655934,
              18.753017
            ],
            [
              73.656795,
              18.752873
            ],
            [
              73.657984,
              18.753078
            ],
            [
              73.658128,
              18.754307
            ],
            [
              73.657923,
              18.755065
            ],
            [
              73.65659,
              18.755024
            ],
            [
              73.655872,
              18.75441
            ],
            [
              73.655934,
              18.753017
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-250",
    "gat_number": "250",
    "gat_marathi": "२५०",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "सुभाष नारायण वाघमारे",
    "owner_name_en": "Subhash Narayan Waghmare",
    "area_ha": 2.28,
    "area_guntha": 227,
    "area_acres": 5.63,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000250",
    "centroid": [
      18.755,
      73.661
    ],
    "bounds": [
      [
        18.75374,
        73.6599
      ],
      [
        18.75626,
        73.6621
      ]
    ],
    "mutation_no": "फेरफार क्र. १२९ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-250",
        "gat_number": "250",
        "gat_marathi": "२५०",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "सुभाष नारायण वाघमारे",
        "area_ha": 2.28
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.660048,
              18.753993
            ],
            [
              73.660817,
              18.753846
            ],
            [
              73.661879,
              18.754056
            ],
            [
              73.662007,
              18.755315
            ],
            [
              73.661824,
              18.756091
            ],
            [
              73.660634,
              18.756049
            ],
            [
              73.659993,
              18.75542
            ],
            [
              73.660048,
              18.753993
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-270",
    "gat_number": "270",
    "gat_marathi": "२७०",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "दत्तात्रय पांडुरंग घारे",
    "owner_name_en": "Dattatray Pandurang Ghare",
    "area_ha": 1.16,
    "area_guntha": 115,
    "area_acres": 2.87,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000270",
    "centroid": [
      18.749,
      73.651
    ],
    "bounds": [
      [
        18.74803,
        73.64995
      ],
      [
        18.74997,
        73.65205
      ]
    ],
    "mutation_no": "फेरफार क्र. १३० (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-270",
        "gat_number": "270",
        "gat_marathi": "२७०",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "दत्तात्रय पांडुरंग घारे",
        "area_ha": 1.16
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.650088,
              18.748221
            ],
            [
              73.650825,
              18.748107
            ],
            [
              73.651842,
              18.748269
            ],
            [
              73.651965,
              18.749244
            ],
            [
              73.65179,
              18.749844
            ],
            [
              73.650649,
              18.749812
            ],
            [
              73.650035,
              18.749325
            ],
            [
              73.650088,
              18.748221
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-271",
    "gat_number": "271",
    "gat_marathi": "२७१",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "मारुती विठ्ठल मराठे",
    "owner_name_en": "Maruti Vitthal Marathe",
    "area_ha": 2.03,
    "area_guntha": 202,
    "area_acres": 5.02,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000271",
    "centroid": [
      18.75,
      73.656
    ],
    "bounds": [
      [
        18.7488,
        73.65475
      ],
      [
        18.7512,
        73.65725
      ]
    ],
    "mutation_no": "फेरफार क्र. १३१ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-271",
        "gat_number": "271",
        "gat_marathi": "२७१",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "मारुती विठ्ठल मराठे",
        "area_ha": 2.03
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.65492,
              18.749042
            ],
            [
              73.655792,
              18.748902
            ],
            [
              73.656997,
              18.749102
            ],
            [
              73.657142,
              18.750299
            ],
            [
              73.656934,
              18.751038
            ],
            [
              73.655585,
              18.750998
            ],
            [
              73.654858,
              18.750399
            ],
            [
              73.65492,
              18.749042
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-274",
    "gat_number": "274",
    "gat_marathi": "२७४",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "सखाराम बाळू बोडके",
    "owner_name_en": "Sakharam Balu Bodke",
    "area_ha": 3.64,
    "area_guntha": 364,
    "area_acres": 8.99,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000274",
    "centroid": [
      18.751,
      73.66
    ],
    "bounds": [
      [
        18.74993,
        73.65896
      ],
      [
        18.75207,
        73.66104
      ]
    ],
    "mutation_no": "फेरफार क्र. १३२ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-274",
        "gat_number": "274",
        "gat_marathi": "२७४",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "सखाराम बाळू बोडके",
        "area_ha": 3.64
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.659096,
              18.75014
            ],
            [
              73.659826,
              18.750015
            ],
            [
              73.660834,
              18.750194
            ],
            [
              73.660956,
              18.751269
            ],
            [
              73.660782,
              18.751931
            ],
            [
              73.659652,
              18.751895
            ],
            [
              73.659044,
              18.751358
            ],
            [
              73.659096,
              18.75014
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-5",
    "gat_number": "5",
    "gat_marathi": "५",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "ज्ञानोबा नामदेव गाडे",
    "owner_name_en": "Dnyanoba Namdev Gade",
    "area_ha": 3.26,
    "area_guntha": 326,
    "area_acres": 8.06,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000005",
    "centroid": [
      18.749,
      73.664
    ],
    "bounds": [
      [
        18.74775,
        73.66279
      ],
      [
        18.75025,
        73.66521
      ]
    ],
    "mutation_no": "फेरफार क्र. १३३ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-5",
        "gat_number": "5",
        "gat_marathi": "५",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "ज्ञानोबा नामदेव गाडे",
        "area_ha": 3.26
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.662951,
              18.747999
            ],
            [
              73.663798,
              18.747853
            ],
            [
              73.664968,
              18.748062
            ],
            [
              73.66511,
              18.749313
            ],
            [
              73.664908,
              18.750084
            ],
            [
              73.663597,
              18.750043
            ],
            [
              73.66289,
              18.749417
            ],
            [
              73.662951,
              18.747999
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-6",
    "gat_number": "6",
    "gat_marathi": "६",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "अनंत लक्ष्मण सावंत",
    "owner_name_en": "Anant Laxman Sawant",
    "area_ha": 2.76,
    "area_guntha": 276,
    "area_acres": 6.82,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000006",
    "centroid": [
      18.75,
      73.668
    ],
    "bounds": [
      [
        18.74882,
        73.66698
      ],
      [
        18.75118,
        73.66902
      ]
    ],
    "mutation_no": "फेरफार क्र. १३४ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-6",
        "gat_number": "6",
        "gat_marathi": "६",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "अनंत लक्ष्मण सावंत",
        "area_ha": 2.76
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.667112,
              18.749059
            ],
            [
              73.667829,
              18.748922
            ],
            [
              73.668819,
              18.749118
            ],
            [
              73.668939,
              18.750294
            ],
            [
              73.668768,
              18.751019
            ],
            [
              73.667659,
              18.75098
            ],
            [
              73.667061,
              18.750392
            ],
            [
              73.667112,
              18.749059
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-7",
    "gat_number": "7",
    "gat_marathi": "७",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "पार्वतीबाई रामभाऊ कडू",
    "owner_name_en": "Parvatibai Rambhau Kadu",
    "area_ha": 2.64,
    "area_guntha": 264,
    "area_acres": 6.52,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000007",
    "centroid": [
      18.747,
      73.671
    ],
    "bounds": [
      [
        18.74596,
        73.66979
      ],
      [
        18.74804,
        73.67221
      ]
    ],
    "mutation_no": "फेरफार क्र. १३५ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-7",
        "gat_number": "7",
        "gat_marathi": "७",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "पार्वतीबाई रामभाऊ कडू",
        "area_ha": 2.64
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.669948,
              18.746168
            ],
            [
              73.670798,
              18.746047
            ],
            [
              73.671971,
              18.74622
            ],
            [
              73.672112,
              18.74726
            ],
            [
              73.67191,
              18.747901
            ],
            [
              73.670596,
              18.747867
            ],
            [
              73.669888,
              18.747347
            ],
            [
              73.669948,
              18.746168
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-8",
    "gat_number": "8",
    "gat_marathi": "८",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "तुकाराम किसन शेळके",
    "owner_name_en": "Tukaram Kisan Shelke",
    "area_ha": 2.12,
    "area_guntha": 212,
    "area_acres": 5.24,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000008",
    "centroid": [
      18.745,
      73.667
    ],
    "bounds": [
      [
        18.74391,
        73.66594
      ],
      [
        18.74609,
        73.66806
      ]
    ],
    "mutation_no": "फेरफार क्र. १३६ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-8",
        "gat_number": "8",
        "gat_marathi": "८",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "तुकाराम किसन शेळके",
        "area_ha": 2.12
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.666081,
              18.744128
            ],
            [
              73.666823,
              18.744
            ],
            [
              73.667848,
              18.744182
            ],
            [
              73.667972,
              18.745273
            ],
            [
              73.667795,
              18.745945
            ],
            [
              73.666647,
              18.745909
            ],
            [
              73.666028,
              18.745363
            ],
            [
              73.666081,
              18.744128
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-40",
    "gat_number": "40",
    "gat_marathi": "४०",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "बाबूराव महादू दळवी",
    "owner_name_en": "Baburao Mahadu Dalvi",
    "area_ha": 1.59,
    "area_guntha": 159,
    "area_acres": 3.93,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000040",
    "centroid": [
      18.742,
      73.67
    ],
    "bounds": [
      [
        18.74078,
        73.66864
      ],
      [
        18.74322,
        73.67136
      ]
    ],
    "mutation_no": "फेरफार क्र. १३७ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-40",
        "gat_number": "40",
        "gat_marathi": "४०",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "बाबूराव महादू दळवी",
        "area_ha": 1.59
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.668818,
              18.741022
            ],
            [
              73.669773,
              18.740879
            ],
            [
              73.671091,
              18.741083
            ],
            [
              73.67125,
              18.742306
            ],
            [
              73.671023,
              18.74306
            ],
            [
              73.669546,
              18.743019
            ],
            [
              73.66875,
              18.742408
            ],
            [
              73.668818,
              18.741022
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-41",
    "gat_number": "41",
    "gat_marathi": "४१",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "शंकर गणपत उंबरे",
    "owner_name_en": "Shankar Ganpat Umbare",
    "area_ha": 3.41,
    "area_guntha": 341,
    "area_acres": 8.43,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000041",
    "centroid": [
      18.74,
      73.666
    ],
    "bounds": [
      [
        18.73899,
        73.6648
      ],
      [
        18.74101,
        73.6672
      ]
    ],
    "mutation_no": "फेरफार क्र. १३८ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-41",
        "gat_number": "41",
        "gat_marathi": "४१",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "शंकर गणपत उंबरे",
        "area_ha": 3.41
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.66496,
              18.739189
            ],
            [
              73.6658,
              18.739071
            ],
            [
              73.66696,
              18.73924
            ],
            [
              73.6671,
              18.740253
            ],
            [
              73.6669,
              18.740878
            ],
            [
              73.6656,
              18.740845
            ],
            [
              73.6649,
              18.740338
            ],
            [
              73.66496,
              18.739189
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-141",
    "gat_number": "141",
    "gat_marathi": "१४१",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "कमल सोपान शिंदे",
    "owner_name_en": "Kamal Sopan Shinde",
    "area_ha": 2.64,
    "area_guntha": 264,
    "area_acres": 6.52,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000141",
    "centroid": [
      18.739,
      73.66
    ],
    "bounds": [
      [
        18.73795,
        73.65867
      ],
      [
        18.74005,
        73.66133
      ]
    ],
    "mutation_no": "फेरफार क्र. १३९ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-141",
        "gat_number": "141",
        "gat_marathi": "१४१",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "कमल सोपान शिंदे",
        "area_ha": 2.64
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.658844,
              18.73816
            ],
            [
              73.659778,
              18.738038
            ],
            [
              73.661067,
              18.738213
            ],
            [
              73.661222,
              18.739262
            ],
            [
              73.661,
              18.73991
            ],
            [
              73.659556,
              18.739875
            ],
            [
              73.658778,
              18.73935
            ],
            [
              73.658844,
              18.73816
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-142",
    "gat_number": "142",
    "gat_marathi": "१४२",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "संजय बबन जाधव",
    "owner_name_en": "Sanjay Baban Jadhav",
    "area_ha": 2.99,
    "area_guntha": 299,
    "area_acres": 7.39,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000142",
    "centroid": [
      18.736,
      73.662
    ],
    "bounds": [
      [
        18.73499,
        73.66076
      ],
      [
        18.73701,
        73.66324
      ]
    ],
    "mutation_no": "फेरफार क्र. १४० (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-142",
        "gat_number": "142",
        "gat_marathi": "१४२",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "संजय बबन जाधव",
        "area_ha": 2.99
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.660926,
              18.735195
            ],
            [
              73.661793,
              18.735078
            ],
            [
              73.662991,
              18.735246
            ],
            [
              73.663136,
              18.736251
            ],
            [
              73.662929,
              18.736872
            ],
            [
              73.661587,
              18.736838
            ],
            [
              73.660864,
              18.736335
            ],
            [
              73.660926,
              18.735195
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-143",
    "gat_number": "143",
    "gat_marathi": "१४३",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "विष्णू भिकाजी पिंगळे",
    "owner_name_en": "Vishnu Bhikaji Pingle",
    "area_ha": 2.33,
    "area_guntha": 233,
    "area_acres": 5.76,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000143",
    "centroid": [
      18.733,
      73.664
    ],
    "bounds": [
      [
        18.73181,
        73.66279
      ],
      [
        18.73419,
        73.66521
      ]
    ],
    "mutation_no": "फेरफार क्र. १४१ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-143",
        "gat_number": "143",
        "gat_marathi": "१४३",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "विष्णू भिकाजी पिंगळे",
        "area_ha": 2.33
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.662948,
              18.732045
            ],
            [
              73.663798,
              18.731906
            ],
            [
              73.664971,
              18.732105
            ],
            [
              73.665113,
              18.733298
            ],
            [
              73.664911,
              18.734034
            ],
            [
              73.663595,
              18.733995
            ],
            [
              73.662887,
              18.733398
            ],
            [
              73.662948,
              18.732045
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-144",
    "gat_number": "144",
    "gat_marathi": "१४४",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "रघुनाथ हरी भांगरे",
    "owner_name_en": "Raghunath Hari Bhangare",
    "area_ha": 0.9,
    "area_guntha": 90,
    "area_acres": 2.22,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000144",
    "centroid": [
      18.73,
      73.661
    ],
    "bounds": [
      [
        18.72894,
        73.65998
      ],
      [
        18.73106,
        73.66202
      ]
    ],
    "mutation_no": "फेरफार क्र. १४२ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-144",
        "gat_number": "144",
        "gat_marathi": "१४४",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "रघुनाथ हरी भांगरे",
        "area_ha": 0.9
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.660116,
              18.729154
            ],
            [
              73.66083,
              18.729031
            ],
            [
              73.661816,
              18.729207
            ],
            [
              73.661935,
              18.730264
            ],
            [
              73.661765,
              18.730916
            ],
            [
              73.66066,
              18.730881
            ],
            [
              73.660065,
              18.730352
            ],
            [
              73.660116,
              18.729154
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-148",
    "gat_number": "148",
    "gat_marathi": "१४८",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "लिलावती दिनकर मोरे",
    "owner_name_en": "Lilawati Dinkar More",
    "area_ha": 3.2,
    "area_guntha": 320,
    "area_acres": 7.91,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000148",
    "centroid": [
      18.727,
      73.657
    ],
    "bounds": [
      [
        18.72448,
        73.65532
      ],
      [
        18.72952,
        73.65868
      ]
    ],
    "mutation_no": "फेरफार क्र. १४३ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-148",
        "gat_number": "148",
        "gat_marathi": "१४८",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "लिलावती दिनकर मोरे",
        "area_ha": 3.2
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.655544,
              18.724984
            ],
            [
              73.65672,
              18.72469
            ],
            [
              73.658344,
              18.72511
            ],
            [
              73.65854,
              18.72763
            ],
            [
              73.65826,
              18.729184
            ],
            [
              73.65644,
              18.7291
            ],
            [
              73.65546,
              18.72784
            ],
            [
              73.655544,
              18.724984
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-124",
    "gat_number": "124",
    "gat_marathi": "१२४",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "सुभाष नारायण वाघमारे",
    "owner_name_en": "Subhash Narayan Waghmare",
    "area_ha": 3.2,
    "area_guntha": 320,
    "area_acres": 7.91,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000124",
    "centroid": [
      18.724,
      73.653
    ],
    "bounds": [
      [
        18.72279,
        73.65166
      ],
      [
        18.72521,
        73.65434
      ]
    ],
    "mutation_no": "फेरफार क्र. १४४ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-124",
        "gat_number": "124",
        "gat_marathi": "१२४",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "सुभाष नारायण वाघमारे",
        "area_ha": 3.2
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.651842,
              18.723032
            ],
            [
              73.652777,
              18.722891
            ],
            [
              73.654069,
              18.723093
            ],
            [
              73.654225,
              18.724302
            ],
            [
              73.654002,
              18.725048
            ],
            [
              73.652555,
              18.725008
            ],
            [
              73.651775,
              18.724403
            ],
            [
              73.651842,
              18.723032
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-125",
    "gat_number": "125",
    "gat_marathi": "१२५",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "दत्तात्रय पांडुरंग घारे",
    "owner_name_en": "Dattatray Pandurang Ghare",
    "area_ha": 3.5,
    "area_guntha": 350,
    "area_acres": 8.65,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000125",
    "centroid": [
      18.722,
      73.656
    ],
    "bounds": [
      [
        18.72078,
        73.65496
      ],
      [
        18.72322,
        73.65704
      ]
    ],
    "mutation_no": "फेरफार क्र. १४५ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-125",
        "gat_number": "125",
        "gat_marathi": "१२५",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "दत्तात्रय पांडुरंग घारे",
        "area_ha": 3.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.655098,
              18.721021
            ],
            [
              73.655827,
              18.720879
            ],
            [
              73.656833,
              18.721082
            ],
            [
              73.656954,
              18.722306
            ],
            [
              73.656781,
              18.72306
            ],
            [
              73.655653,
              18.72302
            ],
            [
              73.655046,
              18.722408
            ],
            [
              73.655098,
              18.721021
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-126",
    "gat_number": "126",
    "gat_marathi": "१२६",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "मारुती विठ्ठल मराठे",
    "owner_name_en": "Maruti Vitthal Marathe",
    "area_ha": 1.04,
    "area_guntha": 104,
    "area_acres": 2.57,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000126",
    "centroid": [
      18.72,
      73.66
    ],
    "bounds": [
      [
        18.71889,
        73.65895
      ],
      [
        18.72111,
        73.66105
      ]
    ],
    "mutation_no": "फेरफार क्र. १४६ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-126",
        "gat_number": "126",
        "gat_marathi": "१२६",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "मारुती विठ्ठल मराठे",
        "area_ha": 1.04
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.659089,
              18.719115
            ],
            [
              73.659825,
              18.718986
            ],
            [
              73.660841,
              18.719171
            ],
            [
              73.660963,
              18.720276
            ],
            [
              73.660788,
              18.720958
            ],
            [
              73.65965,
              18.720921
            ],
            [
              73.659037,
              18.720369
            ],
            [
              73.659089,
              18.719115
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-127",
    "gat_number": "127",
    "gat_marathi": "१२७",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "सखाराम बाळू बोडके",
    "owner_name_en": "Sakharam Balu Bodke",
    "area_ha": 1.21,
    "area_guntha": 121,
    "area_acres": 2.99,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000127",
    "centroid": [
      18.718,
      73.663
    ],
    "bounds": [
      [
        18.71681,
        73.66171
      ],
      [
        18.71919,
        73.66429
      ]
    ],
    "mutation_no": "फेरफार क्र. १४७ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-127",
        "gat_number": "127",
        "gat_marathi": "१२७",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "सखाराम बाळू बोडके",
        "area_ha": 1.21
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.661879,
              18.717048
            ],
            [
              73.662784,
              18.716909
            ],
            [
              73.664035,
              18.717108
            ],
            [
              73.664186,
              18.718297
            ],
            [
              73.66397,
              18.719031
            ],
            [
              73.662569,
              18.718991
            ],
            [
              73.661814,
              18.718397
            ],
            [
              73.661879,
              18.717048
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-128",
    "gat_number": "128",
    "gat_marathi": "१२८",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "ज्ञानोबा नामदेव गाडे",
    "owner_name_en": "Dnyanoba Namdev Gade",
    "area_ha": 1.59,
    "area_guntha": 159,
    "area_acres": 3.93,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000128",
    "centroid": [
      18.716,
      73.658
    ],
    "bounds": [
      [
        18.71488,
        73.65681
      ],
      [
        18.71712,
        73.65919
      ]
    ],
    "mutation_no": "फेरफार क्र. १४८ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-128",
        "gat_number": "128",
        "gat_marathi": "१२८",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "ज्ञानोबा नामदेव गाडे",
        "area_ha": 1.59
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.656968,
              18.7151
            ],
            [
              73.657801,
              18.714969
            ],
            [
              73.658953,
              18.715156
            ],
            [
              73.659092,
              18.716281
            ],
            [
              73.658893,
              18.716975
            ],
            [
              73.657603,
              18.716937
            ],
            [
              73.656908,
              18.716375
            ],
            [
              73.656968,
              18.7151
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-118",
    "gat_number": "118",
    "gat_marathi": "११८",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "अनंत लक्ष्मण सावंत",
    "owner_name_en": "Anant Laxman Sawant",
    "area_ha": 1.44,
    "area_guntha": 144,
    "area_acres": 3.56,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000118",
    "centroid": [
      18.716,
      73.666
    ],
    "bounds": [
      [
        18.71491,
        73.66467
      ],
      [
        18.71709,
        73.66733
      ]
    ],
    "mutation_no": "फेरफार क्र. १४९ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-118",
        "gat_number": "118",
        "gat_marathi": "११८",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "अनंत लक्ष्मण सावंत",
        "area_ha": 1.44
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.664844,
              18.71513
            ],
            [
              73.665778,
              18.715004
            ],
            [
              73.667067,
              18.715185
            ],
            [
              73.667223,
              18.716272
            ],
            [
              73.667001,
              18.716942
            ],
            [
              73.665555,
              18.716906
            ],
            [
              73.664777,
              18.716362
            ],
            [
              73.664844,
              18.71513
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-119",
    "gat_number": "119",
    "gat_marathi": "११९",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "पार्वतीबाई रामभाऊ कडू",
    "owner_name_en": "Parvatibai Rambhau Kadu",
    "area_ha": 1.41,
    "area_guntha": 141,
    "area_acres": 3.48,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000119",
    "centroid": [
      18.714,
      73.669
    ],
    "bounds": [
      [
        18.71282,
        73.66779
      ],
      [
        18.71518,
        73.67021
      ]
    ],
    "mutation_no": "फेरफार क्र. १५० (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-119",
        "gat_number": "119",
        "gat_marathi": "११९",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "पार्वतीबाई रामभाऊ कडू",
        "area_ha": 1.41
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.667948,
              18.713057
            ],
            [
              73.668798,
              18.712919
            ],
            [
              73.669971,
              18.713116
            ],
            [
              73.670113,
              18.714295
            ],
            [
              73.669911,
              18.715022
            ],
            [
              73.668595,
              18.714982
            ],
            [
              73.667887,
              18.714393
            ],
            [
              73.667948,
              18.713057
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-120",
    "gat_number": "120",
    "gat_marathi": "१२०",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "तुकाराम किसन शेळके",
    "owner_name_en": "Tukaram Kisan Shelke",
    "area_ha": 2.67,
    "area_guntha": 267,
    "area_acres": 6.6,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000120",
    "centroid": [
      18.711,
      73.671
    ],
    "bounds": [
      [
        18.70974,
        73.66987
      ],
      [
        18.71226,
        73.67213
      ]
    ],
    "mutation_no": "फेरफार क्र. १५१ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-120",
        "gat_number": "120",
        "gat_marathi": "१२०",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "तुकाराम किसन शेळके",
        "area_ha": 2.67
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.670019,
              18.709993
            ],
            [
              73.670811,
              18.709846
            ],
            [
              73.671906,
              18.710056
            ],
            [
              73.672038,
              18.711315
            ],
            [
              73.671849,
              18.712091
            ],
            [
              73.670623,
              18.712049
            ],
            [
              73.669962,
              18.71142
            ],
            [
              73.670019,
              18.709993
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-121",
    "gat_number": "121",
    "gat_marathi": "१२१",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "बाबूराव महादू दळवी",
    "owner_name_en": "Baburao Mahadu Dalvi",
    "area_ha": 1.19,
    "area_guntha": 119,
    "area_acres": 2.94,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000121",
    "centroid": [
      18.708,
      73.673
    ],
    "bounds": [
      [
        18.70688,
        73.67182
      ],
      [
        18.70912,
        73.67418
      ]
    ],
    "mutation_no": "फेरफार क्र. १५२ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-121",
        "gat_number": "121",
        "gat_marathi": "१२१",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "बाबूराव महादू दळवी",
        "area_ha": 1.19
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.671979,
              18.707108
            ],
            [
              73.672804,
              18.706978
            ],
            [
              73.673942,
              18.707164
            ],
            [
              73.67408,
              18.708279
            ],
            [
              73.673883,
              18.708967
            ],
            [
              73.672607,
              18.708929
            ],
            [
              73.67192,
              18.708372
            ],
            [
              73.671979,
              18.707108
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-122",
    "gat_number": "122",
    "gat_marathi": "१२२",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "शंकर गणपत उंबरे",
    "owner_name_en": "Shankar Ganpat Umbare",
    "area_ha": 2.5,
    "area_guntha": 250,
    "area_acres": 6.18,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000122",
    "centroid": [
      18.712,
      73.66
    ],
    "bounds": [
      [
        18.71094,
        73.6589
      ],
      [
        18.71306,
        73.6611
      ]
    ],
    "mutation_no": "फेरफार क्र. १५३ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-122",
        "gat_number": "122",
        "gat_marathi": "१२२",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "शंकर गणपत उंबरे",
        "area_ha": 2.5
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.659046,
              18.711151
            ],
            [
              73.659817,
              18.711027
            ],
            [
              73.660881,
              18.711204
            ],
            [
              73.661009,
              18.712265
            ],
            [
              73.660826,
              18.71292
            ],
            [
              73.659633,
              18.712885
            ],
            [
              73.658991,
              18.712354
            ],
            [
              73.659046,
              18.711151
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-224",
    "gat_number": "224",
    "gat_marathi": "२२४",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "कमल सोपान शिंदे",
    "owner_name_en": "Kamal Sopan Shinde",
    "area_ha": 1.49,
    "area_guntha": 149,
    "area_acres": 3.68,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000224",
    "centroid": [
      18.752,
      73.643
    ],
    "bounds": [
      [
        18.74948,
        73.64132
      ],
      [
        18.75452,
        73.64468
      ]
    ],
    "mutation_no": "फेरफार क्र. १५४ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-224",
        "gat_number": "224",
        "gat_marathi": "२२४",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "कमल सोपान शिंदे",
        "area_ha": 1.49
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.641544,
              18.749984
            ],
            [
              73.64272,
              18.74969
            ],
            [
              73.644344,
              18.75011
            ],
            [
              73.64454,
              18.75263
            ],
            [
              73.64426,
              18.754184
            ],
            [
              73.64244,
              18.7541
            ],
            [
              73.64146,
              18.75284
            ],
            [
              73.641544,
              18.749984
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-217",
    "gat_number": "217",
    "gat_marathi": "२१७",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "संजय बबन जाधव",
    "owner_name_en": "Sanjay Baban Jadhav",
    "area_ha": 2.62,
    "area_guntha": 262,
    "area_acres": 6.47,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000217",
    "centroid": [
      18.747,
      73.641
    ],
    "bounds": [
      [
        18.74602,
        73.6399
      ],
      [
        18.74798,
        73.6421
      ]
    ],
    "mutation_no": "फेरफार क्र. १५५ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-217",
        "gat_number": "217",
        "gat_marathi": "२१७",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "संजय बबन जाधव",
        "area_ha": 2.62
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.640047,
              18.746215
            ],
            [
              73.640817,
              18.7461
            ],
            [
              73.641879,
              18.746264
            ],
            [
              73.642008,
              18.747245
            ],
            [
              73.641824,
              18.74785
            ],
            [
              73.640634,
              18.747818
            ],
            [
              73.639992,
              18.747327
            ],
            [
              73.640047,
              18.746215
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-218",
    "gat_number": "218",
    "gat_marathi": "२१८",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "विष्णू भिकाजी पिंगळे",
    "owner_name_en": "Vishnu Bhikaji Pingle",
    "area_ha": 3.26,
    "area_guntha": 326,
    "area_acres": 8.06,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000218",
    "centroid": [
      18.744,
      73.645
    ],
    "bounds": [
      [
        18.74277,
        73.6439
      ],
      [
        18.74523,
        73.6461
      ]
    ],
    "mutation_no": "फेरफार क्र. १५६ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-218",
        "gat_number": "218",
        "gat_marathi": "२१८",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "विष्णू भिकाजी पिंगळे",
        "area_ha": 3.26
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.644045,
              18.743015
            ],
            [
              73.644816,
              18.742871
            ],
            [
              73.645882,
              18.743076
            ],
            [
              73.646011,
              18.744308
            ],
            [
              73.645827,
              18.745067
            ],
            [
              73.644633,
              18.745026
            ],
            [
              73.643989,
              18.744411
            ],
            [
              73.644045,
              18.743015
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-221",
    "gat_number": "221",
    "gat_marathi": "२२१",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "रघुनाथ हरी भांगरे",
    "owner_name_en": "Raghunath Hari Bhangare",
    "area_ha": 2.72,
    "area_guntha": 272,
    "area_acres": 6.72,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000221",
    "centroid": [
      18.742,
      73.648
    ],
    "bounds": [
      [
        18.74097,
        73.64695
      ],
      [
        18.74303,
        73.64905
      ]
    ],
    "mutation_no": "फेरफार क्र. १५७ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-221",
        "gat_number": "221",
        "gat_marathi": "२२१",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "रघुनाथ हरी भांगरे",
        "area_ha": 2.72
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.647094,
              18.741175
            ],
            [
              73.647826,
              18.741055
            ],
            [
              73.648836,
              18.741226
            ],
            [
              73.648958,
              18.742258
            ],
            [
              73.648784,
              18.742894
            ],
            [
              73.647651,
              18.74286
            ],
            [
              73.647042,
              18.742344
            ],
            [
              73.647094,
              18.741175
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-194",
    "gat_number": "194",
    "gat_marathi": "१९४",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "लिलावती दिनकर मोरे",
    "owner_name_en": "Lilawati Dinkar More",
    "area_ha": 3.47,
    "area_guntha": 347,
    "area_acres": 8.57,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000194",
    "centroid": [
      18.742,
      73.652
    ],
    "bounds": [
      [
        18.741,
        73.6509
      ],
      [
        18.743,
        73.6531
      ]
    ],
    "mutation_no": "फेरफार क्र. १५८ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-194",
        "gat_number": "194",
        "gat_marathi": "१९४",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "लिलावती दिनकर मोरे",
        "area_ha": 3.47
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.651049,
              18.7412
            ],
            [
              73.651817,
              18.741084
            ],
            [
              73.652878,
              18.74125
            ],
            [
              73.653006,
              18.74225
            ],
            [
              73.652823,
              18.742866
            ],
            [
              73.651634,
              18.742833
            ],
            [
              73.650994,
              18.742333
            ],
            [
              73.651049,
              18.7412
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-197",
    "gat_number": "197",
    "gat_marathi": "१९७",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "सुभाष नारायण वाघमारे",
    "owner_name_en": "Subhash Narayan Waghmare",
    "area_ha": 3.05,
    "area_guntha": 305,
    "area_acres": 7.54,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000197",
    "centroid": [
      18.738,
      73.649
    ],
    "bounds": [
      [
        18.7369,
        73.64777
      ],
      [
        18.7391,
        73.65023
      ]
    ],
    "mutation_no": "फेरफार क्र. १५९ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-197",
        "gat_number": "197",
        "gat_marathi": "१९७",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "सुभाष नारायण वाघमारे",
        "area_ha": 3.05
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.647938,
              18.737119
            ],
            [
              73.648796,
              18.73699
            ],
            [
              73.64998,
              18.737174
            ],
            [
              73.650123,
              18.738275
            ],
            [
              73.649919,
              18.738955
            ],
            [
              73.648591,
              18.738918
            ],
            [
              73.647877,
              18.738367
            ],
            [
              73.647938,
              18.737119
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-198",
    "gat_number": "198",
    "gat_marathi": "१९८",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "दत्तात्रय पांडुरंग घारे",
    "owner_name_en": "Dattatray Pandurang Ghare",
    "area_ha": 1.12,
    "area_guntha": 112,
    "area_acres": 2.77,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000198",
    "centroid": [
      18.736,
      73.646
    ],
    "bounds": [
      [
        18.73498,
        73.64469
      ],
      [
        18.73702,
        73.64731
      ]
    ],
    "mutation_no": "फेरफार क्र. १६० (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-198",
        "gat_number": "198",
        "gat_marathi": "१९८",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "दत्तात्रय पांडुरंग घारे",
        "area_ha": 1.12
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.644864,
              18.735186
            ],
            [
              73.645782,
              18.735068
            ],
            [
              73.647049,
              18.735237
            ],
            [
              73.647201,
              18.736254
            ],
            [
              73.646983,
              18.736882
            ],
            [
              73.645563,
              18.736848
            ],
            [
              73.644799,
              18.736339
            ],
            [
              73.644864,
              18.735186
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-161",
    "gat_number": "161",
    "gat_marathi": "१६१",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "मारुती विठ्ठल मराठे",
    "owner_name_en": "Maruti Vitthal Marathe",
    "area_ha": 2.16,
    "area_guntha": 216,
    "area_acres": 5.34,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000161",
    "centroid": [
      18.734,
      73.64
    ],
    "bounds": [
      [
        18.73291,
        73.63882
      ],
      [
        18.73509,
        73.64118
      ]
    ],
    "mutation_no": "फेरफार क्र. १६१ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-161",
        "gat_number": "161",
        "gat_marathi": "१६१",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "मारुती विठ्ठल मराठे",
        "area_ha": 2.16
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.638982,
              18.73313
            ],
            [
              73.639804,
              18.733004
            ],
            [
              73.64094,
              18.733185
            ],
            [
              73.641077,
              18.734272
            ],
            [
              73.640881,
              18.734942
            ],
            [
              73.639608,
              18.734906
            ],
            [
              73.638923,
              18.734362
            ],
            [
              73.638982,
              18.73313
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-162",
    "gat_number": "162",
    "gat_marathi": "१६२",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "सखाराम बाळू बोडके",
    "owner_name_en": "Sakharam Balu Bodke",
    "area_ha": 3.61,
    "area_guntha": 361,
    "area_acres": 8.92,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000162",
    "centroid": [
      18.732,
      73.637
    ],
    "bounds": [
      [
        18.73084,
        73.63572
      ],
      [
        18.73316,
        73.63828
      ]
    ],
    "mutation_no": "फेरफार क्र. १६२ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-162",
        "gat_number": "162",
        "gat_marathi": "१६२",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "सखाराम बाळू बोडके",
        "area_ha": 3.61
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.635889,
              18.73107
            ],
            [
              73.636786,
              18.730935
            ],
            [
              73.638026,
              18.731128
            ],
            [
              73.638176,
              18.732291
            ],
            [
              73.637962,
              18.733007
            ],
            [
              73.636573,
              18.732968
            ],
            [
              73.635824,
              18.732387
            ],
            [
              73.635889,
              18.73107
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-166",
    "gat_number": "166",
    "gat_marathi": "१६६",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "ज्ञानोबा नामदेव गाडे",
    "owner_name_en": "Dnyanoba Namdev Gade",
    "area_ha": 1.8,
    "area_guntha": 180,
    "area_acres": 4.45,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000166",
    "centroid": [
      18.729,
      73.643
    ],
    "bounds": [
      [
        18.72792,
        73.64194
      ],
      [
        18.73008,
        73.64406
      ]
    ],
    "mutation_no": "फेरफार क्र. १६३ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-166",
        "gat_number": "166",
        "gat_marathi": "१६६",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "ज्ञानोबा नामदेव गाडे",
        "area_ha": 1.8
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.642085,
              18.728135
            ],
            [
              73.642824,
              18.728009
            ],
            [
              73.643844,
              18.728189
            ],
            [
              73.643967,
              18.72927
            ],
            [
              73.643792,
              18.729937
            ],
            [
              73.642648,
              18.729901
            ],
            [
              73.642033,
              18.72936
            ],
            [
              73.642085,
              18.728135
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-170",
    "gat_number": "170",
    "gat_marathi": "१७०",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "अनंत लक्ष्मण सावंत",
    "owner_name_en": "Anant Laxman Sawant",
    "area_ha": 1.38,
    "area_guntha": 138,
    "area_acres": 3.41,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000170",
    "centroid": [
      18.726,
      73.646
    ],
    "bounds": [
      [
        18.72497,
        73.64467
      ],
      [
        18.72703,
        73.64733
      ]
    ],
    "mutation_no": "फेरफार क्र. १६४ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-170",
        "gat_number": "170",
        "gat_marathi": "१७०",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "अनंत लक्ष्मण सावंत",
        "area_ha": 1.38
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.644847,
              18.725172
            ],
            [
              73.645778,
              18.725052
            ],
            [
              73.647064,
              18.725224
            ],
            [
              73.647219,
              18.726259
            ],
            [
              73.646998,
              18.726897
            ],
            [
              73.645557,
              18.726862
            ],
            [
              73.644781,
              18.726345
            ],
            [
              73.644847,
              18.725172
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-151",
    "gat_number": "151",
    "gat_marathi": "१५१",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "पार्वतीबाई रामभाऊ कडू",
    "owner_name_en": "Parvatibai Rambhau Kadu",
    "area_ha": 1.63,
    "area_guntha": 163,
    "area_acres": 4.03,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000151",
    "centroid": [
      18.723,
      73.641
    ],
    "bounds": [
      [
        18.72191,
        73.63982
      ],
      [
        18.72409,
        73.64218
      ]
    ],
    "mutation_no": "फेरफार क्र. १६५ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-151",
        "gat_number": "151",
        "gat_marathi": "१५१",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "पार्वतीबाई रामभाऊ कडू",
        "area_ha": 1.63
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.639976,
              18.722131
            ],
            [
              73.640803,
              18.722004
            ],
            [
              73.641945,
              18.722185
            ],
            [
              73.642083,
              18.723272
            ],
            [
              73.641886,
              18.723942
            ],
            [
              73.640606,
              18.723905
            ],
            [
              73.639917,
              18.723362
            ],
            [
              73.639976,
              18.722131
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-152",
    "gat_number": "152",
    "gat_marathi": "१५२",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "तुकाराम किसन शेळके",
    "owner_name_en": "Tukaram Kisan Shelke",
    "area_ha": 2.09,
    "area_guntha": 209,
    "area_acres": 5.16,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000152",
    "centroid": [
      18.72,
      73.638
    ],
    "bounds": [
      [
        18.71876,
        73.63689
      ],
      [
        18.72124,
        73.63911
      ]
    ],
    "mutation_no": "फेरफार क्र. १६६ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-152",
        "gat_number": "152",
        "gat_marathi": "१५२",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "तुकाराम किसन शेळके",
        "area_ha": 2.09
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.637038,
              18.71901
            ],
            [
              73.637815,
              18.718866
            ],
            [
              73.638888,
              18.719072
            ],
            [
              73.639017,
              18.720309
            ],
            [
              73.638832,
              18.721072
            ],
            [
              73.63763,
              18.721031
            ],
            [
              73.636983,
              18.720412
            ],
            [
              73.637038,
              18.71901
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-vadgaon-154",
    "gat_number": "154",
    "gat_marathi": "१५४",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "वडगाव",
    "village_en": "Vadgaon",
    "village_code": "272500050309270000",
    "owner_name": "बाबूराव महादू दळवी",
    "owner_name_en": "Baburao Mahadu Dalvi",
    "area_ha": 3.26,
    "area_guntha": 326,
    "area_acres": 8.06,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000154",
    "centroid": [
      18.717,
      73.635
    ],
    "bounds": [
      [
        18.71448,
        73.63332
      ],
      [
        18.71952,
        73.63668
      ]
    ],
    "mutation_no": "फेरफार क्र. १६७ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-vadgaon-154",
        "gat_number": "154",
        "gat_marathi": "१५४",
        "village": "वडगाव",
        "district": "पुणे",
        "owner": "बाबूराव महादू दळवी",
        "area_ha": 3.26
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.633544,
              18.714984
            ],
            [
              73.63472,
              18.71469
            ],
            [
              73.636344,
              18.71511
            ],
            [
              73.63654,
              18.71763
            ],
            [
              73.63626,
              18.719184
            ],
            [
              73.63444,
              18.7191
            ],
            [
              73.63346,
              18.71784
            ],
            [
              73.633544,
              18.714984
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-13",
    "gat_number": "13",
    "gat_marathi": "१३",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "दत्तात्रय पांडुरंग घारे",
    "owner_name_en": "Dattatray Pandurang Ghare",
    "area_ha": 6.4,
    "area_guntha": 640,
    "area_acres": 15.81,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000013",
    "centroid": [
      18.739,
      73.602
    ],
    "bounds": [
      [
        18.73648,
        73.60032
      ],
      [
        18.74152,
        73.60368
      ]
    ],
    "mutation_no": "फेरफार क्र. १०० (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-13",
        "gat_number": "13",
        "gat_marathi": "१३",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "दत्तात्रय पांडुरंग घारे",
        "area_ha": 6.4
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.600544,
              18.736984
            ],
            [
              73.60172,
              18.73669
            ],
            [
              73.603344,
              18.73711
            ],
            [
              73.60354,
              18.73963
            ],
            [
              73.60326,
              18.741184
            ],
            [
              73.60144,
              18.7411
            ],
            [
              73.60046,
              18.73984
            ],
            [
              73.600544,
              18.736984
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-12",
    "gat_number": "12",
    "gat_marathi": "१२",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "मारुती विठ्ठल मराठे",
    "owner_name_en": "Maruti Vitthal Marathe",
    "area_ha": 0.99,
    "area_guntha": 99,
    "area_acres": 2.45,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000012",
    "centroid": [
      18.729,
      73.6
    ],
    "bounds": [
      [
        18.72648,
        73.59832
      ],
      [
        18.73152,
        73.60168
      ]
    ],
    "mutation_no": "फेरफार क्र. १०१ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-12",
        "gat_number": "12",
        "gat_marathi": "१२",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "मारुती विठ्ठल मराठे",
        "area_ha": 0.99
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.598544,
              18.726984
            ],
            [
              73.59972,
              18.72669
            ],
            [
              73.601344,
              18.72711
            ],
            [
              73.60154,
              18.72963
            ],
            [
              73.60126,
              18.731184
            ],
            [
              73.59944,
              18.7311
            ],
            [
              73.59846,
              18.72984
            ],
            [
              73.598544,
              18.726984
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-14",
    "gat_number": "14",
    "gat_marathi": "१४",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "सखाराम बाळू बोडके",
    "owner_name_en": "Sakharam Balu Bodke",
    "area_ha": 3.56,
    "area_guntha": 356,
    "area_acres": 8.8,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000014",
    "centroid": [
      18.73,
      73.607
    ],
    "bounds": [
      [
        18.72879,
        73.60562
      ],
      [
        18.73121,
        73.60838
      ]
    ],
    "mutation_no": "फेरफार क्र. १०२ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-14",
        "gat_number": "14",
        "gat_marathi": "१४",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "सखाराम बाळू बोडके",
        "area_ha": 3.56
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.605804,
              18.729031
            ],
            [
              73.60677,
              18.72889
            ],
            [
              73.608104,
              18.729092
            ],
            [
              73.608265,
              18.730303
            ],
            [
              73.608035,
              18.731049
            ],
            [
              73.60654,
              18.731009
            ],
            [
              73.605735,
              18.730404
            ],
            [
              73.605804,
              18.729031
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-15",
    "gat_number": "15",
    "gat_marathi": "१५",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "ज्ञानोबा नामदेव गाडे",
    "owner_name_en": "Dnyanoba Namdev Gade",
    "area_ha": 1.32,
    "area_guntha": 132,
    "area_acres": 3.26,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000015",
    "centroid": [
      18.728,
      73.609
    ],
    "bounds": [
      [
        18.72679,
        73.60765
      ],
      [
        18.72921,
        73.61035
      ]
    ],
    "mutation_no": "फेरफार क्र. १०३ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-15",
        "gat_number": "15",
        "gat_marathi": "१५",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "ज्ञानोबा नामदेव गाडे",
        "area_ha": 1.32
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.607827,
              18.727028
            ],
            [
              73.608774,
              18.726887
            ],
            [
              73.610083,
              18.727089
            ],
            [
              73.610241,
              18.728304
            ],
            [
              73.610015,
              18.729053
            ],
            [
              73.608549,
              18.729012
            ],
            [
              73.607759,
              18.728405
            ],
            [
              73.607827,
              18.727028
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-16",
    "gat_number": "16",
    "gat_marathi": "१६",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "अनंत लक्ष्मण सावंत",
    "owner_name_en": "Anant Laxman Sawant",
    "area_ha": 1.97,
    "area_guntha": 197,
    "area_acres": 4.87,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000016",
    "centroid": [
      18.727,
      73.612
    ],
    "bounds": [
      [
        18.72598,
        73.61081
      ],
      [
        18.72802,
        73.61319
      ]
    ],
    "mutation_no": "फेरफार क्र. १०४ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-16",
        "gat_number": "16",
        "gat_marathi": "१६",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "अनंत लक्ष्मण सावंत",
        "area_ha": 1.97
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.610964,
              18.726181
            ],
            [
              73.611801,
              18.726061
            ],
            [
              73.612956,
              18.726232
            ],
            [
              73.613095,
              18.727256
            ],
            [
              73.612896,
              18.727888
            ],
            [
              73.611602,
              18.727853
            ],
            [
              73.610905,
              18.727341
            ],
            [
              73.610964,
              18.726181
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-18",
    "gat_number": "18",
    "gat_marathi": "१८",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "पार्वतीबाई रामभाऊ कडू",
    "owner_name_en": "Parvatibai Rambhau Kadu",
    "area_ha": 3.61,
    "area_guntha": 361,
    "area_acres": 8.92,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000018",
    "centroid": [
      18.726,
      73.615
    ],
    "bounds": [
      [
        18.72493,
        73.61396
      ],
      [
        18.72707,
        73.61604
      ]
    ],
    "mutation_no": "फेरफार क्र. १०५ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-18",
        "gat_number": "18",
        "gat_marathi": "१८",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "पार्वतीबाई रामभाऊ कडू",
        "area_ha": 3.61
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.614098,
              18.725141
            ],
            [
              73.614826,
              18.725016
            ],
            [
              73.615833,
              18.725195
            ],
            [
              73.615954,
              18.726268
            ],
            [
              73.615781,
              18.726931
            ],
            [
              73.614653,
              18.726895
            ],
            [
              73.614046,
              18.726358
            ],
            [
              73.614098,
              18.725141
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-20",
    "gat_number": "20",
    "gat_marathi": "२०",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "तुकाराम किसन शेळके",
    "owner_name_en": "Tukaram Kisan Shelke",
    "area_ha": 2.12,
    "area_guntha": 212,
    "area_acres": 5.24,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000020",
    "centroid": [
      18.725,
      73.619
    ],
    "bounds": [
      [
        18.7238,
        73.61788
      ],
      [
        18.7262,
        73.62012
      ]
    ],
    "mutation_no": "फेरफार क्र. १०६ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-20",
        "gat_number": "20",
        "gat_marathi": "२०",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "तुकाराम किसन शेळके",
        "area_ha": 2.12
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.618033,
              18.724044
            ],
            [
              73.618814,
              18.723904
            ],
            [
              73.619892,
              18.724104
            ],
            [
              73.620023,
              18.725299
            ],
            [
              73.619837,
              18.726036
            ],
            [
              73.618628,
              18.725996
            ],
            [
              73.617977,
              18.725398
            ],
            [
              73.618033,
              18.724044
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-21",
    "gat_number": "21",
    "gat_marathi": "२१",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "बाबूराव महादू दळवी",
    "owner_name_en": "Baburao Mahadu Dalvi",
    "area_ha": 3.64,
    "area_guntha": 364,
    "area_acres": 8.99,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000021",
    "centroid": [
      18.728,
      73.623
    ],
    "bounds": [
      [
        18.72675,
        73.62183
      ],
      [
        18.72925,
        73.62417
      ]
    ],
    "mutation_no": "फेरफार क्र. १०७ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-21",
        "gat_number": "21",
        "gat_marathi": "२१",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "बाबूराव महादू दळवी",
        "area_ha": 3.64
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.621984,
              18.727002
            ],
            [
              73.622805,
              18.726857
            ],
            [
              73.623938,
              18.727065
            ],
            [
              73.624075,
              18.728312
            ],
            [
              73.623879,
              18.729081
            ],
            [
              73.622609,
              18.729039
            ],
            [
              73.621925,
              18.728416
            ],
            [
              73.621984,
              18.727002
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-22",
    "gat_number": "22",
    "gat_marathi": "२२",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "शंकर गणपत उंबरे",
    "owner_name_en": "Shankar Ganpat Umbare",
    "area_ha": 1.28,
    "area_guntha": 128,
    "area_acres": 3.16,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000022",
    "centroid": [
      18.729,
      73.626
    ],
    "bounds": [
      [
        18.72782,
        73.62478
      ],
      [
        18.73018,
        73.62722
      ]
    ],
    "mutation_no": "फेरफार क्र. १०८ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-22",
        "gat_number": "22",
        "gat_marathi": "२२",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "शंकर गणपत उंबरे",
        "area_ha": 1.28
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.624943,
              18.72806
            ],
            [
              73.625797,
              18.727922
            ],
            [
              73.626976,
              18.728118
            ],
            [
              73.627118,
              18.729294
            ],
            [
              73.626915,
              18.730019
            ],
            [
              73.625593,
              18.72998
            ],
            [
              73.624882,
              18.729392
            ],
            [
              73.624943,
              18.72806
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-23",
    "gat_number": "23",
    "gat_marathi": "२३",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "कमल सोपान शिंदे",
    "owner_name_en": "Kamal Sopan Shinde",
    "area_ha": 2.47,
    "area_guntha": 247,
    "area_acres": 6.1,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000023",
    "centroid": [
      18.728,
      73.628
    ],
    "bounds": [
      [
        18.72675,
        73.62687
      ],
      [
        18.72925,
        73.62913
      ]
    ],
    "mutation_no": "फेरफार क्र. १०९ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-23",
        "gat_number": "23",
        "gat_marathi": "२३",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "कमल सोपान शिंदे",
        "area_ha": 2.47
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.627023,
              18.727
            ],
            [
              73.627812,
              18.726854
            ],
            [
              73.628901,
              18.727062
            ],
            [
              73.629033,
              18.728313
            ],
            [
              73.628845,
              18.729084
            ],
            [
              73.627624,
              18.729042
            ],
            [
              73.626967,
              18.728417
            ],
            [
              73.627023,
              18.727
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-24",
    "gat_number": "24",
    "gat_marathi": "२४",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "संजय बबन जाधव",
    "owner_name_en": "Sanjay Baban Jadhav",
    "area_ha": 1.01,
    "area_guntha": 101,
    "area_acres": 2.5,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000024",
    "centroid": [
      18.727,
      73.631
    ],
    "bounds": [
      [
        18.72582,
        73.62978
      ],
      [
        18.72818,
        73.63222
      ]
    ],
    "mutation_no": "फेरफार क्र. ११० (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-24",
        "gat_number": "24",
        "gat_marathi": "२४",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "संजय बबन जाधव",
        "area_ha": 1.01
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.629947,
              18.726052
            ],
            [
              73.630797,
              18.725914
            ],
            [
              73.631972,
              18.726112
            ],
            [
              73.632114,
              18.727296
            ],
            [
              73.631911,
              18.728026
            ],
            [
              73.630595,
              18.727987
            ],
            [
              73.629886,
              18.727395
            ],
            [
              73.629947,
              18.726052
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-26",
    "gat_number": "26",
    "gat_marathi": "२६",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "विष्णू भिकाजी पिंगळे",
    "owner_name_en": "Vishnu Bhikaji Pingle",
    "area_ha": 3.24,
    "area_guntha": 324,
    "area_acres": 8.01,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000026",
    "centroid": [
      18.728,
      73.636
    ],
    "bounds": [
      [
        18.72689,
        73.63477
      ],
      [
        18.72911,
        73.63723
      ]
    ],
    "mutation_no": "फेरफार क्र. १११ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-26",
        "gat_number": "26",
        "gat_marathi": "२६",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "विष्णू भिकाजी पिंगळे",
        "area_ha": 3.24
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.634934,
              18.727111
            ],
            [
              73.635795,
              18.726982
            ],
            [
              73.636984,
              18.727167
            ],
            [
              73.637128,
              18.728278
            ],
            [
              73.636923,
              18.728963
            ],
            [
              73.63559,
              18.728926
            ],
            [
              73.634872,
              18.72837
            ],
            [
              73.634934,
              18.727111
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-27",
    "gat_number": "27",
    "gat_marathi": "२७",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "रघुनाथ हरी भांगरे",
    "owner_name_en": "Raghunath Hari Bhangare",
    "area_ha": 1.07,
    "area_guntha": 107,
    "area_acres": 2.64,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000027",
    "centroid": [
      18.727,
      73.639
    ],
    "bounds": [
      [
        18.72575,
        73.63792
      ],
      [
        18.72825,
        73.64008
      ]
    ],
    "mutation_no": "फेरफार क्र. ११२ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-27",
        "gat_number": "27",
        "gat_marathi": "२७",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "रघुनाथ हरी भांगरे",
        "area_ha": 1.07
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.638067,
              18.726001
            ],
            [
              73.638821,
              18.725856
            ],
            [
              73.639861,
              18.726064
            ],
            [
              73.639987,
              18.727312
            ],
            [
              73.639808,
              18.728082
            ],
            [
              73.638641,
              18.72804
            ],
            [
              73.638013,
              18.727416
            ],
            [
              73.638067,
              18.726001
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-28",
    "gat_number": "28",
    "gat_marathi": "२८",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "लिलावती दिनकर मोरे",
    "owner_name_en": "Lilawati Dinkar More",
    "area_ha": 2.74,
    "area_guntha": 274,
    "area_acres": 6.77,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000028",
    "centroid": [
      18.723,
      73.634
    ],
    "bounds": [
      [
        18.72186,
        73.63291
      ],
      [
        18.72414,
        73.63509
      ]
    ],
    "mutation_no": "फेरफार क्र. ११३ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-28",
        "gat_number": "28",
        "gat_marathi": "२८",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "लिलावती दिनकर मोरे",
        "area_ha": 2.74
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.633058,
              18.722089
            ],
            [
              73.633819,
              18.721956
            ],
            [
              73.63487,
              18.722146
            ],
            [
              73.634996,
              18.723285
            ],
            [
              73.634815,
              18.723987
            ],
            [
              73.633638,
              18.723949
            ],
            [
              73.633004,
              18.72338
            ],
            [
              73.633058,
              18.722089
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-30",
    "gat_number": "30",
    "gat_marathi": "३०",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "सुभाष नारायण वाघमारे",
    "owner_name_en": "Subhash Narayan Waghmare",
    "area_ha": 3.34,
    "area_guntha": 334,
    "area_acres": 8.25,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000030",
    "centroid": [
      18.722,
      73.637
    ],
    "bounds": [
      [
        18.721,
        73.6359
      ],
      [
        18.723,
        73.6381
      ]
    ],
    "mutation_no": "फेरफार क्र. ११४ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-30",
        "gat_number": "30",
        "gat_marathi": "३०",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "सुभाष नारायण वाघमारे",
        "area_ha": 3.34
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.636043,
              18.721203
            ],
            [
              73.636816,
              18.721087
            ],
            [
              73.637884,
              18.721253
            ],
            [
              73.638013,
              18.722249
            ],
            [
              73.637829,
              18.722863
            ],
            [
              73.636632,
              18.72283
            ],
            [
              73.635987,
              18.722332
            ],
            [
              73.636043,
              18.721203
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-31",
    "gat_number": "31",
    "gat_marathi": "३१",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "दत्तात्रय पांडुरंग घारे",
    "owner_name_en": "Dattatray Pandurang Ghare",
    "area_ha": 2.58,
    "area_guntha": 258,
    "area_acres": 6.38,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000031",
    "centroid": [
      18.719,
      73.635
    ],
    "bounds": [
      [
        18.71786,
        73.63389
      ],
      [
        18.72014,
        73.63611
      ]
    ],
    "mutation_no": "फेरफार क्र. ११५ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-31",
        "gat_number": "31",
        "gat_marathi": "३१",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "दत्तात्रय पांडुरंग घारे",
        "area_ha": 2.58
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.634039,
              18.718089
            ],
            [
              73.634815,
              18.717957
            ],
            [
              73.635887,
              18.718146
            ],
            [
              73.636016,
              18.719285
            ],
            [
              73.635831,
              18.719987
            ],
            [
              73.63463,
              18.719949
            ],
            [
              73.633984,
              18.719379
            ],
            [
              73.634039,
              18.718089
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-33",
    "gat_number": "33",
    "gat_marathi": "३३",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "मारुती विठ्ठल मराठे",
    "owner_name_en": "Maruti Vitthal Marathe",
    "area_ha": 2.31,
    "area_guntha": 231,
    "area_acres": 5.71,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000033",
    "centroid": [
      18.722,
      73.63
    ],
    "bounds": [
      [
        18.72086,
        73.62883
      ],
      [
        18.72314,
        73.63117
      ]
    ],
    "mutation_no": "फेरफार क्र. ११६ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-33",
        "gat_number": "33",
        "gat_marathi": "३३",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "मारुती विठ्ठल मराठे",
        "area_ha": 2.31
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.628985,
              18.721092
            ],
            [
              73.629805,
              18.720959
            ],
            [
              73.630937,
              18.721149
            ],
            [
              73.631073,
              18.722284
            ],
            [
              73.630878,
              18.722984
            ],
            [
              73.62961,
              18.722946
            ],
            [
              73.628927,
              18.722378
            ],
            [
              73.628985,
              18.721092
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-5",
    "gat_number": "5",
    "gat_marathi": "५",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "सखाराम बाळू बोडके",
    "owner_name_en": "Sakharam Balu Bodke",
    "area_ha": 2.86,
    "area_guntha": 286,
    "area_acres": 7.07,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000005",
    "centroid": [
      18.72,
      73.607
    ],
    "bounds": [
      [
        18.71898,
        73.60564
      ],
      [
        18.72102,
        73.60836
      ]
    ],
    "mutation_no": "फेरफार क्र. ११७ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-5",
        "gat_number": "5",
        "gat_marathi": "५",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "सखाराम बाळू बोडके",
        "area_ha": 2.86
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.605824,
              18.719183
            ],
            [
              73.606774,
              18.719064
            ],
            [
              73.608085,
              18.719234
            ],
            [
              73.608243,
              18.720255
            ],
            [
              73.608017,
              18.720885
            ],
            [
              73.606548,
              18.720851
            ],
            [
              73.605757,
              18.72034
            ],
            [
              73.605824,
              18.719183
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-6",
    "gat_number": "6",
    "gat_marathi": "६",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "ज्ञानोबा नामदेव गाडे",
    "owner_name_en": "Dnyanoba Namdev Gade",
    "area_ha": 2.73,
    "area_guntha": 273,
    "area_acres": 6.75,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000006",
    "centroid": [
      18.721,
      73.611
    ],
    "bounds": [
      [
        18.71992,
        73.60989
      ],
      [
        18.72208,
        73.61211
      ]
    ],
    "mutation_no": "फेरफार क्र. ११८ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-6",
        "gat_number": "6",
        "gat_marathi": "६",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "ज्ञानोबा नामदेव गाडे",
        "area_ha": 2.73
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.610042,
              18.720137
            ],
            [
              73.610816,
              18.720011
            ],
            [
              73.611885,
              18.720191
            ],
            [
              73.612014,
              18.72127
            ],
            [
              73.611829,
              18.721935
            ],
            [
              73.610631,
              18.721899
            ],
            [
              73.609986,
              18.72136
            ],
            [
              73.610042,
              18.720137
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-7",
    "gat_number": "7",
    "gat_marathi": "७",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "अनंत लक्ष्मण सावंत",
    "owner_name_en": "Anant Laxman Sawant",
    "area_ha": 2.96,
    "area_guntha": 296,
    "area_acres": 7.31,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000007",
    "centroid": [
      18.719,
      73.614
    ],
    "bounds": [
      [
        18.71795,
        73.61287
      ],
      [
        18.72005,
        73.61513
      ]
    ],
    "mutation_no": "फेरफार क्र. ११९ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-7",
        "gat_number": "7",
        "gat_marathi": "७",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "अनंत लक्ष्मण सावंत",
        "area_ha": 2.96
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.613022,
              18.718156
            ],
            [
              73.613812,
              18.718033
            ],
            [
              73.614902,
              18.718209
            ],
            [
              73.615034,
              18.719264
            ],
            [
              73.614846,
              18.719914
            ],
            [
              73.613624,
              18.719879
            ],
            [
              73.612966,
              18.719352
            ],
            [
              73.613022,
              18.718156
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-8",
    "gat_number": "8",
    "gat_marathi": "८",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "पार्वतीबाई रामभाऊ कडू",
    "owner_name_en": "Parvatibai Rambhau Kadu",
    "area_ha": 3.65,
    "area_guntha": 365,
    "area_acres": 9.02,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000008",
    "centroid": [
      18.72,
      73.617
    ],
    "bounds": [
      [
        18.7189,
        73.61595
      ],
      [
        18.7211,
        73.61805
      ]
    ],
    "mutation_no": "फेरफार क्र. १२० (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-8",
        "gat_number": "8",
        "gat_marathi": "८",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "पार्वतीबाई रामभाऊ कडू",
        "area_ha": 3.65
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.616093,
              18.719122
            ],
            [
              73.616826,
              18.718994
            ],
            [
              73.617837,
              18.719177
            ],
            [
              73.617959,
              18.720274
            ],
            [
              73.617785,
              18.720951
            ],
            [
              73.616651,
              18.720915
            ],
            [
              73.616041,
              18.720366
            ],
            [
              73.616093,
              18.719122
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-25",
    "gat_number": "25",
    "gat_marathi": "२५",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "तुकाराम किसन शेळके",
    "owner_name_en": "Tukaram Kisan Shelke",
    "area_ha": 1.45,
    "area_guntha": 145,
    "area_acres": 3.58,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000025",
    "centroid": [
      18.721,
      73.62
    ],
    "bounds": [
      [
        18.72002,
        73.61862
      ],
      [
        18.72198,
        73.62138
      ]
    ],
    "mutation_no": "फेरफार क्र. १२१ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-25",
        "gat_number": "25",
        "gat_marathi": "२५",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "तुकाराम किसन शेळके",
        "area_ha": 1.45
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.618805,
              18.720214
            ],
            [
              73.61977,
              18.7201
            ],
            [
              73.621103,
              18.720264
            ],
            [
              73.621264,
              18.721245
            ],
            [
              73.621034,
              18.721851
            ],
            [
              73.61954,
              18.721818
            ],
            [
              73.618736,
              18.721327
            ],
            [
              73.618805,
              18.720214
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-41",
    "gat_number": "41",
    "gat_marathi": "४१",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "बाबूराव महादू दळवी",
    "owner_name_en": "Baburao Mahadu Dalvi",
    "area_ha": 3.32,
    "area_guntha": 332,
    "area_acres": 8.2,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000041",
    "centroid": [
      18.719,
      73.624
    ],
    "bounds": [
      [
        18.71776,
        73.62288
      ],
      [
        18.72024,
        73.62512
      ]
    ],
    "mutation_no": "फेरफार क्र. १२२ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-41",
        "gat_number": "41",
        "gat_marathi": "४१",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "बाबूराव महादू दळवी",
        "area_ha": 3.32
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.623033,
              18.718008
            ],
            [
              73.623814,
              18.717863
            ],
            [
              73.624892,
              18.71807
            ],
            [
              73.625023,
              18.71931
            ],
            [
              73.624837,
              18.720075
            ],
            [
              73.623628,
              18.720033
            ],
            [
              73.622977,
              18.719413
            ],
            [
              73.623033,
              18.718008
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-42",
    "gat_number": "42",
    "gat_marathi": "४२",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "शंकर गणपत उंबरे",
    "owner_name_en": "Shankar Ganpat Umbare",
    "area_ha": 1.29,
    "area_guntha": 129,
    "area_acres": 3.19,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000042",
    "centroid": [
      18.717,
      73.626
    ],
    "bounds": [
      [
        18.71593,
        73.62466
      ],
      [
        18.71807,
        73.62734
      ]
    ],
    "mutation_no": "फेरफार क्र. १२३ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-42",
        "gat_number": "42",
        "gat_marathi": "४२",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "शंकर गणपत उंबरे",
        "area_ha": 1.29
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.624842,
              18.716143
            ],
            [
              73.625777,
              18.716018
            ],
            [
              73.627069,
              18.716197
            ],
            [
              73.627225,
              18.717268
            ],
            [
              73.627002,
              18.717928
            ],
            [
              73.625554,
              18.717892
            ],
            [
              73.624775,
              18.717357
            ],
            [
              73.624842,
              18.716143
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-61",
    "gat_number": "61",
    "gat_marathi": "६१",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "कमल सोपान शिंदे",
    "owner_name_en": "Kamal Sopan Shinde",
    "area_ha": 2.56,
    "area_guntha": 256,
    "area_acres": 6.33,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000061",
    "centroid": [
      18.714,
      73.621
    ],
    "bounds": [
      [
        18.71283,
        73.61968
      ],
      [
        18.71517,
        73.62232
      ]
    ],
    "mutation_no": "फेरफार क्र. १२४ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-61",
        "gat_number": "61",
        "gat_marathi": "६१",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "कमल सोपान शिंदे",
        "area_ha": 2.56
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.619856,
              18.713063
            ],
            [
              73.62078,
              18.712927
            ],
            [
              73.622056,
              18.713122
            ],
            [
              73.62221,
              18.714293
            ],
            [
              73.62199,
              18.715015
            ],
            [
              73.62056,
              18.714976
            ],
            [
              73.61979,
              18.71439
            ],
            [
              73.619856,
              18.713063
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-62",
    "gat_number": "62",
    "gat_marathi": "६२",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "संजय बबन जाधव",
    "owner_name_en": "Sanjay Baban Jadhav",
    "area_ha": 0.87,
    "area_guntha": 87,
    "area_acres": 2.15,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000062",
    "centroid": [
      18.712,
      73.623
    ],
    "bounds": [
      [
        18.71084,
        73.62162
      ],
      [
        18.71316,
        73.62438
      ]
    ],
    "mutation_no": "फेरफार क्र. १२५ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-62",
        "gat_number": "62",
        "gat_marathi": "६२",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "संजय बबन जाधव",
        "area_ha": 0.87
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.621808,
              18.711075
            ],
            [
              73.622771,
              18.71094
            ],
            [
              73.6241,
              18.711133
            ],
            [
              73.624261,
              18.712289
            ],
            [
              73.624032,
              18.713002
            ],
            [
              73.622542,
              18.712963
            ],
            [
              73.621739,
              18.712385
            ],
            [
              73.621808,
              18.711075
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-78",
    "gat_number": "78",
    "gat_marathi": "७८",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "विष्णू भिकाजी पिंगळे",
    "owner_name_en": "Vishnu Bhikaji Pingle",
    "area_ha": 2.71,
    "area_guntha": 271,
    "area_acres": 6.7,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000078",
    "centroid": [
      18.715,
      73.629
    ],
    "bounds": [
      [
        18.71395,
        73.62769
      ],
      [
        18.71605,
        73.63031
      ]
    ],
    "mutation_no": "फेरफार क्र. १२६ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-78",
        "gat_number": "78",
        "gat_marathi": "७८",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "विष्णू भिकाजी पिंगळे",
        "area_ha": 2.71
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.627861,
              18.71416
            ],
            [
              73.628781,
              18.714038
            ],
            [
              73.630051,
              18.714213
            ],
            [
              73.630205,
              18.715262
            ],
            [
              73.629986,
              18.71591
            ],
            [
              73.628562,
              18.715875
            ],
            [
              73.627795,
              18.71535
            ],
            [
              73.627861,
              18.71416
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-80",
    "gat_number": "80",
    "gat_marathi": "८०",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "रघुनाथ हरी भांगरे",
    "owner_name_en": "Raghunath Hari Bhangare",
    "area_ha": 1.17,
    "area_guntha": 117,
    "area_acres": 2.89,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000080",
    "centroid": [
      18.713,
      73.631
    ],
    "bounds": [
      [
        18.712,
        73.62964
      ],
      [
        18.714,
        73.63236
      ]
    ],
    "mutation_no": "फेरफार क्र. १२७ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-80",
        "gat_number": "80",
        "gat_marathi": "८०",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "रघुनाथ हरी भांगरे",
        "area_ha": 1.17
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.629823,
              18.7122
            ],
            [
              73.630774,
              18.712083
            ],
            [
              73.632086,
              18.71225
            ],
            [
              73.632245,
              18.71325
            ],
            [
              73.632019,
              18.713867
            ],
            [
              73.630547,
              18.713834
            ],
            [
              73.629755,
              18.713333
            ],
            [
              73.629823,
              18.7122
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-81",
    "gat_number": "81",
    "gat_marathi": "८१",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "लिलावती दिनकर मोरे",
    "owner_name_en": "Lilawati Dinkar More",
    "area_ha": 1.61,
    "area_guntha": 161,
    "area_acres": 3.98,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000081",
    "centroid": [
      18.711,
      73.633
    ],
    "bounds": [
      [
        18.70987,
        73.63194
      ],
      [
        18.71213,
        73.63406
      ]
    ],
    "mutation_no": "फेरफार क्र. १२८ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-81",
        "gat_number": "81",
        "gat_marathi": "८१",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "लिलावती दिनकर मोरे",
        "area_ha": 1.61
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.632083,
              18.710099
            ],
            [
              73.632824,
              18.709968
            ],
            [
              73.633847,
              18.710156
            ],
            [
              73.63397,
              18.711281
            ],
            [
              73.633794,
              18.711976
            ],
            [
              73.632647,
              18.711938
            ],
            [
              73.63203,
              18.711375
            ],
            [
              73.632083,
              18.710099
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-82",
    "gat_number": "82",
    "gat_marathi": "८२",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "सुभाष नारायण वाघमारे",
    "owner_name_en": "Subhash Narayan Waghmare",
    "area_ha": 1.42,
    "area_guntha": 142,
    "area_acres": 3.51,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000082",
    "centroid": [
      18.709,
      73.63
    ],
    "bounds": [
      [
        18.70782,
        73.62876
      ],
      [
        18.71018,
        73.63124
      ]
    ],
    "mutation_no": "फेरफार क्र. १२९ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-82",
        "gat_number": "82",
        "gat_marathi": "८२",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "सुभाष नारायण वाघमारे",
        "area_ha": 1.42
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.628927,
              18.70806
            ],
            [
              73.629794,
              18.707923
            ],
            [
              73.63099,
              18.708119
            ],
            [
              73.631135,
              18.709294
            ],
            [
              73.630928,
              18.710019
            ],
            [
              73.629587,
              18.709979
            ],
            [
              73.628865,
              18.709392
            ],
            [
              73.628927,
              18.70806
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-92",
    "gat_number": "92",
    "gat_marathi": "९२",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "दत्तात्रय पांडुरंग घारे",
    "owner_name_en": "Dattatray Pandurang Ghare",
    "area_ha": 2.22,
    "area_guntha": 222,
    "area_acres": 5.49,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000092",
    "centroid": [
      18.706,
      73.628
    ],
    "bounds": [
      [
        18.70496,
        73.62675
      ],
      [
        18.70704,
        73.62925
      ]
    ],
    "mutation_no": "फेरफार क्र. १३० (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-92",
        "gat_number": "92",
        "gat_marathi": "९२",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "दत्तात्रय पांडुरंग घारे",
        "area_ha": 2.22
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.626918,
              18.705169
            ],
            [
              73.627792,
              18.705047
            ],
            [
              73.628999,
              18.705221
            ],
            [
              73.629144,
              18.70626
            ],
            [
              73.628936,
              18.706901
            ],
            [
              73.627584,
              18.706866
            ],
            [
              73.626856,
              18.706346
            ],
            [
              73.626918,
              18.705169
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-102",
    "gat_number": "102",
    "gat_marathi": "१०२",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "मारुती विठ्ठल मराठे",
    "owner_name_en": "Maruti Vitthal Marathe",
    "area_ha": 1.11,
    "area_guntha": 111,
    "area_acres": 2.74,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000102",
    "centroid": [
      18.704,
      73.624
    ],
    "bounds": [
      [
        18.70279,
        73.62265
      ],
      [
        18.70521,
        73.62535
      ]
    ],
    "mutation_no": "फेरफार क्र. १३१ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-102",
        "gat_number": "102",
        "gat_marathi": "१०२",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "मारुती विठ्ठल मराठे",
        "area_ha": 1.11
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.622834,
              18.703029
            ],
            [
              73.623776,
              18.702887
            ],
            [
              73.625077,
              18.70309
            ],
            [
              73.625234,
              18.704303
            ],
            [
              73.625009,
              18.705052
            ],
            [
              73.623551,
              18.705012
            ],
            [
              73.622766,
              18.704405
            ],
            [
              73.622834,
              18.703029
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-103",
    "gat_number": "103",
    "gat_marathi": "१०३",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "सखाराम बाळू बोडके",
    "owner_name_en": "Sakharam Balu Bodke",
    "area_ha": 0.86,
    "area_guntha": 86,
    "area_acres": 2.13,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000103",
    "centroid": [
      18.702,
      73.621
    ],
    "bounds": [
      [
        18.70096,
        73.61983
      ],
      [
        18.70304,
        73.62217
      ]
    ],
    "mutation_no": "फेरफार क्र. १३२ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-103",
        "gat_number": "103",
        "gat_marathi": "१०३",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "सखाराम बाळू बोडके",
        "area_ha": 0.86
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.619984,
              18.701166
            ],
            [
              73.620805,
              18.701044
            ],
            [
              73.621938,
              18.701218
            ],
            [
              73.622075,
              18.702261
            ],
            [
              73.621879,
              18.702904
            ],
            [
              73.620609,
              18.702869
            ],
            [
              73.619925,
              18.702348
            ],
            [
              73.619984,
              18.701166
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-108",
    "gat_number": "108",
    "gat_marathi": "१०८",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "ज्ञानोबा नामदेव गाडे",
    "owner_name_en": "Dnyanoba Namdev Gade",
    "area_ha": 1.58,
    "area_guntha": 158,
    "area_acres": 3.9,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000108",
    "centroid": [
      18.7,
      73.625
    ],
    "bounds": [
      [
        18.69885,
        73.6237
      ],
      [
        18.70115,
        73.6263
      ]
    ],
    "mutation_no": "फेरफार क्र. १३३ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-108",
        "gat_number": "108",
        "gat_marathi": "१०८",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "ज्ञानोबा नामदेव गाडे",
        "area_ha": 1.58
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.623875,
              18.699079
            ],
            [
              73.624784,
              18.698945
            ],
            [
              73.626038,
              18.699137
            ],
            [
              73.626189,
              18.700288
            ],
            [
              73.625973,
              18.700998
            ],
            [
              73.624567,
              18.700959
            ],
            [
              73.623811,
              18.700384
            ],
            [
              73.623875,
              18.699079
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-110",
    "gat_number": "110",
    "gat_marathi": "११०",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "अनंत लक्ष्मण सावंत",
    "owner_name_en": "Anant Laxman Sawant",
    "area_ha": 2.05,
    "area_guntha": 204,
    "area_acres": 5.07,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000110",
    "centroid": [
      18.699,
      73.618
    ],
    "bounds": [
      [
        18.69787,
        73.61671
      ],
      [
        18.70013,
        73.61929
      ]
    ],
    "mutation_no": "फेरफार क्र. १३४ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-110",
        "gat_number": "110",
        "gat_marathi": "११०",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "अनंत लक्ष्मण सावंत",
        "area_ha": 2.05
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.616885,
              18.6981
            ],
            [
              73.617786,
              18.697968
            ],
            [
              73.619029,
              18.698156
            ],
            [
              73.61918,
              18.699281
            ],
            [
              73.618965,
              18.699975
            ],
            [
              73.617571,
              18.699938
            ],
            [
              73.61682,
              18.699375
            ],
            [
              73.616885,
              18.6981
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-115",
    "gat_number": "115",
    "gat_marathi": "११५",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "पार्वतीबाई रामभाऊ कडू",
    "owner_name_en": "Parvatibai Rambhau Kadu",
    "area_ha": 3.32,
    "area_guntha": 332,
    "area_acres": 8.2,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000115",
    "centroid": [
      18.697,
      73.622
    ],
    "bounds": [
      [
        18.69602,
        73.62098
      ],
      [
        18.69798,
        73.62302
      ]
    ],
    "mutation_no": "फेरफार क्र. १३५ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-115",
        "gat_number": "115",
        "gat_marathi": "११५",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "पार्वतीबाई रामभाऊ कडू",
        "area_ha": 3.32
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.621113,
              18.696214
            ],
            [
              73.621829,
              18.696099
            ],
            [
              73.622819,
              18.696263
            ],
            [
              73.622938,
              18.697246
            ],
            [
              73.622768,
              18.697852
            ],
            [
              73.621659,
              18.697819
            ],
            [
              73.621062,
              18.697328
            ],
            [
              73.621113,
              18.696214
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-116",
    "gat_number": "116",
    "gat_marathi": "११६",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "तुकाराम किसन शेळके",
    "owner_name_en": "Tukaram Kisan Shelke",
    "area_ha": 3.19,
    "area_guntha": 319,
    "area_acres": 7.88,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000116",
    "centroid": [
      18.695,
      73.619
    ],
    "bounds": [
      [
        18.69388,
        73.61765
      ],
      [
        18.69612,
        73.62035
      ]
    ],
    "mutation_no": "फेरफार क्र. १३६ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-116",
        "gat_number": "116",
        "gat_marathi": "११६",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "तुकाराम किसन शेळके",
        "area_ha": 3.19
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.617834,
              18.694101
            ],
            [
              73.618776,
              18.69397
            ],
            [
              73.620076,
              18.694157
            ],
            [
              73.620233,
              18.695281
            ],
            [
              73.620009,
              18.695974
            ],
            [
              73.618552,
              18.695936
            ],
            [
              73.617767,
              18.695375
            ],
            [
              73.617834,
              18.694101
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-119",
    "gat_number": "119",
    "gat_marathi": "११९",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "बाबूराव महादू दळवी",
    "owner_name_en": "Baburao Mahadu Dalvi",
    "area_ha": 1.21,
    "area_guntha": 121,
    "area_acres": 2.99,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000119",
    "centroid": [
      18.693,
      73.623
    ],
    "bounds": [
      [
        18.692,
        73.62177
      ],
      [
        18.694,
        73.62423
      ]
    ],
    "mutation_no": "फेरफार क्र. १३७ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-119",
        "gat_number": "119",
        "gat_marathi": "११९",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "बाबूराव महादू दळवी",
        "area_ha": 1.21
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.621934,
              18.692196
            ],
            [
              73.622795,
              18.692079
            ],
            [
              73.623984,
              18.692247
            ],
            [
              73.624127,
              18.693251
            ],
            [
              73.623922,
              18.693871
            ],
            [
              73.62259,
              18.693837
            ],
            [
              73.621873,
              18.693335
            ],
            [
              73.621934,
              18.692196
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-120",
    "gat_number": "120",
    "gat_marathi": "१२०",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "शंकर गणपत उंबरे",
    "owner_name_en": "Shankar Ganpat Umbare",
    "area_ha": 3.08,
    "area_guntha": 308,
    "area_acres": 7.61,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000120",
    "centroid": [
      18.691,
      73.62
    ],
    "bounds": [
      [
        18.68977,
        73.61887
      ],
      [
        18.69223,
        73.62113
      ]
    ],
    "mutation_no": "फेरफार क्र. १३८ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-120",
        "gat_number": "120",
        "gat_marathi": "१२०",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "शंकर गणपत उंबरे",
        "area_ha": 3.08
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.61902,
              18.690016
            ],
            [
              73.619812,
              18.689873
            ],
            [
              73.620905,
              18.690078
            ],
            [
              73.621037,
              18.691307
            ],
            [
              73.620848,
              18.692066
            ],
            [
              73.619623,
              18.692025
            ],
            [
              73.618963,
              18.69141
            ],
            [
              73.61902,
              18.690016
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-122",
    "gat_number": "122",
    "gat_marathi": "१२२",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "कमल सोपान शिंदे",
    "owner_name_en": "Kamal Sopan Shinde",
    "area_ha": 1.44,
    "area_guntha": 144,
    "area_acres": 3.56,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000122",
    "centroid": [
      18.69,
      73.616
    ],
    "bounds": [
      [
        18.68877,
        73.61467
      ],
      [
        18.69123,
        73.61733
      ]
    ],
    "mutation_no": "फेरफार क्र. १३९ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-122",
        "gat_number": "122",
        "gat_marathi": "१२२",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "कमल सोपान शिंदे",
        "area_ha": 1.44
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.614847,
              18.689016
            ],
            [
              73.615778,
              18.688873
            ],
            [
              73.617064,
              18.689078
            ],
            [
              73.617219,
              18.690307
            ],
            [
              73.616997,
              18.691066
            ],
            [
              73.615557,
              18.691025
            ],
            [
              73.614781,
              18.69041
            ],
            [
              73.614847,
              18.689016
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-123",
    "gat_number": "123",
    "gat_marathi": "१२३",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "संजय बबन जाधव",
    "owner_name_en": "Sanjay Baban Jadhav",
    "area_ha": 3.03,
    "area_guntha": 303,
    "area_acres": 7.49,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000123",
    "centroid": [
      18.687,
      73.618
    ],
    "bounds": [
      [
        18.68601,
        73.61689
      ],
      [
        18.68799,
        73.61911
      ]
    ],
    "mutation_no": "फेरफार क्र. १४० (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-123",
        "gat_number": "123",
        "gat_marathi": "१२३",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "संजय बबन जाधव",
        "area_ha": 3.03
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.617038,
              18.686207
            ],
            [
              73.617815,
              18.686092
            ],
            [
              73.618888,
              18.686257
            ],
            [
              73.619017,
              18.687248
            ],
            [
              73.618832,
              18.687859
            ],
            [
              73.61763,
              18.687826
            ],
            [
              73.616983,
              18.68733
            ],
            [
              73.617038,
              18.686207
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-124",
    "gat_number": "124",
    "gat_marathi": "१२४",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "विष्णू भिकाजी पिंगळे",
    "owner_name_en": "Vishnu Bhikaji Pingle",
    "area_ha": 3.2,
    "area_guntha": 320,
    "area_acres": 7.91,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000124",
    "centroid": [
      18.688,
      73.614
    ],
    "bounds": [
      [
        18.68692,
        73.61266
      ],
      [
        18.68908,
        73.61534
      ]
    ],
    "mutation_no": "फेरफार क्र. १४१ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-124",
        "gat_number": "124",
        "gat_marathi": "१२४",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "विष्णू भिकाजी पिंगळे",
        "area_ha": 3.2
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.61284,
              18.687134
            ],
            [
              73.613777,
              18.687008
            ],
            [
              73.615071,
              18.687189
            ],
            [
              73.615227,
              18.68827
            ],
            [
              73.615004,
              18.688938
            ],
            [
              73.613554,
              18.688902
            ],
            [
              73.612773,
              18.688361
            ],
            [
              73.61284,
              18.687134
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-127",
    "gat_number": "127",
    "gat_marathi": "१२७",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "रघुनाथ हरी भांगरे",
    "owner_name_en": "Raghunath Hari Bhangare",
    "area_ha": 3.27,
    "area_guntha": 327,
    "area_acres": 8.08,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000127",
    "centroid": [
      18.685,
      73.612
    ],
    "bounds": [
      [
        18.68376,
        73.61092
      ],
      [
        18.68624,
        73.61308
      ]
    ],
    "mutation_no": "फेरफार क्र. १४२ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-127",
        "gat_number": "127",
        "gat_marathi": "१२७",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "रघुनाथ हरी भांगरे",
        "area_ha": 3.27
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.611068,
              18.684009
            ],
            [
              73.611821,
              18.683864
            ],
            [
              73.612861,
              18.684071
            ],
            [
              73.612986,
              18.68531
            ],
            [
              73.612807,
              18.686074
            ],
            [
              73.611641,
              18.686032
            ],
            [
              73.611014,
              18.685413
            ],
            [
              73.611068,
              18.684009
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-155",
    "gat_number": "155",
    "gat_marathi": "१५५",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "लिलावती दिनकर मोरे",
    "owner_name_en": "Lilawati Dinkar More",
    "area_ha": 3.32,
    "area_guntha": 332,
    "area_acres": 8.2,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000155",
    "centroid": [
      18.717,
      73.597
    ],
    "bounds": [
      [
        18.7158,
        73.59563
      ],
      [
        18.7182,
        73.59837
      ]
    ],
    "mutation_no": "फेरफार क्र. १४३ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-155",
        "gat_number": "155",
        "gat_marathi": "१५५",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "लिलावती दिनकर मोरे",
        "area_ha": 3.32
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.595811,
              18.716037
            ],
            [
              73.596771,
              18.715897
            ],
            [
              73.598097,
              18.716098
            ],
            [
              73.598257,
              18.717301
            ],
            [
              73.598029,
              18.718043
            ],
            [
              73.596543,
              18.718003
            ],
            [
              73.595743,
              18.717401
            ],
            [
              73.595811,
              18.716037
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-159",
    "gat_number": "159",
    "gat_marathi": "१५९",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "सुभाष नारायण वाघमारे",
    "owner_name_en": "Subhash Narayan Waghmare",
    "area_ha": 1.78,
    "area_guntha": 178,
    "area_acres": 4.4,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000159",
    "centroid": [
      18.722,
      73.599
    ],
    "bounds": [
      [
        18.72082,
        73.59797
      ],
      [
        18.72318,
        73.60003
      ]
    ],
    "mutation_no": "फेरफार क्र. १४४ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-159",
        "gat_number": "159",
        "gat_marathi": "१५९",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "सुभाष नारायण वाघमारे",
        "area_ha": 1.78
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.598108,
              18.721055
            ],
            [
              73.598829,
              18.720917
            ],
            [
              73.599823,
              18.721114
            ],
            [
              73.599943,
              18.722295
            ],
            [
              73.599772,
              18.723024
            ],
            [
              73.598657,
              18.722984
            ],
            [
              73.598057,
              18.722394
            ],
            [
              73.598108,
              18.721055
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-160",
    "gat_number": "160",
    "gat_marathi": "१६०",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "दत्तात्रय पांडुरंग घारे",
    "owner_name_en": "Dattatray Pandurang Ghare",
    "area_ha": 3.27,
    "area_guntha": 327,
    "area_acres": 8.08,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000160",
    "centroid": [
      18.724,
      73.601
    ],
    "bounds": [
      [
        18.7228,
        73.59964
      ],
      [
        18.7252,
        73.60236
      ]
    ],
    "mutation_no": "फेरफार क्र. १४५ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-160",
        "gat_number": "160",
        "gat_marathi": "१६०",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "दत्तात्रय पांडुरंग घारे",
        "area_ha": 3.27
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.599826,
              18.723039
            ],
            [
              73.600774,
              18.722899
            ],
            [
              73.602084,
              18.723099
            ],
            [
              73.602242,
              18.7243
            ],
            [
              73.602016,
              18.725041
            ],
            [
              73.600548,
              18.725001
            ],
            [
              73.599758,
              18.7244
            ],
            [
              73.599826,
              18.723039
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-161",
    "gat_number": "161",
    "gat_marathi": "१६१",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "मारुती विठ्ठल मराठे",
    "owner_name_en": "Maruti Vitthal Marathe",
    "area_ha": 3.05,
    "area_guntha": 305,
    "area_acres": 7.54,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000161",
    "centroid": [
      18.72,
      73.602
    ],
    "bounds": [
      [
        18.71896,
        73.60069
      ],
      [
        18.72104,
        73.60331
      ]
    ],
    "mutation_no": "फेरफार क्र. १४६ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-161",
        "gat_number": "161",
        "gat_marathi": "१६१",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "मारुती विठ्ठल मराठे",
        "area_ha": 3.05
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.600863,
              18.719168
            ],
            [
              73.601781,
              18.719047
            ],
            [
              73.603049,
              18.71922
            ],
            [
              73.603203,
              18.72026
            ],
            [
              73.602984,
              18.720901
            ],
            [
              73.601563,
              18.720867
            ],
            [
              73.600797,
              18.720347
            ],
            [
              73.600863,
              18.719168
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-164",
    "gat_number": "164",
    "gat_marathi": "१६४",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "सखाराम बाळू बोडके",
    "owner_name_en": "Sakharam Balu Bodke",
    "area_ha": 3.25,
    "area_guntha": 325,
    "area_acres": 8.03,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000164",
    "centroid": [
      18.711,
      73.596
    ],
    "bounds": [
      [
        18.70978,
        73.59494
      ],
      [
        18.71222,
        73.59706
      ]
    ],
    "mutation_no": "फेरफार क्र. १४७ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-164",
        "gat_number": "164",
        "gat_marathi": "१६४",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "सखाराम बाळू बोडके",
        "area_ha": 3.25
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.595082,
              18.710023
            ],
            [
              73.595824,
              18.70988
            ],
            [
              73.596847,
              18.710084
            ],
            [
              73.596971,
              18.711305
            ],
            [
              73.596794,
              18.712059
            ],
            [
              73.595647,
              18.712018
            ],
            [
              73.595029,
              18.711407
            ],
            [
              73.595082,
              18.710023
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-168",
    "gat_number": "168",
    "gat_marathi": "१६८",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "ज्ञानोबा नामदेव गाडे",
    "owner_name_en": "Dnyanoba Namdev Gade",
    "area_ha": 2.14,
    "area_guntha": 214,
    "area_acres": 5.29,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "needs_review",
    "record_id": "LR-MH-2026-000168",
    "centroid": [
      18.708,
      73.598
    ],
    "bounds": [
      [
        18.7068,
        73.5969
      ],
      [
        18.7092,
        73.5991
      ]
    ],
    "mutation_no": "फेरफार क्र. १४८ (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-168",
        "gat_number": "168",
        "gat_marathi": "१६८",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "ज्ञानोबा नामदेव गाडे",
        "area_ha": 2.14
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.597047,
              18.707036
            ],
            [
              73.597817,
              18.706895
            ],
            [
              73.59888,
              18.707096
            ],
            [
              73.599008,
              18.708301
            ],
            [
              73.598825,
              18.709044
            ],
            [
              73.597633,
              18.709004
            ],
            [
              73.596992,
              18.708402
            ],
            [
              73.597047,
              18.707036
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-144",
    "gat_number": "144",
    "gat_marathi": "१४४",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "अनंत लक्ष्मण सावंत",
    "owner_name_en": "Anant Laxman Sawant",
    "area_ha": 1.49,
    "area_guntha": 149,
    "area_acres": 3.68,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000144",
    "centroid": [
      18.703,
      73.601
    ],
    "bounds": [
      [
        18.7018,
        73.59987
      ],
      [
        18.7042,
        73.60213
      ]
    ],
    "mutation_no": "फेरफार क्र. १४९ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-144",
        "gat_number": "144",
        "gat_marathi": "१४४",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "अनंत लक्ष्मण सावंत",
        "area_ha": 1.49
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.600021,
              18.702041
            ],
            [
              73.600812,
              18.701901
            ],
            [
              73.601904,
              18.702101
            ],
            [
              73.602036,
              18.7033
            ],
            [
              73.601847,
              18.704039
            ],
            [
              73.600623,
              18.703999
            ],
            [
              73.599964,
              18.7034
            ],
            [
              73.600021,
              18.702041
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-128",
    "gat_number": "128",
    "gat_marathi": "१२८",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "पार्वतीबाई रामभाऊ कडू",
    "owner_name_en": "Parvatibai Rambhau Kadu",
    "area_ha": 1.77,
    "area_guntha": 177,
    "area_acres": 4.37,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000128",
    "centroid": [
      18.697,
      73.605
    ],
    "bounds": [
      [
        18.69598,
        73.60397
      ],
      [
        18.69802,
        73.60603
      ]
    ],
    "mutation_no": "फेरफार क्र. १५० (वारस/खरेदी नोंद)",
    "crops": [
      "भात / तांदूळ (Paddy Rice)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-128",
        "gat_number": "128",
        "gat_marathi": "१२८",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "पार्वतीबाई रामभाऊ कडू",
        "area_ha": 1.77
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.604109,
              18.696186
            ],
            [
              73.604829,
              18.696067
            ],
            [
              73.605823,
              18.696237
            ],
            [
              73.605943,
              18.697254
            ],
            [
              73.605771,
              18.697882
            ],
            [
              73.604657,
              18.697848
            ],
            [
              73.604057,
              18.697339
            ],
            [
              73.604109,
              18.696186
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-malegaon budruk-131",
    "gat_number": "131",
    "gat_marathi": "१३१",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "मावळ",
    "taluka_en": "Maval",
    "village": "माळेगाव बुद्रुक",
    "village_en": "Malegaon Budruk",
    "village_code": "272500050307320000",
    "owner_name": "तुकाराम किसन शेळके",
    "owner_name_en": "Tukaram Kisan Shelke",
    "area_ha": 1.63,
    "area_guntha": 163,
    "area_acres": 4.03,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 1 (उत्तम काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-000131",
    "centroid": [
      18.693,
      73.607
    ],
    "bounds": [
      [
        18.69175,
        73.60567
      ],
      [
        18.69425,
        73.60833
      ]
    ],
    "mutation_no": "फेरफार क्र. १५१ (वारस/खरेदी नोंद)",
    "crops": [
      "ऊस (Sugarcane)",
      "भाजीपाला (Vegetables)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-malegaon budruk-131",
        "gat_number": "131",
        "gat_marathi": "१३१",
        "village": "माळेगाव बुद्रुक",
        "district": "पुणे",
        "owner": "तुकाराम किसन शेळके",
        "area_ha": 1.63
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.605846,
              18.692
            ],
            [
              73.606778,
              18.691854
            ],
            [
              73.608065,
              18.692062
            ],
            [
              73.60822,
              18.693313
            ],
            [
              73.607998,
              18.694083
            ],
            [
              73.606556,
              18.694042
            ],
            [
              73.60578,
              18.693417
            ],
            [
              73.605846,
              18.692
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-beed-312-2",
    "gat_number": "312/2",
    "gat_marathi": "३१२/२",
    "district": "बीड",
    "district_en": "Beed",
    "taluka": "अंबाजोगाई",
    "taluka_en": "Ambajogai",
    "village": "अंबाजोगाई (रुरल)",
    "village_en": "Ambajogai (Rural)",
    "owner_name": "विलासराव नारायणराव पाटील",
    "owner_name_en": "Vilasrao Narayanrao Patil",
    "area_ha": 2.15,
    "area_guntha": 215,
    "area_acres": 5.31,
    "land_type": "जिरायत (कोरडवाहू)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (काळी जमीन)",
    "status": "verified",
    "record_id": "LR-MH-2026-018492",
    "centroid": [
      18.7325,
      76.3842
    ],
    "bounds": [
      [
        18.731,
        76.382
      ],
      [
        18.734,
        76.3865
      ]
    ],
    "mutation_no": "२८४ (वारस नोंद)",
    "crops": [
      "कापूस (Cotton)",
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-beed-312-2",
        "gat_number": "312/2",
        "gat_marathi": "३१२/२",
        "village": "Ambajogai (Rural)",
        "district": "Beed",
        "owner": "Vilasrao Narayanrao Patil",
        "area_ha": 2.15
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              76.382,
              18.731
            ],
            [
              76.386,
              18.7315
            ],
            [
              76.3865,
              18.7338
            ],
            [
              76.383,
              18.734
            ],
            [
              76.382,
              18.731
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-beed-311-1",
    "gat_number": "311/1",
    "gat_marathi": "३११/१",
    "district": "बीड",
    "district_en": "Beed",
    "taluka": "अंबाजोगाई",
    "taluka_en": "Ambajogai",
    "village": "अंबाजोगाई (रुरल)",
    "village_en": "Ambajogai (Rural)",
    "owner_name": "सुधाकर गणपतराव देशमुख",
    "owner_name_en": "Sudhakar Ganpatrao Deshmukh",
    "area_ha": 1.78,
    "area_guntha": 178,
    "area_acres": 4.4,
    "land_type": "बागायत (विहीर)",
    "land_type_en": "Bagayat (Well Irrigated)",
    "soil_class": "Class 2 (मध्यम काळी)",
    "status": "verified",
    "record_id": null,
    "centroid": [
      18.7348,
      76.3855
    ],
    "bounds": [
      [
        18.7335,
        76.383
      ],
      [
        18.736,
        76.3875
      ]
    ],
    "mutation_no": "२९१ (खरेदी खत)",
    "crops": [
      "ऊस (Sugarcane)",
      "हरभरा (Gram)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-beed-311-1",
        "gat_number": "311/1",
        "gat_marathi": "३११/१",
        "village": "Ambajogai (Rural)",
        "district": "Beed",
        "owner": "Sudhakar Ganpatrao Deshmukh",
        "area_ha": 1.78
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              76.383,
              18.7338
            ],
            [
              76.3865,
              18.7338
            ],
            [
              76.3875,
              18.736
            ],
            [
              76.384,
              18.7358
            ],
            [
              76.383,
              18.7338
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-beed-310-3",
    "gat_number": "310/3",
    "gat_marathi": "३१०/३",
    "district": "बीड",
    "district_en": "Beed",
    "taluka": "अंबाजोगाई",
    "taluka_en": "Ambajogai",
    "village": "अंबाजोगाई (रुरल)",
    "village_en": "Ambajogai (Rural)",
    "owner_name": "राजाराम बापूराव शिंदे",
    "owner_name_en": "Rajaram Bapurao Shinde",
    "area_ha": 3.4,
    "area_guntha": 340,
    "area_acres": 8.4,
    "land_type": "जिरायत (कोरडवाहू)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 1 (सुपीक)",
    "status": "needs_review",
    "record_id": null,
    "centroid": [
      18.7315,
      76.388
    ],
    "bounds": [
      [
        18.73,
        76.386
      ],
      [
        18.733,
        76.3905
      ]
    ],
    "mutation_no": "२७५ (वाटप पत्र)",
    "crops": [
      "ज्वारी (Jowar)",
      "तूर (Pigeon Pea)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-beed-310-3",
        "gat_number": "310/3",
        "gat_marathi": "३१०/३",
        "village": "Ambajogai (Rural)",
        "district": "Beed",
        "owner": "Rajaram Bapurao Shinde",
        "area_ha": 3.4
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              76.386,
              18.7315
            ],
            [
              76.3905,
              18.732
            ],
            [
              76.39,
              18.7345
            ],
            [
              76.3865,
              18.7338
            ],
            [
              76.386,
              18.7315
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-beed-313-1",
    "gat_number": "313/1",
    "gat_marathi": "३१३/१",
    "district": "बीड",
    "district_en": "Beed",
    "taluka": "अंबाजोगाई",
    "taluka_en": "Ambajogai",
    "village": "अंबाजोगाई (रुरल)",
    "village_en": "Ambajogai (Rural)",
    "owner_name": "लताबाई ज्ञानेश्वर कुलकर्णी",
    "owner_name_en": "Latabai Dnyaneshwar Kulkarni",
    "area_ha": 1.25,
    "area_guntha": 125,
    "area_acres": 3.09,
    "land_type": "बागायत",
    "land_type_en": "Bagayat (Irrigated)",
    "soil_class": "Class 2",
    "status": "verified",
    "record_id": null,
    "centroid": [
      18.7295,
      76.3835
    ],
    "bounds": [
      [
        18.728,
        76.3815
      ],
      [
        18.731,
        76.3855
      ]
    ],
    "mutation_no": "२८८ (हक्कसोड पत्र)",
    "crops": [
      "गहू (Wheat)",
      "सूर्यफूल (Sunflower)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-beed-313-1",
        "gat_number": "313/1",
        "gat_marathi": "३१३/१",
        "village": "Ambajogai (Rural)",
        "district": "Beed",
        "owner": "Latabai Dnyaneshwar Kulkarni",
        "area_ha": 1.25
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              76.3815,
              18.7285
            ],
            [
              76.3855,
              18.729
            ],
            [
              76.385,
              18.7312
            ],
            [
              76.382,
              18.731
            ],
            [
              76.3815,
              18.7285
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-pune-124-3a",
    "gat_number": "124/3A",
    "gat_marathi": "१२४/३अ",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "हवेली",
    "taluka_en": "Haveli",
    "village": "पिंपरी",
    "village_en": "Pimpri",
    "owner_name": "राजेंद्र विठ्ठल पाटील",
    "owner_name_en": "Rajendra Vitthal Patil",
    "area_ha": 2.48,
    "area_guntha": 248,
    "area_acres": 6.13,
    "land_type": "कृषी / बिनशेती प्रस्तावित",
    "land_type_en": "Agricultural / NA Proposed",
    "soil_class": "Class 1",
    "status": "verified",
    "record_id": "LR-MH-2026-018492",
    "centroid": [
      18.6275,
      73.8525
    ],
    "bounds": [
      [
        18.625,
        73.85
      ],
      [
        18.63,
        73.855
      ]
    ],
    "mutation_no": "४८२ (वारस नोंद)",
    "crops": [
      "भाजीपाला (Vegetables)",
      "मका (Maize)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-pune-124-3a",
        "gat_number": "124/3A",
        "gat_marathi": "१२४/३अ",
        "village": "Pimpri",
        "district": "Pune",
        "owner": "Rajendra Vitthal Patil",
        "area_ha": 2.48
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.85,
              18.63
            ],
            [
              73.855,
              18.63
            ],
            [
              73.855,
              18.625
            ],
            [
              73.85,
              18.625
            ],
            [
              73.85,
              18.63
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-pune-124-3b",
    "gat_number": "124/3B",
    "gat_marathi": "१२४/३ब",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "हवेली",
    "taluka_en": "Haveli",
    "village": "पिंपरी",
    "village_en": "Pimpri",
    "owner_name": "सुनिता अशोक देशमुख",
    "owner_name_en": "Sunita Ashok Deshmukh",
    "area_ha": 1.82,
    "area_guntha": 182,
    "area_acres": 4.5,
    "land_type": "कृषी (जिरायत)",
    "land_type_en": "Agricultural (Jirayat)",
    "soil_class": "Class 2",
    "status": "verified",
    "record_id": "LR-MH-2026-018493",
    "centroid": [
      18.6275,
      73.858
    ],
    "bounds": [
      [
        18.625,
        73.855
      ],
      [
        18.63,
        73.861
      ]
    ],
    "mutation_no": "५०१ (खरेदी खत)",
    "crops": [
      "सोयाबीन (Soybean)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-pune-124-3b",
        "gat_number": "124/3B",
        "gat_marathi": "१२४/३ब",
        "village": "Pimpri",
        "district": "Pune",
        "owner": "Sunita Ashok Deshmukh",
        "area_ha": 1.82
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.855,
              18.63
            ],
            [
              73.861,
              18.63
            ],
            [
              73.861,
              18.625
            ],
            [
              73.855,
              18.625
            ],
            [
              73.855,
              18.63
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-pune-125",
    "gat_number": "125",
    "gat_marathi": "१२५",
    "district": "पुणे",
    "district_en": "Pune",
    "taluka": "हवेली",
    "taluka_en": "Haveli",
    "village": "पिंपरी",
    "village_en": "Pimpri",
    "owner_name": "महेश बाळकृष्ण जाधव",
    "owner_name_en": "Mahesh Balkrishna Jadhav",
    "area_ha": 3.12,
    "area_guntha": 312,
    "area_acres": 7.71,
    "land_type": "कृषी (बागायत)",
    "land_type_en": "Agricultural (Bagayat)",
    "soil_class": "Class 1",
    "status": "needs_review",
    "record_id": null,
    "centroid": [
      18.6325,
      73.848
    ],
    "bounds": [
      [
        18.63,
        73.845
      ],
      [
        18.635,
        73.851
      ]
    ],
    "mutation_no": "४३२ (वाटप पत्र)",
    "crops": [
      "ऊस (Sugarcane)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-pune-125",
        "gat_number": "125",
        "gat_marathi": "१२५",
        "village": "Pimpri",
        "district": "Pune",
        "owner": "Mahesh Balkrishna Jadhav",
        "area_ha": 3.12
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.845,
              18.635
            ],
            [
              73.851,
              18.635
            ],
            [
              73.851,
              18.63
            ],
            [
              73.845,
              18.63
            ],
            [
              73.845,
              18.635
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-solapur-88-2b",
    "gat_number": "88/2B",
    "gat_marathi": "८८/२ब",
    "district": "सोलापूर",
    "district_en": "Solapur",
    "taluka": "पंढरपूर",
    "taluka_en": "Pandharpur",
    "village": "पंढरपूर",
    "village_en": "Pandharpur",
    "owner_name": "महेश आनंदराव जाधव",
    "owner_name_en": "Mahesh Anandrao Jadhav",
    "area_ha": 1.22,
    "area_guntha": 122,
    "area_acres": 3.01,
    "land_type": "जिरायत (कोरडवाहू)",
    "land_type_en": "Jirayat (Dry Crop)",
    "soil_class": "Class 2",
    "status": "verified",
    "record_id": "LR-MH-2026-018493",
    "centroid": [
      17.674,
      75.325
    ],
    "bounds": [
      [
        17.672,
        75.322
      ],
      [
        17.676,
        75.328
      ]
    ],
    "mutation_no": "६१२ (खरेदी)",
    "crops": [
      "डाळिंब (Pomegranate)",
      "ज्वारी (Jowar)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-solapur-88-2b",
        "gat_number": "88/2B",
        "gat_marathi": "८८/२ब",
        "village": "Pandharpur",
        "district": "Solapur",
        "owner": "Mahesh Anandrao Jadhav",
        "area_ha": 1.22
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              75.322,
              17.673
            ],
            [
              75.3275,
              17.6725
            ],
            [
              75.328,
              17.6755
            ],
            [
              75.3235,
              17.676
            ],
            [
              75.322,
              17.673
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-nashik-45-1",
    "gat_number": "45/1",
    "gat_marathi": "४५/१",
    "district": "नाशिक",
    "district_en": "Nashik",
    "taluka": "दिंडोरी",
    "taluka_en": "Dindori",
    "village": "दिंडोरी",
    "village_en": "Dindori",
    "owner_name": "भाऊसाहेब शांताराम मोरे",
    "owner_name_en": "Bhausaheb Shantaram More",
    "area_ha": 2.8,
    "area_guntha": 280,
    "area_acres": 6.92,
    "land_type": "द्राक्ष बाग (बागायत)",
    "land_type_en": "Grape Vineyard (Irrigated)",
    "soil_class": "Class 1",
    "status": "verified",
    "record_id": null,
    "centroid": [
      20.205,
      73.835
    ],
    "bounds": [
      [
        20.203,
        73.832
      ],
      [
        20.207,
        73.838
      ]
    ],
    "mutation_no": "३४४ (वारस नोंद)",
    "crops": [
      "द्राक्षे (Grapes)",
      "कांदा (Onion)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-nashik-45-1",
        "gat_number": "45/1",
        "gat_marathi": "४५/१",
        "village": "Dindori",
        "district": "Nashik",
        "owner": "Bhausaheb Shantaram More",
        "area_ha": 2.8
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.832,
              20.204
            ],
            [
              73.837,
              20.2035
            ],
            [
              73.838,
              20.2065
            ],
            [
              73.8335,
              20.207
            ],
            [
              73.832,
              20.204
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-satara-77-a",
    "gat_number": "77/A",
    "gat_marathi": "७७/अ",
    "district": "सातारा",
    "district_en": "Satara",
    "taluka": "वाई",
    "taluka_en": "Wai",
    "village": "वाई",
    "village_en": "Wai",
    "owner_name": "आनंद संभाजीराव कदम",
    "owner_name_en": "Anand Sambhajirao Kadam",
    "area_ha": 1.65,
    "area_guntha": 165,
    "area_acres": 4.08,
    "land_type": "हळद / आले बागायत",
    "land_type_en": "Turmeric / Ginger Irrigated",
    "soil_class": "Class 1",
    "status": "verified",
    "record_id": null,
    "centroid": [
      17.95,
      73.89
    ],
    "bounds": [
      [
        17.948,
        73.887
      ],
      [
        17.952,
        73.893
      ]
    ],
    "mutation_no": "१८२ (वाटप)",
    "crops": [
      "हळद (Turmeric)",
      "स्ट्राबेरी (Strawberry)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-satara-77-a",
        "gat_number": "77/A",
        "gat_marathi": "७७/अ",
        "village": "Wai",
        "district": "Satara",
        "owner": "Anand Sambhajirao Kadam",
        "area_ha": 1.65
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              73.887,
              17.949
            ],
            [
              73.892,
              17.9485
            ],
            [
              73.893,
              17.9515
            ],
            [
              73.888,
              17.952
            ],
            [
              73.887,
              17.949
            ]
          ]
        ]
      }
    }
  },
  {
    "id": "parcel-dyn-52-1-18151",
    "gat_number": "52/1",
    "gat_marathi": "५२/१",
    "district": "Pune",
    "district_en": "Pune",
    "taluka": "Baramati",
    "taluka_en": "Baramati",
    "village": "Baramati",
    "village_en": "Baramati",
    "owner_name": "अमित पवार",
    "owner_name_en": "Registered Agricultural Holder",
    "area_ha": 2.45,
    "area_guntha": 245,
    "area_acres": 6.05,
    "land_type": "जिरायत (शेतजमीन)",
    "land_type_en": "Jirayat (Agricultural)",
    "soil_class": "Class 1 (काळी जमीन)",
    "status": "verified",
    "record_id": null,
    "centroid": [
      18.1519,
      74.577
    ],
    "bounds": [
      [
        18.1497,
        74.5745
      ],
      [
        18.1541,
        74.5795
      ]
    ],
    "mutation_no": "थेट भू-नकाशा नोंद (Live Cadastral Mapping)",
    "crops": [
      "सोयाबीन (Soybean)",
      "कापूस (Cotton)"
    ],
    "geojson": {
      "type": "Feature",
      "properties": {
        "id": "parcel-dyn-52-1-18151",
        "gat_number": "52/1",
        "gat_marathi": "५२/१",
        "village": "Baramati",
        "district": "Pune",
        "owner": "अमित पवार",
        "area_ha": 2.45
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              74.575107,
              18.150207
            ],
            [
              74.576602,
              18.149709
            ],
            [
              74.578693,
              18.150505
            ],
            [
              74.579291,
              18.152597
            ],
            [
              74.578395,
              18.153992
            ],
            [
              74.576203,
              18.153793
            ],
            [
              74.574908,
              18.152298
            ],
            [
              74.575107,
              18.150207
            ]
          ]
        ]
      }
    }
  }
];
