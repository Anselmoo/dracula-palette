<template>
  <div class="contrast-matrix">
    <div class="matrix-toolbar">
      <div class="title-group">
        <h3 class="matrix-title">Accessible Contrast Matrix</h3>
        <p class="matrix-subtitle">
          Compare accent colors against key backgrounds. Hover a cell to inspect precise WCAG
          ratios.
        </p>
      </div>
      <label class="toggle">
        <input type="checkbox" v-model="showHeatmap" />
        <span>Heatmap overlay</span>
      </label>
    </div>

    <div class="matrix-grid" :style="matrixStyle">
      <div class="matrix-corner">Accent vs Background</div>
      <div v-for="bg in backgroundList" :key="bg.name" class="matrix-header">
        <span class="header-chip" :style="{ backgroundColor: bg.hex }"></span>
        <span class="header-label">{{ bg.name }}</span>
        <span class="header-hex">{{ bg.hex }}</span>
      </div>

      <template v-for="accent in accentList" :key="accent.name">
        <div class="matrix-row-label">
          <span class="swatch" :style="{ backgroundColor: accent.hex }"></span>
          <div class="row-text">
            <span class="label">{{ accent.name }}</span>
            <span class="hex">{{ accent.hex }}</span>
          </div>
        </div>
        <div
          v-for="bg in backgroundList"
          :key="`${accent.name}-${bg.name}`"
          class="matrix-cell"
          :title="tooltip(accent.hex, bg.hex)"
        >
          <div class="cell-preview" :style="previewStyle(accent.hex, bg.hex)">
            <span class="preview-sample">Aa</span>
            <span class="preview-sample large">Aa</span>
          </div>
          <div class="cell-meta">
            <span :class="['ratio-badge', rating(accent.hex, bg.hex)]">{{
              ratio(accent.hex, bg.hex)
            }}</span>
            <span class="wcag-tag">{{ rating(accent.hex, bg.hex) }}</span>
          </div>
          <div
            v-if="showHeatmap"
            class="heatmap-overlay"
            :style="heatStyle(accent.hex, bg.hex)"
          ></div>
        </div>
      </template>
    </div>

    <p class="legend">
      Normal text requires 4.5:1 for AA and 7:1 for AAA. Large text (>=18pt or 14pt bold) passes at
      3:1.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTheme } from '../composables/useTheme';
import { contrastRatio, wcagRating } from '../utils/contrast';
import chroma from 'chroma-js';

type AnalysisColor = {
  hex: string;
  name: string;
};

const props = withDefaults(
  defineProps<{
    backgrounds?: AnalysisColor[];
    accents?: AnalysisColor[];
  }>(),
  {
    backgrounds: () => [],
    accents: () => [],
  }
);
const { currentColors } = useTheme();

const fallbackBackgrounds = computed<AnalysisColor[]>(() =>
  currentColors.value
    .filter(color => color.category === 'background')
    .map(color => ({ hex: color.hex, name: color.name }))
);

const fallbackAccents = computed<AnalysisColor[]>(() =>
  currentColors.value
    .filter(color => color.category === 'accent')
    .map(color => ({ hex: color.hex, name: color.name }))
);

const backgroundList = computed<AnalysisColor[]>(() =>
  props.backgrounds && props.backgrounds.length ? props.backgrounds : fallbackBackgrounds.value
);

const accentList = computed<AnalysisColor[]>(() =>
  props.accents && props.accents.length ? props.accents : fallbackAccents.value
);

const showHeatmap = ref(false);

const matrixStyle = computed(() => ({
  gridTemplateColumns: `160px repeat(${backgroundList.value.length}, minmax(140px, 1fr))`,
}));

