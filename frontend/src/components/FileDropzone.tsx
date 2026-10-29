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
      // Reset input value to allow re-selecting same file if removed
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer select-none ${
        disabled
          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
          : isDragOver
          ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
          : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/50 shadow-sm'
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

      <div className="flex flex-col items-center justify-center space-y-4">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
            isDragOver ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {isDragOver ? <FileUp className="w-8 h-8 animate-bounce" /> : <UploadCloud className="w-8 h-8" />}
        </div>

        <div className="space-y-1">
          <p className="text-base sm:text-lg font-medium text-slate-800">
            {isDragOver ? 'Drop your files right here' : 'Drop files here or click to browse'}
          </p>
          <p className="text-xs sm:text-sm text-slate-500">
            Images, Documents, PDFs, Spreadsheets, Data files • Max 50 MB per file
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600">
          <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium">PNG</span>
          <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium">JPG</span>
          <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium">WEBP</span>
          <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium">PDF</span>
          <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium">DOCX</span>
          <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium">XLSX</span>
          <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium">CSV</span>
          <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium">JSON</span>
        </div>
      </div>
    </div>
  );
};
