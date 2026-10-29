import React, { useMemo, useState } from 'react';
import type { FormatCapability } from '../types';

interface FormatSelectorProps {
  availableTargets: string[];
  selectedTarget: string;
  onSelectTarget: (target: string) => void;
  capabilities: FormatCapability[];
  sourceFormat: string;
  disabled?: boolean;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  availableTargets,
  selectedTarget,
  onSelectTarget,
  capabilities,
  sourceFormat,
  disabled = false,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const currentCap = capabilities.find(
    (c) => c.source_format.toLowerCase() === sourceFormat.toLowerCase()
  );

  const formatCategories: Record<string, string> = {
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    webp: 'image',
    bmp: 'image',
    tiff: 'image',
    gif: 'image',
    ico: 'image',
    txt: 'document',
    md: 'document',
    html: 'document',
    pdf: 'pdf',
    docx: 'document',
    xlsx: 'spreadsheet',
    csv: 'spreadsheet',
    json: 'data',
    yaml: 'data',
    xml: 'data',
  };

  const categories = useMemo(() => {
    const presentCats = new Set<string>();
    availableTargets.forEach((t) => {
      const cat = formatCategories[t.toLowerCase()] || 'other';
      presentCats.add(cat);
    });
    return Array.from(presentCats);
  }, [availableTargets]);

  const filteredTargets = useMemo(() => {
    if (filterCategory === 'all') return availableTargets;
    return availableTargets.filter(
      (t) => (formatCategories[t.toLowerCase()] || 'other') === filterCategory
    );
  }, [availableTargets, filterCategory]);

  if (availableTargets.length === 0) {
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-800 dark:text-amber-300 text-xs sm:text-sm">
        No compatible conversion targets are supported for <strong>.{sourceFormat}</strong> on this system.
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
            Target Output Format
          </label>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Converting from <span className="uppercase font-bold text-slate-700 dark:text-slate-300">.{sourceFormat}</span>
          </span>
        </div>

        {/* Quick Category Filter Pills */}
        {categories.length > 1 && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-semibold">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`px-2 py-0.8 rounded-md transition-colors cursor-pointer ${
                filterCategory === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-2 py-0.8 rounded-md uppercase transition-colors cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {filteredTargets.map((target) => {
          const isSelected = selectedTarget.toLowerCase() === target.toLowerCase();
          return (
            <button
              key={target}
              type="button"
              onClick={() => onSelectTarget(target)}
              disabled={disabled}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold uppercase transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md ring-2 ring-slate-900 dark:ring-white ring-offset-2 dark:ring-offset-slate-900 scale-102'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {target}
            </button>
          );
        })}
      </div>

      {currentCap?.limitations && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
          Note: {currentCap.limitations}
        </p>
      )}
    </div>
  );
};
