import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileUp } from 'lucide-react';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ onFilesSelected, disabled = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      onFilesSelected(droppedFiles);
    }
  }, [disabled, onFilesSelected]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onFilesSelected(selectedFiles);
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`group relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer select-none overflow-hidden ${
        disabled
          ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 opacity-60 cursor-not-allowed'
          : isDragOver
          ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 scale-[1.01] shadow-lg ring-4 ring-blue-500/10'
          : 'border-slate-300 dark:border-slate-750 hover:border-blue-400 dark:hover:border-blue-500/80 bg-white dark:bg-slate-900/40 hover:bg-slate-50/60 dark:hover:bg-slate-900/70 shadow-2xs hover:shadow-md'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
        disabled={disabled}
      />

      <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
        {/* Centered Rich Multi-Layered Icon Emblem */}
        <div className="relative">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center transition-all duration-300 shadow-xl ${
              isDragOver
                ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white scale-110 shadow-blue-500/40 ring-8 ring-blue-500/20'
                : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-blue-500/25 ring-4 ring-blue-500/10 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-blue-500/40 group-hover:ring-8 group-hover:ring-blue-500/20'
            }`}
          >
            {isDragOver ? (
              <FileUp className="w-10 h-10 sm:w-11 sm:h-11 animate-bounce" />
            ) : (
              <UploadCloud className="w-10 h-10 sm:w-11 sm:h-11" />
            )}
          </div>
        </div>

        <div className="space-y-2 max-w-md">
          <p className="font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isDragOver ? (
              'Drop files to upload instantly'
            ) : (
              <>
                Drag your files here, or{' '}
                <span className="text-blue-600 dark:text-blue-400 underline underline-offset-4 decoration-2 decoration-blue-500/40 hover:decoration-blue-500">
                  browse files
                </span>
              </>
            )}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Supports multiple files. Press{' '}
            <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
              Ctrl
            </kbd>{' '}
            +{' '}
            <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
              V
            </kbd>{' '}
            to paste from clipboard.
          </p>
        </div>

        {/* Supported Format Pills */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 font-display text-xs font-bold text-slate-700 dark:text-slate-300">
          {['JPG', 'PNG', 'WEBP', 'PDF', 'DOCX', 'XLSX', 'CSV', 'JSON', 'MD'].map((fmt) => (
            <span
              key={fmt}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-transform hover:scale-105"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
