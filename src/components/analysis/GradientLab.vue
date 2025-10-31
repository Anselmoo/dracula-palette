<template>
  <section class="gradient-lab">
    <h3 class="t">
      <Icon name="gradients" />
      <span>Gradients</span>
    </h3>
    <div class="controls">
      <label>
        <span class="lbl">Mode</span>
        <select v-model="mode">
          <option value="mixed">Mixed (use palette)</option>
          <option value="mono">Monochromatic (auto steps)</option>
        </select>
      </label>
      <label>
        <span class="lbl">Type</span>
        <select v-model="kind">
          <option value="linear">Linear</option>
          <option value="radial">Radial</option>
          <option value="conic">Conic</option>
          <option value="steps">Stepped</option>
        </select>
      </label>
      <label v-if="kind === 'linear' || kind === 'conic'">
        <span class="lbl">Angle</span>
        <input type="range" min="0" max="360" v-model.number="angle" />
        <span class="lbl small">{{ angle }}°</span>
      </label>
      <label v-if="kind === 'steps'">
        <span class="lbl">Steps</span>
        <input type="range" min="2" max="10" v-model.number="steps" />
        <span class="lbl small">{{ steps }}</span>
      </label>
      <label>
        <span class="lbl">Demo</span>
        <select v-model="overlayMode">
          <option value="auto">Auto</option>
          <option value="none">None</option>
          <option value="bubbles">Bubbles</option>
          <option value="squares">Squares</option>
          <option value="stripes">Stripes</option>
        </select>
      </label>
    </div>
    <div class="row">
      <div class="preview" :style="{ background: mainGradient }" aria-label="Gradient preview" />
    </div>
    <div class="posters">
      <div class="poster" :style="{ background: linearHor }">
        <div class="legend">Linear</div>
        <div class="demo-overlay" :class="overlayClassFor('linear')" aria-hidden="true" />
      </div>
      <div class="poster" :style="{ background: radial }">
        <div class="legend">Radial</div>
        <div class="demo-overlay" :class="overlayClassFor('radial')" aria-hidden="true" />
      </div>
      <div class="poster" :style="{ background: conic }">
        <div class="legend">Conic</div>
        <div class="demo-overlay" :class="overlayClassFor('conic')" aria-hidden="true" />
      </div>
      <div class="poster" :style="{ background: stepsBg }">
        <div class="legend">Stepped</div>
        <div class="demo-overlay" :class="overlayClassFor('steps')" aria-hidden="true" />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import Icon from '../Icon.vue';
import { useTheme } from '../../composables/useTheme';
const props = defineProps<{ palette: { hex: string; name?: string }[] }>();
const { currentColors } = useTheme();

const mode = ref<'mixed' | 'mono'>('mixed');
const kind = ref<'linear' | 'radial' | 'conic' | 'steps'>('linear');
const angle = ref(90);
const steps = ref(5);
const overlayMode = ref<'auto' | 'none' | 'bubbles' | 'squares' | 'stripes'>('auto');

const effectivePalette = computed(() => {
  if (props.palette?.length) return props.palette.map(c => c.hex);
  return currentColors.value.map(c => c.hex);
});

const swatches = computed(() => {
  const colors = effectivePalette.value;
  if (mode.value === 'mixed') return colors.slice(0, 5);
  // Mono: just repeat the first color
  const base = colors[0] ?? '#6f6dfa';
  return Array(5).fill(base);
});

const linearHor = computed(
  () => `linear-gradient(${angle.value}deg, ${swatches.value.join(', ')})`
);
const radial = computed(() => `radial-gradient(circle at 30% 50%, ${swatches.value.join(', ')})`);
const conic = computed(
  () => `conic-gradient(from ${angle.value}deg, ${swatches.value.join(', ')})`
);
const stepsBg = computed(() => {
  const colors = swatches.value.length ? swatches.value : ['#6e56cf', '#6f6dfa'];
  const count = Math.max(2, Math.min(steps.value, 20));
  const use = colors.slice(0, count);
  const pct = 100 / use.length;
  const parts: string[] = [];
  use.forEach((c, i) => {
    const start = Math.round(i * pct);
    const end = Math.round((i + 1) * pct);
    parts.push(`${c} ${start}% ${end}%`);
  });
  return `linear-gradient(90deg, ${parts.join(', ')})`;
});
const mainGradient = computed(() => {
  if (kind.value === 'radial') return radial.value;
  if (kind.value === 'conic') return conic.value;
  if (kind.value === 'steps') return stepsBg.value;
  return linearHor.value;
});

type Kind = 'linear' | 'radial' | 'conic' | 'steps';
function overlayClassFor(k: Kind) {
  let choice: 'none' | 'bubbles' | 'squares' | 'stripes' = 'none';
  if (overlayMode.value === 'auto') {
    if (k === 'radial') choice = 'bubbles';
    else if (k === 'linear' || k === 'steps') choice = 'stripes';
    else if (k === 'conic') choice = 'squares';
  } else if (overlayMode.value === 'none') choice = 'none';
  else choice = overlayMode.value;
  return `overlay-${choice}`;
}
</script>
<style scoped lang="scss">
@use '@/assets/styles/analysis-mixins' as mixins;

.gradient-lab {
  margin-top: 0.5rem;
}
.t {
  margin: 0 0 0.5rem;
  color: var(--dracula-foreground);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.controls {
  margin-bottom: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;

  select {
    @include mixins.analysis-select;
  }

  input[type='range'] {
    @include mixins.analysis-range;
  }
}
.lbl {
  margin-right: 0.5rem;
  color: var(--dracula-comment);
}
.lbl.small {
  margin-left: 0.25rem;
  opacity: 0.8;
  font-size: 0.85rem;
}
.row {
  margin-bottom: 1rem;
}
.preview {
  height: 56px;
  border-radius: 12px;
  border: 1px solid var(--surface-border);
}
.posters {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}
.poster {
  position: relative;
  height: 120px;
  border-radius: 12px;
  border: 1px solid var(--surface-border);
  overflow: hidden;
}
.legend {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  background: color-mix(in oklab, var(--surface-primary) 70%, transparent);
  backdrop-filter: blur(4px);
  border: 1px solid var(--surface-border);
  border-radius: 999px;
  padding: 0.15rem 0.5rem;
  font-size: 0.8rem;
}
/* Demo overlays */
.demo-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.7;
}
.overlay-none {
  display: none;
}
.overlay-bubbles {
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.14) 0 10px, transparent 11px),
    radial-gradient(circle at 70% 60%, rgba(0, 0, 0, 0.12) 0 8px, transparent 9px),
    radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.1) 0 6px, transparent 7px),
    radial-gradient(circle at 80% 25%, rgba(0, 0, 0, 0.1) 0 12px, transparent 13px);
  background-repeat: no-repeat;
}
.overlay-squares {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.08) 1px, transparent 1px);
  background-size:
    16px 16px,
    16px 16px;
  mix-blend-mode: multiply;
}
.overlay-stripes {
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.12) 0 8px,
    transparent 8px 16px
  );
}
@media (max-width: 900px) {
  .posters {
    grid-template-columns: 1fr;
  }
}
</style>
