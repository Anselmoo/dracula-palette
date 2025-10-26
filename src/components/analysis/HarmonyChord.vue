<template>
  <div class="chord-wrap">
    <svg
      ref="svgRef"
      class="chord"
      :viewBox="`0 0 ${size} ${size}`"
      role="img"
      aria-label="Color harmony chord diagram"
    ></svg>
  </div>
  <p v-if="!palette.length" class="empty">No colors available</p>
  <p v-else class="hint">
    How to read: Each outer arc is a palette color positioned by hue. Ribbons connect hue pairs with
    strong harmony relationships; thicker/darker ribbons indicate stronger matches, and the fill
    blends source→target colors.
  </p>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed, onBeforeUnmount } from 'vue';
import { chord as d3Chord, ribbon as d3Ribbon } from 'd3-chord';
import { arc as d3Arc } from 'd3-shape';
import { select } from 'd3-selection';

const props = defineProps<{ palette: { hex: string; name?: string }[] }>();

const size = 540; // square viewBox; responsive through viewBox + CSS
const innerRadius = Math.min(size, size) * 0.36;
const outerRadius = innerRadius + 26;
const svgRef = ref<SVGSVGElement | null>(null);

function hexToHsl(hex: string) {
  const m = hex.replace('#', '');
  const r = parseInt(m.substring(0, 2), 16) / 255;
  const g = parseInt(m.substring(2, 4), 16) / 255;
  const b = parseInt(m.substring(4, 6), 16) / 255;
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
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
}

function harmonyScore(h1: number, h2: number) {
  const diff = Math.abs(h1 - h2);
  const d = Math.min(diff, 360 - diff);
  if (d > 170 && d < 190) return 55; // complementary
  if (d > 110 && d < 130) return 40; // triadic
  if (d < 30) return 28; // analogous
  if (d > 80 && d < 100) return 24; // split comp
  return Math.max(6, 36 - d / 7);
}

const names = computed(() => props.palette.map(p => p.name || p.hex).reverse());
const colors = computed(() => props.palette.map(p => p.hex).reverse());
const hues = computed(() => props.palette.map(p => hexToHsl(p.hex).h).reverse());

function buildMatrix(): number[][] {
  const n = props.palette.length;
  const M: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      M[i][j] = Math.round(harmonyScore(hues.value[i], hues.value[j]));
    }
  }
  return M;
}

let cleanup: (() => void) | null = null;

