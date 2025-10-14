import { ref, computed, watch } from 'vue';
import type { ThemeMode } from '../types/theme';
import { DRACULA_COLORS, ALUCARD_COLORS } from '../data/draculaColors';
import type { DraculaColor } from '../types/color';

const THEME_STORAGE_KEY = 'dracula-palette-theme';

// Global theme state
const currentTheme = ref<ThemeMode>('dracula');

// Load theme from localStorage on init (browser only)
if (typeof window !== 'undefined') {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
  if (storedTheme && (storedTheme === 'dracula' || storedTheme === 'alucard')) {
    currentTheme.value = storedTheme;
  }
  // Initialize CSS variables and body class immediately
  updateCSSVariables(currentTheme.value);
  updateBodyClass(currentTheme.value);
}

/**
 * Composable for managing theme state across the application
 */
export function useTheme() {
  // Computed property to get the current color palette
  const currentColors = computed<DraculaColor[]>(() => {
    return currentTheme.value === 'dracula' ? DRACULA_COLORS : ALUCARD_COLORS;
  });

  // Watch for theme changes and update localStorage and CSS variables
  watch(
    currentTheme,
    newTheme => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      }
      updateCSSVariables(newTheme);
      updateBodyClass(newTheme);
    },
    { immediate: true }
  );

  /**
   * Toggle between Dracula and Alucard themes
   */
  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'dracula' ? 'alucard' : 'dracula';
  }

  /**
   * Set a specific theme
   */
  function setTheme(theme: ThemeMode) {
    currentTheme.value = theme;
  }

  /**
   * Check if current theme is dark mode
   */
  const isDarkMode = computed(() => currentTheme.value === 'dracula');

  /**
   * Check if current theme is light mode
   */
  const isLightMode = computed(() => currentTheme.value === 'alucard');

  return {
    currentTheme: computed(() => currentTheme.value),
    currentColors,
    toggleTheme,
    setTheme,
    isDarkMode,
    isLightMode,
  };
}

/**
 * Update CSS variables based on the current theme
 */
function updateCSSVariables(theme: ThemeMode) {
  if (typeof document === 'undefined') return;

  const colors = theme === 'dracula' ? DRACULA_COLORS : ALUCARD_COLORS;
  const root = document.documentElement;

  colors.forEach(color => {
    const cssVarName = `--dracula-${color.name.toLowerCase().replace(/\s+/g, '-')}`;
    root.style.setProperty(cssVarName, color.hex);
  });

  // Set theme mode variable for CSS
  root.style.setProperty('--theme-mode', theme);
}

/**
 * Update body class for theme-specific styling
 */
function updateBodyClass(theme: ThemeMode) {
  if (typeof document === 'undefined') return;

  document.body.classList.remove('theme-dracula', 'theme-alucard');
  document.body.classList.add(`theme-${theme}`);
}
