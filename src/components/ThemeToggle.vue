<template>
  <div class="theme-toggle">
    <button
      class="theme-toggle-button"
      @click="toggleTheme"
      :aria-label="`Switch to ${nextTheme} theme`"
      :title="`Switch to ${nextTheme} theme`"
    >
      <span class="theme-icon"><Icon :name="isDarkMode ? 'moon' : 'sun'" :size="18" /></span>
      <span class="theme-label">{{ currentThemeLabel }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '../composables/useTheme';
import { THEME_CONFIGS } from '../types/theme';
import Icon from './Icon.vue';

const { currentTheme, toggleTheme, isDarkMode } = useTheme();

const currentThemeLabel = computed(() => THEME_CONFIGS[currentTheme.value].label);
const nextTheme = computed(() => (isDarkMode.value ? 'Alucard' : 'Dracula'));
</script>

<style scoped lang="scss">
.theme-toggle {
  display: flex;
  align-items: center;
}

.theme-toggle-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--dracula-current-line);
  border: 2px solid var(--dracula-selection);
  border-radius: 8px;
  color: var(--dracula-foreground);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: var(--dracula-selection);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: 2px solid var(--dracula-purple);
    outline-offset: 2px;
  }
}

/* Theme-specific button styling */
.theme-alucard .theme-toggle-button {
  background: var(--dracula-selection);
  border-color: var(--dracula-comment);

  &:hover {
    background: color-mix(in srgb, var(--dracula-selection) 80%, var(--dracula-comment) 20%);
  }
}

.theme-icon {
  font-size: 1.25rem;
  line-height: 1;
  display: flex;
  align-items: center;
}

.theme-label {
  font-family: 'Fira Code', monospace;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Responsive */
@media (max-width: 768px) {
  .theme-label {
    display: none;
  }

  .theme-toggle-button {
    padding: 0.5rem;
    min-width: 44px;
    min-height: 44px;
    justify-content: center;
  }

  .theme-icon {
    font-size: 1.5rem;
  }
}
</style>
