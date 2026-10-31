import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  ArrowRight,
  Sun,
  Moon,
  Layers,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Settings,
  Trash2,
  LayoutDashboard,
  CornerDownLeft,
  X,
} from 'lucide-react';
import { SIDEBAR_TOOL_GROUPS } from './layout/Sidebar';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Tools' | 'Actions' | 'System';
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: string;
  shortcut?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (source: string, target: string, action?: 'convert' | 'merge_pdf' | 'split_pdf') => void;
  onToggleTheme: () => void;
  isDark: boolean;
  onNavigateToDashboard: () => void;
  onNavigateToTools: () => void;
  onNavigateToPdfStudio?: () => void;
  onNavigateToSettings: () => void;
  onClearQueue?: () => void;
  hasQueueFiles?: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  onToggleTheme,
  isDark,
  onNavigateToDashboard,
  onNavigateToTools,
  onNavigateToPdfStudio,
  onNavigateToSettings,
  onClearQueue,
  hasQueueFiles = false,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Compile all commands
  const allCommands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [];

    // 1. PDF Studio action
    if (onNavigateToPdfStudio) {
      list.push({
        id: 'nav-pdf-studio',
        title: 'PDF Visual Studio',
        subtitle: 'Reorder, rotate, delete & export PDF pages with live previews',
        category: 'Actions',
        icon: Layers,
        accentColor: 'text-violet-500',
        shortcut: 'P',
        onSelect: () => {
          onNavigateToPdfStudio();
          onClose();
        },
      });
    }

    // 2. Tool Presets from Sidebar groups
    SIDEBAR_TOOL_GROUPS.forEach((group) => {
      group.tools.forEach((tool) => {
        let IconComp: React.ComponentType<{ className?: string }> = ImageIcon;
        if (group.category === 'pdf') IconComp = Layers;
        else if (group.category === 'document') IconComp = FileText;
        else if (group.category === 'spreadsheet') IconComp = FileSpreadsheet;
        else if (group.category === 'data') IconComp = FileCode;

        list.push({
          id: tool.id,
          title: tool.label,
          subtitle: `${group.title} • ${tool.source} → ${tool.target}`,
          category: 'Tools',
          icon: IconComp,
          accentColor: group.accentColor,
          onSelect: () => {
            if (tool.id === 'pdf-studio' && onNavigateToPdfStudio) {
              onNavigateToPdfStudio();
            } else {
              onSelectTool(tool.source, tool.target, tool.action);
            }
            onClose();
          },
        });
      });
    });

    // 3. Actions & Navigation
    list.push({
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      subtitle: 'Main conversion workspace',
      category: 'Actions',
      icon: LayoutDashboard,
      accentColor: 'text-blue-500',
      shortcut: 'D',
      onSelect: () => {
        onNavigateToDashboard();
        onClose();
      },
    });

    list.push({
      id: 'nav-tools',
      title: 'Browse All Tools Catalog',
      subtitle: 'View full conversion matrix and formats',
      category: 'Actions',
      icon: Layers,
      accentColor: 'text-violet-500',
      shortcut: 'T',
      onSelect: () => {
        onNavigateToTools();
        onClose();
      },
    });

    list.push({
      id: 'nav-settings',
      title: 'Diagnostics & Settings',
      subtitle: 'Check local CLI engines and health status',
      category: 'System',
      icon: Settings,
      accentColor: 'text-slate-500',
      shortcut: 'S',
      onSelect: () => {
        onNavigateToSettings();
        onClose();
      },
    });

    list.push({
      id: 'toggle-theme',
      title: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      subtitle: `Currently using ${isDark ? 'Dark' : 'Light'} appearance`,
      category: 'System',
      icon: isDark ? Sun : Moon,
      accentColor: isDark ? 'text-amber-400' : 'text-indigo-400',
      shortcut: 'M',
      onSelect: () => {
        onToggleTheme();
        onClose();
      },
    });

    if (hasQueueFiles && onClearQueue) {
      list.push({
        id: 'clear-queue',
        title: 'Clear File Queue',
        subtitle: 'Remove all pending files from workspace',
        category: 'Actions',
        icon: Trash2,
        accentColor: 'text-rose-500',
        shortcut: 'Del',
        onSelect: () => {
          onClearQueue();
          onClose();
        },
      });
    }

    return list;
  }, [
    onSelectTool,
    onNavigateToDashboard,
    onNavigateToTools,
    onNavigateToPdfStudio,
    onNavigateToSettings,
    onToggleTheme,
    isDark,
    hasQueueFiles,
    onClearQueue,
    onClose,
  ]);

  // Filter commands by search query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase().trim();
    return allCommands.filter((cmd) => {
      return (
        cmd.title.toLowerCase().includes(q) ||
        (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
        cmd.category.toLowerCase().includes(q)
      );
    });
  }, [query, allCommands]);

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector<HTMLElement>(`[data-cmd-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white/95 dark:bg-[#0c1427]/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl ring-1 ring-black/[0.06] dark:ring-white/[0.08] backdrop-blur-xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top Search Input Box */}
        <div className="relative flex items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tools, formats, or actions... (e.g. PDF to MD)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base font-medium focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 shadow-2xs">
              ESC
            </kbd>
          )}
        </div>

        {/* Command Items List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 sm:p-3 divide-y divide-slate-100/60 dark:divide-slate-800/60"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <p className="text-sm font-semibold">No matching tools or commands found</p>
              <p className="text-xs mt-1">Try typing &apos;PDF&apos;, &apos;Studio&apos;, &apos;Theme&apos;, or &apos;Image&apos;</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={cmd.id}
                  data-cmd-index={idx}
                  onClick={cmd.onSelect}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full px-3.5 py-3 rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-white/20 border-white/30 text-white'
                          : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 ' +
                            (cmd.accentColor || 'text-blue-500')
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {cmd.title}
                      </p>
                      {cmd.subtitle && (
                        <p
                          className={`text-[11px] truncate ${
                            isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        isSelected
                          ? 'bg-white/20 border-white/30 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cmd.category}
                    </span>
                    {cmd.shortcut && (
                      <kbd
                        className={`hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {cmd.shortcut}
                      </kbd>
                    )}
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? 'translate-x-0.5 text-white' : 'text-slate-400 opacity-60'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Helper Bar */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono">
                ↑↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono flex items-center">
                <CornerDownLeft className="w-2.5 h-2.5 mr-0.5" /> Enter
              </kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono">
              ESC
            </kbd>
            <span>to close</span>
          </span>
        </div>
      </div>
    </div>
  );
};
