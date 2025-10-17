<template>
  <section class="contrast-polygon" aria-label="Contrast polygon">
    <h3 class="contrast-polygon__heading"><Icon name="network" :size="16" /> Contrast Polygon</h3>
    <p class="contrast-polygon__description">
      Pairs colored by WCAG contrast ratios. Hover edges to inspect values.
    </p>

    <div class="contrast-polygon__controls">
      <label>
        <span class="label-text">Min ratio</span>
        <select v-model.number="minRatio" aria-label="Minimum contrast ratio">
          <option :value="0">All</option>
          <option :value="3">3.0 (AA Large)</option>
          <option :value="4.5">4.5 (AA)</option>
          <option :value="7">7.0 (AAA)</option>
        </select>
      </label>
      <label>
        <input type="checkbox" v-model="hideFail" />
        <span>Hide failing</span>
      </label>
      <button class="btn-reset" @click="resetFilters" type="button">Reset Filters</button>
    </div>

    <div ref="wrapperRef" class="contrast-polygon__visualization">
      <svg
        :width="size"
        :height="size"
        :viewBox="`0 0 ${size} ${size}`"
        role="img"
        aria-label="Interactive contrast polygon"
        class="contrast-polygon__svg"
      >
        <defs>
          <filter id="edge-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g :transform="`translate(${cx},${cy})`">
          <!-- Background ring -->
          <circle :r="radius" class="contrast-polygon__ring" />

          <!-- Edges (contrast connections) -->
          <g class="contrast-polygon__edges">
            <line
              v-for="e in filteredEdges"
              :key="e.k"
              :x1="e.x1"
              :y1="e.y1"
              :x2="e.x2"
              :y2="e.y2"
              :class="['edge', edgeClass(e.r), { hidden: hideFail && e.r < 3 }]"
              :stroke="edgeColor(e.r)"
              filter="url(#edge-glow)"
            >
              <title>{{ e.r.toFixed(2) }}:1</title>
            </line>
          </g>

          <!-- Color dots (vertices) -->
          <g
            v-for="(p, i) in animPoints"
            :key="'dot-' + i"
            class="contrast-polygon__dot"
            :transform="`translate(${p.x},${p.y})`"
          >
            <circle r="10" :fill="palette[i]?.hex || '#ccc'" class="dot-fill" />
            <circle r="10" class="dot-border" />
            <title>{{ palette[i]?.name || palette[i]?.hex }}</title>
          </g>
        </g>
      </svg>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { contrastRatio } from '../../utils/contrast';
import { useTheme } from '../../composables/useTheme';
import Icon from '../Icon.vue';

type Entry = { hex: string; name?: string };
const props = defineProps<{ palette: Entry[] }>();

// Get theme-aware colors
const { currentColors } = useTheme();

// Controls
const minRatio = ref<number>(0);
const hideFail = ref<boolean>(false);

// Responsive sizing via ResizeObserver
const wrapperRef = ref<HTMLElement | null>(null);
const size = ref(320);
const cx = computed(() => size.value / 2);
const cy = computed(() => size.value / 2);
const radius = computed(() => Math.max(60, size.value / 2 - 40));
let ro: ResizeObserver | null = null;

onMounted(() => {
  if (wrapperRef.value && 'ResizeObserver' in window) {
    ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      const s = Math.round(Math.min(cr.width, 520));
      if (s > 0) size.value = s; // clamp
    });
    ro.observe(wrapperRef.value);
  }
});
onBeforeUnmount(() => {
  if (ro && wrapperRef.value) ro.unobserve(wrapperRef.value);
});

// Geometry
const targetPoints = computed(() => {
  const n = Math.max(1, props.palette.length);
  return props.palette.map((_, i) => {
    const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: Math.cos(ang) * radius.value, y: Math.sin(ang) * radius.value };
  });
});

// Simple tween for point movement on palette/size change
const animPoints = ref<{ x: number; y: number }[]>([]);
let animRAF = 0;
function tweenToTargets(duration = 220) {
  const from = animPoints.value.length
    ? animPoints.value.map(p => ({ ...p }))
    : targetPoints.value.map(p => ({ ...p }));
  const to = targetPoints.value.map(p => ({ ...p }));
  const start = performance.now();
  cancelAnimationFrame(animRAF);
  const step = () => {
    const t = Math.min(1, (performance.now() - start) / duration);
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    animPoints.value = to.map((tp, i) => {
      const fp = from[i] || from[from.length - 1] || tp;
      return { x: fp.x + (tp.x - fp.x) * ease, y: fp.y + (tp.y - fp.y) * ease };
    });
    if (t < 1) animRAF = requestAnimationFrame(step);
  };
  animRAF = requestAnimationFrame(step);
}

watch([targetPoints, size], () => tweenToTargets(), { immediate: true });

// Edges + filtering
const edges = computed(() => {
  const pts = animPoints.value.length ? animPoints.value : targetPoints.value;
  const out: { k: string; x1: number; y1: number; x2: number; y2: number; r: number }[] = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const p = pts[i];
      const q = pts[j];
      const r = ratio(i, j);
      out.push({ k: `${i}-${j}`, x1: p.x, y1: p.y, x2: q.x, y2: q.y, r });
    }
  }
  return out;
});

const filteredEdges = computed(() => edges.value.filter(e => e.r >= (minRatio.value || 0)));