// Theme-aware color scale for heatmap
const heatmapColorScale = computed(() => {
  const red = currentColors.value.find(c => c.name === 'Red')?.hex ?? '#ff5555';
  const yellow = currentColors.value.find(c => c.name === 'Yellow')?.hex ?? '#f1fa8c';
  const green = currentColors.value.find(c => c.name === 'Green')?.hex ?? '#50fa7b';
  return chroma.scale([red, yellow, green]).domain([1, 4.5, 7]);
});

function ratio(fg: string, bg: string): string {
  return contrastRatio(fg, bg).toFixed(2);
}

function rating(fg: string, bg: string): string {
  return wcagRating(contrastRatio(fg, bg));
}

function tooltip(fg: string, bg: string) {
  return `FG ${fg} vs BG ${bg}: ${ratio(fg, bg)}:1`;
}

function previewStyle(fg: string, bg: string) {
  return {
    background: bg,
    color: fg,
  };
}

function heatStyle(fg: string, bg: string) {
  const r = contrastRatio(fg, bg);
  const rc = Math.max(1, Math.min(7, r));
  const color = heatmapColorScale.value(rc).alpha(0.35).hex();
  return {
    background: color,
  };
}
</script>

<style scoped lang="scss">
.contrast-matrix {
  margin-top: 2rem;
  background: var(--surface-primary);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
}

.matrix-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.title-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.matrix-title {
  margin: 0;
  color: var(--dracula-foreground);
}

.matrix-subtitle {
  margin: 0;
  color: var(--dracula-comment);
  font-size: 0.9rem;
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--dracula-foreground);
  font-size: 0.9rem;
}

.toggle input {
  accent-color: var(--dracula-purple);
}

.matrix-grid {
  display: grid;
  gap: 0.75rem;
  max-width: 100%;
  overflow: auto; /* both axes */
}

.matrix-corner {
  color: var(--dracula-comment);
  font-size: 0.85rem;
  align-self: end;
}

.matrix-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--surface-border);
  position: sticky;
  top: 0;
  background: var(--surface-primary);
}

.header-chip {
  width: 36px;
  height: 12px;
  border-radius: 999px;
}

.header-label {
  color: var(--dracula-foreground);
  font-weight: 600;
  font-size: 0.95rem;
}

.header-hex {
  color: var(--dracula-comment);
  font-size: 0.8rem;
  font-family: var(--font-family-mono);
}

.matrix-row-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--dracula-foreground);
  padding-right: 0.5rem;
  position: sticky;
  left: 0;
  background: var(--surface-primary);
}

.row-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.label {
  font-weight: 600;
}

.hex {
  font-size: 0.8rem;
  color: var(--dracula-comment);
  font-family: var(--font-family-mono);
}

.swatch {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid var(--surface-border);
}

.matrix-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 10px;
  background: var(--surface-secondary);
  border: 1px solid var(--surface-border);
  overflow: hidden;
}

.cell-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  position: relative;
  z-index: 1;
}

.preview-sample {
  font-size: 1rem;
  font-weight: 600;
}

.preview-sample.large {
  font-size: 1.4rem;
}

.cell-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  z-index: 1;
}

.ratio-badge {
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.82rem;
  background: var(--surface-primary);
  color: var(--dracula-foreground);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ratio-badge.fail {
  background: rgba(255, 85, 85, 0.15);
  color: var(--dracula-red);
}

.ratio-badge.AA {
  background: rgba(241, 250, 140, 0.18);
  color: var(--dracula-yellow);
}

.ratio-badge.AAA {
  background: rgba(80, 250, 123, 0.18);
  color: var(--dracula-green);
}

.wcag-tag {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--dracula-comment);
}

.heatmap-overlay {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: 10px;
  pointer-events: none;
}

.legend {
  color: var(--dracula-comment);
  font-size: 0.85rem;
  margin-top: 1rem;
}

@media (max-width: 900px) {
  .matrix-grid {
    overflow-x: auto;
    padding-bottom: 1rem;
  }

  .matrix-grid::after {
    content: '';
    flex: 0 0 1rem;
  }
}
</style>
