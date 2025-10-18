<template>
  <section class="cycle-map">
    <h3 class="cycle-map__heading"><Icon name="relations" :size="16" /> Color Relationship Map</h3>
    <p class="cycle-map__description">
      Interactive hue-sorted color wheel. Click segments to select, hover for details.
    </p>
    <div class="cycle-map__controls">
      <label>
        <input type="checkbox" v-model="triangle" />
        Show triangle
      </label>
      <label>
        Pattern
        <select v-model="pattern">
          <option value="triad">Triad (even thirds)</option>
          <option value="triple">User triple (0, 33%, 66%)</option>
        </select>
      </label>
      <label>
        <input type="checkbox" v-model="autoRotate" />
        Auto-rotate
      </label>
      <label v-if="selectedSegment !== null">
        Selected:
        <span class="selected-color">{{
          ordered[selectedSegment]?.name || ordered[selectedSegment]?.hex
        }}</span>
      </label>
    </div>
    <div class="cycle-map__visualization" :title="'Hue-sorted ring; click or hover for details'">
      <svg
        :width="size"
        :height="size"
        viewBox="0 0 200 200"
        role="img"
        aria-label="Hue cycle map"
        class="cycle-map__svg"
        :class="{ 'is-rotating': autoRotate }"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="centerGradient">
            <stop offset="0%" :stop-color="centerColor" stop-opacity="0.2" />
            <stop offset="100%" :stop-color="centerColor" stop-opacity="0" />
          </radialGradient>
        </defs>
        <g transform="translate(100,100)">
          <!-- Animated center circle -->
          <circle r="60" fill="url(#centerGradient)" class="center-circle" />

          <!-- Color segments -->
          <template v-for="(c, i) in ordered" :key="c.hex">
            <path
              :d="arcPath(i)"
              :fill="c.hex"
              class="cycle-map__segment"
              :class="{
                'is-selected': selectedSegment === i,
                'is-hovered': hoveredSegment === i,
              }"
              @click="selectSegment(i)"
              @mouseenter="hoveredSegment = i"
              @mouseleave="hoveredSegment = null"
              :style="{ animationDelay: `${i * 50}ms` }"
            >
              <title>{{ c.name }} — {{ c.hex }}</title>
            </path>
          </template>

          <!-- Optional triangle mode overlay -->
          <g v-if="triangle && ordered.length >= 3" class="cycle-map__triangle">
            <polyline
              :points="trianglePoints"
              fill="none"
              :stroke="triangleStrokeColor"
              stroke-width="2"
              stroke-linejoin="round"
              class="triangle-line"
            />
            <!-- Triangle vertices -->
            <circle
              v-for="(pt, idx) in triangleVertices"
              :key="`vertex-${idx}`"
              :cx="pt.x"
              :cy="pt.y"
              r="4"
              :fill="triangleStrokeColor"
              class="triangle-vertex"
            />
          </g>

          <!-- Center label -->
          <text v-if="selectedSegment !== null" class="center-text" text-anchor="middle" dy="0.3em">
            {{ ordered.length }}
          </text>
        </g>
      </svg>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import Icon from '../Icon.vue';

const props = defineProps<{ palette: { hex: string; name: string }[] }>();
const size = 220;
const triangle = ref(true);
const pattern = ref<'triad' | 'triple'>('triad');
const autoRotate = ref(false);
const selectedSegment = ref<number | null>(null);
const hoveredSegment = ref<number | null>(null);

// Auto-rotation interval
let rotationInterval: number | null = null;

watch(autoRotate, enabled => {
  if (enabled) {
    rotationInterval = window.setInterval(() => {
      if (selectedSegment.value === null) {
        selectedSegment.value = 0;
      } else {
        selectedSegment.value = (selectedSegment.value + 1) % ordered.value.length;
      }
    }, 2000);
  } else {
    if (rotationInterval !== null) {
      clearInterval(rotationInterval);
      rotationInterval = null;
    }
  }
});

onBeforeUnmount(() => {
  if (rotationInterval !== null) {
    clearInterval(rotationInterval);
  }
});

function selectSegment(index: number) {
  selectedSegment.value = selectedSegment.value === index ? null : index;
  if (selectedSegment.value !== null) {
    autoRotate.value = false;
  }
}

const centerColor = computed(() => {
  if (selectedSegment.value !== null && ordered.value[selectedSegment.value]) {
    return ordered.value[selectedSegment.value].hex;
  }
  return 'var(--dracula-purple)';
});

const triangleStrokeColor = computed(() => {
  return hoveredSegment.value !== null ? 'var(--dracula-cyan)' : 'var(--dracula-foreground)';
});

