import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Layers,
  UploadCloud,
  RotateCw,
  RotateCcw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Archive,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  CheckSquare,
  Square,
  Undo2,
  GripVertical,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { ConversionApi } from '../services/conversionApi';
import type { PdfPageThumbnailItem, PdfInspectResponse, PdfCompileResponse } from '../types';
import { formatBytes } from '../utils/formatters';

interface PdfStudioPageProps {
  initialFile?: File | null;
  onClearInitialFile?: () => void;
  onNavigateToDashboard?: () => void;
}

export const PdfStudioPage: React.FC<PdfStudioPageProps> = ({
  initialFile,
  onClearInitialFile,
  onNavigateToDashboard,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pages, setPages] = useState<PdfPageThumbnailItem[]>([]);
  const [originalPages, setOriginalPages] = useState<PdfPageThumbnailItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compileResult, setCompileResult] = useState<PdfCompileResponse | null>(null);

  // Drag and drop reorder state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPdf = useCallback(async (pdfFile: File) => {
    if (!pdfFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF file (.pdf).');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCompileResult(null);

    try {
      const res: PdfInspectResponse = await ConversionApi.inspectPdf(pdfFile);
      setSessionId(res.session_id);
      setFile(pdfFile);

      const items: PdfPageThumbnailItem[] = res.pages.map((p) => ({
        id: `page-${p.page_index}-${Date.now()}-${Math.random()}`,
        pageIndex: p.page_index,
        pageNumber: p.page_number,
        width: p.width,
        height: p.height,
        rotation: 0,
        thumbnailUrl: p.thumbnail_url,
        selected: false,
      }));

      setPages(items);
      setOriginalPages(items);
    } catch (err: any) {
      setError(err.message || 'Failed to inspect PDF pages.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle incoming file passed as prop
  useEffect(() => {
    if (initialFile) {
      loadPdf(initialFile);
      onClearInitialFile?.();
    }
  }, [initialFile, loadPdf, onClearInitialFile]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      loadPdf(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      loadPdf(e.dataTransfer.files[0]);
    }
  };

  // Reordering handlers
  const handleDragStart = (index: number) => {
    setDraggedIdx(index);
  };

  const handleDragEnter = (index: number) => {
    setDragOverIdx(index);
  };

  const handleDragEnd = () => {
    if (draggedIdx !== null && dragOverIdx !== null && draggedIdx !== dragOverIdx) {
      setPages((prev) => {
        const next = [...prev];
        const [moved] = next.splice(draggedIdx, 1);
        next.splice(dragOverIdx, 0, moved);
        return next;
      });
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  // Shift left/right via button
  const movePage = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= pages.length) return;
    setPages((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  // Single page rotation
  const rotatePage = (index: number, degrees: number) => {
    setPages((prev) => {
      const next = [...prev];
      const currentRot = next[index].rotation;
      next[index] = {
        ...next[index],
        rotation: (currentRot + degrees + 360) % 360,
      };
      return next;
    });
  };

  // Delete/Exclude single page
  const deletePage = (index: number) => {
    setPages((prev) => prev.filter((_, i) => i !== index));
  };

  // Selection toggle
  const toggleSelectPage = (index: number) => {
    setPages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], selected: !next[index].selected };
      return next;
    });
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  // Bulk actions
  const selectAll = (select: boolean) => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: select })));
  };

  const rotateAll = (degrees: number) => {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        rotation: (p.rotation + degrees + 360) % 360,
      }))
    );
  };

  const deleteSelected = () => {
    setPages((prev) => prev.filter((p) => !p.selected));
  };

  const resetOrder = () => {
    setPages(originalPages);
  };

  // Compile / Export
  const handleCompile = async (exportType: 'pdf' | 'images_zip') => {
    if (!sessionId || !file || pages.length === 0) return;

    setIsCompiling(true);
    setError(null);
    setCompileResult(null);

    try {
      const pageSpecs = pages.map((p) => ({
        page_index: p.pageIndex,
        rotation: p.rotation,
      }));

      const res = await ConversionApi.compilePdf(sessionId, file.name, pageSpecs, exportType);
      setCompileResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to export PDF.');
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-violet-600 dark:text-violet-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Visual PDF Organizer & Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Interactive PDF Studio
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
            Reorder pages with drag & drop, rotate individual pages, delete unwanted content, and export organized PDFs or high-resolution images locally.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          {onNavigateToDashboard && (
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
          )}

          {file && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setSessionId(null);
                setPages([]);
                setCompileResult(null);
              }}
              className="px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer flex items-center space-x-2"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Open Different PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-2xl text-rose-900 dark:text-rose-200 text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="p-1 text-rose-600 hover:text-rose-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading inspection indicator */}
      {isLoading && (
        <div className="p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/70 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Generating High-Resolution Page Thumbnails...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Rendering multi-page raster previews with local engine.
            </p>
          </div>
        </div>
      )}

      {/* Empty State: PDF Dropzone */}
      {!file && !isLoading && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-400 rounded-3xl p-10 sm:p-16 text-center cursor-pointer transition-all bg-white/70 dark:bg-slate-900/40 hover:bg-violet-50/20 dark:hover:bg-violet-950/10 shadow-xs hover:shadow-md group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
              <Layers className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Drop your PDF here to organize pages
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Supports multi-page documents. Visual thumbnails will render in real time.
              </p>
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-md transition-all">
                <UploadCloud className="w-4 h-4" />
                <span>Select PDF File</span>
              </span>
            </div>

            {/* Feature highlights chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <span className="px-3 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
                📑 Visual Page Grid
              </span>
              <span className="px-3 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
                ⇄ Drag & Drop Reorder
              </span>
              <span className="px-3 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
                ↻ Rotate 90° CW / CCW
              </span>
              <span className="px-3 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
                🗑️ Delete & Exclude
              </span>
              <span className="px-3 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
                🖼️ Export as Images ZIP
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Studio Workspace */}
      {file && !isLoading && (
        <div className="space-y-6">
          {/* File Overview & Global Action Toolbar */}
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Left: Document details */}
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate" title={file.name}>
                  {file.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(file.size)} • {pages.length} Pages Loaded
                  {pages.length !== originalPages.length && (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold ml-1.5">
                      ({originalPages.length - pages.length} excluded)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Right: Quick Batch Actions */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Select All Toggle */}
              <button
                type="button"
                onClick={() => selectAll(selectedCount !== pages.length)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                {selectedCount === pages.length && pages.length > 0 ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Select All</span>
                  </>
                )}
              </button>

              {/* Rotate All CW */}
              <button
                type="button"
                onClick={() => rotateAll(90)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
                title="Rotate all pages 90° clockwise"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate All 90°</span>
              </button>

              {/* Reset to Original Order */}
              <button
                type="button"
                onClick={resetOrder}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
                title="Reset order and restore deleted pages"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              {/* Delete selected */}
              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={deleteSelected}
                  className="px-3 py-1.5 text-xs font-bold bg-rose-50 dark:bg-rose-950/80 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Compilation Success Banner if available */}
          {compileResult && (
            <div className="p-5 bg-emerald-50/90 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-3xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {compileResult.filename}
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    {compileResult.message} • {formatBytes(compileResult.file_size_bytes)} • {compileResult.page_count} pages
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <a
                  href={ConversionApi.getFullDownloadUrl(compileResult.download_url)}
                  download={compileResult.filename}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl inline-flex items-center justify-center space-x-2 transition-colors shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Result</span>
                </a>
                <button
                  type="button"
                  onClick={() => setCompileResult(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Page Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {pages.map((page, idx) => {
              const isDragged = draggedIdx === idx;
              const isOver = dragOverIdx === idx;

              return (
                <div
                  key={page.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragEnter={() => handleDragEnter(idx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className={`group relative bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
                    page.selected
                      ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                      : isOver
                      ? 'border-violet-500 scale-[1.02] shadow-lg ring-2 ring-violet-500/30'
                      : isDragged
                      ? 'opacity-40 scale-95'
                      : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md'
                  }`}
                >
                  {/* Top Bar of Page Card */}
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="checkbox"
                        checked={!!page.selected}
                        onChange={() => toggleSelectPage(idx)}
                        className="w-3.5 h-3.5 text-blue-600 rounded-sm cursor-pointer accent-blue-600"
                        title="Select page"
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        #{idx + 1}
                      </span>
                      {page.pageNumber !== idx + 1 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          (orig {page.pageNumber})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      {page.rotation !== 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
                          {page.rotation}°
                        </span>
                      )}
                      <div
                        className="cursor-grab active:cursor-grabbing p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Preview Area */}
                  <div className="p-3 flex-1 flex items-center justify-center bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:14px_14px] min-h-[180px] overflow-hidden select-none">
                    <img
                      src={page.thumbnailUrl}
                      alt={`Page ${page.pageNumber}`}
                      className="max-w-full max-h-[160px] object-contain rounded-md shadow-xs transition-transform duration-200 pointer-events-none"
                      style={{ transform: `rotate(${page.rotation}deg)` }}
                    />
                  </div>

                  {/* Bottom Action Bar on Page Card */}
                  <div className="px-2 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between text-slate-500 dark:text-slate-400">
                    {/* Shift Left */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => movePage(idx, 'left')}
                      className="p-1 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Move page left"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    {/* Rotate CCW */}
                    <button
                      type="button"
                      onClick={() => rotatePage(idx, -90)}
                      className="p-1 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                      title="Rotate 90° CCW"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {/* Rotate CW */}
                    <button
                      type="button"
                      onClick={() => rotatePage(idx, 90)}
                      className="p-1 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                      title="Rotate 90° CW"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Page */}
                    <button
                      type="button"
                      onClick={() => deletePage(idx)}
                      className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/60 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors"
                      title="Delete / Exclude this page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Shift Right */}
                    <button
                      type="button"
                      disabled={idx === pages.length - 1}
                      onClick={() => movePage(idx, 'right')}
                      className="p-1 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Move page right"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {pages.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <p className="text-slate-500 font-semibold text-sm">All pages have been excluded.</p>
              <button
                type="button"
                onClick={resetOrder}
                className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-500 cursor-pointer"
              >
                Restore Pages
              </button>
            </div>
          )}

          {/* Sticky Export Action Footer */}
          {pages.length > 0 && (
            <div className="sticky bottom-4 z-30 p-4 sm:p-5 bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-xl border border-white/10 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
              <div className="flex items-center space-x-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-extrabold text-sm sm:text-base">
                    Ready to Export {pages.length} Pages
                  </p>
                  <p className="text-xs text-slate-400">
                    All rotations and reordering will be preserved.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isCompiling}
                  onClick={() => handleCompile('images_zip')}
                  className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl border border-slate-700 transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  title="Export each page as high-res JPG inside a ZIP"
                >
                  <Archive className="w-4 h-4 text-amber-400" />
                  <span>Images ZIP</span>
                </button>

                <button
                  type="button"
                  disabled={isCompiling}
                  onClick={() => handleCompile('pdf')}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-2xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isCompiling ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Compiling...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Export Reordered PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
