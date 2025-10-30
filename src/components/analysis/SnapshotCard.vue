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
            v-show="index < visibleSourcesCount"
            class="chip color-chip"
            :class="{ 'reveal-animation': index === visibleSourcesCount - 1 && visibleSourcesCount > 1 }"
            :style="{ background: s.hex }"
            :title="s.name"
            @click="revealNextSource"
            role="button"
            :aria-label="`${s.name} - Click to reveal next color`"
            tabindex="0"
            @keydown.enter="revealNextSource"
            @keydown.space.prevent="revealNextSource"
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
      <span
        v-for="(c, index) in swatches"
        :key="c"
        v-show="index < visibleSwatchesCount"
        class="sw clickable-swatch"
        :class="{ 'reveal-animation': index === visibleSwatchesCount - 1 && visibleSwatchesCount > 1 }"
        :style="{ background: c }"
        :title="c"
        @click="revealNextSwatch"
        role="button"
        :aria-label="`Color ${c} - Click to reveal next color`"
        tabindex="0"
        @keydown.enter="revealNextSwatch"
        @keydown.space.prevent="revealNextSwatch"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue';
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

// State for interactive reveal - start with showing only 1 color
const visibleSourcesCount = ref(1);
const visibleSwatchesCount = ref(1);

// Click handlers to reveal next color
const revealNextSource = () => {
  if (visibleSourcesCount.value < props.sources.length) {
    visibleSourcesCount.value++;
  }
};

const revealNextSwatch = () => {
  if (visibleSwatchesCount.value < props.swatches.length) {
    visibleSwatchesCount.value++;
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
.color-chip {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  &:focus {
    outline: 2px solid var(--dracula-purple);
    outline-offset: 2px;
  }
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
.clickable-swatch {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: scale(1.15);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  &:focus {
    outline: 2px solid var(--dracula-purple);
    outline-offset: 2px;
  }
}
.reveal-animation {
  animation: revealColor 0.3s ease-out;
}
@keyframes revealColor {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
