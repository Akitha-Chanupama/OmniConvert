import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Trash2,
  FileSpreadsheet,
  FileCode,
  ChevronUp,
  ChevronDown,
  Eye,
} from 'lucide-react';
import type { UploadedFileItem } from '../types';
import { formatBytes, truncateFilename } from '../utils/formatters';

interface FileCardProps {
  item: UploadedFileItem;
  index?: number;
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
  index,
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

  return (
    <div className="flex items-center justify-between p-3 sm:p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all group">
      <div className="flex items-center space-x-3 min-w-0">
        {/* Index Pill if provided */}
        {index !== undefined && (
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-600 w-5 text-center shrink-0">
            #{index + 1}
          </span>
        )}

        {/* Thumbnail / Icon */}
        <div
          onClick={() => onPreview && onPreview(item)}
          className={`w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 ${
            onPreview ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
          }`}
          title={onPreview ? 'Click to preview' : undefined}
        >
          {item.previewUrl ? (
            <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : isImage ? (
            <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          ) : isSpreadsheet ? (
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          ) : isCodeOrData ? (
            <FileCode className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          ) : (
            <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          )}
        </div>

        {/* File Info */}
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate" title={item.name}>
            {truncateFilename(item.name, 40)}
          </p>
          <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span>{formatBytes(item.size)}</span>
            <span>•</span>
            <span className="uppercase font-bold text-slate-700 dark:text-slate-300 px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-[10px]">
              {item.detectedExt || 'FILE'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 shrink-0">
        {/* Reordering Controls */}
        {(onMoveUp || onMoveDown) && (
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 mr-1 border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={disabled || !canMoveUp}
              className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 disabled:hover:text-slate-500 rounded cursor-pointer disabled:cursor-not-allowed transition-colors"
              title="Move up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={disabled || !canMoveDown}
              className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 disabled:hover:text-slate-500 rounded cursor-pointer disabled:cursor-not-allowed transition-colors"
              title="Move down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Preview Trigger */}
        {item.previewUrl && onPreview && (
          <button
            type="button"
            onClick={() => onPreview(item)}
            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
            title="Preview file"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          disabled={disabled}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          title="Remove file"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
