import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Shield,
  RefreshCw,
  Cpu,
  Server,
  Check,
  Sun,
  Moon,
  Laptop,
  Type,
  Sparkles,
  Sliders,
  SlidersHorizontal,
  RotateCcw,
  Trash2,
  FileCheck,
  Layers,
  Palette,
} from 'lucide-react';
import { ConversionApi } from '../services/conversionApi';
import type { HealthResponse } from '../types';
import {
  getSettings,
  saveSettings,
  resetSettings,
  subscribeSettings,
  type AppSettings,
  type ThemeMode,
  type FontSizeMode,
} from '../utils/settingsStore';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Settings State
  const [settings, setSettings] = useState<AppSettings>(() => getSettings());
  const [activeCategory, setActiveCategory] = useState<'appearance' | 'defaults' | 'storage' | 'diagnostics'>('appearance');
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSavedNotification(msg);
    setTimeout(() => setSavedNotification(null), 3000);
  };

  const fetchHealth = () => {
    setLoadingHealth(true);
    setHealthError(null);
    ConversionApi.getHealth()
      .then((data) => {
        setHealth(data);
        setLoadingHealth(false);
      })
      .catch((err) => {
        setHealthError(err.message || 'Could not connect to backend server.');
        setLoadingHealth(false);
      });
  };

  useEffect(() => {
    fetchHealth();
    const unsubscribe = subscribeSettings((updated) => {
      setSettings(updated);
    });
    return unsubscribe;
  }, []);

  const handleUpdate = (partial: Partial<AppSettings>, message?: string) => {
    saveSettings(partial);
    if (message) showNotification(message);
  };

  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to restore all settings and preferences to default?')) {
      resetSettings();
      showNotification('All preferences restored to default.');
    }
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem('omniconvert_session_history');
      showNotification('Temporary session cache cleared successfully.');
    } catch {
      showNotification('Cache cleared.');
    }
  };

  const categories = [
    { id: 'appearance', label: 'Appearance & UI', icon: Palette, desc: 'Themes, typography scale & motion' },
    { id: 'defaults', label: 'Conversion Defaults', icon: SlidersHorizontal, desc: 'Quality presets & format defaults' },
    { id: 'storage', label: 'Storage & Privacy', icon: Shield, desc: 'Cache management & reset options' },
    { id: 'diagnostics', label: 'System Diagnostics', icon: Cpu, desc: 'Local engine binaries & health' },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-16">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5" />
            <span>Preferences & System Control</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Settings & Options
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl">
            Personalize your workspace theme, typography scale, automated conversion defaults, and inspect local engine status.
          </p>
        </div>

        {/* Global Reset Button */}
        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleResetAll}
            className="px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl inline-flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
            title="Reset all settings to default values"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Floating Instant Toast Notification */}
      {savedNotification && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{savedNotification}</span>
        </div>
      )}

      {/* Category Tab Segmented Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 overflow-x-auto custom-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 min-w-[130px] sm:min-w-0 py-2.5 px-3 rounded-xl font-display text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs ring-1 ring-black/[0.04] dark:ring-white/[0.08]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-750/50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
              <span className="truncate">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: APPEARANCE & UI */}
      {activeCategory === 'appearance' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Theme Mode Selection */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/50 dark:border-amber-800/50">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  Interface Theme
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your preferred color scheme or synchronize with your operating system
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                { id: 'light' as ThemeMode, label: 'Light Mode', desc: 'Crisp white with high contrast', icon: Sun },
                { id: 'dark' as ThemeMode, label: 'Dark Mode', desc: 'Deep midnight navy backdrop', icon: Moon },
                { id: 'system' as ThemeMode, label: 'System Sync', desc: 'Automatically matches OS preference', icon: Laptop },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = settings.theme === t.id;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleUpdate({ theme: t.id }, `Theme updated to ${t.label}.`)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                        {t.label}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {t.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography & Font Scaling */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/50">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  Typography Scale & Sizing
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Adjust global font scale across menus, cards, and file lists
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                { id: 'compact' as FontSizeMode, label: 'Compact', scale: '92%', desc: 'Higher density for large batch operations' },
                { id: 'normal' as FontSizeMode, label: 'Default', scale: '100%', desc: 'Standard balanced typography scale' },
                { id: 'spacious' as FontSizeMode, label: 'Spacious', scale: '108%', desc: 'Enhanced legibility and touch targets' },
              ].map((f) => {
                const isSelected = settings.fontSize === f.id;

                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleUpdate({ fontSize: f.id }, `Font scale adjusted to ${f.label} (${f.scale}).`)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {f.scale}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                        {f.label}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {f.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Live Typography Preview Strip */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Live Preview
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                The quick brown fox jumps over the lazy dog. • <strong>100% Local Conversion Engine Active</strong>
              </p>
            </div>
          </div>

          {/* Animation & Physics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-200/50 dark:border-violet-800/50">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    Interface Transitions & Motion
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Control smooth momentum physics and liquid animations
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() =>
                    handleUpdate(
                      { motion: settings.motion === 'smooth' ? 'reduced' : 'smooth' },
                      settings.motion === 'smooth' ? 'Reduced motion enabled.' : 'Smooth liquid animations enabled.'
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                    settings.motion === 'smooth'
                      ? 'bg-violet-50 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {settings.motion === 'smooth' ? 'Liquid Motion: Active' : 'Reduced Motion: Active'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONVERSION DEFAULTS */}
      {activeCategory === 'defaults' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Default Image Compression Quality */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/50 dark:border-rose-800/50">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    Default Image Compression Quality
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pre-set compression quality applied to newly uploaded JPG and WEBP files
                  </p>
                </div>
              </div>

              <span className="font-mono font-bold text-sm px-3 py-1 bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200/70 dark:border-rose-800 rounded-xl">
                {settings.defaultQuality}%
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={settings.defaultQuality}
                onChange={(e) => handleUpdate({ defaultQuality: parseInt(e.target.value, 10) })}
                className="w-full accent-rose-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>50% (Max Compression)</span>
                <span>80% (Recommended Balance)</span>
                <span>100% (Lossless / High Size)</span>
              </div>
            </div>
          </div>

          {/* Workflow Automation Toggles */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-800/50">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  Automation & Sizing Defaults
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pre-configured behavior when processing file queues
                </p>
              </div>
            </div>

            <div className="space-y-3.5 pt-1">
              {/* Lock Aspect Ratio */}
              <label className="flex items-center justify-between p-3.5 bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
                <div>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">
                    Always Lock Aspect Ratio by Default
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Proportionally scales width and height when resizing images
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.preserveAspectRatio}
                  onChange={(e) => handleUpdate({ preserveAspectRatio: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded-sm cursor-pointer accent-blue-600"
                />
              </label>

              {/* Auto Download on Finish */}
              <label className="flex items-center justify-between p-3.5 bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
                <div>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">
                    Instant Auto-Download on Conversion
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Automatically triggers browser download when single-file conversion finishes
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoDownload}
                  onChange={(e) => handleUpdate({ autoDownload: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded-sm cursor-pointer accent-blue-600"
                />
              </label>
            </div>
          </div>

          {/* PDF Visual Studio Defaults */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-200/50 dark:border-violet-800/50">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  PDF Visual Studio Primary Export
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your default output package when compiling pages
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleUpdate({ defaultPdfExport: 'pdf' })}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  settings.defaultPdfExport === 'pdf'
                    ? 'border-violet-500 bg-violet-50/60 dark:bg-violet-950/40 ring-2 ring-violet-500/20'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    Compiled PDF Document
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Single vector document (.pdf)</p>
                </div>
                {settings.defaultPdfExport === 'pdf' && <span className="text-violet-600 font-bold">✓</span>}
              </button>

              <button
                type="button"
                onClick={() => handleUpdate({ defaultPdfExport: 'images_zip' })}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  settings.defaultPdfExport === 'images_zip'
                    ? 'border-violet-500 bg-violet-50/60 dark:bg-violet-950/40 ring-2 ring-violet-500/20'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    Images Archive (.ZIP)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Individual high-res JPGs per page</p>
                </div>
                {settings.defaultPdfExport === 'images_zip' && <span className="text-violet-600 font-bold">✓</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STORAGE & PRIVACY */}
      {activeCategory === 'storage' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Cache Management Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/50 dark:border-amber-800/50">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  Local Cache & Stored Sessions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage temporary local session history and memory buffers
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Purge Temporary Session Cache
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Clears local session logs, thumbnail references, and memory buffers.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearCache}
                className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
              >
                Clear Cache Now
              </button>
            </div>
          </div>

          {/* Security & Data Lifecycle Architecture */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 text-slate-900 dark:text-white font-bold text-base">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-800/50">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  Privacy & Data Lifecycle Boundaries
                </h3>
                <p className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  Hardware-enforced zero-cloud architecture
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-200 flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Isolated Workspaces</span>
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Every batch upload executes in an isolated UUID directory inside <code>backend/temp/</code>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-200 flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Automatic Purge</span>
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Directories older than 30 minutes are automatically wiped during periodic cleanup sweeps.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-200 flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Zero Telemetry</span>
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  No analytical pings, tracking tokens, cookies, or remote logs are ever collected.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-200 flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Ephemeral Storage Guarantee</span>
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  All uploaded files and temporary workspaces are automatically wiped after conversion.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM ENGINES & DIAGNOSTICS */}
      {activeCategory === 'diagnostics' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {healthError ? (
            <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-800 dark:text-rose-300 text-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="font-bold">Backend Communication Error</span>
                <p className="text-xs">{healthError}</p>
              </div>
              <button
                type="button"
                onClick={fetchHealth}
                className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Server Status Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4.5 sm:p-7 shadow-xs space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-slate-900 dark:text-white font-bold text-base">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <span>Backend Core Service</span>
                      <p className="text-xs font-normal text-slate-500 dark:text-slate-400">
                        FastAPI engine running high-performance Python pipelines
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={fetchHealth}
                    disabled={loadingHealth}
                    className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    title="Refresh diagnostics"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingHealth ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-xs">
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
                      {health?.mode ? health.mode.toUpperCase() : 'ACTIVE'}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 dark:text-slate-400 block mb-1">API Endpoint</span>
                    <span
                      className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-xs truncate block"
                      title={import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'Connected')}
                    >
                      {import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'Connected')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Installed Tools & Engines */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center space-x-3 text-slate-900 dark:text-white font-bold text-base">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
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
                    { name: 'pillow-heif', key: 'pillow_heif', desc: 'Apple HEIC & HEIF image codec support' },
                    { name: 'pypdf', key: 'pypdf', desc: 'PDF text extraction, merging, and rotation' },
                    { name: 'pypdfium2', key: 'pypdfium2', desc: 'High-speed PDFium engine for PDF-to-image rendering' },
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
                      <div key={tool.key} className="py-3 flex items-center justify-between gap-4">
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
