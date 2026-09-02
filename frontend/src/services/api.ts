import type { ProcessResponse, CadastralParcel, GISSearchResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function checkBackendHealthApi(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function uploadDocumentApi(file: File): Promise<{ message: string; original_filename: string; saved_filename: string; file_path: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_BASE_URL}/api/upload`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
  } catch (err: unknown) {
    const detail = err instanceof Error ? `: ${err.message}` : '';
    throw new Error(`Upload request failed${detail}`);
  }

  if (!response.ok) {
    throw new Error(`Upload error (${response.status})`);
  }

  return response.json();
}

export async function processDocumentApi(file: File, provider: string = 'gemini'): Promise<ProcessResponse> {
  const buildFormData = () => {
    const fd = new FormData();
    fd.append('file', file);
    return fd;
  };

  const url = `${API_BASE_URL}/api/process?provider=${encodeURIComponent(provider)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      body: buildFormData(),
    });
  } catch (err: unknown) {
    // Single bounded retry to seamlessly handle Render free tier cold-start wakeups
    try {
      await new Promise(res => setTimeout(res, 2000));
      response = await fetch(url, {
        method: 'POST',
        body: buildFormData(),
      });
    } catch (retryErr: unknown) {
      const detail = retryErr instanceof Error ? `: ${retryErr.message}` : '';
      throw new Error(`Document processing request failed${detail}`);
    }
  }

  if (!response.ok) {
    let errorDetail = 'Unknown processing error';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text().catch(() => 'Unknown error');
    }

    if (response.status === 400) {
      throw new Error(`Unsupported document format: ${errorDetail}`);
    } else if (response.status === 422) {
      throw new Error(`Invalid processing request parameters: ${errorDetail}`);
    } else if (response.status === 500) {
      throw new Error(`Document processing failed: ${errorDetail}`);
    } else {
      throw new Error(`Processing error (${response.status}): ${errorDetail}`);
    }
  }

  const data: ProcessResponse = await response.json();
  return data;
}

// ═══════════════════════════════════════════
// GIS & CADASTRAL APIs
// ═══════════════════════════════════════════

export async function fetchCadastralParcelsApi(): Promise<CadastralParcel[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/gis/parcels`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.parcels || [];
  } catch (err) {
    console.warn('[GIS API] Failed to fetch backend parcels, falling back to local registry:', err);
    return [];
  }
}

export async function searchGhatNumberApi(
  gatNumber: string,
  district?: string,
  taluka?: string,
  village?: string
): Promise<GISSearchResponse | null> {
  try {
    const params = new URLSearchParams();
    if (gatNumber) params.append('gat_number', gatNumber);
    if (district) params.append('district', district);
    if (taluka) params.append('taluka', taluka);
    if (village) params.append('village', village);

    const res = await fetch(`${API_BASE_URL}/api/gis/search?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[GIS API] Search request failed, using local search:', err);
    return null;
  }
}

export async function fetchParcelByIdApi(identifier: string): Promise<CadastralParcel | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/gis/parcels/${encodeURIComponent(identifier)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.parcel || null;
  } catch {
    return null;
  }
}

export async function demarcateParcelApi(payload: {
  gat_number: string;
  location_name: string;
  owner_name?: string;
  area_ha?: number;
}): Promise<CadastralParcel | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/gis/demarcate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.parcel || null;
  } catch (err) {
    console.warn('[GIS API] Demarcation API failed, using frontend local fallback:', err);
    return null;
  }
}

export async function importGeoJSONApi(geojsonData: any): Promise<{ imported_count: number; parcels: CadastralParcel[] } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/gis/import-geojson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geojsonData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[GIS API] GeoJSON import API failed, parsing locally:', err);
    return null;
  }
}

