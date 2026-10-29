import React from 'react';
import { Shield, Zap, Lock } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
      {/* Title & Subtitle */}
      <div className="space-y-1.5 max-w-2xl">
        <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-blue-600 dark:text-blue-400 block">
          FILE CONVERSION MADE SIMPLE
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          Convert files. Keep it simple.
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
          High performance local converter for images, PDFs, office documents, spreadsheets, and data structures.
        </p>
      </div>

      {/* 3 Value Proposition Cards */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
        {/* 100% Local */}
        <div className="flex items-center space-x-3 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">100% Local</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Your files stay on your device</p>
          </div>
        </div>

        {/* Fast & Reliable */}
        <div className="flex items-center space-x-3 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">Fast & Reliable</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Powered by local engine</p>
          </div>
        </div>

        {/* Secure */}
        <div className="flex items-center space-x-3 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">Secure</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">No internet required</p>
          </div>
        </div>
      </div>
    </div>
  );
};
