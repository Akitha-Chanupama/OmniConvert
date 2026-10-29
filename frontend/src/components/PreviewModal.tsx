import React, { useEffect, useState } from 'react';
import { X, Download, Copy, Check, ExternalLink, Code2, Eye } from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import { ConversionApi } from '../services/conversionApi';

interface PreviewModalProps {
  filename: string;
  downloadUrl: string;
  fileSizeBytes?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  filename,
  downloadUrl,
  fileSizeBytes,
  isOpen,
  onClose,
}) => {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [viewHtmlSource, setViewHtmlSource] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = ConversionApi.getFullDownloadUrl(downloadUrl);
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'ico', 'svg'].includes(ext);
  const isPdf = ext === 'pdf';
  const isHtml = ext === 'html' || ext === 'htm';
  const isTextLike = ['txt', 'md', 'json', 'yaml', 'yml', 'xml', 'csv', 'html', 'htm'].includes(ext);

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

  if (!isOpen) return null;

  const handleCopy = () => {
    if (textContent) {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
          <div className="min-w-0 pr-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              {filename}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {fileSizeBytes !== undefined && formatBytes(fileSizeBytes)} • {ext.toUpperCase()} Preview
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {isHtml && (
              <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold mr-2">
                <button
                  type="button"
                  onClick={() => setViewHtmlSource(false)}
                  className={`px-3 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors ${
                    !viewHtmlSource
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Rendered</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewHtmlSource(true)}
                  className={`px-3 py-1 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors ${
                    viewHtmlSource
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Source</span>
                </button>
              </div>
            )}

            {textContent !== null && (
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold inline-flex items-center space-x-1 cursor-pointer transition-colors border border-slate-200/60 dark:border-slate-700"
                title="Copy content"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}

            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Open raw file in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href={fullUrl}
              download={filename}
              className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl inline-flex items-center space-x-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950 flex items-center justify-center min-h-[350px]">
          {isImage ? (
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
          ) : isHtml && !viewHtmlSource ? (
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
