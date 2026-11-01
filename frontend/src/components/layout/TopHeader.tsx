import React from 'react';
import {
  Search,
  Sun,
  Moon,
  ShieldCheck,
  Menu,
  FileText,
  History,
  Download,
} from 'lucide-react';

interface TopHeaderProps {
  isDark: boolean;
  onToggleTheme: (e?: React.MouseEvent) => void;
  onOpenMobileMenu: () => void;
  onSelectTool: (source: string, target: string, action?: 'convert' | 'merge_pdf' | 'split_pdf') => void;
  onOpenCommandPalette: () => void;
  onOpenPasteSnippet?: () => void;
  onOpenHistory?: () => void;
  historyCount?: number;
  isInstallable?: boolean;
  onInstallApp?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  isDark,
  onToggleTheme,
  onOpenMobileMenu,
  onOpenCommandPalette,
  onOpenPasteSnippet,
  onOpenHistory,
  historyCount = 0,
  isInstallable = false,
  onInstallApp,
}) => {
  return (
    <header className="h-16 sm:h-20 px-3.5 sm:px-8 flex items-center justify-between gap-2 sm:gap-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#070b16]/70 backdrop-blur-md sticky top-0 z-30 transition-colors">
      {/* Left: Mobile Menu Toggle & Global Tool Search Trigger */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Command Palette Trigger Input */}
        <div
          onClick={onOpenCommandPalette}
          className="relative flex-1 min-w-0 flex items-center px-3 sm:px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-750/90 border border-slate-200/90 dark:border-slate-700/80 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-all shadow-2xs ring-1 ring-black/[0.03] dark:ring-white/[0.04] group select-none"
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
          <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors mr-2 shrink-0" />
          <span className="flex-1 text-slate-400 dark:text-slate-400 font-medium truncate text-xs sm:text-sm">
            <span className="hidden sm:inline">Search tools, formats, or commands...</span>
            <span className="sm:hidden">Search tools...</span>
          </span>

          {/* Shortcut Badges */}
          <div className="flex items-center space-x-1 shrink-0 ml-1.5 sm:ml-2">
            <kbd className="hidden sm:inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-md bg-white dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-300 shadow-2xs">
              <span className="text-[10px]">Ctrl</span>
              <span>K</span>
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Actions: Paste Snippet, History, Install App, Theme Toggle, Engine Status */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
        {/* Quick Paste Snippet Button */}
        {onOpenPasteSnippet && (
          <button
            type="button"
            onClick={onOpenPasteSnippet}
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer shadow-2xs"
            title="Paste raw text, Markdown, or JSON snippet to convert"
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>Paste Snippet</span>
          </button>
        )}

        {/* History Drawer Trigger */}
        {onOpenHistory && (
          <button
            type="button"
            onClick={onOpenHistory}
            className="relative p-2 sm:p-2.5 rounded-full border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-2xs transition-all cursor-pointer"
            title="Conversion History"
            aria-label="Open conversion history"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>
        )}

        {/* PWA Install Button (Displays when browser signals installability) */}
        {isInstallable && onInstallApp && (
          <button
            type="button"
            onClick={onInstallApp}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 shadow-2xs transition-all cursor-pointer animate-in fade-in"
            title="Install OmniConvert Desktop App"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {/* Sun/Moon Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 sm:p-2.5 rounded-full border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-2xs ring-1 ring-black/[0.04] dark:ring-white/[0.06] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          <span className="relative flex items-center justify-center w-4 h-4 overflow-hidden">
            <Sun
              className={`w-4 h-4 text-amber-500 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${
                isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
              }`}
            />
            <Moon
              className={`w-4 h-4 text-amber-400 absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${
                isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
              }`}
            />
          </span>
        </button>

        {/* Live Engine Status Badge */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/70 rounded-full text-xs font-semibold font-display font-bold text-emerald-700 dark:text-emerald-400 shadow-2xs ring-1 ring-emerald-500/10 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="hidden lg:inline">Conversion Engine Active</span>
          <span className="lg:hidden font-bold">Active</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        </div>
      </div>
    </header>
  );
};
