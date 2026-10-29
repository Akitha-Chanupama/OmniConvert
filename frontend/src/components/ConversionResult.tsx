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
    <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
      <div className="flex items-center space-x-3.5">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Conversion Successful!</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{result.message}</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/40">
        {result.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-3.5 sm:p-4 text-xs sm:text-sm">
            <div className="min-w-0 pr-4">
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={item.converted_filename}>
                {item.converted_filename}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {formatBytes(item.file_size_bytes)} • From {item.original_filename}
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              {onPreview && (
                <button
                  type="button"
                  onClick={() => onPreview(item)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Preview</span>
                </button>
              )}
              <a
                href={ConversionApi.getFullDownloadUrl(item.download_url)}
                download={item.converted_filename}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl inline-flex items-center space-x-1.5 transition-colors shadow-2xs"
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
          className="w-full sm:flex-1 py-3 px-6 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-sm transition-all text-center"
        >
          {result.is_zip ? <Archive className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          <span>{result.is_zip ? 'Download All Files (ZIP)' : 'Download Converted File'}</span>
        </a>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto py-3 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Convert More</span>
        </button>
      </div>
    </div>
  );
};
