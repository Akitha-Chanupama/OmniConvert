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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="min-w-0 pr-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {filename}
            </h3>
            <p className="text-xs text-slate-500">
              {fileSizeBytes !== undefined && formatBytes(fileSizeBytes)} • {ext.toUpperCase()} Preview
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {isHtml && (
              <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold mr-2">
                <button
                  type="button"
                  onClick={() => setViewHtmlSource(false)}
                  className={`px-2.5 py-1 rounded-md flex items-center space-x-1 cursor-pointer transition-colors ${
                    !viewHtmlSource ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Rendered</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewHtmlSource(true)}
                  className={`px-2.5 py-1 rounded-md flex items-center space-x-1 cursor-pointer transition-colors ${
                    viewHtmlSource ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code2 className="w-3 h-3" />
                  <span>Source</span>
                </button>
              </div>
            )}

            {textContent !== null && (
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg text-xs inline-flex items-center space-x-1 cursor-pointer transition-colors"
                title="Copy content"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}

            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              title="Open raw file in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href={fullUrl}
              download={filename}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg inline-flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50/30 flex items-center justify-center min-h-[300px]">
          {isImage ? (
            <div className="flex items-center justify-center w-full h-full p-2">
              <img
                src={fullUrl}
                alt={filename}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm border border-slate-200 bg-white"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={fullUrl}
              title={filename}
              className="w-full h-[70vh] rounded-lg border border-slate-200 bg-white shadow-2xs"
            />
          ) : isHtml && !viewHtmlSource ? (
            <iframe
              srcDoc={textContent || ''}
              title={filename}
              sandbox="allow-same-origin"
              className="w-full h-[70vh] rounded-lg border border-slate-200 bg-white shadow-2xs p-2"
            />
          ) : isTextLike ? (
            <div className="w-full h-full max-h-[70vh] overflow-auto bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs leading-relaxed border border-slate-800">
              {loadingText ? (
                <p className="text-slate-400 italic">Loading preview...</p>
              ) : (
                <pre className="whitespace-pre-wrap break-words">{textContent}</pre>
              )}
            </div>
          ) : (
            <div className="text-center p-8 space-y-2 text-slate-500">
              <p className="text-sm font-medium">Binary file format preview not available.</p>
              <p className="text-xs">You can download the file directly to view it on your computer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