function render() {
  const svg = svgRef.value ? select(svgRef.value) : null;
  if (!svg || !props.palette.length) return;
  svg.selectAll('*').remove();
  const g = svg.append('g').attr('transform', `translate(${size / 2},${size / 2})`);

  const chord = d3Chord()
    .padAngle(0.05)
    .sortSubgroups((a: number, b: number) => b - a);
  const arcBase = d3Arc().innerRadius(innerRadius).outerRadius(outerRadius);
  // small wrappers to keep types narrow and avoid any
  const arcPath = (d: unknown) => (arcBase as unknown as (_arg: unknown) => string)(d);
  const ribbonBase = d3Ribbon().radius(innerRadius);
  const ribbonPath = (d: unknown) => (ribbonBase as unknown as (_arg: unknown) => string)(d);

  const matrix = buildMatrix();
  const chords = chord(matrix);

  // Theme-aware stroke color from CSS variable
  const foreground =
    window
      .getComputedStyle(document.documentElement)
      .getPropertyValue('--dracula-foreground')
      .trim() || '#aab';

  // Create gradients for ribbons (userSpaceOnUse so it follows the geometry)
  const defs = svg.append('defs');
  g.selectAll('dummy')
    .data(chords)
    .enter()
    .each((_d, i) => {
      const gid = `chgrad-${i}`;
      const c = chords[i] as unknown as { source: { index: number }; target: { index: number } };
      const grad = defs
        .append('linearGradient')
        .attr('id', gid)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', size / 2)
        .attr('y2', size / 2);
      grad
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colors.value[c.source.index])
        .attr('stop-opacity', 0.9);
      grad
        .append('stop')
        .attr('offset', '50%')
        .attr('stop-color', colors.value[c.target.index])
        .attr('stop-opacity', 0.95);
      grad
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colors.value[c.target.index])
        .attr('stop-opacity', 0.9);
    });

  // Groups (outer arcs)
  const groups = g
    .selectAll('g.group')
    .data(chords.groups)
    .enter()
    .append('g')
    .attr('class', 'group');

  groups
    .append('path')
    .attr('class', d => `group-arc ga-${(d as unknown as { index: number }).index}`)
    .attr('d', arcPath)
    .attr('fill', (_d, i: number) => colors.value[i])
    .attr('stroke', foreground)
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 1.2);

  groups
    .append('title')
    .text(
      d =>
        `${names.value[(d as unknown as { index: number }).index]} — total: ${(d as unknown as { value: number }).value}`
    );

  // Ribbons (connections)
  g.append('g')
    .attr('fill-opacity', 0.8)
    .attr('stroke', foreground)
    .attr('stroke-opacity', 0.4)
    .selectAll('path')
    .data(chords)
    .enter()
    .append('path')
    .attr('class', 'ribbon')
    .attr('d', ribbonPath)
    .attr('stroke-width', d => {
      const v = (d as unknown as { source: { value: number } }).source.value;
      // Map score [~6..55] -> stroke width [0.6..2.4]
      const t = Math.max(6, Math.min(55, v));
      return 0.6 + ((t - 6) / 49) * 1.8;
    })
    .attr('fill', (_d, i) => `url(#chgrad-${i})`)
    .style('opacity', d => {
      const v = (d as unknown as { source: { value: number } }).source.value;
      // normalize roughly into [0.35..1]
      return Math.max(0.35, Math.min(1, v / 55));
    })
    .on('mouseover', (_evt, d) => {
      const c = d as unknown as {
        source: { index: number; value: number };
        target: { index: number };
      };
      // Dim all ribbons except hovered
      g.selectAll('path.ribbon').style('opacity', 0.15);
      g.selectAll('path.ribbon')
        .filter(x => x === d)
        .style('opacity', 1);
      // Emphasize source/target group arcs
      g.selectAll('path.group-arc').style('stroke-opacity', 0.15).style('stroke-width', 1.0);
      g.selectAll(`.ga-${c.source.index}, .ga-${c.target.index}`)
        .style('stroke-opacity', 0.95)
        .style('stroke-width', 2.0);
    })
    .on('mouseout', () => {
      // Restore ribbons and arcs
      g.selectAll('path.ribbon').style('opacity', null);
      g.selectAll('path.group-arc').style('stroke-opacity', 0.4).style('stroke-width', 1.2);
    })
    .append('title')
    .text(d => {
      const c = d as unknown as {
        source: { index: number; value: number };
        target: { index: number };
      };
      return `${names.value[c.source.index]} ↔ ${names.value[c.target.index]} — ${c.source.value}`;
    });

  cleanup = () => {
    svg.selectAll('*').remove();
  };
}

onMounted(render);
watch(() => props.palette, render, { deep: true });
onBeforeUnmount(() => cleanup?.());
</script>

<style scoped>
.chord-wrap {
  display: grid;
  place-items: center;
  width: 100%;
}
.chord {
  width: 100%;
  max-width: 560px;
  height: auto;
}
.empty {
  color: var(--dracula-comment);
}
.hint {
  color: var(--dracula-comment);
  font-size: 0.85rem;
  margin-top: 0.25rem;
}
.ribbon {
  transition: opacity 0.15s ease-in-out;
}
.group-arc {
  transition:
    stroke-width 0.15s ease-in-out,
    stroke-opacity 0.15s ease-in-out;
}
</style>
