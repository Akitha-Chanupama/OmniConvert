import React from 'react';
import { FileText, Image as ImageIcon, Trash2, FileSpreadsheet, FileCode } from 'lucide-react';
import type { UploadedFileItem } from '../types';
import { formatBytes, truncateFilename } from '../utils/formatters';

interface FileCardProps {
  item: UploadedFileItem;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({ item, onRemove, disabled = false }) => {
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'ico'].includes(item.detectedExt);
  const isSpreadsheet = ['csv', 'xlsx', 'xls'].includes(item.detectedExt);
  const isCodeOrData = ['json', 'yaml', 'yml', 'xml'].includes(item.detectedExt);

  return (
    <div className="flex items-center justify-between p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 transition-colors">
      <div className="flex items-center space-x-3.5 min-w-0">
        <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden text-slate-600">
          {item.previewUrl ? (
            <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : isImage ? (
            <ImageIcon className="w-5 h-5 text-indigo-600" />
          ) : isSpreadsheet ? (
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          ) : isCodeOrData ? (
            <FileCode className="w-5 h-5 text-amber-600" />
          ) : (
            <FileText className="w-5 h-5 text-slate-600" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-800 truncate" title={item.name}>
            {truncateFilename(item.name, 36)}
          </p>
          <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-500">
            <span>{formatBytes(item.size)}</span>
            <span>•</span>
            <span className="uppercase font-semibold text-slate-600 px-1.5 py-0.2 bg-slate-100 rounded text-[10px]">
              {item.detectedExt || 'FILE'}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        disabled={disabled}
        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        title="Remove file"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
