<template>
  <button
    class="theme-toggle"
    :aria-label="`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`"
    @click="toggleTheme"
  >
    <svg
      v-if="themeMode === 'dark'"
      class="icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
    <svg
      v-else
      class="icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
    <span class="theme-label">{{ themeMode === 'dark' ? 'Light' : 'Dark' }} Mode</span>
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme';

const { themeMode, toggleTheme } = useTheme();
</script>

<style lang="scss" scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--dracula-current-line);
  color: var(--dracula-foreground);
  border: 1px solid var(--dracula-selection);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: 0.9rem;
  font-weight: 500;

  @media (hover: hover) {
    &:hover {
      background: var(--dracula-selection);
      border-color: var(--dracula-pink);
      transform: translateY(-1px);
    }
  }

  &:active {
    transform: translateY(0);
  }

  .icon {
    color: var(--dracula-yellow);
    transition: transform var(--transition-normal);
  }

  &:hover .icon {
    transform: rotate(20deg);
  }

  .theme-label {
    @media (max-width: 640px) {
      display: none;
    }
  }
}
</style>
