import React from 'react';
import {
  Zap,
  ArrowRight,
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
      label: 'PDF → MD',
      source: 'PDF',
      target: 'MD',
      icon: FileCode,
      iconColor: 'text-violet-500',
      bgColor: 'bg-violet-50 dark:bg-violet-950/40',
    },
    {
      id: 'md-pdf',
      label: 'MD → PDF',
      source: 'MD',
      target: 'PDF',
      icon: FileText,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
    },
    {
      id: 'img-pdf',
      label: 'Image → PDF',
      source: 'JPG',
      target: 'PDF',
      icon: ImageIcon,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    },
    {
      id: 'pdf-jpg',
      label: 'PDF → JPG',
      source: 'PDF',
      target: 'JPG',
      icon: FileText,
      iconColor: 'text-sky-500',
      bgColor: 'bg-sky-50 dark:bg-sky-950/40',
    },
    {
      id: 'excel-csv',
      label: 'Excel → CSV',
      source: 'XLSX',
      target: 'CSV',
      icon: FileSpreadsheet,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      id: 'json-csv',
      label: 'JSON → CSV',
      source: 'JSON',
      target: 'CSV',
      icon: Database,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 fill-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
              Popular Quick Actions
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              One-click setup for common conversion presets
            </p>
          </div>
        </div>

        {onNavigateToTools && (
          <button
            type="button"
            onClick={onNavigateToTools}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white inline-flex items-center space-x-1 cursor-pointer transition-colors self-start sm:self-auto"
          >
            <span>View all tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => onSelectAction(act.source, act.target)}
              className="group flex items-center p-3 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all cursor-pointer text-left space-x-3"
            >
              <div
                className={`w-9 h-9 rounded-xl ${act.bgColor} ${act.iconColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-slate-900 dark:group-hover:text-white">
                  {act.label}
                </span>
                <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Preset
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
