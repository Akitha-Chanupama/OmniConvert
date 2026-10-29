import React from 'react';
import { Shield, Zap, Lock } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
      {/* Title & Subtitle */}
      <div className="space-y-2.5 max-w-2xl">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 shadow-2xs">
          <span className="font-display text-xs font-black tracking-wider uppercase text-blue-600 dark:text-blue-400">
            PRIVATE LOCAL STUDIO • ZERO CLOUD UPLOADS
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl lg:text-[52px] font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white">
          Convert files. <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Keep it simple.</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-normal">
          High-performance local converter for images, PDFs, office documents, spreadsheets, and data structures.
        </p>
      </div>

      {/* 3 Rich Value Proposition Cards */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3.5">
        {/* 100% Local */}
        <div className="flex items-center space-x-3.5 px-4.5 py-3.5 bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs backdrop-blur-sm transition-transform hover:-translate-y-0.5 duration-200">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs shadow-emerald-500/15 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-tight">100% Local</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Files stay on your machine</p>
          </div>
        </div>

        {/* Fast & Reliable */}
        <div className="flex items-center space-x-3.5 px-4.5 py-3.5 bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs backdrop-blur-sm transition-transform hover:-translate-y-0.5 duration-200">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-transparent text-violet-600 dark:text-violet-400 border border-violet-500/30 shadow-xs shadow-violet-500/15 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 fill-violet-500/20" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-tight">Fast & Reliable</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Native compiled engines</p>
          </div>
        </div>

        {/* Secure */}
        <div className="flex items-center space-x-3.5 px-4.5 py-3.5 bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs backdrop-blur-sm transition-transform hover:-translate-y-0.5 duration-200">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-xs shadow-blue-500/15 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-tight">Airgapped & Private</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Zero data collection</p>
          </div>
        </div>
      </div>
    </div>
  );
};
