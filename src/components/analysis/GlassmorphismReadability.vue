<template>
  <section class="glass">
    <h3 class="t"><Icon name="glass" /><span>Glassmorphism Readability</span></h3>
    <div class="controls">
      <label
        >Backdrop opacity
        <input type="range" v-model.number="opacity" min="0.1" max="0.9" step="0.05"
      /></label>
      <label
        >Blur (px) <input type="range" v-model.number="blur" min="0" max="20" step="1"
      /></label>
    </div>
    <div class="grid" v-if="palette.length >= 2">
      <div v-for="(bg, i) in palette.slice(0, 8)" :key="i" class="card">
        <h4>{{ bg.name || bg.hex }}</h4>
        <div class="back" :style="{ background: bg.hex }">
          <div class="pane" :style="paneStyle">
            <div v-for="(fg, j) in palette.slice(0, 6)" :key="j" class="row">
              <span class="dot" :style="{ background: fg.hex }"></span>
              <span class="text" :style="{ color: fg.hex }">Sample text</span>
              <span class="ratio">{{ ratio(fg.hex, effectiveBg(bg.hex)).toFixed(2) }}:1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="empty">Need at least two colors.</p>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { contrastRatio } from '../../utils/contrast';
import Icon from '../Icon.vue';

type Entry = { hex: string; name?: string };
const props = defineProps<{ palette: Entry[] }>();

const opacity = ref(0.4);
const blur = ref(8);
const palette = computed(() => props.palette ?? []);

function blendOver(bg: string, overlay: string, alpha: number) {
  const toRGB = (h: string) => ({
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16),
  });
  const B = toRGB(bg);
  const O = toRGB(overlay);
  const r = Math.round((1 - alpha) * B.r + alpha * O.r);
  const g = Math.round((1 - alpha) * B.g + alpha * O.g);
  const b = Math.round((1 - alpha) * B.b + alpha * O.b);
  const to = (v: number) => ('0' + v.toString(16)).slice(-2);
  return `#${to(r)}${to(g)}${to(b)}`;
}

function effectiveBg(bg: string) {
  // Frosted pane assumed near-white overlay
  return blendOver(bg, '#ffffff', opacity.value);
}

function ratio(fg: string, bg: string) {
  return contrastRatio(fg, bg);
}

const paneStyle = computed(() => ({
  backdropFilter: `blur(${blur.value}px)`,
  background: `rgba(255,255,255,${opacity.value})`,
}));
</script>
<style scoped lang="scss">
@use '@/assets/styles/analysis-mixins' as mixins;

.t {
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.75rem;

  input[type='range'] {
    @include mixins.analysis-range;
  }
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  max-height: 380px;
  overflow: auto;
  padding-right: 0.25rem;
}
.card {
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  padding: 0.75rem;
}
.back {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--surface-border);
}
.pane {
  padding: 0.5rem;
}
.row {
  display: grid;
  grid-template-columns: 20px 1fr auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}
.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid var(--surface-border);
}
.ratio {
  font-variant-numeric: tabular-nums;
  opacity: 0.9;
}
.empty {
  color: var(--dracula-comment);
}
@media (max-width: 920px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
