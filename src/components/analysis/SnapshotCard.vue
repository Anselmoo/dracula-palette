<template>
  <section class="snapshot" aria-label="Palette Snapshot">
    <header class="row">
      <h3 class="t"><Icon name="compass" /><span>Palette Snapshot</span></h3>
    </header>
    <div class="grid">
      <div class="cell">
        <span class="label">Standards</span>
        <div class="chips">
          <span v-for="s in standards" :key="s" class="chip">{{ s }}</span>
        </div>
      </div>
      <div class="cell" v-if="sources.length">
        <span class="label">Sources</span>
        <div class="chips">
          <span
            v-for="(s, index) in sources"
            :key="s.hex"
            class="chip chip-interactive"
            :class="{ 'chip-hidden': !isColorVisible(index) }"
            :style="{ background: s.hex }"
            :title="s.name"
            @click="showNextColor(index)"
            @keydown.enter="showNextColor(index)"
            @keydown.space.prevent="showNextColor(index)"
            role="button"
            :tabindex="isColorVisible(index) ? 0 : -1"
            :aria-label="`${s.name} color chip${isColorVisible(index) && visibleCount < sources.length ? '. Click to reveal next color' : ''}`"
            >{{ s.name }}</span
          >
        </div>
      </div>
      <div class="cell" v-if="insights">
        <div class="metrics">
          <div class="metric">
            <span class="m-label">Lightness</span
            ><span class="m-val"
              >{{ insights.lightnessRange[0] }}–{{ insights.lightnessRange[1] }}%</span
            >
          </div>
          <div class="metric">
            <span class="m-label">Avg Chroma</span
            ><span class="m-val">{{ insights.averageChroma ?? '—' }}</span>
          </div>
          <div class="metric">
            <span class="m-label">Vivid</span
            ><span class="m-val">{{ insights.vividShare ?? '—' }}%</span>
          </div>
          <div class="metric">
            <span class="m-label">Count</span><span class="m-val">{{ insights.totalColors }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="swatches" v-if="swatches?.length">
      <span v-for="c in swatches" :key="c" class="sw" :style="{ background: c }" :title="c" />
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import type { PaletteStandard, PaletteSourceColor } from '../../types/palette';
import Icon from '../Icon.vue';

interface Insights {
  lightnessRange: [number, number];
  averageChroma: number | null;
  vividShare: number | null;
  totalColors: number;
}

const props = withDefaults(
  defineProps<{
    standards: PaletteStandard[];
    sources: PaletteSourceColor[];
    insights: Insights | null;
    swatches?: string[];
  }>(),
  {
    standards: () => [],
    sources: () => [],
    swatches: () => [],
  }
);

// Track the number of visible colors (initially 1)
const visibleCount = ref(1);

// Watch for changes in sources to reset visible count
watch(
  () => props.sources,
  () => {
    visibleCount.value = Math.min(1, props.sources.length);
  },
  { immediate: true }
);

// Check if a color at given index should be visible
const isColorVisible = (index: number): boolean => {
  return index < visibleCount.value;
};

// Show the next color when a visible chip is clicked
const showNextColor = (clickedIndex: number): void => {
  // Only process clicks on visible chips
  if (isColorVisible(clickedIndex) && visibleCount.value < props.sources.length) {
    visibleCount.value += 1;
  }
};
</script>
<style scoped lang="scss">
.snapshot {
  background: var(--surface-secondary);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.t {
  margin: 0;
  color: var(--dracula-foreground);
  font-size: 1.1rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}
.cell {
  min-width: 0;
}
.label {
  color: var(--dracula-comment);
  font-size: 0.85rem;
  display: block;
  margin-bottom: 0.25rem;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.chip {
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  background: var(--dracula-background);
  color: var(--dracula-foreground);
  border: 1px solid var(--surface-border);
  font-size: 0.8rem;
}
.chip-interactive {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}
.chip-interactive:not(.chip-hidden):hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.chip-interactive:not(.chip-hidden):active {
  transform: scale(0.98);
}
.chip-interactive:not(.chip-hidden):focus-visible {
  outline: 2px solid var(--dracula-cyan);
  outline-offset: 2px;
}
.chip-hidden {
  opacity: 0;
  transform: scale(0.8);
  max-width: 0;
  padding: 0;
  margin: 0;
  border: 0;
  overflow: hidden;
  pointer-events: none;
}
.metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}
.metric {
  background: var(--surface-primary);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 0.5rem 0.7rem;
}
.m-label {
  display: block;
  color: var(--dracula-comment);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.m-val {
  color: var(--dracula-foreground);
  font-weight: 600;
}
.swatches {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.75rem;
}
.sw {
  width: 24px;
  height: 16px;
  border-radius: 6px;
  border: 1px solid var(--surface-border);
  display: inline-block;
}
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
