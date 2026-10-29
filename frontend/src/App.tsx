import React, { useEffect, useState } from 'react';
import { ArrowLeftRight, Grid, Activity, ShieldCheck, Moon, Sun } from 'lucide-react';
import { HomePage } from './pages/HomePage';
import { ToolsPage } from './pages/ToolsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'convert' | 'tools' | 'settings'>('convert');
  const [presetTarget, setPresetTarget] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('omniconvert_theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('omniconvert_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('omniconvert_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleSelectToolFromCatalog = (_source: string, target: string) => {
    setPresetTarget(target);
    setActiveTab('convert');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50/70 text-slate-900'
    }`}>
      {/* Top Navbar */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors ${
        isDark ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white/80 border-slate-200/80'
      }`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center space-x-6">
            <div
              onClick={() => setActiveTab('convert')}
              className="flex items-center space-x-3 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-xl tracking-tight leading-none">
                    OmniConvert
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                    v1.0
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  Personal Local File Suite
                </span>
              </div>
            </div>

            {/* Live Engine Indicator */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 rounded-full text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Local Engine (127.0.0.1:8000)</span>
            </div>
          </div>

          {/* Right Navigation & Controls */}
          <div className="flex items-center space-x-3">
            {/* Nav Tabs */}
            <nav className={`flex items-center space-x-1 p-1 rounded-xl border ${
              isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-slate-100/80 border-slate-200/60'
            }`}>
              <button
                type="button"
                onClick={() => setActiveTab('convert')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'convert'
                    ? isDark
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Convert</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tools')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'tools'
                    ? isDark
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>All Tools</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'settings'
                    ? isDark
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Diagnostics</span>
              </button>
            </nav>

            {/* Dark / Light Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-750'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Wide Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-8 pt-8">
        {activeTab === 'convert' && (
          <HomePage
            onNavigateToTools={() => setActiveTab('tools')}
            presetTarget={presetTarget}
            onClearPreset={() => setPresetTarget(null)}
          />
        )}
        {activeTab === 'tools' && (
          <ToolsPage onSelectTool={handleSelectToolFromCatalog} />
        )}
        {activeTab === 'settings' && <SettingsPage />}
      </main>

      {/* Modern Wide Footer */}
      <footer className={`border-t py-6 text-xs transition-colors mt-12 ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              100% Local File Execution • No Cloud Servers • Zero Data Leaves Your Machine
            </span>
          </div>
          <p className="text-slate-400 dark:text-slate-600">
            OmniConvert • High Performance Personal Converter
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
