import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { HomePage } from './pages/HomePage';
import { ToolsPage } from './pages/ToolsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'convert' | 'tools' | 'settings'>('convert');
  const [presetTarget, setPresetTarget] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleSelectToolPreset = (
    _source: string,
    target: string,
    _action?: 'convert' | 'merge_pdf' | 'split_pdf'
  ) => {
    setPresetTarget(target);
    setSelectedPresetId(`${_source.toLowerCase()}-to-${target.toLowerCase()}`);
    setActiveTab('convert');
  };

  const handleSelectDashboard = () => {
    setActiveTab('convert');
    setSelectedPresetId(null);
  };

  const handleSelectSettings = () => {
    setActiveTab('settings');
    setSelectedPresetId(null);
  };

  const handleSelectToolFromCatalog = (_source: string, target: string) => {
    setPresetTarget(target);
    setActiveTab('convert');
  };

  return (
    <div
      className={`min-h-screen flex font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#070b16] text-slate-100' : 'bg-[#f4f6fa] text-slate-900'
      }`}
    >
      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        selectedPreset={selectedPresetId}
        onSelectDashboard={handleSelectDashboard}
        onSelectTool={handleSelectToolPreset}
        onSelectSettings={handleSelectSettings}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area (Offset by Sidebar on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 sm:lg:pl-72 transition-all">
        {/* Floating Top Header */}
        <TopHeader
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onSelectTool={handleSelectToolPreset}
        />

        {/* Content Canvas */}
        <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-8 pt-6 sm:pt-8">
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

        {/* Bottom Footer */}
        <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-5 text-xs transition-colors mt-auto bg-white/50 dark:bg-slate-900/40">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                100% Local Execution • Zero External APIs • Files Never Leave Your Computer
              </span>
            </div>
            <p className="text-slate-400 dark:text-slate-600 text-[11px]">
              OmniConvert • Personal Local File Suite v1.0
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
