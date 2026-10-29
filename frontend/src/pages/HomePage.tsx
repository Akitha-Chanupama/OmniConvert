import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  History,
  Trash2,
  Download,
  Clipboard,
  Eye,
  FileImage,
  FileSpreadsheet,
  FileCode,
  Layers,
  Lock,
  Cpu,
} from 'lucide-react';
import { FileDropzone } from '../components/FileDropzone';
import { FileCard } from '../components/FileCard';
import { FormatSelector } from '../components/FormatSelector';
import { ConversionSettings } from '../components/ConversionSettings';
import { ConversionProgress } from '../components/ConversionProgress';
import { ConversionResult } from '../components/ConversionResult';
import { ErrorMessage } from '../components/ErrorMessage';
import { PreviewModal } from '../components/PreviewModal';
import type {
  BatchConversionResponse,
  ConversionHistoryItem,
  ConversionOptions,
  ConvertedFileInfo,
  FormatsResponse,
  UploadedFileItem,
} from '../types';
import { ConversionApi } from '../services/conversionApi';
import { getFileExtension, formatBytes } from '../utils/formatters';

interface HomePageProps {
  onNavigateToTools?: () => void;
  presetTarget?: string | null;
  onClearPreset?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigateToTools, presetTarget, onClearPreset }) => {
  const [formatsData, setFormatsData] = useState<FormatsResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [mergePdf, setMergePdf] = useState(false);
  const [options, setOptions] = useState<ConversionOptions>({
    quality: 90,
    preserve_aspect_ratio: true,
  });

  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<BatchConversionResponse | null>(null);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  // Preview Modal State
  const [previewModal, setPreviewModal] = useState<{
    filename: string;
    downloadUrl: string;
    fileSizeBytes?: number;
    isOpen: boolean;
  } | null>(null);

  // Load formats on mount
  useEffect(() => {
    let isMounted = true;
    ConversionApi.getFormats()
      .then((data) => {
        if (isMounted) {
          setFormatsData(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setApiError(
            `Could not connect to local backend API: ${err.message}. Ensure backend is running on 127.0.0.1:8000.`
          );
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle preset if provided
  useEffect(() => {
    if (presetTarget) {
      setSelectedTarget(presetTarget.toLowerCase());
      if (onClearPreset) onClearPreset();
    }
  }, [presetTarget, onClearPreset]);

  // Handle file addition
  const handleFilesSelected = (newFiles: File[]) => {
    const items: UploadedFileItem[] = newFiles.map((file) => {
      const ext = getFileExtension(file.name);
      let previewUrl: string | undefined;
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      }
      return {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        detectedExt: ext,
        previewUrl,
      };
    });

    setFiles((prev) => [...prev, ...items]);
    setConversionResult(null);
    setConversionError(null);
  };

  // Clipboard Paste support (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const pastedFiles = Array.from(e.clipboardData.files);
        handleFilesSelected(pastedFiles);
        setPasteNotice(`Added ${pastedFiles.length} file(s) from clipboard!`);
        setTimeout(() => setPasteNotice(null), 3500);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  // Re-ordering files
  const handleMoveFileUp = (index: number) => {
    if (index <= 0) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const handleMoveFileDown = (index: number) => {
    if (index >= files.length - 1) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  // Remove individual file
  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  // Clear all files
  const handleClearAll = () => {
    files.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setFiles([]);
    setSelectedTarget('');
    setConversionResult(null);
    setConversionError(null);
  };

  // Determine available target formats
  const firstExt = files.length > 0 ? files[0].detectedExt.toLowerCase() : '';
  const availableTargets: string[] = React.useMemo(() => {
    if (!formatsData || files.length === 0) return [];

    const uniqueExts = Array.from(new Set(files.map((f) => f.detectedExt.toLowerCase())));
    if (uniqueExts.length === 1) {
      return formatsData.formats[uniqueExts[0]] || [];
    }

    // Intersect common targets across all file types
    const formatLists = uniqueExts.map((ext) => formatsData.formats[ext] || []);
    if (formatLists.length === 0) return [];
    return formatLists.reduce((acc, curr) => acc.filter((item) => curr.includes(item)));
  }, [formatsData, files]);

  // Set default target when targets update
  useEffect(() => {
    if (availableTargets.length > 0) {
      if (!availableTargets.includes(selectedTarget)) {
        setSelectedTarget(availableTargets[0]);
      }
    } else {
      setSelectedTarget('');
    }
  }, [availableTargets, selectedTarget]);

  const isMultiPdf = files.length > 1 && files.every((f) => f.detectedExt.toLowerCase() === 'pdf');
  const isMultiImage =
    files.length > 1 &&
    files.every((f) =>
      ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'].includes(f.detectedExt.toLowerCase())
    );

  const totalBytes = React.useMemo(() => {
    return files.reduce((acc, curr) => acc + curr.size, 0);
  }, [files]);

  // Trigger conversion
  const handleConvert = async () => {
    if (files.length === 0 || !selectedTarget) return;

    setIsConverting(true);
    setConversionError(null);

    try {
      const rawFiles = files.map((f) => f.file);
      const shouldMerge = mergePdf && (isMultiPdf || isMultiImage);

      const res = await ConversionApi.convertFiles(
        rawFiles,
        selectedTarget,
        options,
        shouldMerge
      );
      setConversionResult(res);

      // Add to session history
      const historyEntry: ConversionHistoryItem = {
        id: res.conversion_id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        originalNames: files.map((f) => f.name),
        convertedFilename:
          res.items.length === 1 ? res.items[0].converted_filename : 'converted_files.zip',
        targetFormat: selectedTarget,
        downloadUrl: res.download_url,
        fileSizeBytes: res.items.reduce((acc, curr) => acc + curr.file_size_bytes, 0),
        isZip: res.is_zip,
      };
      setHistory((prev) => [historyEntry, ...prev.slice(0, 9)]);
    } catch (err: any) {
      setConversionError(err.message || 'Conversion failed. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = () => {
    handleClearAll();
  };

  const handleShortcutClick = (_source: string, target: string) => {
    setSelectedTarget(target);
  };

  const handlePreviewConverted = (item: ConvertedFileInfo) => {
    setPreviewModal({
      filename: item.converted_filename,
      downloadUrl: item.download_url,
      fileSizeBytes: item.file_size_bytes,
      isOpen: true,
    });
  };

  const handlePreviewUploaded = (item: UploadedFileItem) => {
    if (item.previewUrl) {
      setPreviewModal({
        filename: item.name,
        downloadUrl: item.previewUrl,
        fileSizeBytes: item.size,
        isOpen: true,
      });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner Headline */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 rounded-full text-indigo-700 dark:text-indigo-400 text-xs font-bold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Private Local Studio • Zero Cloud Uploads • Open Source Engines</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Convert files. Keep it simple.
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-2xl">
            High performance local converter for images, PDFs, office documents, spreadsheets, and data structures.
          </p>
        </div>

        {/* Quick Stats or Actions */}
        <div className="flex items-center space-x-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Processing</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Synchronous Engine</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Max Upload</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">50 MB / File</span>
          </div>
        </div>
      </div>

      {/* Paste notification pill */}
      {pasteNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center space-x-2 shadow-sm animate-in fade-in slide-in-from-top-2">
          <Clipboard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{pasteNotice}</span>
        </div>
      )}

      {/* API Connection Warning if backend unreachable */}
      {apiError && (
        <div className="w-full">
          <ErrorMessage message={apiError} />
        </div>
      )}

      {/* 2-Column Split Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload Stage & File Queue (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Dropzone */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Select or Drop Files
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload one or more files to convert in parallel or merge
                </p>
              </div>

              {files.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">
                    {files.length} file{files.length > 1 ? 's' : ''} ({formatBytes(totalBytes)})
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={isConverting}
                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    title="Clear all uploaded files"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <FileDropzone onFilesSelected={handleFilesSelected} disabled={isConverting} />

            {/* Selected Files Queue */}
            {files.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <span>File Queue</span>
                  {files.length > 1 && (
                    <span className="text-[11px] font-normal normal-case text-indigo-600 dark:text-indigo-400">
                      Use arrows on cards to re-order pages
                    </span>
                  )}
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {files.map((item, idx) => (
                    <FileCard
                      key={item.id}
                      item={item}
                      index={idx}
                      onRemove={handleRemoveFile}
                      onMoveUp={() => handleMoveFileUp(idx)}
                      onMoveDown={() => handleMoveFileDown(idx)}
                      canMoveUp={idx > 0}
                      canMoveDown={idx < files.length - 1}
                      onPreview={handlePreviewUploaded}
                      disabled={isConverting}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* When no files are selected: Show Rich Feature Hub Cards */}
          {files.length === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Image Studio Tile */}
                <div
                  onClick={() => handleShortcutClick('PNG', 'JPG')}
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileImage className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Image Studio
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Convert between PNG, JPG, WebP, BMP, TIFF, GIF, and ICO with transparency preservation.
                    </p>
                  </div>
                </div>

                {/* PDF Suite Tile */}
                <div
                  onClick={() => handleShortcutClick('IMG', 'PDF')}
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      PDF Suite & Merging
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Combine multiple images into 1 PDF, merge PDFs, rotate pages, or extract text per page.
                    </p>
                  </div>
                </div>

                {/* Spreadsheet Studio Tile */}
                <div
                  onClick={() => handleShortcutClick('CSV', 'XLSX')}
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Spreadsheets & Excel
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Convert tabular CSV files to modern Excel XLSX, or export XLSX worksheets to CSV and JSON.
                    </p>
                  </div>
                </div>

                {/* Structured Data Tile */}
                <div
                  onClick={() => handleShortcutClick('JSON', 'YAML')}
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer group space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Data & Documents
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Convert JSON $\leftrightarrow$ YAML, format XML safely, render Markdown to HTML, and extract DOCX text.
                    </p>
                  </div>
                </div>
              </div>

              {onNavigateToTools && (
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Need batch conversions or wanting to see all supported extensions?
                  </span>
                  <button
                    type="button"
                    onClick={onNavigateToTools}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center space-x-1 group"
                  >
                    <span>Browse All Tools</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              )}

              {/* Local Security Guarantee */}
              <div className="p-6 bg-slate-900 dark:bg-slate-900/90 text-white rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm">Strict Local Sandbox</h4>
                    <p className="text-xs text-slate-300">
                      Files are processed in isolated per-job folders on your disk and automatically wiped.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center space-x-2">
                  <span className="px-3 py-1 bg-white/10 rounded-xl text-xs font-semibold text-emerald-400 border border-white/10">
                    ✓ 0 Bytes Sent Online
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Conversion Control Center & Results (5 Columns) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          {/* Active Conversion Box or Result */}
          {conversionResult ? (
            <ConversionResult
              result={conversionResult}
              onReset={handleReset}
              onPreview={handlePreviewConverted}
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Conversion Studio</span>
                </h3>
                {files.length > 0 ? (
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-md">
                    Ready to Configure
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">Waiting for files</span>
                )}
              </div>

              {files.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-3 bg-slate-50/60 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 mx-auto flex items-center justify-center text-slate-400 shadow-2xs border border-slate-200/60 dark:border-slate-800">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Upload files on the left to begin
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto mt-0.5">
                      Target formats, quality sliders, and options will automatically adapt to your file types.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Format Selector */}
                  <FormatSelector
                    availableTargets={availableTargets}
                    selectedTarget={selectedTarget}
                    onSelectTarget={setSelectedTarget}
                    capabilities={formatsData?.capabilities || []}
                    sourceFormat={firstExt}
                    disabled={isConverting}
                  />

                  {/* Contextual Options */}
                  {selectedTarget && (
                    <ConversionSettings
                      sourceFormat={firstExt}
                      targetFormat={selectedTarget}
                      isMultiPdf={isMultiPdf}
                      isMultiImage={isMultiImage}
                      mergePdf={mergePdf}
                      onToggleMergePdf={setMergePdf}
                      options={options}
                      onChangeOptions={setOptions}
                      disabled={isConverting}
                    />
                  )}

                  {/* Error Banner */}
                  {conversionError && (
                    <ErrorMessage
                      message={conversionError}
                      onDismiss={() => setConversionError(null)}
                    />
                  )}

                  {/* Convert Action Button / Progress */}
                  {isConverting ? (
                    <ConversionProgress
                      statusMessage={
                        mergePdf
                          ? isMultiImage
                            ? `Compiling ${files.length} images into PDF...`
                            : 'Merging PDF files in order...'
                          : files.length > 1
                          ? `Converting ${files.length} files...`
                          : 'Converting file...'
                      }
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={handleConvert}
                      disabled={!selectedTarget || files.length === 0}
                      className="w-full py-4 px-6 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white dark:text-slate-900 disabled:text-slate-400 font-extrabold rounded-2xl flex items-center justify-center space-x-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:cursor-not-allowed text-sm sm:text-base group"
                    >
                      <span>Convert {files.length} File{files.length > 1 ? 's' : ''} Now</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Popular Shortcuts Pill Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Popular Fast Shortcuts</span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
              {[
                { src: 'JPG', dest: 'PNG' },
                { src: 'PNG', dest: 'JPG' },
                { src: 'PNG', dest: 'WEBP' },
                { src: 'IMG', dest: 'PDF' },
                { src: 'PDF', dest: 'TXT' },
                { src: 'CSV', dest: 'XLSX' },
                { src: 'XLSX', dest: 'CSV' },
                { src: 'MD', dest: 'HTML' },
                { src: 'JSON', dest: 'YAML' },
              ].map((sc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleShortcutClick(sc.src, sc.dest)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700/80 rounded-lg text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center space-x-1 text-[11px]"
                >
                  <span>{sc.src}</span>
                  <span className="text-slate-400">→</span>
                  <span>{sc.dest}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Session Activity Hub (Recent Conversions) */}
          {history.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-2">
                  <History className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                  <span>Session History ({history.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer font-semibold text-[11px]"
                >
                  Clear
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs max-h-60 overflow-y-auto">
                {history.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between">
                    <div className="min-w-0 pr-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={item.convertedFilename}>
                        {item.convertedFilename}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {item.timestamp} • {formatBytes(item.fileSizeBytes)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      {!item.isZip && (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewModal({
                              filename: item.convertedFilename,
                              downloadUrl: item.downloadUrl,
                              fileSizeBytes: item.fileSizeBytes,
                              isOpen: true,
                            })
                          }
                          className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <a
                        href={ConversionApi.getFullDownloadUrl(item.downloadUrl)}
                        download={item.convertedFilename}
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors inline-flex items-center"
                        title="Download again"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inline Preview Modal */}
      {previewModal && (
        <PreviewModal
          filename={previewModal.filename}
          downloadUrl={previewModal.downloadUrl}
          fileSizeBytes={previewModal.fileSizeBytes}
          isOpen={previewModal.isOpen}
          onClose={() => setPreviewModal(null)}
        />
      )}
    </div>
  );
};
