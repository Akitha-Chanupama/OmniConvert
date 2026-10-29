import React from 'react';
import {
  Zap,
  ArrowRight,
  Image as ImageIcon,
  FileText,
  FileSpreadsheet,
  Database,
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
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
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
      id: 'jpg-png',
      label: 'JPG → PNG',
      source: 'JPG',
      target: 'PNG',
      icon: ImageIcon,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
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
              All processing happens locally on your machine. No data is uploaded to any server.
            </p>
          </div>
        </div>

        {onNavigateToTools && (
          <button
            type="button"
            onClick={onNavigateToTools}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-1 cursor-pointer self-start sm:self-auto group"
          >
            <span>View all tools</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Action Pills Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => onSelectAction(act.source, act.target)}
              className="flex items-center space-x-2.5 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/70 hover:bg-blue-50/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 hover:border-blue-300 dark:hover:border-blue-600/80 rounded-2xl transition-all cursor-pointer group text-left"
            >
              <div className={`w-7 h-7 rounded-lg ${act.bgColor} ${act.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

