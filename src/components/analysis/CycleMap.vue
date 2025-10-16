<template>
  <section class="cycle-map">
    <h3 class="cycle-map__heading"><Icon name="relations" :size="16" /> Color Relationship Map</h3>
    <p class="cycle-map__description">
      Chord diagram showing color relationships. Hover over colors or connections to explore harmony and contrast.
    </p>
    <div class="cycle-map__controls">
      <label>
        Relationship Type
        <select v-model="relationshipType">
          <option value="harmony">Harmony (hue proximity)</option>
          <option value="contrast">Contrast (luminance difference)</option>
          <option value="complement">Complementary</option>
        </select>
      </label>
      <label>
        <input type="checkbox" v-model="showLabels" />
        Show labels
      </label>
      <label v-if="selectedNode !== null">
        Selected:
        <span class="selected-color">{{
          ordered[selectedNode]?.name || ordered[selectedNode]?.hex
        }}</span>
      </label>
    </div>
    <div class="cycle-map__visualization" :title="'Chord diagram showing color relationships'">
      <svg
        :width="size"
        :height="size"
        viewBox="0 0 240 240"
        role="img"
        aria-label="Color relationship chord diagram"
        class="cycle-map__svg"
      >
        <defs>
          <filter id="chord-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="bgGradient">
            <stop offset="0%" stop-color="var(--analysis-card-bg)" stop-opacity="0.3" />
            <stop offset="100%" stop-color="var(--analysis-card-bg)" stop-opacity="0" />
          </radialGradient>
        </defs>
        <g transform="translate(120,120)">
          <!-- Background circle -->
          <circle r="100" fill="url(#bgGradient)" class="bg-circle" />

          <!-- Relationship chords -->
          <g class="chords-group">
            <template v-for="(chord, idx) in relationshipChords" :key="`chord-${idx}`">
              <path
                :d="chordPath(chord)"
                :stroke="chord.color"
                :stroke-opacity="getChordOpacity(chord)"
                fill="none"
                stroke-width="2"
                class="chord"
                :class="{
                  'is-highlighted': isChordHighlighted(chord),
                  'is-dimmed': shouldDimChord(chord),
                }"
                @mouseenter="hoveredChord = chord"
                @mouseleave="hoveredChord = null"
              >
                <title>{{ chord.source.name }} ↔ {{ chord.target.name }}: {{ chord.label }}</title>
              </path>
            </template>
          </g>

          <!-- Color nodes -->
          <g class="nodes-group">
            <template v-for="(c, i) in ordered" :key="c.hex">
              <circle
                :cx="nodePosition(i).x"
                :cy="nodePosition(i).y"
                :r="nodeRadius"
                :fill="c.hex"
                class="color-node"
                :class="{
                  'is-selected': selectedNode === i,
                  'is-hovered': hoveredNode === i,
                  'is-connected': isNodeConnected(i),
                }"
                @click="selectNode(i)"
                @mouseenter="hoveredNode = i"
                @mouseleave="hoveredNode = null"
              >
                <title>{{ c.name }} — {{ c.hex }}</title>
              </circle>
              <!-- Labels -->
              <text
                v-if="showLabels"
                :x="labelPosition(i).x"
                :y="labelPosition(i).y"
                class="node-label"
                :class="{ 'is-active': selectedNode === i || hoveredNode === i }"
                :text-anchor="getLabelAnchor(i)"
                :dy="getLabelDy(i)"
              >
                {{ c.name }}
              </text>
            </template>
          </g>

          <!-- Center info -->
          <text v-if="hoveredChord" class="center-text" text-anchor="middle" dy="-0.3em">
            {{ hoveredChord.label }}
          </text>
          <text v-else-if="selectedNode === null" class="center-text" text-anchor="middle" dy="0.3em">
            {{ ordered.length }} colors
          </text>
        </g>
      </svg>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import Icon from '../Icon.vue';
import { relativeLuminance } from '@/utils/contrast';

interface ColorNode {
  hex: string;
  name: string;
  hue: number;
  luminance: number;
}

interface Chord {
  source: ColorNode;
  target: ColorNode;
  sourceIndex: number;
  targetIndex: number;
  strength: number;
  label: string;
  color: string;
}

const props = defineProps<{ palette: { hex: string; name: string }[] }>();
const size = 240;
const nodeRadius = 12;
const relationshipType = ref<'harmony' | 'contrast' | 'complement'>('harmony');
const showLabels = ref(true);
const selectedNode = ref<number | null>(null);
const hoveredNode = ref<number | null>(null);
const hoveredChord = ref<Chord | null>(null);

