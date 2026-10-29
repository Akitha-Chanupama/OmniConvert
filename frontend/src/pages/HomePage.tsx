import React, { useEffect, useState } from 'react';
import {
  Trash2,
  Clipboard,
  History,
  Eye,
  Download,
  UploadCloud,
} from 'lucide-react';
import { HeroBanner } from '../components/dashboard/HeroBanner';
import { QuickActions } from '../components/dashboard/QuickActions';
import { FileDropzone } from '../components/FileDropzone';
import { FileCard } from '../components/FileCard';
import { ConversionSettings } from '../components/ConversionSettings';
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
  presetSource?: string | null;
  presetAction?: 'convert' | 'merge_pdf' | 'split_pdf' | null;
  onClearPreset?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToTools,
  presetTarget,
  presetSource,
  presetAction,
  onClearPreset,
}) => {
  const [formatsData, setFormatsData] = useState<FormatsResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [mergePdf, setMergePdf] = useState(false);
  const [options, setOptions] = useState<ConversionOptions>({
    quality: 80,
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
        if (isMounted) setFormatsData(data);
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
      setSelectedTarget(presetTarget.toUpperCase());
    }
    if (presetAction === 'merge_pdf') {
      setSelectedTarget('PDF');
      setMergePdf(true);
      setOptions((prev) => ({ ...prev, split_pdf: false }));
    } else if (presetAction === 'split_pdf') {
      setSelectedTarget('PDF');
      setMergePdf(false);
      setOptions((prev) => ({ ...prev, split_pdf: true }));
    }
  }, [presetTarget, presetSource, presetAction]);

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
      if (!availableTargets.some((t) => t.toUpperCase() === selectedTarget.toUpperCase())) {
        setSelectedTarget(availableTargets[0].toUpperCase());
      }
    }
  }, [availableTargets, selectedTarget]);

  const isMultiPdf = files.length > 1 && files.every((f) => f.detectedExt.toLowerCase() === 'pdf');
  const isMultiImage =
    files.length > 1 &&
    files.every((f) =>
      ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'].includes(f.detectedExt.toLowerCase())
    );
  const canMergeIntoPdf = (isMultiPdf || isMultiImage) && selectedTarget.toUpperCase() === 'PDF';

  // Trigger conversion
  const handleConvert = async () => {
    if (files.length === 0 || !selectedTarget) return;

    setIsConverting(true);
    setConversionError(null);

    try {
      const rawFiles = files.map((f) => f.file);
      const shouldMerge = mergePdf && canMergeIntoPdf;

      const res = await ConversionApi.convertFiles(
        rawFiles,
        selectedTarget.toLowerCase(),
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
        targetFormat: selectedTarget.toUpperCase(),
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

  const handleSelectQuickAction = (_source: string, target: string) => {
    setSelectedTarget(target.toUpperCase());
    if (target.toUpperCase() === 'PDF') {
      setMergePdf(true);
    }
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
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Hero Banner Section */}
      <HeroBanner />

      {/* Preset / Mode Activation Banner */}
      {(presetSource || presetAction) && (
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/90 dark:border-blue-800/80 rounded-2xl text-blue-900 dark:text-blue-300 text-xs font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span>
              {presetAction === 'split_pdf'
                ? 'Mode Active: Split PDF — drop a multi-page PDF to extract individual pages.'
                : presetAction === 'merge_pdf'
                ? 'Mode Active: Merge PDF — drop multiple PDFs or images to compile into one document.'
                : `Preset Active: ${presetSource?.toUpperCase()} → ${presetTarget?.toUpperCase()} conversion.`}
            </span>
          </div>
          {onClearPreset && (
            <button
              type="button"
              onClick={onClearPreset}
              className="px-2 py-1 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-lg text-[11px] font-bold border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      )}

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

      {/* Conversion error banner */}
      {conversionError && (
        <div className="w-full">
          <ErrorMessage message={conversionError} />
        </div>
      )}

      {/* Main 2-Column Split Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column (7 Columns): Upload Stage & File Queue + Quick Actions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Dropzone Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Select or Drop Files
                  </h2>
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    Upload one or more files to convert in parallel or merge
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-display px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
                  {files.length} file{files.length === 1 ? '' : 's'} selected
                </span>
                {files.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={isConverting}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                    title="Clear all uploaded files"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <FileDropzone onFilesSelected={handleFilesSelected} disabled={isConverting} />

            {/* Selected Files Queue */}
            {files.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  <span>File Queue</span>
                  {files.length > 1 && (
                    <span className="text-[11px] font-normal normal-case text-blue-600 dark:text-blue-400">
                      Use reorder controls to adjust page sequence
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {files.map((item, idx) => (
                    <FileCard
                      key={item.id}
                      item={item}
                      index={idx}
                      targetFormat={selectedTarget}
                      availableTargets={availableTargets}
                      onSelectTarget={(tgt) => setSelectedTarget(tgt)}
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

          {/* Popular Quick Actions Hub */}
          <QuickActions
            onSelectAction={handleSelectQuickAction}
            onNavigateToTools={onNavigateToTools}
          />
        </div>

        {/* Right Column (5 Columns): Sticky Conversion Studio & Result */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          {conversionResult ? (
            <ConversionResult
              result={conversionResult}
              onReset={handleReset}
              onPreview={handlePreviewConverted}
            />
          ) : (
            <ConversionSettings
              availableTargets={availableTargets}
              selectedTarget={selectedTarget}
              onSelectTarget={(t) => setSelectedTarget(t)}
              options={options}
              onChangeOptions={setOptions}
              filesCount={files.length}
              isConverting={isConverting}
              onConvert={handleConvert}
              canMergeIntoPdf={canMergeIntoPdf}
              isMultiPdf={isMultiPdf}
              mergePdf={mergePdf}
              onToggleMergePdf={setMergePdf}
            />
          )}

          {/* Session Activity Hub (Recent Conversions) */}
          {history.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <div className="flex items-center space-x-2">
                  <History className="w-3.5 h-3.5 text-slate-500" />
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
                      <p
                        className="font-bold text-slate-800 dark:text-slate-200 truncate"
                        title={item.convertedFilename}
                      >
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
                          className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <a
                        href={ConversionApi.getFullDownloadUrl(item.downloadUrl)}
                        download={item.convertedFilename}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Download"
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

      {/* Global Preview Modal */}
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
