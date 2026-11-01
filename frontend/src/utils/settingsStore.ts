export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSizeMode = 'compact' | 'normal' | 'spacious';
export type MotionMode = 'smooth' | 'reduced';
export type PdfExportDefault = 'pdf' | 'images_zip';

export interface AppSettings {
  // Appearance
  theme: ThemeMode;
  fontSize: FontSizeMode;
  motion: MotionMode;

  // Conversion Defaults
  defaultQuality: number;
  defaultTarget: string;
  preserveAspectRatio: boolean;
  autoDownload: boolean;

  // PDF Studio Defaults
  defaultPdfExport: PdfExportDefault;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  fontSize: 'normal',
  motion: 'smooth',
  defaultQuality: 80,
  defaultTarget: 'auto',
  preserveAspectRatio: true,
  autoDownload: false,
  defaultPdfExport: 'pdf',
};

const STORAGE_KEY = 'omniconvert_settings_v1';
const SETTINGS_EVENT = 'omniconvert_settings_changed';

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Legacy theme migration if exists
      const legacyTheme = localStorage.getItem('omniconvert_theme');
      if (legacyTheme === 'light' || legacyTheme === 'dark') {
        return { ...DEFAULT_SETTINGS, theme: legacyTheme };
      }
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(partial: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const updated: AppSettings = { ...current, ...partial };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Keep legacy theme key in sync for backwards compatibility
    if (updated.theme === 'dark' || updated.theme === 'light') {
      localStorage.setItem('omniconvert_theme', updated.theme);
    } else {
      localStorage.removeItem('omniconvert_theme');
    }
  } catch (err) {
    console.error('Failed to save settings:', err);
  }

  applySettingsToDOM(updated);
  window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: updated }));
  return updated;
}

export function resetSettings(): AppSettings {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('omniconvert_theme');
  } catch (err) {
    console.error('Failed to reset settings:', err);
  }

  applySettingsToDOM(DEFAULT_SETTINGS);
  window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: DEFAULT_SETTINGS }));
  return DEFAULT_SETTINGS;
}

export function applySettingsToDOM(settings: AppSettings) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // 1. Theme application
  let isDark = false;
  if (settings.theme === 'system') {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  } else {
    isDark = settings.theme === 'dark';
  }

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // 2. Font Size Scaling
  if (settings.fontSize === 'compact') {
    root.style.fontSize = '92%';
    root.setAttribute('data-font-size', 'compact');
  } else if (settings.fontSize === 'spacious') {
    root.style.fontSize = '108%';
    root.setAttribute('data-font-size', 'spacious');
  } else {
    root.style.fontSize = '100%';
    root.setAttribute('data-font-size', 'normal');
  }

  // 3. Motion Preference
  if (settings.motion === 'reduced') {
    root.classList.add('reduced-motion');
    root.setAttribute('data-reduced-motion', 'true');
  } else {
    root.classList.remove('reduced-motion');
    root.removeAttribute('data-reduced-motion');
  }
}

export function subscribeSettings(callback: (settings: AppSettings) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const custom = e as CustomEvent<AppSettings>;
    callback(custom.detail || getSettings());
  };

  window.addEventListener(SETTINGS_EVENT, handler);

  // Listen to OS theme changes if in system mode
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const mediaHandler = () => {
    const current = getSettings();
    if (current.theme === 'system') {
      applySettingsToDOM(current);
      callback(current);
    }
  };

  try {
    mediaQuery.addEventListener('change', mediaHandler);
  } catch {
    mediaQuery.addListener(mediaHandler);
  }

  return () => {
    window.removeEventListener(SETTINGS_EVENT, handler);
    try {
      mediaQuery.removeEventListener('change', mediaHandler);
    } catch {
      mediaQuery.removeListener(mediaHandler);
    }
  };
}
