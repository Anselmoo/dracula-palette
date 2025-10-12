<template>
  <header class="header">
    <div class="header-content">
      <div class="header-top">
        <div class="logo">
          <img src="/logo.svg" alt="Dracula Logo" class="logo-image" />
          <h1 class="title">Dracula Palette</h1>
        </div>
        <ThemeToggle />
      </div>
      <p class="subtitle">Advanced color harmony generator for Dracula-themed palettes</p>
    </div>
  </header>
</template>

<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue';
</script>

<style lang="scss" scoped>
.header {
  background: var(--dracula-current-line);
  border-bottom: 1px solid var(--dracula-selection);
  padding: 2rem 0;
  text-align: center;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
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
  color: var(--dracula-foreground);
  font-size: 1.2rem;
  margin: 0;
  font-weight: 400;
  opacity: 0.8;
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
