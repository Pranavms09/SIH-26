import type { ProcessResponse } from '../types';

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
  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_BASE_URL}/api/process?provider=${encodeURIComponent(provider)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
  } catch (err: unknown) {
    const detail = err instanceof Error ? `: ${err.message}` : '';
    throw new Error(`Document processing request failed${detail}`);
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

