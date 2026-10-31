import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Trash2,
  FileSpreadsheet,
  FileCode,
  Eye,
  ChevronDown,
  Layers,
  ChevronUp,
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
  onOpenPdfStudio?: (file: File) => void;
  disabled?: boolean;
}

interface FormatTheme {
  category: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  iconBg: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const getFormatTheme = (ext: string): FormatTheme => {
  const cleanExt = ext.toLowerCase();

  if (cleanExt === 'pdf') {
    return {
      category: 'PDF Document',
      badgeBg: 'bg-gradient-to-r from-rose-500/15 to-red-500/10 dark:from-rose-500/25 dark:to-red-500/15',
      textColor: 'text-rose-600 dark:text-rose-400',
      borderColor: 'border-rose-500/30 dark:border-rose-500/40',
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
      icon: Layers,
    };
  }

  if (cleanExt === 'md' || cleanExt === 'markdown') {
    return {
      category: 'Markdown',
      badgeBg: 'bg-gradient-to-r from-violet-500/15 to-purple-500/10 dark:from-violet-500/25 dark:to-purple-500/15',
      textColor: 'text-violet-600 dark:text-violet-400',
      borderColor: 'border-violet-500/30 dark:border-violet-500/40',
      iconBg: 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800',
      icon: FileText,
    };
  }

  if (['csv', 'xlsx', 'xls'].includes(cleanExt)) {
    return {
      category: 'Spreadsheet',
      badgeBg: 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10 dark:from-emerald-500/25 dark:to-teal-500/15',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500/30 dark:border-emerald-500/40',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      icon: FileSpreadsheet,
    };
  }

  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'ico', 'heic', 'tiff'].includes(cleanExt)) {
    return {
      category: 'Image',
      badgeBg: 'bg-gradient-to-r from-sky-500/15 to-blue-500/10 dark:from-sky-500/25 dark:to-blue-500/15',
      textColor: 'text-sky-600 dark:text-sky-400',
      borderColor: 'border-sky-500/30 dark:border-sky-500/40',
      iconBg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800',
      icon: ImageIcon,
    };
  }

  if (['json', 'yaml', 'yml', 'xml'].includes(cleanExt)) {
    return {
      category: 'Data',
      badgeBg: 'bg-gradient-to-r from-amber-500/15 to-orange-500/10 dark:from-amber-500/25 dark:to-orange-500/15',
      textColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-500/30 dark:border-amber-500/40',
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      icon: FileCode,
    };
  }

  // Fallback: Document / text
  return {
    category: 'Document',
    badgeBg: 'bg-gradient-to-r from-indigo-500/15 to-blue-500/10 dark:from-indigo-500/25 dark:to-blue-500/15',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    borderColor: 'border-indigo-500/30 dark:border-indigo-500/40',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    icon: FileText,
  };
};

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
  onOpenPdfStudio,
  disabled = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const theme = getFormatTheme(item.detectedExt);
  const IconComp = theme.icon;

  const effectiveTarget = item.customTarget || targetFormat;

  // Click outside to close target selector
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative group flex items-center justify-between p-3.5 sm:p-4 bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs ring-1 ring-black/[0.04] dark:ring-white/[0.06] hover:border-blue-400 dark:hover:border-slate-700 hover:shadow-md transition-all">
      {/* Left: Thumbnail & File Metadata */}
      <div className="flex items-center space-x-3.5 min-w-0 flex-1 mr-3">
        {/* Live Thumbnail / Rich Icon Badge */}
        <div
          onClick={() => onPreview && onPreview(item)}
          className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden border shadow-xs transition-transform duration-200 ${
            theme.iconBg
          } ${onPreview ? 'cursor-pointer hover:scale-105' : ''}`}
          title={onPreview ? 'Click to preview' : undefined}
        >
          {item.previewUrl ? (
            <>
              <img
                src={item.previewUrl}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Eye className="w-4 h-4 text-white drop-shadow" />
              </div>
            </>
          ) : (
            <IconComp className="w-6 h-6 sm:w-7 sm:h-7" />
          )}
        </div>

        {/* Name, Size, & Color-Coded Extension Badge */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <p
              className="text-xs sm:text-sm font-bold font-display text-slate-900 dark:text-slate-100 truncate"
              title={item.name}
            >
              {truncateFilename(item.name, 38)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 text-[11px]">
            {/* Color-Coded Extension Badge */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-lg border font-display text-[10px] font-black uppercase tracking-wider ${theme.badgeBg} ${theme.textColor} ${theme.borderColor}`}
            >
              {item.detectedExt || 'FILE'}
            </span>

            <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>

            <span className="text-slate-500 dark:text-slate-400 font-medium font-mono text-[11px]">
              {formatBytes(item.size)}
            </span>

            <span className="hidden sm:inline text-slate-300 dark:text-slate-700 font-bold">•</span>

            <span className="hidden sm:inline text-slate-400 dark:text-slate-500 text-[10px]">
              {theme.category}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Per-File Target Selector & Action Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
        {/* Per-File Target Format Dropdown Selector */}
        {effectiveTarget && (
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => availableTargets.length > 0 && setDropdownOpen((prev) => !prev)}
              disabled={disabled || availableTargets.length === 0}
              className="px-2.5 sm:px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center space-x-1.5 transition-colors cursor-pointer select-none shadow-2xs"
              title="Change output format for this file"
            >
              <span className="uppercase font-mono text-slate-500 dark:text-slate-400">
                {item.detectedExt}
              </span>
              <span className="text-slate-400 text-[10px]">→</span>
              <span className="uppercase font-display font-black text-blue-600 dark:text-blue-400">
                {effectiveTarget}
              </span>
              {availableTargets.length > 1 && (
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              )}
            </button>

            {/* Target Options Popover */}
            {dropdownOpen && availableTargets.length > 1 && (
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl ring-1 ring-black/[0.08] dark:ring-white/[0.08] overflow-hidden z-40 p-1.5 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Target Format
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {availableTargets.map((tgt) => (
                    <button
                      key={tgt}
                      type="button"
                      onClick={() => {
                        onSelectTarget?.(tgt);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer flex items-center justify-between ${
                        tgt.toLowerCase() === effectiveTarget.toLowerCase()
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{tgt}</span>
                      {tgt.toLowerCase() === effectiveTarget.toLowerCase() && (
                        <span className="text-[10px] font-mono">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center space-x-1">
          {/* Quick PDF Studio Button */}
          {item.detectedExt.toLowerCase() === 'pdf' && onOpenPdfStudio && (
            <button
              type="button"
              onClick={() => onOpenPdfStudio(item.file)}
              className="px-2 py-1 bg-violet-50 dark:bg-violet-950/70 text-violet-600 dark:text-violet-300 hover:bg-violet-100 rounded-lg text-[11px] font-bold border border-violet-200 dark:border-violet-800 transition-colors flex items-center space-x-1 cursor-pointer mr-1"
              title="Open in PDF Visual Studio to reorder, rotate & extract pages"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Studio</span>
            </button>
          )}

          {/* Quick Preview Button */}
          {onPreview && (
            <button
              type="button"
              onClick={() => onPreview(item)}
              className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xl transition-colors cursor-pointer"
              title="Preview file content"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {/* Reorder Buttons (Move Up / Down) */}
          {(canMoveUp || canMoveDown) && (
            <div className="flex items-center space-x-0.5">
              {canMoveUp && onMoveUp && (
                <button
                  type="button"
                  onClick={onMoveUp}
                  disabled={disabled}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Move up in queue"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              )}
              {canMoveDown && onMoveDown && (
                <button
                  type="button"
                  onClick={onMoveDown}
                  disabled={disabled}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Move down in queue"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Remove from queue */}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            disabled={disabled}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer disabled:opacity-40"
            title="Remove from queue"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
