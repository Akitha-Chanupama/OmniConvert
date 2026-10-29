import type {
  BatchConversionResponse,
  ConversionOptions,
  FormatsResponse,
  HealthResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export class ConversionApi {
  static async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE}/api/v1/health`);
    if (!res.ok) {
      throw new Error(`Failed to fetch health status: ${res.statusText}`);
    }
    return res.json();
  }

  static async getFormats(): Promise<FormatsResponse> {
    const res = await fetch(`${API_BASE}/api/v1/formats`);
    if (!res.ok) {
      throw new Error(`Failed to fetch supported formats: ${res.statusText}`);
    }
    return res.json();
  }

  static async convertFiles(
    files: File[],
    targetFormat: string,
    options?: ConversionOptions,
    mergePdf = false
  ): Promise<BatchConversionResponse> {
    const formData = new FormData();

    for (const file of files) {
      formData.append('files', file);
    }

    formData.append('target_format', targetFormat);

    if (options && Object.keys(options).length > 0) {
      formData.append('options', JSON.stringify(options));
    }

    if (mergePdf) {
      formData.append('merge_pdf', 'true');
    }

    const res = await fetch(`${API_BASE}/api/v1/convert`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      let errDetail = 'Conversion failed';
      try {
        const errorJson = await res.json();
        errDetail = errorJson.detail || errDetail;
      } catch {
        errDetail = await res.text();
      }
      throw new Error(errDetail);
    }

    return res.json();
  }

  static getFullDownloadUrl(relativeUrl: string): string {
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }
    return `${API_BASE}${relativeUrl}`;
  }
}
