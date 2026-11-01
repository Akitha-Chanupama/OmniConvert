export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSizeMode = 'compact' | 'normal' | 'spacious';
export type MotionMode = 'smooth' | 'reduced';
export type PdfExportDefault = 'pdf' | 'images_zip';

export interface AppSettings {
  // Appearance
  theme: ThemeMode;
  fontSize: FontSizeMode;
  motion: MotionMode;
  soundEffects: boolean;

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
  soundEffects: true,
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

export interface ThemeTransitionOrigin {
  x?: number;
  y?: number;
}

let themeTransitionTimer: number | null = null;

export function saveSettings(
  partial: Partial<AppSettings>,
  origin?: ThemeTransitionOrigin
): AppSettings {
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

  applySettingsToDOM(updated, origin);
  window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: updated }));
  return updated;
}

export function resetSettings(origin?: ThemeTransitionOrigin): AppSettings {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('omniconvert_theme');
  } catch (err) {
    console.error('Failed to reset settings:', err);
  }

  applySettingsToDOM(DEFAULT_SETTINGS, origin);
  window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: DEFAULT_SETTINGS }));
  return DEFAULT_SETTINGS;
}

export function applySettingsToDOM(settings: AppSettings, origin?: ThemeTransitionOrigin) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // 1. Theme application with smooth circular ripple or progressive cross-fade
  let isDark = false;
  if (settings.theme === 'system') {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  } else {
    isDark = settings.theme === 'dark';
  }

  const currentIsDark = root.classList.contains('dark');
  const themeChanged = currentIsDark !== isDark;

  const executeThemeChange = () => {
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  if (themeChanged) {
    const isReducedMotion =
      settings.motion === 'reduced' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // View Transitions API (Modern Chromium & Safari 18+)
    const docWithVT = document as unknown as {
      startViewTransition?: (cb: () => void) => {
        ready: Promise<void>;
      };
    };

    if (typeof docWithVT.startViewTransition === 'function' && !isReducedMotion) {
      try {
        const x = origin?.x ?? window.innerWidth / 2;
        const y = origin?.y ?? window.innerHeight / 2;
        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );

        const transition = docWithVT.startViewTransition(() => {
          executeThemeChange();
        });

        transition.ready
          .then(() => {
            root.animate(
              {
                clipPath: [
                  `circle(0px at ${x}px ${y}px)`,
                  `circle(${endRadius}px at ${x}px ${y}px)`,
                ],
              },
              {
                duration: 480,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                pseudoElement: '::view-transition-new(root)',
              }
            );
          })
          .catch(() => {
            // Silently ignore if transition is canceled or interrupted
          });
      } catch {
        executeThemeChange();
      }
    } else if (!isReducedMotion) {
      // Smooth CSS color & background interpolation fallback
      root.classList.add('theme-transitioning');
      executeThemeChange();

      if (themeTransitionTimer !== null) {
        window.clearTimeout(themeTransitionTimer);
      }
      themeTransitionTimer = window.setTimeout(() => {
        root.classList.remove('theme-transitioning');
        themeTransitionTimer = null;
      }, 450);
    } else {
      executeThemeChange();
    }
  } else {
    executeThemeChange();
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

