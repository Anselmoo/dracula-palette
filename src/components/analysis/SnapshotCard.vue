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
          <button
            v-for="(s, index) in displayedSources"
            :key="s.hex"
            class="chip chip--interactive"
            :class="{ 'chip--first': index === 0 }"
            :style="{ background: s.hex }"
            :title="s.name"
            @click="toggleSourcesExpanded"
            :aria-expanded="sourcesExpanded ? 'true' : 'false'"
            :aria-label="
              index === 0 && !sourcesExpanded && sources.length > 1
                ? `${s.name}. Click to show ${sources.length - 1} more colors`
                : s.name
            "
            >{{ s.name }}</button
          >
          <button
            v-if="!sourcesExpanded && sources.length > 1"
            class="chip chip--show-more"
            @click="toggleSourcesExpanded"
            :aria-label="`Show ${sources.length - 1} more colors`"
            title="Click to show all colors"
          >
            +{{ sources.length - 1 }}
          </button>
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
import { ref, computed } from 'vue';
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

// State for expandable sources
const sourcesExpanded = ref(false);

// Show only first source initially, all when expanded
const displayedSources = computed(() => {
  if (sourcesExpanded.value || props.sources.length <= 1) {
    return props.sources;
  }
  return props.sources.slice(0, 1);
});

function toggleSourcesExpanded() {
  sourcesExpanded.value = !sourcesExpanded.value;
}
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
  align-items: center;
}
.chip {
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  background: var(--dracula-background);
  color: var(--dracula-foreground);
  border: 1px solid var(--surface-border);
  font-size: 0.8rem;
  transition: all 0.3s ease;

  &--interactive {
    cursor: pointer;
    border: 2px solid var(--surface-border);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      border-color: var(--dracula-purple);
    }

    &:focus {
      outline: 2px solid var(--dracula-purple);
      outline-offset: 2px;
    }

    &:active {
      transform: translateY(0);
    }
  }

  &--first {
    animation: chip-appear 0.3s ease;
  }

  &--show-more {
    background: var(--dracula-purple);
    color: var(--dracula-foreground);
    border: 2px solid var(--dracula-purple);
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    animation: chip-appear 0.3s ease;

    &:hover {
      background: var(--dracula-pink);
      border-color: var(--dracula-pink);
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 4px 12px rgba(189, 147, 249, 0.4);
    }

    &:focus {
      outline: 2px solid var(--dracula-pink);
      outline-offset: 2px;
    }

    &:active {
      transform: translateY(0) scale(0.98);
    }
  }
}

@keyframes chip-appear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
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
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