function selectNode(index: number) {
  selectedNode.value = selectedNode.value === index ? null : index;
}

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

const ordered = computed((): ColorNode[] => {
  const unique = new Map<string, { hex: string; name: string }>();
  props.palette.forEach(p => {
    unique.set(p.hex.toLowerCase(), p);
  });
  return Array.from(unique.values())
    .map(c => ({
      hex: c.hex,
      name: c.name,
      hue: hexToHsl(c.hex).h,
      luminance: relativeLuminance(c.hex),
    }))
    .sort((a, b) => a.hue - b.hue);
});

function nodePosition(index: number): { x: number; y: number } {
  const radius = 85;
  const n = ordered.value.length || 1;
  const angle = (2 * Math.PI * index) / n - Math.PI / 2; // Start at top
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  };
}

function labelPosition(index: number): { x: number; y: number } {
  const radius = 105;
  const n = ordered.value.length || 1;
  const angle = (2 * Math.PI * index) / n - Math.PI / 2;
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  };
}

function getLabelAnchor(index: number): string {
  const n = ordered.value.length || 1;
  const angle = (2 * Math.PI * index) / n - Math.PI / 2;
  const normalizedAngle = ((angle + Math.PI * 2) % (Math.PI * 2));
  
  // Left side
  if (normalizedAngle > Math.PI / 2 && normalizedAngle < (3 * Math.PI) / 2) {
    return 'end';
  }
  // Right side
  if (normalizedAngle < Math.PI / 2 || normalizedAngle > (3 * Math.PI) / 2) {
    return 'start';
  }
  // Top/bottom
  return 'middle';
}

function getLabelDy(index: number): string {
  const n = ordered.value.length || 1;
  const angle = (2 * Math.PI * index) / n - Math.PI / 2;
  const normalizedAngle = ((angle + Math.PI * 2) % (Math.PI * 2));
  
  // Top (near 3π/2 or 270°)
  if (normalizedAngle > (5 * Math.PI) / 4 && normalizedAngle < (7 * Math.PI) / 4) {
    return '1em';
  }
  // Bottom (near π/2 or 90°) 
  if (normalizedAngle > Math.PI / 4 && normalizedAngle < (3 * Math.PI) / 4) {
    return '-0.5em';
  }
  // Sides
  return '0.3em';
}

const relationshipChords = computed((): Chord[] => {
  const chords: Chord[] = [];
  const n = ordered.value.length;

  if (n < 2) return chords;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const source = ordered.value[i];
      const target = ordered.value[j];
      let strength = 0;
      let label = '';
      let shouldInclude = false;

      if (relationshipType.value === 'harmony') {
        // Harmony based on hue proximity
        const hueDiff = Math.abs(source.hue - target.hue);
        const minDiff = Math.min(hueDiff, 360 - hueDiff);
        if (minDiff < 60) {
          // Analogous colors
          strength = 1 - minDiff / 60;
          label = `Analogous (${Math.round(minDiff)}°)`;
          shouldInclude = true;
        }
      } else if (relationshipType.value === 'contrast') {
        // Contrast based on luminance difference
        const lumDiff = Math.abs(source.luminance - target.luminance);
        if (lumDiff > 0.3) {
          strength = Math.min(lumDiff / 0.7, 1);
          label = `Contrast (${(lumDiff * 100).toFixed(0)}%)`;
          shouldInclude = true;
        }
      } else if (relationshipType.value === 'complement') {
        // Complementary colors (opposite on hue wheel)
        const hueDiff = Math.abs(source.hue - target.hue);
        const minDiff = Math.min(hueDiff, 360 - hueDiff);
        if (minDiff > 150 && minDiff < 210) {
          strength = 1 - Math.abs(minDiff - 180) / 30;
          label = `Complementary (${Math.round(minDiff)}°)`;
          shouldInclude = true;
        }
      }

      if (shouldInclude) {
        // Mix colors for chord color
        const mixColor = blendColors(source.hex, target.hex);
        chords.push({
          source,
          target,
          sourceIndex: i,
          targetIndex: j,
          strength,
          label,
          color: mixColor,
        });
      }
    }
  }

  return chords;
});

