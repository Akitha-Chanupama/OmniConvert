import React, { useEffect, useMemo, useState } from 'react';
import { X, Download, Copy, Check, ExternalLink, Code2, Eye } from 'lucide-react';
import { marked } from 'marked';
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
  const [viewSource, setViewSource] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = ConversionApi.getFullDownloadUrl(downloadUrl);
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'ico', 'svg'].includes(ext);
  const isPdf = ext === 'pdf';
  const isHtml = ext === 'html' || ext === 'htm';
  const isMarkdown = ext === 'md' || ext === 'markdown';
  const isTextLike = ['txt', 'md', 'markdown', 'json', 'yaml', 'yml', 'xml', 'csv', 'html', 'htm'].includes(ext);
  const canToggleRender = isHtml || isMarkdown;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
          <div className="min-w-0 pr-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {filename}
              </h3>
              {isMarkdown && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 shrink-0">
                  Markdown
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {fileSizeBytes !== undefined && formatBytes(fileSizeBytes)} • {ext.toUpperCase()} Preview
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {canToggleRender && (
              <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold mr-2">
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
