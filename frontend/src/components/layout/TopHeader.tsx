import React, { useState, useRef, useEffect } from 'react';
import { Search, Sun, Moon, ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import { SIDEBAR_TOOL_GROUPS } from './Sidebar';

interface TopHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenMobileMenu: () => void;
  onSelectTool: (source: string, target: string, action?: 'convert' | 'merge_pdf' | 'split_pdf') => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  isDark,
  onToggleTheme,
  onOpenMobileMenu,
  onSelectTool,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Flatten all available tools for search
  const allTools = React.useMemo(() => {
    return SIDEBAR_TOOL_GROUPS.flatMap((g) =>
      g.tools.map((t) => ({
        ...t,
        categoryTitle: g.title,
      }))
    );
  }, []);

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allTools.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.source.toLowerCase().includes(q) ||
        t.target.toLowerCase().includes(q) ||
        t.categoryTitle.toLowerCase().includes(q)
    );
  }, [searchQuery, allTools]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSearchResult = (
    source: string,
    target: string,
    action?: 'convert' | 'merge_pdf' | 'split_pdf'
  ) => {
    onSelectTool(source, target, action);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return (
    <header className="h-16 sm:h-20 px-4 sm:px-8 flex items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 transition-colors">
      {/* Left: Mobile Menu Toggle & Global Tool Search */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input Box */}
        <div ref={searchRef} className="relative flex-1">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search for a tool..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-full text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Search Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-2 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {searchResults.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => handleSelectSearchResult(tool.source, tool.target, tool.action)}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {tool.label}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                        {tool.categoryTitle}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Theme Toggle & Live Engine Badge */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Sun/Moon Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 sm:p-2.5 rounded-full border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-2xs transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Live Engine Status Badge */}
        <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/70 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">Local Engine (127.0.0.1:8000)</span>
          <span className="sm:hidden">127.0.0.1:8000</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        </div>
      </div>
    </header>
  );
};
