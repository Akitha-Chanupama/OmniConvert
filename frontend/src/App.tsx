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
        <main className="flex-1 max-w-[1480px] w-full mx-auto px-4 sm:px-8 pt-6 sm:pt-8">
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
        <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-5 text-xs transition-colors mt-auto bg-white/50 dark:bg-slate-900/40">
          <div className="max-w-[1480px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
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
