<template>
  <header class="header">
    <div class="header-content">
      <div class="header-top">
        <div class="logo">
          <img src="/logo.svg" alt="Dracula Logo" class="logo-image" />
          <h1 class="title">{{ isDarkMode ? 'Dracula' : 'Alucard' }} Palette</h1>
        </div>
        <ThemeToggle />
      </div>
      <p class="subtitle">
        Advanced color harmony generator for {{ isDarkMode ? 'Dracula' : 'Alucard' }}-themed
        palettes - Dark and Light
      </p>
      <nav class="subnav" aria-label="Section navigation">
        <a href="#section-start" class="subnav-link">Start</a>
        <a href="#section-suggestions" class="subnav-link"
          >Closest {{ isDarkMode ? 'Dracula' : 'Alucard' }} Colors</a
        >
        <a href="#section-palette" class="subnav-link"
          >{{ isDarkMode ? 'Dracula' : 'Alucard' }} Color Palette</a
        >
        <a href="#section-generator" class="subnav-link">Extended Palette Generator</a>
        <a href="#section-analysis" class="subnav-link">Scientific Color Analysis</a>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue';
import { useTheme } from '../composables/useTheme';

const { isDarkMode } = useTheme();
</script>

<style lang="scss" scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--header-footer-bg);
  border-bottom: 1px solid var(--header-footer-border);
  padding: 2rem 0;
  text-align: center;
  backdrop-filter: blur(8px);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.logo-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
}

.title {
  color: var(--dracula-foreground);
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, var(--dracula-pink), var(--dracula-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: var(--header-subtitle-color);
  font-size: 1.2rem;
  margin: 0;
  font-weight: 400;
  opacity: 0.9;
}

.subnav {
  display: flex;
  justify-content: center;
  gap: 1.25rem;
  padding: 0.5rem 1rem 0.8rem;
  border-top: 1px solid var(--header-footer-border);
  overflow-x: auto;
}

.subnav-link {
  color: var(--dracula-comment);
  text-decoration: none;
  white-space: nowrap;
  padding: 0.25rem 0.25rem;
  border-radius: 6px;
  font-weight: 500;
}

.subnav-link:hover {
  color: var(--dracula-foreground);
  background: var(--dracula-selection);
}

/* Better visibility in Alucard theme */
.theme-alucard .subnav-link {
  color: var(--dracula-foreground);
  opacity: 0.8;
}

.theme-alucard .subnav-link:hover {
  opacity: 1;
  background: var(--dracula-selection);
}

@media (max-width: 768px) {
  .logo {
    flex-direction: column;
    gap: 0.5rem;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }
}
</style>
