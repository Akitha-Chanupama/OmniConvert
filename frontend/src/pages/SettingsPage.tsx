import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Shield, RefreshCw, Cpu, Server } from 'lucide-react';
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
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">System Diagnostics</h1>
          <p className="text-slate-500 text-sm">
            Local conversion engine health and installed tool capabilities.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchHealth}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 inline-flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Server Status Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 text-slate-800 font-semibold text-base">
              <Server className="w-5 h-5 text-indigo-600" />
              <span>Backend Core Service</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block">Status</span>
                <span className="font-bold text-emerald-600 uppercase">
                  {health?.status || 'Unknown'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block">Version</span>
                <span className="font-bold text-slate-800">
                  {health?.version || '1.0.0'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block">Mode</span>
                <span className="font-bold text-slate-800 uppercase">
                  {health?.mode || 'Local'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block">Host Binding</span>
                <span className="font-bold text-slate-800">127.0.0.1:8000</span>
              </div>
            </div>
          </div>

          {/* Installed Tools & Engines */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 text-slate-800 font-semibold text-base">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <span>Conversion Engines & Dependencies</span>
            </div>

            <div className="divide-y divide-slate-100 text-sm">
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
                  <div key={tool.key} className="py-3 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-slate-800">{tool.name}</span>
                        {tool.isOptional && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            Optional
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{tool.desc}</p>
                      {path && (
                        <p className="text-[10px] font-mono text-slate-400 truncate max-w-sm">
                          {path}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      {isAvailable ? (
                        <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Detected</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 text-slate-800 font-semibold text-base">
              <Shield className="w-5 h-5 text-indigo-600" />
              <span>Security & File Storage Lifecycle</span>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                • <strong>Isolated Workspaces</strong>: Every upload is processed in a unique UUID directory inside <code>backend/temp/</code>.
              </p>
              <p>
                • <strong>Auto-Purge</strong>: Scratch directories older than 30 minutes are automatically deleted during periodic cleanup runs.
              </p>
              <p>
                • <strong>No Telemetry</strong>: No analytics, tracking tokens, or user metrics are captured.
              </p>
              <p>
                • <strong>100% Localhost</strong>: The backend listens exclusively on <code>127.0.0.1</code>, unreachable from outside networks.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
