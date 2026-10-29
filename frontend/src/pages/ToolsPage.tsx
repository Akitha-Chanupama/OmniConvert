import React, { useEffect, useState } from 'react';
import { Search, CheckCircle, AlertTriangle, ArrowRight, Layers } from 'lucide-react';
import { ConversionApi } from '../services/conversionApi';
import type { FormatCapability } from '../types';

interface ToolsPageProps {
  onSelectTool: (source: string, target: string) => void;
}

export const ToolsPage: React.FC<ToolsPageProps> = ({ onSelectTool }) => {
  const [capabilities, setCapabilities] = useState<FormatCapability[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    ConversionApi.getFormats().then((data) => setCapabilities(data.capabilities)).catch(() => {});
  }, []);

  const categories = [
    { id: 'all', label: 'All Converters' },
    { id: 'image', label: 'Image Studio' },
    { id: 'pdf', label: 'PDF Suite' },
    { id: 'document', label: 'Documents' },
    { id: 'spreadsheet', label: 'Spreadsheets' },
    { id: 'data', label: 'Structured Data' },
  ];

  // Flatten into tool cards
  const toolList = React.useMemo(() => {
    const list: Array<{
      id: string;
      source: string;
      target: string;
      category: string;
      description?: string | null;
      requiresTool?: string | null;
      isEnabled: boolean;
      limitations?: string | null;
    }> = [];

    capabilities.forEach((cap) => {
      cap.supported_targets.forEach((tgt) => {
        list.push({
          id: `${cap.source_format}-${tgt}`,
          source: cap.source_format,
          target: tgt,
          category: cap.category,
          description: cap.description,
          requiresTool: cap.requires_tool,
          isEnabled: cap.is_enabled,
          limitations: cap.limitations,
        });
      });
    });

    return list;
  }, [capabilities]);

  const filteredTools = toolList.filter((tool) => {
    const matchesCat = selectedCategory === 'all' || tool.category === selectedCategory;
    const q = search.toLowerCase();
    const matchesQuery =
      tool.source.toLowerCase().includes(q) ||
      tool.target.toLowerCase().includes(q) ||
      (tool.description && tool.description.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Capability Matrix & Presets</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Conversion Tools Directory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
            Browse all supported local converters. Selecting any tool will preload the target format in your workspace studio.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60 self-start md:self-auto">
          {toolList.length} Total Routings Available
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((c) => {
            const count =
              c.id === 'all'
                ? toolList.length
                : toolList.filter((t) => t.category === c.id).length;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  selectedCategory === c.id
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                }`}
              >
                <span>{c.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === c.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/70 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search formats (e.g. png, pdf, json)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          />
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching conversion tools found</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Try adjusting your search keywords or filter category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-xs group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 font-extrabold uppercase text-slate-900 dark:text-white text-sm">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {tool.source}
                    </span>
                    <span className="text-slate-400 font-normal">→</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                      {tool.target}
                    </span>
                  </div>

                  {tool.isEnabled ? (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle className="w-3 h-3" />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Missing CLI</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {tool.description || `Convert ${tool.source.toUpperCase()} files directly to ${tool.target.toUpperCase()}.`}
                </p>

                {tool.limitations && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400/90 italic leading-snug">
                    {tool.limitations}
                  </p>
                )}
              </div>

              <div className="pt-5">
                <button
                  type="button"
                  onClick={() => onSelectTool(tool.source, tool.target)}
                  disabled={!tool.isEnabled}
                  className="w-full py-2.5 px-3 text-xs font-bold bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-600 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
                >
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
