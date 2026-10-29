import React, { useEffect, useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Layers, FileSpreadsheet, FileCode } from 'lucide-react';

interface GlobalDropOverlayProps {
  onFilesDropped: (files: File[]) => void;
  disabled?: boolean;
}

export const GlobalDropOverlay: React.FC<GlobalDropOverlayProps> = ({
  onFilesDropped,
  disabled = false,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    if (disabled) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      // Ensure we are dragging files (not just text or links)
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        dragCounter.current += 1;
        if (dragCounter.current === 1) {
          setIsDragActive(true);
        }
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsDragActive(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragActive(false);

      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        onFilesDropped(files);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [disabled, onFilesDropped]);

  if (!isDragActive) return null;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      aria-hidden="true"
    >
      {/* Outer Glow Boundary Frame */}
      <div className="relative w-[calc(100%-3rem)] sm:w-[calc(100%-6rem)] max-w-4xl h-[70vh] max-h-[600px] rounded-3xl border-3 border-dashed border-blue-500/80 dark:border-blue-400/90 bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent flex flex-col items-center justify-center text-center p-6 sm:p-12 shadow-[0_0_80px_rgba(59,130,246,0.3)] animate-pulse">
        {/* Pulsing Ambient Radial Aura */}
        <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.25)_0%,transparent_70%)] pointer-events-none" />

        {/* Central Icon Emblem */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-2xl shadow-blue-500/50 ring-8 ring-blue-500/20 transform hover:scale-105 transition-transform duration-300">
            <UploadCloud className="w-12 h-12 sm:w-14 sm:h-14 animate-bounce" />
          </div>
        </div>

        {/* Text Headline */}
        <div className="relative z-10 space-y-2 max-w-lg">
          <h2 className="font-display text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            Drop anywhere to convert
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Release your files anywhere on the screen. OmniConvert will automatically queue and detect them for instant local conversion.
          </p>
        </div>

        {/* Floating Category Pills */}
        <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-2.5">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white backdrop-blur-sm shadow-xs">
            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>Images (PNG, JPG, WEBP)</span>
          </span>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white backdrop-blur-sm shadow-xs">
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span>PDF &amp; Split/Merge</span>
          </span>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white backdrop-blur-sm shadow-xs">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Markdown &amp; Docs</span>
          </span>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white backdrop-blur-sm shadow-xs">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel &amp; CSV</span>
          </span>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white backdrop-blur-sm shadow-xs">
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span>JSON &amp; Data</span>
          </span>
        </div>
      </div>
    </div>
  );
};
