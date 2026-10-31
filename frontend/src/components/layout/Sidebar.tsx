import React from 'react';
import {
  ArrowLeftRight,
  LayoutDashboard,
  Image as ImageIcon,
  FileText,
  FileSpreadsheet,
  FileCode,
  Settings,
  ChevronRight,
  Layers,
  X,
} from 'lucide-react';

export interface ToolShortcut {
  id: string;
  label: string;
  source: string;
  target: string;
  category: 'image' | 'pdf' | 'document' | 'spreadsheet' | 'data';
  action?: 'convert' | 'merge_pdf' | 'split_pdf';
  isStudio?: boolean;
}

interface SidebarProps {
  activeTab: 'convert' | 'tools' | 'settings' | 'pdf-studio';
  selectedPreset: string | null;
  onSelectDashboard: () => void;
  onSelectTool: (source: string, target: string, action?: 'convert' | 'merge_pdf' | 'split_pdf') => void;
  onSelectPdfStudio?: () => void;
  onSelectSettings: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const SIDEBAR_TOOL_GROUPS = [
  {
    category: 'image',
    title: 'IMAGE CONVERSION',
    icon: ImageIcon,
    accentColor: 'text-rose-400',
    dotBg: 'bg-rose-500',
    tools: [
      { id: 'jpg-to-png', label: 'JPG to PNG', source: 'JPG', target: 'PNG' },
      { id: 'png-to-jpg', label: 'PNG to JPG', source: 'PNG', target: 'JPG' },
      { id: 'webp-to-jpg', label: 'WEBP to JPG', source: 'WEBP', target: 'JPG' },
      { id: 'heic-to-jpg', label: 'HEIC to JPG', source: 'HEIC', target: 'JPG' },
    ],
  },
  {
    category: 'pdf',
    title: 'PDF TOOLS',
    icon: Layers,
    accentColor: 'text-violet-400',
    dotBg: 'bg-violet-500',
    tools: [
      { id: 'pdf-studio', label: 'PDF Visual Studio', source: 'PDF', target: 'STUDIO', isStudio: true },
      { id: 'pdf-to-md', label: 'PDF to Markdown', source: 'PDF', target: 'MD' },
      { id: 'pdf-to-jpg', label: 'PDF to JPG', source: 'PDF', target: 'JPG' },
      { id: 'jpg-to-pdf', label: 'JPG to PDF', source: 'JPG', target: 'PDF' },
      { id: 'merge-pdf', label: 'Merge PDF', source: 'PDF', target: 'PDF', action: 'merge_pdf' as const },
      { id: 'split-pdf', label: 'Split PDF', source: 'PDF', target: 'PDF', action: 'split_pdf' as const },
    ],
  },
  {
    category: 'document',
    title: 'DOCUMENT CONVERTER',
    icon: FileText,
    accentColor: 'text-indigo-400',
    dotBg: 'bg-indigo-500',
    tools: [
      { id: 'md-to-pdf', label: 'MD to PDF', source: 'MD', target: 'PDF' },
      { id: 'docx-to-pdf', label: 'DOCX to PDF', source: 'DOCX', target: 'PDF' },
      { id: 'pdf-to-docx', label: 'PDF to DOCX', source: 'PDF', target: 'DOCX' },
      { id: 'txt-to-pdf', label: 'TXT to PDF', source: 'TXT', target: 'PDF' },
    ],
  },
  {
    category: 'spreadsheet',
    title: 'SPREADSHEET CONVERTER',
    icon: FileSpreadsheet,
    accentColor: 'text-emerald-400',
    dotBg: 'bg-emerald-500',
    tools: [
      { id: 'xlsx-to-csv', label: 'XLSX to CSV', source: 'XLSX', target: 'CSV' },
      { id: 'csv-to-xlsx', label: 'CSV to XLSX', source: 'CSV', target: 'XLSX' },
    ],
  },
  {
    category: 'data',
    title: 'DATA CONVERTER',
    icon: FileCode,
    accentColor: 'text-amber-400',
    dotBg: 'bg-amber-500',
    tools: [
      { id: 'json-to-csv', label: 'JSON to CSV', source: 'JSON', target: 'CSV' },
      { id: 'csv-to-json', label: 'CSV to JSON', source: 'CSV', target: 'JSON' },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  selectedPreset,
  onSelectDashboard,
  onSelectTool,
  onSelectPdfStudio,
  onSelectSettings,
  isOpenMobile,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 sm:w-72 bg-[#0c1427] text-slate-300 flex flex-col border-r border-[#1a233a] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-[#1a233a] shrink-0">
          <div
            onClick={() => {
              onSelectDashboard();
              onCloseMobile();
            }}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/20 group-hover:scale-105 group-hover:shadow-blue-500/40 transition-all">
              <ArrowLeftRight className="w-5 h-5 drop-shadow-xs" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-extrabold text-xl text-white tracking-tight">
                  OmniConvert
                </span>
                <span className="font-display px-2 py-0.5 text-[10px] font-black rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Personal Local File Suite</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 custom-scrollbar">
          {/* Main Dashboard item */}
          <div>
            <button
              type="button"
              onClick={() => {
                onSelectDashboard();
                onCloseMobile();
              }}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl font-display font-bold text-sm transition-all cursor-pointer ${
                activeTab === 'convert' && !selectedPreset
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-white/10'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              <span>Dashboard</span>
            </button>
          </div>

          {/* Categorized Tool Groups */}
          {SIDEBAR_TOOL_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.category} className="space-y-1.5">
                <div className="px-3.5 text-xs font-display font-bold tracking-wider text-slate-400 uppercase flex items-center space-x-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${group.dotBg}`} />
                  <span>{group.title}</span>
                </div>

                <div className="space-y-0.5">
                  {group.tools.map((tool) => {
                    const isSelected =
                      (tool.isStudio && activeTab === 'pdf-studio') ||
                      (activeTab === 'convert' && selectedPreset === tool.id);

                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => {
                          if (tool.isStudio && onSelectPdfStudio) {
                            onSelectPdfStudio();
                          } else {
                            onSelectTool(tool.source, tool.target, tool.action);
                          }
                          onCloseMobile();
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-display font-medium transition-all cursor-pointer group ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-sm shadow-blue-600/25 ring-1 ring-white/10'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon
                            className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                              isSelected
                                ? 'text-white'
                                : `${group.accentColor} group-hover:text-white`
                            }`}
                          />
                          <span>{tool.label}</span>
                        </div>
                        {tool.isStudio ? (
                          <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-2xs">
                            Studio
                          </span>
                        ) : isSelected ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Footer Item: Diagnostics & Settings */}
        <div className="p-4 border-t border-[#1a233a] shrink-0 bg-[#0a1120]">
          <button
            type="button"
            onClick={() => {
              onSelectSettings();
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-display text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Settings className="w-4.5 h-4.5 text-slate-400" />
              <span>Diagnostics & Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </aside>
    </>
  );
};
