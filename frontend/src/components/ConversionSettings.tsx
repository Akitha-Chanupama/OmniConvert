import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { ConversionOptions } from '../types';

interface ConversionSettingsProps {
  sourceFormat: string;
  targetFormat: string;
  isMultiPdf: boolean;
  isMultiImage?: boolean;
  mergePdf: boolean;
  onToggleMergePdf: (merge: boolean) => void;
  options: ConversionOptions;
  onChangeOptions: (options: ConversionOptions) => void;
  disabled?: boolean;
}

export const ConversionSettings: React.FC<ConversionSettingsProps> = ({
  sourceFormat,
  targetFormat,
  isMultiPdf,
  isMultiImage = false,
  mergePdf,
  onToggleMergePdf,
  options,
  onChangeOptions,
  disabled = false,
}) => {
  const isLossyImage = ['jpg', 'jpeg', 'webp'].includes(targetFormat.toLowerCase());
  const isImageTarget = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'].includes(targetFormat.toLowerCase());
  const isPdfInput = sourceFormat.toLowerCase() === 'pdf';
  const isSpreadsheetInput = ['xlsx', 'xls'].includes(sourceFormat.toLowerCase());
  const canMergeIntoPdf = (isMultiPdf || isMultiImage) && targetFormat.toLowerCase() === 'pdf';

  const hasRelevantSettings =
    isLossyImage || isImageTarget || isPdfInput || isSpreadsheetInput || canMergeIntoPdf;

  if (!hasRelevantSettings) {
    return null;
  }

  const updateOption = <K extends keyof ConversionOptions>(key: K, value: ConversionOptions[K]) => {
    onChangeOptions({
      ...options,
      [key]: value,
    });
  };

  return (
    <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-4">
      <div className="flex items-center space-x-2 text-slate-700 font-medium text-sm">
        <SlidersHorizontal className="w-4 h-4 text-slate-500" />
        <span>Conversion Options</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {/* Multi-PDF Merge or Multi-Image to Single PDF Checkbox */}
        {canMergeIntoPdf && (
          <div className="sm:col-span-2 flex items-center space-x-3 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <input
              type="checkbox"
              id="merge_pdf_check"
              checked={mergePdf}
              onChange={(e) => onToggleMergePdf(e.target.checked)}
              disabled={disabled}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
            />
            <label htmlFor="merge_pdf_check" className="text-slate-800 font-medium text-sm cursor-pointer select-none">
              {isMultiPdf
                ? 'Merge all uploaded PDFs into a single document in order'
                : 'Combine all uploaded images into a single multi-page PDF document in order'}
            </label>
          </div>
        )}

        {/* Quality for lossy images */}
        {isLossyImage && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <label htmlFor="quality-slider">Image Quality</label>
              <span>{options.quality ?? 90}%</span>
            </div>
            <input
              id="quality-slider"
              type="range"
              min="20"
              max="100"
              value={options.quality ?? 90}
              onChange={(e) => updateOption('quality', parseInt(e.target.value, 10))}
              disabled={disabled}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
          </div>
        )}

        {/* Image Resizing */}
        {isImageTarget && (
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-slate-600 block">
              Resize Dimensions (Optional)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                placeholder="Width (px)"
                value={options.width || ''}
                onChange={(e) =>
                  updateOption('width', e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
                disabled={disabled}
                className="w-32 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <span className="text-slate-400">×</span>
              <input
                type="number"
                placeholder="Height (px)"
                value={options.height || ''}
                onChange={(e) =>
                  updateOption('height', e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
                disabled={disabled}
                className="w-32 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        )}

        {/* PDF Page Range */}
        {isPdfInput && targetFormat.toLowerCase() === 'pdf' && (
          <div className="space-y-1.5">
            <label htmlFor="page-range" className="text-xs font-medium text-slate-600 block">
              Page Range (e.g. 1-3, 5)
            </label>
            <input
              id="page-range"
              type="text"
              placeholder="all or 1-3"
              value={options.page_range || ''}
              onChange={(e) => updateOption('page_range', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        )}

        {/* PDF Rotation */}
        {isPdfInput && (
          <div className="space-y-1.5">
            <label htmlFor="rotate-select" className="text-xs font-medium text-slate-600 block">
              Rotate Document
            </label>
            <select
              id="rotate-select"
              value={options.rotate_degrees || 0}
              onChange={(e) => updateOption('rotate_degrees', parseInt(e.target.value, 10))}
              disabled={disabled}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="0">No rotation (0°)</option>
              <option value="90">90° Clockwise</option>
              <option value="180">180° Inverted</option>
              <option value="270">270° Counter-clockwise</option>
            </select>
          </div>
        )}

        {/* Spreadsheet Sheet Selection */}
        {isSpreadsheetInput && (
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="sheet-input" className="text-xs font-medium text-slate-600 block">
              Worksheet Name (Leave blank for first sheet)
            </label>
            <input
              id="sheet-input"
              type="text"
              placeholder="e.g. Sheet1"
              value={options.sheet_name || ''}
              onChange={(e) => updateOption('sheet_name', e.target.value)}
              disabled={disabled}
              className="w-full sm:w-64 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        )}
      </div>
    </div>
  );
};
