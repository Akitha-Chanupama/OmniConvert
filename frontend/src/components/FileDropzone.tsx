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
        {/* Centered Circular Cloud Icon */}
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            isDragOver
              ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30'
              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-transform'
          }`}
        >
          {isDragOver ? (
            <FileUp className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce" />
          ) : (
            <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
          )}
        </div>

        <div className="space-y-1.5 max-w-md">
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {isDragOver ? (
              'Drop files to upload instantly'
            ) : (
              <>
                Drag your files here, or{' '}
                <span className="text-blue-600 dark:text-blue-400 underline underline-offset-2">
                  browse files
                </span>
              </>
            )}
          </p>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
            Supports multiple files. Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-mono text-slate-600 dark:text-slate-300">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-mono text-slate-600 dark:text-slate-300">V</kbd> to paste from clipboard.
          </p>
        </div>

        {/* Supported Format Pills */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
          {['JPG', 'PNG', 'WEBP', 'PDF', 'DOCX', 'XLSX', 'CSV', 'JSON'].map((fmt) => (
            <span
              key={fmt}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800/90 rounded-lg border border-slate-200/80 dark:border-slate-700/80"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
