import React from 'react';
import { CheckCircle2, Download, RefreshCw, Archive, Eye } from 'lucide-react';
import type { BatchConversionResponse, ConvertedFileInfo } from '../types';
import { formatBytes } from '../utils/formatters';
import { ConversionApi } from '../services/conversionApi';

interface ConversionResultProps {
  result: BatchConversionResponse;
  onReset: () => void;
  onPreview?: (item: ConvertedFileInfo) => void;
}

export const ConversionResult: React.FC<ConversionResultProps> = ({
  result,
  onReset,
  onPreview,
}) => {
  const fullDownloadUrl = ConversionApi.getFullDownloadUrl(result.download_url);

  return (
    <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
      <div className="flex items-center space-x-3.5">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Conversion Successful!</h3>
          <p className="text-xs text-slate-500">{result.message}</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
        {result.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-3.5 text-sm">
            <div className="min-w-0 pr-4">
              <p className="font-medium text-slate-800 truncate" title={item.converted_filename}>
                {item.converted_filename}
              </p>
              <p className="text-xs text-slate-400">
                {formatBytes(item.file_size_bytes)} • Converted from {item.original_filename}
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              {onPreview && (
                <button
                  type="button"
                  onClick={() => onPreview(item)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span>Preview</span>
                </button>
              )}
              <a
                href={ConversionApi.getFullDownloadUrl(item.download_url)}
                download={item.converted_filename}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg inline-flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <a
          href={fullDownloadUrl}
          download={result.is_zip ? 'converted_files.zip' : undefined}
          className="w-full sm:flex-1 py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all text-center"
        >
          {result.is_zip ? <Archive className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          <span>{result.is_zip ? 'Download All (ZIP)' : 'Download Converted File'}</span>
        </a>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Convert More</span>
        </button>
      </div>
    </div>
  );
};
