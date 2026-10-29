import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Shield, RefreshCw, Cpu, Server, Check } from 'lucide-react';
import { ConversionApi } from '../services/conversionApi';
import type { HealthResponse } from '../types';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = () => {
    setLoading(true);
    setError(null);
    ConversionApi.getHealth()
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Could not connect to backend server.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            System Diagnostics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time status of local conversion engines, system binaries, and security boundaries.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchHealth}
          disabled={loading}
          className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/70 rounded-xl text-slate-700 dark:text-slate-200 inline-flex items-center space-x-2 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {error ? (
        <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-800 dark:text-rose-300 text-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="font-bold">Backend Communication Error</span>
            <p className="text-xs">{error}</p>
          </div>
          <button
            onClick={fetchHealth}
            className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Server Status Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 text-slate-900 dark:text-white font-bold text-base">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <span>Backend Core Service</span>
                <p className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  FastAPI engine running as a local headless daemon
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-400 block mb-1">Status</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                  ● {health?.status || 'Active'}
                </span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-400 block mb-1">Version</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  v{health?.version || '1.0.0'}
                </span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-400 block mb-1">Execution Mode</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                  {health?.mode || 'Personal Localhost'}
                </span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-400 block mb-1">Host Binding</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  127.0.0.1:8000
                </span>
              </div>
            </div>
          </div>

          {/* Installed Tools & Engines */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center space-x-3 text-slate-900 dark:text-white font-bold text-base">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span>Conversion Engines & Runtime Dependencies</span>
                <p className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  Local libraries and system executables queried at startup
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {[
                { name: 'Pillow (PIL)', key: 'pillow', desc: 'Core image conversion and manipulation' },
                { name: 'pypdf', key: 'pypdf', desc: 'PDF text extraction, merging, and rotation' },
                { name: 'openpyxl', key: 'openpyxl', desc: 'Excel spreadsheet (XLSX) reading and writing' },
                { name: 'PyYAML', key: 'pyyaml', desc: 'Safe YAML structured data serialization' },
                { name: 'defusedxml', key: 'defusedxml', desc: 'Secure XML parsing without entity injection' },
                {
                  name: 'LibreOffice (soffice)',
                  key: 'libreoffice',
                  desc: 'Headless office document engine (DOCX/XLSX to PDF)',
                  isOptional: true,
                },
                {
                  name: 'Pandoc',
                  key: 'pandoc',
                  desc: 'Universal document converter (Markdown/Docx/HTML)',
                  isOptional: true,
                },
                {
                  name: 'FFmpeg',
                  key: 'ffmpeg',
                  desc: 'Audio and video conversion suite (future optional module)',
                  isOptional: true,
                },
              ].map((tool) => {
                const isAvailable = health?.installed_tools[tool.key] ?? false;
                const path = health?.tool_paths[tool.key];

                return (
                  <div key={tool.key} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{tool.name}</span>
                        {tool.isOptional && (
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            Optional
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{tool.desc}</p>
                      {path && (
                        <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 truncate max-w-md pt-0.5">
                          {path}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      {isAvailable ? (
                        <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/80">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Detected</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Not Installed</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Privacy & File Lifecycle */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 text-slate-900 dark:text-white font-bold text-base">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span>Security & File Storage Lifecycle</span>
                <p className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  Data protection policies enforced by OmniConvert architecture
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-200 flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Isolated Workspaces</span>
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Every batch upload is processed in a unique UUID directory inside <code>backend/temp/</code>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-200 flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Automatic Purge</span>
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Directories older than 30 minutes are automatically wiped during periodic cleanup sweeps.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-200 flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Zero Telemetry</span>
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  No analytical pings, tracking tokens, cookies, or remote logs are ever collected.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-200 flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>100% Localhost Only</span>
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  FastAPI binds strictly to <code>127.0.0.1</code>, making it completely invisible outside your machine.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
