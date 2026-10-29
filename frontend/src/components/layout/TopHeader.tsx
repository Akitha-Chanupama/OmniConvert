import React from 'react';
import { Search, Sun, Moon, ShieldCheck, Menu } from 'lucide-react';

interface TopHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenMobileMenu: () => void;
  onSelectTool: (source: string, target: string, action?: 'convert' | 'merge_pdf' | 'split_pdf') => void;
  onOpenCommandPalette: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  isDark,
  onToggleTheme,
  onOpenMobileMenu,
  onOpenCommandPalette,
}) => {
  return (
    <header className="h-16 sm:h-20 px-4 sm:px-8 flex items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#070b16]/70 backdrop-blur-md sticky top-0 z-30 transition-colors">
      {/* Left: Mobile Menu Toggle & Global Tool Search Trigger */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Command Palette Trigger Input */}
        <div
          onClick={onOpenCommandPalette}
          className="relative flex-1 flex items-center px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-750/90 border border-slate-200/90 dark:border-slate-700/80 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-all shadow-2xs ring-1 ring-black/[0.03] dark:ring-white/[0.04] group select-none"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenCommandPalette();
            }
          }}
          title="Open Command Palette (Ctrl+K or /)"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors mr-2.5 shrink-0" />
          <span className="flex-1 text-slate-400 dark:text-slate-400 font-medium truncate">
            Search tools, formats, or commands...
          </span>

          {/* Shortcut Badges */}
          <div className="flex items-center space-x-1 shrink-0 ml-2">
            <kbd className="hidden sm:inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-md bg-white dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-300 shadow-2xs">
              <span className="text-[10px]">Ctrl</span>
              <span>K</span>
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Theme Toggle & Live Engine Badge */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Sun/Moon Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 sm:p-2.5 rounded-full border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-2xs ring-1 ring-black/[0.04] dark:ring-white/[0.06] transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Live Engine Status Badge */}
        <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/70 rounded-full text-xs font-semibold font-display font-bold text-emerald-700 dark:text-emerald-400 shadow-2xs ring-1 ring-emerald-500/10">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">Local Engine (127.0.0.1:8000)</span>
          <span className="sm:hidden">127.0.0.1:8000</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        </div>
      </div>
    </header>
  );
};