function hexToHsl(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

const ordered = computed(() => {
  const unique = new Map<string, { hex: string; name: string }>();
  props.palette.forEach(p => {
    unique.set(p.hex.toLowerCase(), p);
  });
  return Array.from(unique.values()).sort((a, b) => hexToHsl(a.hex).h - hexToHsl(b.hex).h);
});

function arcPath(i: number) {
  const rOuter = 90,
    rInner = 60;
  const n = ordered.value.length || 1;
  const a0 = (2 * Math.PI * i) / n;
  const a1 = (2 * Math.PI * (i + 1)) / n;
  const p = (r: number, a: number) => [r * Math.cos(a), r * Math.sin(a)];
  const [x0, y0] = p(rOuter, a0);
  const [x1, y1] = p(rOuter, a1);
  const [x2, y2] = p(rInner, a1);
  const [x3, y3] = p(rInner, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${x0} ${y0} A ${rOuter} ${rOuter} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${rInner} ${rInner} 0 ${large} 0 ${x3} ${y3} Z`;
}

// Calculate triangle vertex indices to approximate 120° spacing (even thirds)
// Related to issue: https://github.com/Anselmoo/dracula-palette/issues/124
// Using Math.round instead of Math.floor for better approximation when n is not divisible by 3
const trianglePoints = computed(() => {
  const n = ordered.value.length;
  if (n < 3) return '';
  const idxA = 0;
  const idxB = pattern.value === 'triad' ? Math.round(n / 3) : Math.round(n * 0.33);
  const idxC = pattern.value === 'triad' ? Math.round((2 * n) / 3) : Math.round(n * 0.66);
  const r = 70;
  const angle = (i: number) => (2 * Math.PI * i) / n;
  const p = (i: number) => `${r * Math.cos(angle(i))},${r * Math.sin(angle(i))}`;
  return `${p(idxA)} ${p(idxB)} ${p(idxC)} ${p(idxA)}`;
});

const triangleVertices = computed(() => {
  const n = ordered.value.length;
  if (n < 3) return [];
  const idxA = 0;
  const idxB = pattern.value === 'triad' ? Math.round(n / 3) : Math.round(n * 0.33);
  const idxC = pattern.value === 'triad' ? Math.round((2 * n) / 3) : Math.round(n * 0.66);
  const r = 70;
  const angle = (i: number) => (2 * Math.PI * i) / n;
  return [idxA, idxB, idxC].map(idx => ({
    x: r * Math.cos(angle(idx)),
    y: r * Math.sin(angle(idx)),
  }));
});
</script>
<style scoped lang="scss">
@use '@/assets/styles/analysis-mixins' as mixins;

.cycle-map {
  @include mixins.analysis-panel;
  @include mixins.analysis-animation-fade-in;
  margin-top: var(--spacing-sm);
}

.cycle-map__heading {
  @include mixins.analysis-heading;
}

.cycle-map__description {
  @include mixins.analysis-description;
}

.cycle-map__controls {
  @include mixins.analysis-controls;

  .selected-color {
    font-weight: 600;
    color: var(--dracula-cyan);
    font-family: var(--font-family-mono);
    font-size: 0.85rem;
  }
}

.cycle-map__visualization {
  @include mixins.analysis-svg-container;
  position: relative;
}

.cycle-map__svg {
  filter: drop-shadow(0 4px 8px var(--surface-shadow));
  transition: filter var(--transition-normal);

  &.is-rotating {
    animation: gentle-pulse 4s ease-in-out infinite;
  }

  &:hover {
    filter: drop-shadow(0 6px 12px var(--surface-shadow));
  }
}

.center-circle {
  animation: pulse-glow 3s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

.cycle-map__segment {
  cursor: pointer;
  transition: all var(--transition-normal);
  transform-origin: center;
  animation: segment-fade-in 0.6s ease-out backwards;

  &:hover {
    opacity: 0.9;
    filter: brightness(1.1) drop-shadow(0 0 8px currentColor);
  }

  &.is-selected {
    filter: brightness(1.2) drop-shadow(0 0 12px currentColor);
    opacity: 1;
    animation: segment-selected 0.5s ease-out;
  }

  &.is-hovered {
    transform: scale(1.05);
    filter: brightness(1.15);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;

    &:hover,
    &.is-selected,
    &.is-hovered {
      animation: none;
      transform: none;
    }
  }
}

.cycle-map__triangle {
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.3));
  animation: triangle-fade-in 0.8s ease-out 0.3s backwards;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

.triangle-line {
  stroke-dasharray: 300;
  stroke-dashoffset: 300;
  animation: draw-triangle 1.5s ease-out 0.5s forwards;
  transition: stroke var(--transition-normal);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    stroke-dashoffset: 0;
  }
}

.triangle-vertex {
  animation: vertex-appear 0.4s ease-out backwards;
  transition: all var(--transition-fast);

  &:nth-child(1) {
    animation-delay: 1.8s;
  }

  &:nth-child(2) {
    animation-delay: 1.9s;
  }

  &:nth-child(3) {
    animation-delay: 2s;
  }

  &:hover {
    r: 6;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

.center-text {
  font-size: 24px;
  font-weight: bold;
  fill: var(--dracula-foreground);
  opacity: 0.6;
  animation: text-pulse 2s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

// Keyframe Animations
@keyframes segment-fade-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes segment-selected {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1.05);
  }
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes gentle-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

@keyframes triangle-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes draw-triangle {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes vertex-appear {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes text-pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