function ratio(i: number, j: number) {
  const a = props.palette[i]?.hex || '#000';
  const b = props.palette[j]?.hex || '#fff';
  return contrastRatio(a, b);
}

function edgeClass(r: number) {
  if (r >= 7) return 'edge-aaa';
  if (r >= 4.5) return 'edge-aa';
  if (r >= 3) return 'edge-aal';
  return 'edge-fail';
}

// Theme-aware colors for edge coloring
const themeColors = computed(() => ({
  green: currentColors.value.find(c => c.name === 'Green')?.hex ?? '#50fa7b',
  yellow: currentColors.value.find(c => c.name === 'Yellow')?.hex ?? '#f1fa8c',
  orange: currentColors.value.find(c => c.name === 'Orange')?.hex ?? '#ffb86c',
  red: currentColors.value.find(c => c.name === 'Red')?.hex ?? '#ff5555',
}));

function edgeColor(r: number) {
  if (r >= 7) return themeColors.value.green;
  if (r >= 4.5) return themeColors.value.yellow;
  if (r >= 3) return themeColors.value.orange;
  return themeColors.value.red;
}

function resetFilters() {
  minRatio.value = 0;
  hideFail.value = false;
}
</script>
<style scoped lang="scss">
@use '@/assets/styles/analysis-mixins' as mixins;

.contrast-polygon {
  @include mixins.analysis-panel;

  &__heading {
    @include mixins.analysis-heading;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__description {
    color: var(--dracula-comment);
    font-size: 0.9rem;
    margin: 0 0 1rem 0;
    line-height: 1.5;
  }

  &__controls {
    @include mixins.analysis-controls;
    margin-bottom: 1.5rem;

    .label-text {
      color: var(--dracula-foreground);
      font-size: 0.95rem;
      font-weight: 500;
    }

    select {
      padding: 0.4rem 0.8rem;
      font-size: 0.95rem;
      background: var(--analysis-input-bg);
      color: var(--dracula-foreground);
      border: 1px solid var(--surface-border);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: border-color 0.2s ease;

      &:hover {
        border-color: var(--dracula-purple);
      }

      &:focus {
        outline: 2px solid var(--dracula-purple);
        outline-offset: 2px;
      }
    }

    label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;

      input[type='checkbox'] {
        cursor: pointer;
        accent-color: var(--dracula-purple);
      }

      span:not(.label-text) {
        color: var(--dracula-foreground);
        font-size: 0.95rem;
      }
    }

    .btn-reset {
      padding: 0.4rem 0.8rem;
      font-size: 0.9rem;
      font-weight: 500;
      background: var(--dracula-purple);
      color: var(--dracula-background);
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition:
        background 0.2s ease,
        transform 0.1s ease;

      &:hover {
        background: var(--dracula-pink);
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  &__visualization {
    @include mixins.analysis-svg-container;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: var(--analysis-panel-bg);
    border-radius: var(--radius-md);

    @media (prefers-reduced-motion: no-preference) {
      .edge {
        transition:
          stroke-width 0.2s ease,
          opacity 0.2s ease;
      }

      .dot-fill {
        transition: transform 0.2s ease;
      }
    }
  }

  &__svg {
    display: block;
    max-width: 100%;
    height: auto;
  }

  &__ring {
    fill: none;
    stroke: var(--surface-border);
    stroke-width: 1.5;
    opacity: 0.25;
  }

  &__edges {
    .edge {
      stroke-width: 1.5;
      opacity: 0.6;
      cursor: pointer;

      &:hover {
        stroke-width: 3;
        opacity: 1;
      }

      &.hidden {
        display: none;
      }

      &.aaa {
        stroke-dasharray: none;
      }

      &.aa {
        stroke-dasharray: 4 2;
      }

      &.aa-large {
        stroke-dasharray: 2 2;
      }

      &.fail {
        stroke-dasharray: 1 3;
        opacity: 0.3;
      }
    }
  }

  &__dot {
    cursor: pointer;

    .dot-fill {
      filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
    }

    .dot-border {
      fill: none;
      stroke: var(--dracula-foreground);
      stroke-width: 2;
      opacity: 0.6;
    }

    &:hover .dot-fill {
      transform: scale(1.15);
    }

    &:hover .dot-border {
      opacity: 1;
      stroke-width: 2.5;
    }
  }

  // Animation keyframes
  @media (prefers-reduced-motion: no-preference) {
    &__edges .edge {
      animation: edge-draw 0.6s ease-out backwards;
      animation-delay: calc(var(--edge-index, 0) * 0.02s);
    }

    &__dot {
      animation: dot-appear 0.4s ease-out backwards;
      animation-delay: calc(var(--dot-index, 0) * 0.05s);
    }
  }

  @keyframes edge-draw {
    from {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      opacity: 0;
    }
    to {
      stroke-dashoffset: 0;
      opacity: 0.6;
    }
  }

  @keyframes dot-appear {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  // Responsive adjustments
  @include mixins.analysis-responsive;

  @media (max-width: 768px) {
    &__visualization {
      padding: 1rem;
      min-height: 300px;
    }

    &__controls {
      flex-direction: column;
      align-items: stretch;

      label {
        width: 100%;
      }

      .btn-reset {
        width: 100%;
      }
    }
  }
}
</style>
