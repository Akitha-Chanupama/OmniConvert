import React, { useState, useEffect } from 'react';
import {
  X,
  FileCode2,
  FileText,
  FileSpreadsheet,
  Sparkles,
  ArrowRight,
  Code2,
} from 'lucide-react';

export type SnippetType = 'markdown' | 'json' | 'csv' | 'text';

interface PasteSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSnippetReady: (file: File, suggestedTarget: string) => void;
}

const SNIPPET_CONFIGS: Record<
  SnippetType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    defaultFilename: string;
    defaultTarget: string;
    mimeType: string;
    placeholder: string;
    availableTargets: string[];
  }
> = {
  markdown: {
    label: 'Markdown',
    icon: FileText,
    defaultFilename: 'document.md',
    defaultTarget: 'PDF',
    mimeType: 'text/markdown',
    placeholder: `# Project Overview\n\nWrite or paste your **Markdown** here...\n\n- Local document conversion\n- High fidelity typesetting\n\n\`\`\`javascript\nconsole.log("Hello OmniConvert");\n\`\`\``,
    availableTargets: ['PDF', 'DOCX', 'TXT'],
  },
  json: {
    label: 'JSON Data',
    icon: FileCode2,
    defaultFilename: 'data.json',
    defaultTarget: 'CSV',
    mimeType: 'application/json',
    placeholder: `[\n  {\n    "id": 1,\n    "name": "Sarah Connor",\n    "role": "Security Engineer",\n    "status": "Active"\n  },\n  {\n    "id": 2,\n    "name": "John Doe",\n    "role": "Systems Architect",\n    "status": "Verified"\n  }\n]`,
    availableTargets: ['CSV'],
  },
  csv: {
    label: 'CSV Table',
    icon: FileSpreadsheet,
    defaultFilename: 'table.csv',
    defaultTarget: 'JSON',
    mimeType: 'text/csv',
    placeholder: `id,product,category,price,stock\n101,Ultra Wireless Mouse,Electronics,49.99,120\n102,Mechanical Keyboard,Electronics,129.50,45\n103,Ergonomic Chair,Furniture,299.00,18`,
    availableTargets: ['JSON', 'XLSX'],
  },
  text: {
    label: 'Plain Text',
    icon: Code2,
    defaultFilename: 'notes.txt',
    defaultTarget: 'PDF',
    mimeType: 'text/plain',
    placeholder: `Paste your raw notes, logs, or unformatted text here to instantly convert into a structured PDF document...`,
    availableTargets: ['PDF', 'DOCX'],
  },
};

export const PasteSnippetModal: React.FC<PasteSnippetModalProps> = ({
  isOpen,
  onClose,
  onSnippetReady,
}) => {
  const [activeType, setActiveType] = useState<SnippetType>('markdown');
  const [content, setContent] = useState('');
  const [filename, setFilename] = useState(SNIPPET_CONFIGS.markdown.defaultFilename);
  const [selectedTarget, setSelectedTarget] = useState(SNIPPET_CONFIGS.markdown.defaultTarget);
  const [formatError, setFormatError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cfg = SNIPPET_CONFIGS[activeType];
      setFilename(cfg.defaultFilename);
      setSelectedTarget(cfg.defaultTarget);
      setFormatError(null);
    }
  }, [isOpen, activeType]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentConfig = SNIPPET_CONFIGS[activeType];

  const handleTypeChange = (type: SnippetType) => {
    setActiveType(type);
    const cfg = SNIPPET_CONFIGS[type];
    setFilename(cfg.defaultFilename);
    setSelectedTarget(cfg.defaultTarget);
    setFormatError(null);
  };

  const handleFormatJson = () => {
    if (!content.trim()) return;
    try {
      const parsed = JSON.parse(content);
      setContent(JSON.stringify(parsed, null, 2));
      setFormatError(null);
    } catch (err: any) {
      setFormatError('Invalid JSON format: ' + err.message);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Optional validation for JSON
    if (activeType === 'json') {
      try {
        JSON.parse(content);
      } catch (err: any) {
        setFormatError('Invalid JSON format: ' + err.message);
        return;
      }
    }

    const cleanFilename = filename.trim() || currentConfig.defaultFilename;
    const blob = new Blob([content], { type: currentConfig.mimeType });
    const file = new File([blob], cleanFilename, {
      type: currentConfig.mimeType,
      lastModified: Date.now(),
    });

    onSnippetReady(file, selectedTarget);
    setContent('');
    onClose();
  };

  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c1427] w-full max-w-2xl rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                Paste Raw Text or Code
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly convert text, Markdown, or data without creating a local file
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Snippet Type Selector Tabs */}
        <div className="px-5 pt-4 pb-2 flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800/80 overflow-x-auto custom-scrollbar">
          {(Object.keys(SNIPPET_CONFIGS) as SnippetType[]).map((type) => {
            const cfg = SNIPPET_CONFIGS[type];
            const Icon = cfg.icon;
            const isSelected = activeType === type;

            return (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl font-display text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-5 space-y-4 overflow-hidden">
          {/* File Name & Target Config Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Virtual Filename
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Output Format
              </label>
              <div className="flex items-center space-x-1.5">
                {currentConfig.availableTargets.map((tgt) => (
                  <button
                    key={tgt}
                    type="button"
                    onClick={() => setSelectedTarget(tgt)}
                    className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer uppercase ${
                      selectedTarget.toUpperCase() === tgt.toUpperCase()
                        ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-500 text-blue-600 dark:text-blue-300 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tgt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Text Area */}
          <div className="flex-1 flex flex-col min-h-52 relative">
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (formatError) setFormatError(null);
              }}
              placeholder={currentConfig.placeholder}
              rows={10}
              className="w-full flex-1 p-3.5 text-xs font-mono bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none custom-scrollbar leading-relaxed"
            />

            {/* Quick Helper Prettify Button for JSON */}
            {activeType === 'json' && content.trim() && (
              <button
                type="button"
                onClick={handleFormatJson}
                className="absolute right-3 top-3 px-2 py-1 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-blue-600 dark:text-blue-400 rounded-lg shadow-2xs backdrop-blur-xs cursor-pointer flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Prettify JSON</span>
              </button>
            )}
          </div>

          {formatError && (
            <p className="text-xs text-rose-500 font-semibold px-1">{formatError}</p>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center space-x-3">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} characters</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!content.trim()}
                className="flex items-center space-x-1.5 px-4.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <span>Add to Queue & Convert</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
