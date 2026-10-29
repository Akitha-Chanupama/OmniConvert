import React, { useEffect, useState } from 'react';
import { Search, CheckCircle, AlertTriangle } from 'lucide-react';
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
    { id: 'all', label: 'All Tools' },
    { id: 'image', label: 'Images' },
    { id: 'pdf', label: 'PDF Suite' },
    { id: 'document', label: 'Documents' },
    { id: 'spreadsheet', label: 'Spreadsheets' },
    { id: 'data', label: 'Data & Text' },
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
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900">Conversion Tools Directory</h1>
        <p className="text-slate-500 text-sm">
          Browse all supported file conversion tools powered by your local machine.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-bold uppercase text-slate-900 text-sm">
                  <span>{tool.source}</span>
                  <span className="text-slate-400 font-normal">→</span>
                  <span>{tool.target}</span>
                </div>
                {tool.isEnabled ? (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    <span>Ready</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Requires {tool.requiresTool || 'dependency'}</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 line-clamp-2">
                {tool.description || `Convert ${tool.source.toUpperCase()} files to ${tool.target.toUpperCase()}.`}
              </p>

              {tool.limitations && (
                <p className="text-[11px] text-amber-700 italic">
                  {tool.limitations}
                </p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => onSelectTool(tool.source, tool.target)}
                disabled={!tool.isEnabled}
                className="w-full py-2 px-3 text-xs font-semibold bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 hover:border-slate-900 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Use Converter
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
