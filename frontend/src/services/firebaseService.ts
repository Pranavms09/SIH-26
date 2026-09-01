/**
 * Firebase service helpers for Doc2Digital.
 * Handles uploading documents to Firebase Storage and saving metadata to Firestore.
 * All functions gracefully no-op if Firebase is not configured.
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage, isFirebaseConfigured } from '../lib/firebase';
import type { Document, LandRecord, ProcessResponse } from '../types';

/** Firestore collection name for all Doc2Digital documents */
const COLLECTION = 'doc2digital_documents';

/**
 * Uploads a file to Firebase Storage under documents/{documentId}/original.{ext}
 * @returns The public download URL, or null if Firebase is not configured or upload fails.
 */
export async function uploadDocumentToStorage(
  file: File,
  documentId: string
): Promise<string | null> {
  if (!isFirebaseConfigured() || !storage) {
    console.info('[Doc2Digital Firebase] Storage not configured — skipping upload.');
    return null;
  }

  try {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const storageRef = ref(storage, `documents/${documentId}/original${ext}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    console.info('[Doc2Digital Firebase] File uploaded to Storage:', downloadUrl);
    return downloadUrl;
  } catch (err) {
    console.warn('[Doc2Digital Firebase] Storage upload failed:', err);
    return null;
  }
}

/**
 * Saves document metadata, extraction result and land record to Firestore.
 * @returns true on success, false if Firebase not configured or Firestore write fails.
 */
export async function saveDocumentRecord(
  document: Document,
  landRecord: LandRecord,
  processResult: ProcessResponse,
  storageUrl: string | null
): Promise<boolean> {
  if (!isFirebaseConfigured() || !db) {
    console.info('[Doc2Digital Firebase] Firestore not configured — skipping save.');
    return false;
  }

  try {
    const docRef = doc(collection(db, COLLECTION), document.id);
    await setDoc(docRef, {
      // Document metadata
      id: document.id,
      filename: document.filename,
      originalName: document.originalName,
      status: document.status,
      language: document.language,
      pages: document.pages,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      confidence: document.confidence ?? null,
      uploadedAt: serverTimestamp(),
      processedAt: serverTimestamp(),

      // Location
      location: {
        village: document.location.village,
        tehsil: document.location.tehsil,
        district: document.location.district,
        state: document.location.state,
      },

      // Firebase Storage URL (null if Storage not configured)
      storageUrl: storageUrl,

      // Extracted data from backend
      extractedRecord: {
        district: processResult.record?.district?.value ?? null,
        taluka: processResult.record?.taluka?.value ?? null,
        village: processResult.record?.village?.value ?? null,
        survey_number: processResult.record?.survey_number?.value ?? null,
        owner_name: processResult.record?.owner_name?.value ?? null,
        area: processResult.record?.area?.value ?? null,
        land_holding_type: processResult.record?.land_holding_type?.value ?? null,
      },

      // Extraction metadata
      extractionSource: processResult.extraction?.source ?? null,
      extractionRoute: processResult.extraction?.route ?? null,

      // Validation status
      validationStatus: processResult.validation?.status ?? null,

      // Land record IDs for cross-reference
      landRecordId: landRecord.id,
      documentId: processResult.document_id,
    });

    console.info('[Doc2Digital Firebase] Document saved to Firestore:', document.id);
    return true;
  } catch (err) {
    console.warn('[Doc2Digital Firebase] Firestore write failed:', err);
    return false;
  }
}
