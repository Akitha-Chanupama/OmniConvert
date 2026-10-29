import React from 'react';
import {
  Settings,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import type { ConversionOptions } from '../types';

interface ConversionSettingsProps {
  availableTargets: string[];
  selectedTarget: string;
  onSelectTarget: (target: string) => void;
  options: ConversionOptions;
  onChangeOptions: (options: ConversionOptions) => void;
  filesCount: number;
  isConverting: boolean;
  onConvert: () => void;
  canMergeIntoPdf?: boolean;
  isMultiPdf?: boolean;
  mergePdf?: boolean;
  onToggleMergePdf?: (merge: boolean) => void;
  disabled?: boolean;
}

export const ConversionSettings: React.FC<ConversionSettingsProps> = ({
  availableTargets,
  selectedTarget,
  onSelectTarget,
  options,
  onChangeOptions,
  filesCount,
  isConverting,
  onConvert,
  canMergeIntoPdf = false,
  isMultiPdf = false,
  mergePdf = false,
  onToggleMergePdf,
  disabled = false,
}) => {
  // Preset default 8 formats if available, otherwise fallback to available targets
  const standardFormats = ['PNG', 'JPG', 'WEBP', 'PDF', 'DOCX', 'XLSX', 'CSV', 'JSON'];

  // Combine standard formats and any custom supported targets
  const displayFormats = React.useMemo(() => {
    if (availableTargets.length === 0) {
      return standardFormats;
    }
    const set = new Set([...standardFormats, ...availableTargets.map((t) => t.toUpperCase())]);
    return Array.from(set);
  }, [availableTargets]);

  const targetUpper = selectedTarget.toUpperCase();
  const isLossyImage = ['JPG', 'JPEG', 'WEBP'].includes(targetUpper);
  const isImageTarget = ['JPG', 'JPEG', 'PNG', 'WEBP', 'BMP', 'TIFF', 'ICO'].includes(targetUpper);
  const isPdfTarget = targetUpper === 'PDF';

  const updateOption = <K extends keyof ConversionOptions>(key: K, value: ConversionOptions[K]) => {
    onChangeOptions({
      ...options,
      [key]: value,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Conversion Settings
          </h3>
        </div>

        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 px-2.5 py-1 rounded-full">
          {filesCount > 0 ? 'Ready to Configure' : 'Waiting for files'}
        </span>
      </div>

      {/* Output Format 8-Grid */}
      <div className="space-y-2.5">
        <div>
          <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
            Output Format
          </label>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Choose the format you want to convert to
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {displayFormats.slice(0, 8).map((fmt) => {
            const isSelected = selectedTarget.toLowerCase() === fmt.toLowerCase();
            const isSupported =
              availableTargets.length === 0 ||
              availableTargets.some((t) => t.toLowerCase() === fmt.toLowerCase());

            return (
              <button
                key={fmt}
                type="button"
                onClick={() => isSupported && onSelectTarget(fmt)}
                disabled={disabled || !isSupported}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold uppercase transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-600 scale-[1.02]'
                    : isSupported
                    ? 'bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-700 border border-slate-100 dark:border-slate-800/50 cursor-not-allowed opacity-50'
                }`}
              >
                {fmt}
              </button>
            );
          })}
        </div>

        {/* Extra formats pill row if available */}
        {displayFormats.length > 8 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {displayFormats.slice(8).map((fmt) => {
              const isSelected = selectedTarget.toLowerCase() === fmt.toLowerCase();
              return (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => onSelectTarget(fmt)}
                  disabled={disabled}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {fmt}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Multi-PDF Merge or Multi-Image to Single PDF */}
      {canMergeIntoPdf && onToggleMergePdf && (
        <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <input
            type="checkbox"
            id="merge_pdf_box"
            checked={mergePdf}
            onChange={(e) => onToggleMergePdf(e.target.checked)}
            disabled={disabled}
            className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
          />
          <label htmlFor="merge_pdf_box" className="text-slate-800 dark:text-slate-200 font-semibold text-xs cursor-pointer select-none">
            {isMultiPdf
              ? 'Merge all uploaded PDFs into a single document in order'
              : 'Combine all uploaded images into a single multi-page PDF document in order'}
          </label>
        </div>
      )}

      {/* Image Compression Quality Slider */}
      {isLossyImage && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="quality-slider" className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                Image Compression
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Adjust the quality of the output file
              </span>
            </div>
            <span className="font-extrabold text-xs text-blue-600 dark:text-blue-400 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 rounded-md">
              {options.quality ?? 80}%
            </span>
          </div>

          <input
            id="quality-slider"
            type="range"
            min="20"
            max="100"
            value={options.quality ?? 80}
            onChange={(e) => updateOption('quality', parseInt(e.target.value, 10))}
            disabled={disabled}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            <span>Smaller Size (20%)</span>
            <span>Balanced (60%)</span>
            <span>Best Quality (100%)</span>
          </div>
        </div>
      )}

      {/* Resize Dimensions (Optional) */}
      {isImageTarget && (
        <div className="space-y-2 pt-1">
          <div>
            <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
              Resize Dimensions (Optional)
            </label>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Set custom width and height (leave empty to keep original)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Width (px)"
              value={options.width || ''}
              onChange={(e) =>
                updateOption('width', e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
              disabled={disabled}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <span className="text-slate-400 text-xs font-bold">×</span>
            <input
              type="number"
              placeholder="Height (px)"
              value={options.height || ''}
              onChange={(e) =>
                updateOption('height', e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
              disabled={disabled}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={options.preserve_aspect_ratio ?? true}
              onChange={(e) => updateOption('preserve_aspect_ratio', e.target.checked)}
              disabled={disabled}
              className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span className="font-semibold">Lock Aspect Ratio</span>
          </label>
        </div>
      )}

      {/* PDF Specific Options: Rotation / Page Range */}
      {isPdfTarget && (
        <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <label htmlFor="rotate_select" className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                Rotate Document
              </label>
              <select
                id="rotate_select"
                value={options.rotate_degrees || 0}
                onChange={(e) => updateOption('rotate_degrees', parseInt(e.target.value, 10))}
                disabled={disabled}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs"
              >
                <option value="0">0° (Normal)</option>
                <option value="90">90° Clockwise</option>
                <option value="180">180° Inverted</option>
                <option value="270">270° Counter</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="page_range_input" className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                Page Range
              </label>
              <input
                id="page_range_input"
                type="text"
                placeholder="e.g. 1-3, 5"
                value={options.page_range || ''}
                onChange={(e) => updateOption('page_range', e.target.value)}
                disabled={disabled}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onConvert}
          disabled={disabled || filesCount === 0 || !selectedTarget || isConverting}
          className="w-full py-3.5 px-6 font-bold rounded-2xl flex items-center justify-center space-x-2 text-sm sm:text-base transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed select-none bg-[#0c1427] dark:bg-blue-600 hover:bg-[#152140] dark:hover:bg-blue-500 text-white shadow-blue-600/20"
        >
          {isConverting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Converting Files...</span>
            </>
          ) : (
            <>
              <span>
                Convert {filesCount > 0 ? `${filesCount} File${filesCount > 1 ? 's' : ''}` : ''} Now
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
