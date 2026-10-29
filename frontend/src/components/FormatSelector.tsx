import React from 'react';
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
  if (availableTargets.length === 0) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
        No compatible conversion formats available for <strong>.{sourceFormat}</strong> on this system.
      </div>
    );
  }

  const currentCap = capabilities.find(
    (c) => c.source_format.toLowerCase() === sourceFormat.toLowerCase()
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">
          Target Format
        </label>
        <span className="text-xs text-slate-500">
          Converting from <strong className="uppercase">.{sourceFormat}</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {availableTargets.map((target) => {
          const isSelected = selectedTarget.toLowerCase() === target.toLowerCase();
          return (
            <button
              key={target}
              type="button"
              onClick={() => onSelectTarget(target)}
              disabled={disabled}
              className={`py-2.5 px-3 rounded-xl text-sm font-semibold uppercase transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900 ring-offset-1'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {target}
            </button>
          );
        })}
      </div>

      {currentCap?.limitations && (
        <p className="text-xs text-slate-500 italic mt-1">
          Note: {currentCap.limitations}
        </p>
      )}
    </div>
  );
};
