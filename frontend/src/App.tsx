import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { HomePage } from './pages/HomePage';
import { ToolsPage } from './pages/ToolsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PdfStudioPage } from './pages/PdfStudioPage';
import { CommandPalette } from './components/CommandPalette';
import { GlobalDropOverlay } from './components/GlobalDropOverlay';
import { ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'convert' | 'tools' | 'settings' | 'pdf-studio'>('convert');
  const [presetTarget, setPresetTarget] = useState<string | null>(null);
  const [presetSource, setPresetSource] = useState<string | null>(null);
  const [presetAction, setPresetAction] = useState<'convert' | 'merge_pdf' | 'split_pdf' | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Dedicated file for PDF Studio
  const [pdfStudioFile, setPdfStudioFile] = useState<File | null>(null);

  // Cross-component communication for drag-and-drop & queue control
  const [droppedFiles, setDroppedFiles] = useState<File[] | null>(null);
  const [queueCount, setQueueCount] = useState<number>(0);
  const [clearQueueTrigger, setClearQueueTrigger] = useState<number>(0);

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

  // Global Keyboard Shortcuts (Ctrl + K or / to trigger Command Palette)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '') &&
        !(document.activeElement as HTMLElement)?.isContentEditable
      ) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleSelectToolPreset = (
    source: string,
    target: string,
    action?: 'convert' | 'merge_pdf' | 'split_pdf'
  ) => {
    setPresetTarget(target);
    setPresetSource(source);
    setPresetAction(action || null);
    setSelectedPresetId(`${source.toLowerCase()}-to-${target.toLowerCase()}${action ? '-' + action : ''}`);
    setActiveTab('convert');
  };

  const handleSelectDashboard = () => {
    setActiveTab('convert');
    setSelectedPresetId(null);
    setPresetTarget(null);
    setPresetSource(null);
    setPresetAction(null);
  };

  const handleSelectSettings = () => {
    setActiveTab('settings');
    setSelectedPresetId(null);
  };

  const handleSelectPdfStudio = (fileToLoad?: File) => {
    if (fileToLoad) {
      setPdfStudioFile(fileToLoad);
    }
    setActiveTab('pdf-studio');
    setSelectedPresetId('pdf-studio');
  };

  const handleSelectToolFromCatalog = (source: string, target: string) => {
    if (source.toUpperCase() === 'PDF' && target.toUpperCase() === 'STUDIO') {
      handleSelectPdfStudio();
      return;
    }
    setPresetTarget(target);
    setPresetSource(source);
    setActiveTab('convert');
  };

  const handleGlobalFilesDropped = (files: File[]) => {
    if (files.length === 1 && files[0].name.toLowerCase().endsWith('.pdf') && activeTab === 'pdf-studio') {
      setPdfStudioFile(files[0]);
      return;
    }
    setDroppedFiles(files);
    setActiveTab('convert');
  };

  return (
    <div
      className={`min-h-screen flex font-sans transition-colors duration-200 ambient-mesh ${
        isDark ? 'bg-[#070b16] text-slate-100' : 'bg-[#f4f6fa] text-slate-900'
      }`}
    >
      {/* Global Full-Screen Drag & Drop Aura Overlay */}
      <GlobalDropOverlay onFilesDropped={handleGlobalFilesDropped} />

      {/* Spotlight Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTool={handleSelectToolPreset}
        onToggleTheme={toggleTheme}
        isDark={isDark}
        onNavigateToDashboard={handleSelectDashboard}
        onNavigateToTools={() => {
          setActiveTab('tools');
          setSelectedPresetId(null);
        }}
        onNavigateToPdfStudio={handleSelectPdfStudio}
        onNavigateToSettings={handleSelectSettings}
        onClearQueue={() => setClearQueueTrigger((prev) => prev + 1)}
        hasQueueFiles={queueCount > 0}
      />

      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        selectedPreset={selectedPresetId}
        onSelectDashboard={handleSelectDashboard}
        onSelectTool={handleSelectToolPreset}
        onSelectPdfStudio={handleSelectPdfStudio}
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
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Content Canvas */}
        <main className="flex-1 max-w-[1480px] w-full mx-auto px-3.5 sm:px-8 pt-4 sm:pt-8">
          {activeTab === 'convert' && (
            <HomePage
              onNavigateToTools={() => setActiveTab('tools')}
              onOpenPdfStudio={handleSelectPdfStudio}
              presetTarget={presetTarget}
              presetSource={presetSource}
              presetAction={presetAction}
              onClearPreset={() => {
                setPresetTarget(null);
                setPresetSource(null);
                setPresetAction(null);
              }}
              externalFiles={droppedFiles}
              onClearExternalFiles={() => setDroppedFiles(null)}
              onQueueChange={setQueueCount}
              clearQueueTrigger={clearQueueTrigger}
            />
          )}

          {activeTab === 'pdf-studio' && (
            <PdfStudioPage
              initialFile={pdfStudioFile}
              onClearInitialFile={() => setPdfStudioFile(null)}
              onNavigateToDashboard={handleSelectDashboard}
            />
          )}

          {activeTab === 'tools' && (
            <ToolsPage onSelectTool={handleSelectToolFromCatalog} />
          )}

          {activeTab === 'settings' && <SettingsPage />}
        </main>

        {/* Bottom Footer */}
        <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-4 text-xs transition-colors mt-auto bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
          <div className="max-w-[1480px] mx-auto px-3.5 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 font-medium text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                100% Local Execution • Zero External APIs • Files Never Leave Your Computer
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
                <span>Developed by</span>
                <a
                  href="https://github.com/Akitha-Chanupama"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors group px-2 py-1 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs"
                >
                  <svg
                    className="w-3.5 h-3.5 fill-current text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>Akitha Chanupama</span>
                </a>
              </div>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
              <div className="flex items-center space-x-1.5 text-slate-400 dark:text-slate-500 text-[11px] font-medium">
                <img src="/logo.png" alt="" className="w-3.5 h-3.5 rounded-sm object-cover" />
                <span>OmniConvert v1.0</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