function blendColors(hex1: string, hex2: string): string {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);

  const r = Math.round((r1 + r2) / 2);
  const g = Math.round((g1 + g2) / 2);
  const b = Math.round((b1 + b2) / 2);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function chordPath(chord: Chord): string {
  const sourcePos = nodePosition(chord.sourceIndex);
  const targetPos = nodePosition(chord.targetIndex);

  // Calculate control points for smooth bezier curve
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Control point distance from the center (creates the arc)
  const controlDist = distance * 0.3;

  // Midpoint
  const mx = (sourcePos.x + targetPos.x) / 2;
  const my = (sourcePos.y + targetPos.y) / 2;

  // Perpendicular direction for control point (towards center)
  const nx = -my / Math.sqrt(mx * mx + my * my) || 0;
  const ny = mx / Math.sqrt(mx * mx + my * my) || 0;

  const cx = mx + nx * controlDist;
  const cy = my + ny * controlDist;

  return `M ${sourcePos.x} ${sourcePos.y} Q ${cx} ${cy} ${targetPos.x} ${targetPos.y}`;
}

function getChordOpacity(chord: Chord): number {
  return 0.3 + chord.strength * 0.5;
}

function isChordHighlighted(chord: Chord): boolean {
  if (hoveredChord.value === chord) return true;
  if (selectedNode.value === chord.sourceIndex || selectedNode.value === chord.targetIndex)
    return true;
  if (hoveredNode.value === chord.sourceIndex || hoveredNode.value === chord.targetIndex) return true;
  return false;
}

function shouldDimChord(chord: Chord): boolean {
  if (selectedNode.value === null && hoveredNode.value === null && hoveredChord.value === null)
    return false;
  return !isChordHighlighted(chord);
}

function isNodeConnected(nodeIndex: number): boolean {
  if (selectedNode.value === null && hoveredNode.value === null) return false;
  return relationshipChords.value.some(
    chord => chord.sourceIndex === nodeIndex || chord.targetIndex === nodeIndex
  );
}
</script>
<style scoped lang="scss">
@import '@/assets/styles/analysis-mixins';

.cycle-map {
  @include analysis-panel;
  @include analysis-animation-fade-in;
  margin-top: var(--spacing-sm);
}

.cycle-map__heading {
  @include analysis-heading;
}

.cycle-map__description {
  @include analysis-description;
}

.cycle-map__controls {
  @include analysis-controls;

  .selected-color {
    font-weight: 600;
    color: var(--dracula-cyan);
    font-family: var(--font-family-mono);
    font-size: 0.85rem;
  }
}

.cycle-map__visualization {
  @include analysis-svg-container;
  position: relative;
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cycle-map__svg {
  filter: drop-shadow(0 4px 8px var(--surface-shadow));
  transition: filter var(--transition-normal);

  &:hover {
    filter: drop-shadow(0 6px 12px var(--surface-shadow));
  }
}

.bg-circle {
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

// Chord styling
.chords-group {
  .chord {
    cursor: pointer;
    transition: all var(--transition-normal);

    &.is-highlighted {
      stroke-width: 3;
      stroke-opacity: 0.9 !important;
      filter: drop-shadow(0 0 8px currentColor) url(#chord-glow);
    }

    &.is-dimmed {
      stroke-opacity: 0.1 !important;
      stroke-width: 1;
    }

    &:hover {
      stroke-width: 3;
      filter: drop-shadow(0 0 6px currentColor);
    }

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }
}

// Node styling
.nodes-group {
  .color-node {
    cursor: pointer;
    transition: all var(--transition-normal);
    stroke: var(--analysis-swatch-border);
    stroke-width: 2;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));

    &:hover {
      stroke-width: 3;
      filter: drop-shadow(0 0 12px currentColor) brightness(1.1);
      transform: scale(1.15);
      transform-origin: center;
    }

    &.is-selected {
      stroke-width: 4;
      stroke: var(--dracula-cyan);
      filter: drop-shadow(0 0 16px currentColor) brightness(1.15);
    }

    &.is-hovered {
      stroke-width: 3;
      stroke: var(--dracula-purple);
      transform: scale(1.2);
    }

    &.is-connected {
      filter: drop-shadow(0 0 8px currentColor);
    }

    @media (prefers-reduced-motion: reduce) {
      animation: none;

      &:hover,
      &.is-selected,
      &.is-hovered {
        animation: none;
        transform: scale(1.05);
      }
    }
  }

  .node-label {
    font-size: 10px;
    fill: var(--dracula-foreground);
    opacity: 0.7;
    pointer-events: none;
    transition: all var(--transition-fast);
    font-weight: 500;

    &.is-active {
      opacity: 1;
      font-weight: 700;
      fill: var(--dracula-cyan);
    }
  }
}

.center-text {
  font-size: 14px;
  font-weight: 600;
  fill: var(--dracula-foreground);
  opacity: 0.7;
  pointer-events: none;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

// Keyframe Animations - kept minimal for performance
@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
