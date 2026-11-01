import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  Download,
  Trash2,
  Search,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Layers,
  FileCode,
  Archive,
  Check,
  Copy,
} from 'lucide-react';
import {
  getStoredHistory,
  removeStoredHistoryItem,
  clearStoredHistory,
  subscribeHistory,
  type StoredConversionRecord,
} from '../utils/historyStore';
import { formatBytes } from '../utils/formatters';

interface ConversionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConversionHistoryDrawer: React.FC<ConversionHistoryDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [history, setHistory] = useState<StoredConversionRecord[]>(() => getStoredHistory());
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getStoredHistory());
    const unsubscribe = subscribeHistory((records) => {
      setHistory(records);
    });
    return unsubscribe;
  }, []);

  // Keyboard shortcut to close on Esc
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredHistory = history.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.convertedFilename.toLowerCase().includes(q) ||
      item.targetFormat.toLowerCase().includes(q) ||
      item.originalNames.some((n) => n.toLowerCase().includes(q))
    );
  });

  const handleCopyName = (id: string, name: string) => {
    navigator.clipboard.writeText(name).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  const getFormatIcon = (format: string, isZip?: boolean) => {
    if (isZip) return <Archive className="w-4 h-4 text-amber-500" />;
    const f = format.toUpperCase();
    if (['JPG', 'JPEG', 'PNG', 'WEBP', 'HEIC', 'AVIF'].includes(f)) {
      return <ImageIcon className="w-4 h-4 text-rose-500" />;
    }
    if (f === 'PDF') {
      return <Layers className="w-4 h-4 text-violet-500" />;
    }
    if (['DOCX', 'TXT', 'MD'].includes(f)) {
      return <FileText className="w-4 h-4 text-indigo-500" />;
    }
    if (['XLSX', 'CSV'].includes(f)) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
    }
    return <FileCode className="w-4 h-4 text-blue-500" />;
  };

  const formatTimeAgo = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 45) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Slide-over Drawer */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-full sm:w-110 max-w-full bg-white dark:bg-[#0c1427] text-slate-800 dark:text-slate-100 shadow-2xl flex flex-col border-l border-slate-200/90 dark:border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
              <History className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Conversion History
                </h3>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {history.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Stored locally on this device
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clear all conversion history records?')) {
                    clearStoredHistory();
                  }
                }}
                className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Clear all history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close history drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        {history.length > 0 && (
          <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0c1427]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name or format..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* History Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400 dark:text-slate-500">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <History className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-xs">
                <p className="font-display font-bold text-sm text-slate-700 dark:text-slate-300">
                  {searchQuery ? 'No matching conversions' : 'No conversion history yet'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {searchQuery
                    ? 'Try a different search term or clear the filter.'
                    : 'Converted files will be remembered here so you can easily re-download them during your session.'}
                </p>
              </div>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const icon = getFormatIcon(item.targetFormat, item.isZip);
              const isCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 hover:border-blue-400/50 dark:hover:border-blue-500/40 transition-all shadow-2xs group flex flex-col space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <p
                            className="font-display font-bold text-xs text-slate-900 dark:text-white truncate"
                            title={item.convertedFilename}
                          >
                            {item.convertedFilename}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleCopyName(item.id, item.convertedFilename)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                            title="Copy filename"
                          >
                            {isCopied ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          From: {item.originalNames.join(', ')}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 shrink-0">
                      {item.isZip ? 'ZIP' : item.targetFormat}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {formatBytes(item.fileSizeBytes)}
                      </span>
                      <span>•</span>
                      <span>{formatTimeAgo(item.timestamp)}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {item.downloadUrl && (
                        <a
                          href={item.downloadUrl}
                          download={item.convertedFilename}
                          className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-2xs"
                          title="Download again"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => removeStoredHistoryItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Remove from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};
