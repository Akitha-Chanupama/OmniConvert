import React, { useEffect, useState } from 'react';
import { ShieldCheck, ArrowRight, Sparkles, History, Trash2, Download } from 'lucide-react';
import { FileDropzone } from '../components/FileDropzone';
import { FileCard } from '../components/FileCard';
import { FormatSelector } from '../components/FormatSelector';
import { ConversionSettings } from '../components/ConversionSettings';
import { ConversionProgress } from '../components/ConversionProgress';
import { ConversionResult } from '../components/ConversionResult';
import { ErrorMessage } from '../components/ErrorMessage';
import type {
  BatchConversionResponse,
  ConversionHistoryItem,
  ConversionOptions,
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

export const HomePage: React.FC<HomePageProps> = ({ presetTarget, onClearPreset }) => {
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
          setApiError(`Could not connect to local backend API: ${err.message}. Ensure backend is running on 127.0.0.1:8000.`);
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

    // For all files, check common supported formats
    const uniqueExts = Array.from(new Set(files.map((f) => f.detectedExt.toLowerCase())));
    if (uniqueExts.length === 1) {
      return formatsData.formats[uniqueExts[0]] || [];
    }

    // If multiple different extensions, intersect their targets
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

  // Trigger conversion
  const handleConvert = async () => {
    if (files.length === 0 || !selectedTarget) return;

    setIsConverting(true);
    setConversionError(null);

    try {
      const rawFiles = files.map((f) => f.file);
      const res = await ConversionApi.convertFiles(
        rawFiles,
        selectedTarget,
        options,
        mergePdf && isMultiPdf
      );
      setConversionResult(res);

      // Add to session history
      const historyEntry: ConversionHistoryItem = {
        id: res.conversion_id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        originalNames: files.map((f) => f.name),
        convertedFilename: res.items.length === 1 ? res.items[0].converted_filename : 'converted_files.zip',
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

  return (
    <div className="space-y-10 pb-16">
      {/* Header Headline */}
      <div className="text-center space-y-3 pt-4 sm:pt-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-100 rounded-full text-slate-700 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Local Engine • Zero Cloud APIs • Free & Private</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          Convert files. Keep it simple.
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
          Convert images, documents, PDFs, and spreadsheets locally on your computer with complete privacy.
        </p>
      </div>

      {/* API Connection Warning if backend unreachable */}
      {apiError && (
        <div className="max-w-2xl mx-auto">
          <ErrorMessage message={apiError} />
        </div>
      )}

      {/* Main Conversion Flow Card */}
      <div className="max-w-3xl mx-auto space-y-6">
        {conversionResult ? (
          <ConversionResult result={conversionResult} onReset={handleReset} />
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            {/* Dropzone */}
            <FileDropzone onFilesSelected={handleFilesSelected} disabled={isConverting} />

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Selected Files ({files.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={isConverting}
                    className="text-xs font-medium text-slate-500 hover:text-red-600 cursor-pointer flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {files.map((item) => (
                    <FileCard
                      key={item.id}
                      item={item}
                      onRemove={handleRemoveFile}
                      disabled={isConverting}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Format Selection & Options (Shown when files are uploaded) */}
            {files.length > 0 && (
              <div className="space-y-6 pt-4 border-t border-slate-100">
                <FormatSelector
                  availableTargets={availableTargets}
                  selectedTarget={selectedTarget}
                  onSelectTarget={setSelectedTarget}
                  capabilities={formatsData?.capabilities || []}
                  sourceFormat={firstExt}
                  disabled={isConverting}
                />

                {selectedTarget && (
                  <ConversionSettings
                    sourceFormat={firstExt}
                    targetFormat={selectedTarget}
                    isMultiPdf={isMultiPdf}
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

                {/* Active Progress or Convert Button */}
                {isConverting ? (
                  <ConversionProgress
                    statusMessage={
                      mergePdf
                        ? 'Merging PDF files in order...'
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
                    className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>Convert Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Popular Shortcuts */}
        <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-6 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Popular Conversions</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium">
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
              { src: 'YAML', dest: 'JSON' },
            ].map((sc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleShortcutClick(sc.src, sc.dest)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer flex items-center space-x-1"
              >
                <span>{sc.src}</span>
                <span className="text-slate-400">→</span>
                <span>{sc.dest}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Session History */}
        {history.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-slate-600" />
                <span>Recent Conversions (This Session)</span>
              </div>
              <button
                type="button"
                onClick={() => setHistory([])}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {history.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <p className="font-medium text-slate-800 truncate">
                      {item.convertedFilename}
                    </p>
                    <p className="text-slate-400">
                      {item.timestamp} • {formatBytes(item.fileSizeBytes)}
                    </p>
                  </div>
                  <a
                    href={ConversionApi.getFullDownloadUrl(item.downloadUrl)}
                    download={item.convertedFilename}
                    className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center space-x-1"
                    title="Download again"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
