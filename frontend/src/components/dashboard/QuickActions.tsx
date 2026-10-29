import React from 'react';
import {
  Zap,
  ArrowRight,
  ArrowUpRight,
  Image as ImageIcon,
  FileText,
  FileSpreadsheet,
  Database,
  FileCode,
} from 'lucide-react';

interface QuickActionsProps {
  onSelectAction: (source: string, target: string) => void;
  onNavigateToTools?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSelectAction,
  onNavigateToTools,
}) => {
  const actions = [
    {
      id: 'pdf-md',
      label: 'PDF → Markdown',
      desc: 'Extract text & tables',
      source: 'PDF',
      target: 'MD',
      icon: FileCode,
      iconColor: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-transparent border border-violet-500/25 shadow-xs shadow-violet-500/10',
    },
    {
      id: 'md-pdf',
      label: 'Markdown → PDF',
      desc: 'Styled vector document',
      source: 'MD',
      target: 'PDF',
      icon: FileText,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-gradient-to-br from-indigo-500/15 via-blue-500/10 to-transparent border border-indigo-500/25 shadow-xs shadow-indigo-500/10',
    },
    {
      id: 'img-pdf',
      label: 'Image → PDF',
      desc: 'Compile images to PDF',
      source: 'JPG',
      target: 'PDF',
      icon: ImageIcon,
      iconColor: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-gradient-to-br from-rose-500/15 via-pink-500/10 to-transparent border border-rose-500/25 shadow-xs shadow-rose-500/10',
    },
    {
      id: 'pdf-jpg',
      label: 'PDF → JPG',
      desc: 'High-res page images',
      source: 'PDF',
      target: 'JPG',
      icon: FileText,
      iconColor: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-gradient-to-br from-sky-500/15 via-cyan-500/10 to-transparent border border-sky-500/25 shadow-xs shadow-sky-500/10',
    },
    {
      id: 'excel-csv',
      label: 'Excel → CSV',
      desc: 'Spreadsheet export',
      source: 'XLSX',
      target: 'CSV',
      icon: FileSpreadsheet,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/25 shadow-xs shadow-emerald-500/10',
    },
    {
      id: 'json-csv',
      label: 'JSON → CSV',
      desc: 'Flatten structured data',
      source: 'JSON',
      target: 'CSV',
      icon: Database,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/25 shadow-xs shadow-amber-500/10',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
              Popular Quick Actions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              One-click presets for common conversion workflows
            </p>
          </div>
        </div>

        {onNavigateToTools && (
          <button
            type="button"
            onClick={onNavigateToTools}
            className="font-display text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center space-x-1 cursor-pointer transition-colors self-start sm:self-auto group"
          >
            <span>View all tools</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        )}
      </div>

      {/* Action Buttons 3-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => onSelectAction(act.source, act.target)}
              className="group relative flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-800/90 hover:border-blue-300 dark:hover:border-blue-700/60 hover:shadow-md transition-all cursor-pointer text-left overflow-hidden"
            >
              <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                <div
                  className={`w-11 h-11 rounded-2xl ${act.bgColor} ${act.iconColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-108 duration-200`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-display text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {act.label}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">
                    {act.desc}
                  </span>
                </div>
              </div>

              <div className="pl-2 shrink-0">
                <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
