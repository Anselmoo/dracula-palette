import { ref, watch } from 'vue';
import type { ThemeMode } from '../types/color';

const THEME_STORAGE_KEY = 'dracula-theme-mode';

// Global theme state
const themeMode = ref<ThemeMode>('dark');

// Initialize theme from localStorage or system preference
function initializeTheme() {
  if (typeof window === 'undefined') return;
  
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
  
  if (stored && (stored === 'dark' || stored === 'light')) {
    themeMode.value = stored;
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    themeMode.value = prefersDark ? 'dark' : 'light';
  }
  
  applyTheme(themeMode.value);
}

// Apply theme to document
function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}

// Watch for theme changes and persist
watch(themeMode, (newTheme) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  applyTheme(newTheme);
});

export function useTheme() {
  const toggleTheme = () => {
    themeMode.value = themeMode.value === 'dark' ? 'light' : 'dark';
  };

  const setTheme = (theme: ThemeMode) => {
    themeMode.value = theme;
  };

  return {
    themeMode,
    toggleTheme,
    setTheme,
    initializeTheme,
  };
}
