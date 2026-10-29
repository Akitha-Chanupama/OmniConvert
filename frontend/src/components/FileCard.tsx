import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Trash2,
  FileSpreadsheet,
  FileCode,
  ArrowUpDown,
  Eye,
  ChevronDown,
} from 'lucide-react';
import type { UploadedFileItem } from '../types';
import { formatBytes, truncateFilename } from '../utils/formatters';

interface FileCardProps {
  item: UploadedFileItem;
  index?: number;
  targetFormat?: string;
  availableTargets?: string[];
  onSelectTarget?: (target: string) => void;
  onRemove: (id: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onPreview?: (item: UploadedFileItem) => void;
  disabled?: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({
  item,
  targetFormat,
  availableTargets = [],
  onSelectTarget,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  onPreview,
  disabled = false,
}) => {
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'ico'].includes(item.detectedExt);
  const isSpreadsheet = ['csv', 'xlsx', 'xls'].includes(item.detectedExt);
  const isCodeOrData = ['json', 'yaml', 'yml', 'xml'].includes(item.detectedExt);

  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleReorder = () => {
    if (canMoveDown) {
      onMoveDown?.();
    } else if (canMoveUp) {
      onMoveUp?.();
    }
  };

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs hover:border-blue-300 dark:hover:border-slate-700 transition-all group">
      <div className="flex items-center space-x-3.5 min-w-0">
        {/* Thumbnail Preview / Icon */}
        <div
          onClick={() => onPreview && onPreview(item)}
          className={`w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center shrink-0 overflow-hidden text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs ${
            onPreview ? 'cursor-pointer hover:opacity-90' : ''
          }`}
          title={onPreview ? 'Click to preview' : undefined}
        >
          {item.previewUrl ? (
            <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : isImage ? (
            <ImageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          ) : isSpreadsheet ? (
            <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          ) : isCodeOrData ? (
            <FileCode className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          ) : (
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          )}
        </div>

        {/* File Information */}
        <div className="min-w-0 flex-1">
          <p
            className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate"
            title={item.name}
          >
            {truncateFilename(item.name, 35)}
          </p>
          <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            <span>{formatBytes(item.size)}</span>
            <span>•</span>
            <span className="uppercase font-bold text-slate-600 dark:text-slate-400">
              {item.detectedExt || 'FILE'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {/* Target Format Dropdown Pill */}
        {targetFormat && (
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => availableTargets.length > 0 && setDropdownOpen((prev) => !prev)}
              disabled={disabled || availableTargets.length === 0}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center space-x-1.5 transition-colors cursor-pointer select-none"
            >
              <span className="uppercase text-slate-500 dark:text-slate-400">{item.detectedExt}</span>
              <span className="text-slate-400">→</span>
              <span className="uppercase text-blue-600 dark:text-blue-400">{targetFormat}</span>
              {availableTargets.length > 1 && <ChevronDown className="w-3 h-3 text-slate-400" />}
            </button>

            {dropdownOpen && availableTargets.length > 1 && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-30 p-1">
                {availableTargets.map((tgt) => (
                  <button
                    key={tgt}
                    type="button"
                    onClick={() => {
                      onSelectTarget?.(tgt);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                      tgt.toLowerCase() === targetFormat.toLowerCase()
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tgt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center space-x-1">
          {/* Preview Trigger */}
          {onPreview && (
            <button
              type="button"
              onClick={() => onPreview(item)}
              className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl transition-colors cursor-pointer"
              title="Preview file"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {/* Reorder / Swap button */}
          {(canMoveUp || canMoveDown) && (
            <button
              type="button"
              onClick={handleToggleReorder}
              disabled={disabled}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title={canMoveDown ? 'Move down' : 'Move up'}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          )}

          {/* Delete Action */}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            disabled={disabled}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="Remove file"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
