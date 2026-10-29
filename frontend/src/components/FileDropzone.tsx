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
          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 scale-[1.01] shadow-lg ring-4 ring-indigo-500/10'
          : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 hover:bg-slate-50/60 dark:hover:bg-slate-900/90 shadow-xs hover:shadow-md'
      }`}
    >
      {/* Decorative gradient glow on hover */}
      <div className="absolute inset-0 bg-radial from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
        disabled={disabled}
      />

      <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isDragOver
              ? 'bg-indigo-600 text-white scale-110 shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-indigo-600 group-hover:scale-105'
          }`}
        >
          {isDragOver ? <FileUp className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce" /> : <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />}
        </div>

        <div className="space-y-1.5 max-w-md">
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {isDragOver ? 'Drop files to upload instantly' : 'Drop your files here, or browse files'}
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Drag files from your desktop or paste directly with <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-mono">V</kbd>
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">PNG</span>
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">JPG</span>
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">WEBP</span>
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">PDF</span>
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">DOCX</span>
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">XLSX</span>
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">CSV</span>
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">JSON</span>
        </div>
      </div>
    </div>
  );
};
