import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Eye,
  SlidersHorizontal,
  Columns2,
  MoveHorizontal,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { marked } from 'marked';
import { formatBytes } from '../utils/formatters';
import { ConversionApi } from '../services/conversionApi';

export interface PreviewModalProps {
  filename: string;
  downloadUrl: string;
  fileSizeBytes?: number;
  isOpen: boolean;
  onClose: () => void;
  originalUrl?: string;
  originalSizeBytes?: number;
  originalFilename?: string;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  filename,
  downloadUrl,
  fileSizeBytes,
  isOpen,
  onClose,
  originalUrl,
  originalSizeBytes,
  originalFilename,
}) => {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [viewSource, setViewSource] = useState(false);
  const [copied, setCopied] = useState(false);

  // Comparison & Split Slider State
  const [compareMode, setCompareMode] = useState<'split' | 'side' | 'single'>('split');
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState(false);

  const imageContainerRef = useRef<HTMLDivElement>(null);

  const fullUrl = ConversionApi.getFullDownloadUrl(downloadUrl);
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'ico', 'svg', 'avif', 'tiff'].includes(ext);
  const originalExt = originalFilename ? originalFilename.split('.').pop()?.toLowerCase() || '' : '';
  const isOriginalImage = originalExt
    ? ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'ico', 'svg', 'avif', 'tiff'].includes(originalExt)
    : true;
  const hasComparison = isImage && !!originalUrl && isOriginalImage;

  const isPdf = ext === 'pdf';
  const isHtml = ext === 'html' || ext === 'htm';
  const isMarkdown = ext === 'md' || ext === 'markdown';
  const isTextLike = ['txt', 'md', 'markdown', 'json', 'yaml', 'yml', 'xml', 'csv', 'html', 'htm'].includes(ext);
  const canToggleRender = isHtml || isMarkdown;

  // Reset comparison slider state when opened
  useEffect(() => {
    if (isOpen) {
      setSliderPos(50);
      setIsDragging(false);
      if (hasComparison) {
        setCompareMode('split');
      }
    }
  }, [isOpen, hasComparison]);

  // Load text preview if file is text-based
  useEffect(() => {
    if (isOpen && isTextLike && !isPdf) {
      setLoadingText(true);
      fetch(fullUrl)
        .then((res) => res.text())
        .then((text) => {
          setTextContent(text);
          setLoadingText(false);
        })
        .catch(() => {
          setTextContent('Could not load file preview.');
          setLoadingText(false);
        });
    } else {
      setTextContent(null);
    }
  }, [isOpen, fullUrl, isTextLike, isPdf]);

  // Byte savings badge calculation
  const savingsData = useMemo(() => {
    if (originalSizeBytes === undefined || fileSizeBytes === undefined || originalSizeBytes <= 0) {
      return null;
    }
    const diff = originalSizeBytes - fileSizeBytes;
    const percent = Math.round((diff / originalSizeBytes) * 100);
    const isSavings = diff > 0;
    const isIncrease = diff < 0;

    return {
      diff,
      percent: Math.abs(percent),
      isSavings,
      isIncrease,
      badgeText: isSavings
        ? `-${Math.abs(percent)}% • ${formatBytes(originalSizeBytes)} → ${formatBytes(fileSizeBytes)}`
        : isIncrease
        ? `+${Math.abs(percent)}% • ${formatBytes(originalSizeBytes)} → ${formatBytes(fileSizeBytes)}`
        : `0% • ${formatBytes(originalSizeBytes)} → ${formatBytes(fileSizeBytes)}`,
      savedSummary: isSavings
        ? `${formatBytes(diff)} saved`
        : isIncrease
        ? `${formatBytes(Math.abs(diff))} larger`
        : 'same size',
    };
  }, [originalSizeBytes, fileSizeBytes]);

  // Slider dragging handlers
  const updateSliderPosition = useCallback((clientX: number) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const offsetX = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    setSliderPos(Math.round(pct * 10) / 10);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateSliderPosition(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      updateSliderPosition(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateSliderPosition(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateSliderPosition(e.touches[0].clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('touchcancel', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchcancel', handleMouseUp);
    };
  }, [isDragging, updateSliderPosition]);

  // Keyboard navigation (Escape to close, Left/Right arrow to nudge slider)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (hasComparison && compareMode === 'split') {
        if (e.key === 'ArrowLeft') {
          setSliderPos((prev) => Math.max(0, Math.round(prev - 2)));
        } else if (e.key === 'ArrowRight') {
          setSliderPos((prev) => Math.min(100, Math.round(prev + 2)));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, hasComparison, compareMode]);

  // Build rendered HTML for Markdown
  const markdownHtmlDoc = useMemo(() => {
    if (!isMarkdown || !textContent) return '';
    try {
      const parsedBody = marked.parse(textContent) as string;
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    :root { color-scheme: light dark; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.65;
      color: #1e293b;
      background-color: #ffffff;
      padding: 2.25rem;
      max-width: 820px;
      margin: 0 auto;
    }
    @media (prefers-color-scheme: dark) {
      body { color: #f1f5f9; background-color: #0b1329; }
      h1, h2, h3, h4 { color: #ffffff !important; }
      hr { border-color: #334155 !important; }
      code { background-color: #1e293b !important; color: #38bdf8 !important; }
      pre { background-color: #0f172a !important; border-color: #334155 !important; }
      table th { background-color: #1e293b !important; border-color: #334155 !important; color: #f8fafc !important; }
      table td { border-color: #334155 !important; }
      blockquote { border-color: #6366f1 !important; color: #94a3b8 !important; }
    }
    h1 { font-size: 1.85rem; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-top: 0; color: #0f172a; }
    h2 { font-size: 1.35rem; font-weight: 700; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.35rem; margin-top: 1.5rem; color: #1e293b; }
    h3 { font-size: 1.1rem; font-weight: 600; margin-top: 1.25rem; color: #334155; }
    p { margin: 0.75rem 0; }
    ul, ol { padding-left: 1.5rem; margin: 0.75rem 0; }
    li { margin: 0.25rem 0; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.875em; background-color: #f1f5f9; padding: 0.2em 0.4em; border-radius: 4px; }
    pre { background-color: #0f172a; color: #f8fafc; padding: 1rem; border-radius: 8px; overflow-x: auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.85rem; border: 1px solid #1e293b; line-height: 1.45; }
    pre code { background-color: transparent; color: inherit; padding: 0; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: 0.9rem; }
    th, td { border: 1px solid #cbd5e1; padding: 0.5rem 0.75rem; text-align: left; }
    th { background-color: #f8fafc; font-weight: 600; color: #0f172a; }
    blockquote { border-left: 4px solid #6366f1; padding-left: 1rem; margin: 1rem 0; color: #64748b; font-style: italic; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0; }
    a { color: #3b82f6; text-decoration: underline; }
  </style>
</head>
<body>
  ${parsedBody}
</body>
</html>`;
    } catch {
      return textContent;
    }
  }, [isMarkdown, textContent]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (textContent) {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
          <div className="min-w-0 pr-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {filename}
              </h3>
              {isMarkdown && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 shrink-0">
                  Markdown
                </span>
              )}

              {/* Byte savings badge in header */}
              {savingsData && (
                <div
                  className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border transition-colors ${
                    savingsData.isSavings
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800'
                      : savingsData.isIncrease
                      ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300/80 dark:border-amber-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                  title={`${savingsData.badgeText} (${savingsData.savedSummary})`}
                >
                  {savingsData.isSavings ? (
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : savingsData.isIncrease ? (
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  ) : null}
                  <span>{savingsData.badgeText}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {fileSizeBytes !== undefined && formatBytes(fileSizeBytes)} • {ext.toUpperCase()} Preview
              {hasComparison && originalFilename && (
                <span className="hidden sm:inline text-slate-400 dark:text-slate-500 ml-1.5">
                  (Comparing with {originalFilename})
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* View Mode switcher for Before / After images */}
            {hasComparison && (
              <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCompareMode('split')}
                  className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors ${
                    compareMode === 'split'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Interactive split comparison slider"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Split Slider</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCompareMode('side')}
                  className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors ${
                    compareMode === 'side'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Side by side view"
                >
                  <Columns2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Side-by-Side</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCompareMode('single')}
                  className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors ${
                    compareMode === 'single'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Single image view"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Single</span>
                </button>
              </div>
            )}

            {/* Markdown / HTML toggle */}
            {canToggleRender && (
              <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold mr-1">
                <button
                  type="button"
                  onClick={() => setViewSource(false)}
                  className={`px-3 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors ${
                    !viewSource
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Rendered</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewSource(true)}
                  className={`px-3 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors ${
                    viewSource
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Source</span>
                </button>
              </div>
            )}

            {/* Copy button for text */}
            {textContent !== null && (
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold inline-flex items-center space-x-1 cursor-pointer transition-colors border border-slate-200/60 dark:border-slate-700"
                title="Copy content"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : isMarkdown ? 'Copy MD' : 'Copy'}</span>
              </button>
            )}

            {/* Open Raw in New Tab */}
            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Open raw file in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Download Button */}
            <a
              href={fullUrl}
              download={filename}
              className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl inline-flex items-center space-x-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>

            {/* Close Modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer ml-1"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950 flex flex-col items-center justify-center min-h-[380px]">
          {hasComparison && compareMode === 'split' ? (
            /* Split Comparison Slider */
            <div className="w-full flex-1 flex flex-col items-center justify-center space-y-4">
              <div
                className="relative inline-block max-w-full max-h-[60vh] rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-md bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:16px_16px] cursor-ew-resize select-none touch-none group"
                ref={imageContainerRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                {/* Background image: After (Converted / Compressed) */}
                <img
                  src={fullUrl}
                  alt="Converted output"
                  className="max-w-full max-h-[60vh] object-contain block pointer-events-none select-none"
                  draggable={false}
                />

                {/* Foreground clipped image: Before (Original) */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none select-none"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <img
                    src={originalUrl}
                    alt="Original"
                    className="w-full h-full object-contain block pointer-events-none select-none"
                    draggable={false}
                  />
                </div>

                {/* Before badge top-left */}
                <div className="absolute top-3 left-3 pointer-events-none select-none z-10">
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/10 shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>Before (Original)</span>
                    {originalSizeBytes !== undefined && (
                      <span className="text-slate-300 font-normal">({formatBytes(originalSizeBytes)})</span>
                    )}
                  </div>
                </div>

                {/* After badge top-right */}
                <div className="absolute top-3 right-3 pointer-events-none select-none z-10">
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/10 shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>After (Output)</span>
                    {fileSizeBytes !== undefined && (
                      <span className="text-slate-300 font-normal">({formatBytes(fileSizeBytes)})</span>
                    )}
                  </div>
                </div>

                {/* Vertical Divider Line & Draggable Thumb Handle */}
                <div
                  className="absolute top-0 bottom-0 pointer-events-none z-20"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-0 bottom-0 -left-[1.5px] w-[3px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.6)]" />
                  <div
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-2xl border-2 border-white dark:border-slate-700 flex items-center justify-center pointer-events-auto cursor-ew-resize hover:scale-115 active:scale-95 transition-transform"
                    title="Drag left or right to compare"
                  >
                    <MoveHorizontal className="w-4 h-4 text-slate-800 dark:text-white" />
                  </div>
                </div>
              </div>

              {/* Slider Control Toolbar & Byte Savings Badge */}
              <div className="w-full max-w-xl px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2 w-full sm:w-auto flex-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                    Before
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-ew-resize accent-blue-600"
                    aria-label="Image comparison split slider"
                  />
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                    After
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSliderPos(100)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                      sliderPos === 100
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Original
                  </button>
                  <button
                    type="button"
                    onClick={() => setSliderPos(50)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                      sliderPos === 50
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    50/50 Split
                  </button>
                  <button
                    type="button"
                    onClick={() => setSliderPos(0)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                      sliderPos === 0
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Compressed
                  </button>
                </div>
              </div>
            </div>
          ) : hasComparison && compareMode === 'side' ? (
            /* Side-by-Side Comparison */
            <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-2 overflow-auto max-h-[72vh]">
              {/* Original Image Card */}
              <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Before (Original)
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {originalSizeBytes !== undefined && formatBytes(originalSizeBytes)}
                  </span>
                </div>
                <div className="flex-1 p-3 flex items-center justify-center bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:16px_16px] min-h-[280px]">
                  <img
                    src={originalUrl}
                    alt="Original"
                    className="max-w-full max-h-[50vh] object-contain rounded-lg"
                  />
                </div>
              </div>

              {/* Converted Output Card */}
              <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      After (Converted)
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {fileSizeBytes !== undefined && formatBytes(fileSizeBytes)}
                  </span>
                </div>
                <div className="flex-1 p-3 flex items-center justify-center bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:16px_16px] min-h-[280px]">
                  <img
                    src={fullUrl}
                    alt="Converted"
                    className="max-w-full max-h-[50vh] object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>
          ) : isImage ? (
            /* Single Image View */
            <div className="flex items-center justify-center w-full h-full p-2">
              <img
                src={fullUrl}
                alt={filename}
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={fullUrl}
              title={filename}
              className="w-full h-[70vh] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white shadow-2xs"
            />
          ) : isMarkdown && !viewSource ? (
            <iframe
              srcDoc={markdownHtmlDoc}
              title={filename}
              sandbox="allow-same-origin"
              className="w-full h-[70vh] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white shadow-2xs p-2"
            />
          ) : isHtml && !viewSource ? (
            <iframe
              srcDoc={textContent || ''}
              title={filename}
              sandbox="allow-same-origin"
              className="w-full h-[70vh] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white shadow-2xs p-4"
            />
          ) : isTextLike ? (
            <div className="w-full h-full max-h-[70vh] overflow-auto bg-slate-950 text-slate-100 p-5 rounded-2xl font-mono text-xs leading-relaxed border border-slate-800 shadow-inner">
              {loadingText ? (
                <p className="text-slate-400 italic">Loading preview...</p>
              ) : (
                <pre className="whitespace-pre-wrap break-words">{textContent}</pre>
              )}
            </div>
          ) : (
            <div className="text-center p-8 space-y-2 text-slate-500">
              <p className="text-sm font-semibold">Binary file format preview not available.</p>
              <p className="text-xs">You can download the file directly to view it on your computer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
