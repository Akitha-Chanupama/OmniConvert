export interface InstalledTools {
  pillow: boolean;
  pypdf: boolean;
  openpyxl: boolean;
  pyyaml: boolean;
  defusedxml: boolean;
  libreoffice: boolean;
  pandoc: boolean;
  ffmpeg: boolean;
  [key: string]: boolean;
}

export interface HealthResponse {
  status: string;
  version: string;
  mode: string;
  installed_tools: InstalledTools;
  tool_paths: Record<string, string | null>;
}

export interface FormatCapability {
  source_format: string;
  category: 'image' | 'text' | 'data' | 'spreadsheet' | 'pdf' | 'document' | string;
  supported_targets: string[];
  requires_tool?: string | null;
  is_enabled: boolean;
  limitations?: string | null;
  description?: string | null;
}

export interface FormatsResponse {
  formats: Record<string, string[]>;
  capabilities: FormatCapability[];
}

export interface ConversionOptions {
  quality?: number;
  width?: number;
  height?: number;
  preserve_aspect_ratio?: boolean;
  sheet_name?: string;
  page_range?: string;
  rotate_degrees?: number;
  indent?: number;
  split_pdf?: boolean;
}

export interface ConvertedFileInfo {
  conversion_id: string;
  original_filename: string;
  converted_filename: string;
  target_format: string;
  file_size_bytes: number;
  download_url: string;
}

export interface BatchConversionResponse {
  success: boolean;
  message: string;
  conversion_id: string;
  is_zip: boolean;
  download_url: string;
  items: ConvertedFileInfo[];
}

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  detectedExt: string;
  previewUrl?: string;
}

export interface ConversionHistoryItem {
  id: string;
  timestamp: string;
  originalNames: string[];
  convertedFilename: string;
  targetFormat: string;
  downloadUrl: string;
  fileSizeBytes: number;
  isZip: boolean;
}
