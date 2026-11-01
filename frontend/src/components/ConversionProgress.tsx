import React from 'react';
import { Loader2 } from 'lucide-react';

interface ConversionProgressProps {
  statusMessage?: string;
}

export const ConversionProgress: React.FC<ConversionProgressProps> = ({
  statusMessage = 'Converting files locally...',
}) => {
  return (
    <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center space-y-4">
      <div className="flex justify-center">
        <Loader2 className="w-10 h-10 text-slate-800 animate-spin" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{statusMessage}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Processing securely • Fast high-performance conversion engine
        </p>
      </div>
    </div>
  );
};
