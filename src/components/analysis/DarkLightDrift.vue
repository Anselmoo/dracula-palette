<template>
  <section class="drift">
    <h3 class="t"><Icon name="drift" /><span>Dark/Light Drift</span></h3>
    <p class="desc">
      Estimates how roles shift between dark and light themes using lightness ordering.
    </p>
    <div class="grid">
      <div class="card">
        <h4>Lightness distribution</h4>
        <div class="bars">
          <span
            v-for="(l, i) in lightnesses"
            :key="i"
            class="bar"
            :style="{ height: (l * 100).toFixed(0) + '%', background: palette[i]?.hex || '#888' }"
            :title="(l * 100).toFixed(0) + '% L'"
          ></span>
        </div>
        <div class="legend"><span>dark</span><span>light</span></div>
      </div>
      <div class="card">
        <h4>Drift score</h4>
        <p class="big">{{ driftScore.toFixed(2) }}</p>
        <p class="note">0 = unstable roles, 1 = consistent ordering</p>
      </div>
      <div class="card">
        <h4>Readability samples</h4>
        <div class="matrix" role="table" aria-label="Contrast samples">
          <div class="row head" role="row">
            <div class="cell ghost" role="columnheader" aria-hidden="true"></div>
            <div
              v-for="(fg, i) in foregrounds"
              :key="'h' + i"
              class="cell headcell"
              role="columnheader"
            >
              <span class="chip" :style="{ background: fg.hex }"></span>
              <span class="hex">{{ fg.hex }}</span>
            </div>
          </div>
          <div v-for="(bg, ri) in backgrounds" :key="'r' + ri" class="row" role="row">
            <div class="cell side" role="rowheader">
              <span class="chip" :style="{ background: bg.hex }"></span>
              <span class="hex">{{ bg.hex }}</span>
            </div>
            <div
              v-for="(fg, ci) in foregrounds"
              :key="'c' + ri + '-' + ci"
              class="cell"
              role="cell"
            >
              <div
                class="sample"
                :style="{ color: fg.hex, background: bg.hex }"
                :title="cellTitle(fg.hex, bg.hex)"
              >
                <span class="txt">Aa</span>
                <span class="badge" :class="ratingClass(fg.hex, bg.hex)">{{
                  ratingLabel(fg.hex, bg.hex)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import Icon from '../Icon.vue';
import { contrastRatio, wcagRating } from '../../utils/contrast';

type Entry = { hex: string; name?: string };
const props = defineProps<{ palette: Entry[] }>();

function hexToHsl(hex: string) {
  const m = hex.replace('#', '');
  const r = parseInt(m.substring(0, 2), 16) / 255;
  const g = parseInt(m.substring(2, 4), 16) / 255;
  const b = parseInt(m.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const l = (max + min) / 2;
  return { l };
}

const palette = computed(() => props.palette ?? []);
const lightnesses = computed(() => palette.value.map(p => hexToHsl(p.hex).l));

// Heuristic: compare ordering to ideal monotonic ramp; compute Kendall-like score
const driftScore = computed(() => {
  const L = lightnesses.value;
  if (L.length < 3) return 0.5;
  let inversions = 0;
  let total = 0;
  for (let i = 0; i < L.length; i++) {
    for (let j = i + 1; j < L.length; j++) {
      total++;
      if (L[i] > L[j]) inversions++;
    }
  }
  const norm = inversions / Math.max(1, total);
  return 1 - norm; // 1 = well-ordered from dark->light
});

// Simple matrix: pick darkest 3 as foregrounds and lightest 3 as backgrounds
const sortedByL = computed(() =>
  [...palette.value].sort((a, b) => hexToHsl(a.hex).l - hexToHsl(b.hex).l)
);
const foregrounds = computed(() => sortedByL.value.slice(0, Math.min(3, sortedByL.value.length)));
const backgrounds = computed(() => sortedByL.value.slice(-Math.min(3, sortedByL.value.length)));

function ratingLabel(fg: string, bg: string) {
  const ratio = contrastRatio(fg, bg);
  const r = wcagRating(ratio, false);
  if (r === 'AAA') return 'AAA';
  if (r === 'AA') return 'AA';
  return 'fail';
}
function ratingClass(fg: string, bg: string) {
  const ratio = contrastRatio(fg, bg);
  const r = wcagRating(ratio, false);
  return r === 'AAA' ? 'ok3' : r === 'AA' ? 'ok2' : 'bad';
}
function cellTitle(fg: string, bg: string) {
  const ratio = contrastRatio(fg, bg).toFixed(2);
  return `FG ${fg} / BG ${bg} — ${ratio}:1`;
}
</script>
<style scoped lang="scss">
.t {
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.desc {
  opacity: 0.8;
  margin: -0.25rem 0 0.5rem;
}
.grid {
  display: grid;
  grid-template-columns: 2fr 1fr 3fr;
  gap: 0.75rem;
}
.card {
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  padding: 0.75rem;
}
.bars {
  display: flex;
  gap: 0.25rem;
  align-items: flex-end;
  height: 120px;
}
.bar {
  width: 14px;
  border-radius: 3px;
  border: 1px solid var(--surface-border);
}
.legend {
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
  opacity: 0.8;
  font-size: 0.85rem;
}
.big {
  font-weight: 800;
  font-size: 1.6rem;
}
.note {
  opacity: 0.8;
}
/* Matrix styles */
.matrix {
  display: grid;
  gap: 0.25rem;
}
.row {
  display: grid;
  grid-template-columns: 1fr repeat(3, 1fr);
  gap: 0.25rem;
  align-items: stretch;
}
.row.head {
  font-size: 0.85rem;
  opacity: 0.85;
}
.cell {
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-primary);
}
.cell.ghost {
  border: none;
  background: transparent;
}
.headcell,
.side {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  justify-content: flex-start;
  padding: 0.35rem;
}
.chip {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid var(--surface-border);
  display: inline-block;
}
.hex {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
  font-size: 0.8rem;
  opacity: 0.9;
}
.sample {
  width: 100%;
  height: 46px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 0.35rem;
  gap: 0.5rem;
}
.txt {
  font-weight: 800;
  font-size: 1.1rem;
}
.badge {
  border-radius: 999px;
  font-size: 0.75rem;
  padding: 0.1rem 0.5rem;
  background: var(--surface-secondary);
  border: 1px solid var(--surface-border);
}
.badge.ok3 {
  background: color-mix(in oklab, var(--dracula-green) 40%, transparent);
  border-color: var(--dracula-green);
}
.badge.ok2 {
  background: color-mix(in oklab, var(--dracula-yellow) 30%, transparent);
  border-color: var(--dracula-yellow);
}
.badge.bad {
  background: color-mix(in oklab, var(--dracula-red) 30%, transparent);
  border-color: var(--dracula-red);
}
@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
