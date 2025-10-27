<template>
  <section class="genetic">
    <h3 class="t"><Icon name="dna" /><span>Genetic Mixer</span></h3>
    <div class="controls">
      <label>
        <span>Target ratio</span>
        <input type="number" v-model.number="target" min="2" max="12" step="0.1" />
      </label>
      <label>
        <span>Generations</span>
        <input type="number" v-model.number="gens" min="10" max="500" step="10" />
      </label>
      <label>
        <span>Seed</span>
        <input type="range" v-model.number="seed" min="0" max="999" step="1" />
        <span class="value-display">{{ seed }}</span>
      </label>
      <label>
        <span>Filter</span>
        <select v-model="filter">
          <option value="none">None</option>
          <option value="aa">AA (4.5:1)</option>
          <option value="aaLarge">AA Large (3.0:1)</option>
          <option value="aaa">AAA (7.0:1)</option>
        </select>
      </label>
      <button class="btn-recompute" type="button" @click="recompute">Recompute</button>
    </div>
    <div class="row" v-if="best">
      <div class="card">
        <h4>Best candidate</h4>
        <div class="sample" :style="{ background: best.bg }">
          <span :style="{ color: best.fg }">Aa {{ best.ratio.toFixed(2) }}:1</span>
        </div>
        <p class="note">Contrast error: {{ Math.abs(best.ratio - target).toFixed(2) }}</p>
      </div>
      <div class="card">
        <h4>Palette parents</h4>
        <div class="chips">
          <span
            v-for="(p, i) in parents"
            :key="i"
            class="chip"
            :style="{ background: p.hex }"
            :title="p.name || p.hex"
          ></span>
        </div>
      </div>
    </div>
    <div v-if="top.length" class="topgrid">
      <button
        v-for="(t, i) in top"
        :key="i"
        class="mini"
        :style="{ background: t.bg, color: t.fg }"
        :title="t.ratio.toFixed(2) + ':1'"
        type="button"
        @click="
          promote(t);
          copyPair(t);
        "
      >
        <span class="txt">Aa</span>
        <span class="rt">{{ t.ratio.toFixed(2) }}<span aria-hidden="true">:1</span></span>
        <span class="bdg" :class="badgeClass(t.ratio)">{{ badgeLabel(t.ratio) }}</span>
      </button>
    </div>
    <p v-else class="empty">Need at least two colors.</p>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { contrastRatio } from '../../utils/contrast';
import Icon from '../Icon.vue';

type Entry = { hex: string; name?: string };
const props = defineProps<{ palette: Entry[] }>();

const target = ref(7.0);
const gens = ref(100);
const seed = ref(0);
// hydrate/persist seed
onMounted(() => {
  const s = localStorage.getItem('genmix-seed');
  if (s) seed.value = parseInt(s, 10) || 0;
});
watch(seed, v => localStorage.setItem('genmix-seed', String(v)));
const bump = ref(0); // manual recompute counter

function mix(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255,
    ag = (pa >> 8) & 255,
    ab = pa & 255;
  const br = (pb >> 16) & 255,
    bg = (pb >> 8) & 255,
    bb = pb & 255;
  const r = Math.round(ar + (br - ar) * t),
    g = Math.round(ag + (bg - ag) * t),
    bl = Math.round(ab + (bb - ab) * t);
  const to = (v: number) => ('0' + v.toString(16)).slice(-2);
  return `#${to(r)}${to(g)}${to(bl)}`;
}

const parents = computed(() => (props.palette ?? []).slice(0, 6));
const filter = ref<'none' | 'aa' | 'aaLarge' | 'aaa'>('none');

const computedBest = computed(() => {
  const items = props.palette ?? [];
  if (items.length < 2) return null;
  let bestBg = items[0].hex,
    bestFg = items[1].hex;
  let bestRatio = contrastRatio(bestFg, bestBg);
  let bestErr = Math.abs(bestRatio - target.value);

  const N = gens.value;
  for (let g = 0; g < N; g++) {
    // Deterministic pseudo-random based on loop index + seed
    const s = (seed.value + bump.value) % 1000;
    const ai = (g * 13 + s) % items.length;
    const bi = (g * 29 + 7 + s) % items.length;
    if (ai === bi) continue;
    const a = items[ai].hex;
    const b = items[bi].hex;
    const t = ((g * 37 + s) % 100) / 100; // 0..0.99
    const childBg = g % 2 === 0 ? mix(a, b, t) : bestBg;
    const childFg = g % 2 === 1 ? mix(b, a, 1 - t) : bestFg;
    const r = contrastRatio(childFg, childBg);
    const err = Math.abs(r - target.value);
    if (err < bestErr) {
      bestErr = err;
      bestBg = childBg;
      bestFg = childFg;
      bestRatio = r;
    }
  }
  return { bg: bestBg, fg: bestFg, ratio: bestRatio };
});

// allow user to pin a candidate as best via click
const pinned = ref<{ bg: string; fg: string; ratio: number } | null>(null);
const best = computed(() => pinned.value ?? computedBest.value);

// Capture top N candidates for preview
const top = computed(() => {
  const items = props.palette ?? [];
  if (items.length < 2) return [] as Array<{ bg: string; fg: string; ratio: number }>;
  const list: Array<{ bg: string; fg: string; ratio: number }> = [];
  const N = Math.min(80, gens.value);
  let bestBg = items[0].hex,
    bestFg = items[1].hex;
  for (let g = 0; g < N; g++) {
    const s = (seed.value + bump.value) % 1000;
    const ai = (g * 11 + s) % items.length;
    const bi = (g * 17 + 3 + s) % items.length;
    if (ai === bi) continue;
    const a = items[ai].hex;
    const b = items[bi].hex;
    const t = ((g * 23 + s) % 100) / 100;
    const childBg = g % 2 === 0 ? mix(a, b, t) : bestBg;
    const childFg = g % 2 === 1 ? mix(b, a, 1 - t) : bestFg;
    list.push({ bg: childBg, fg: childFg, ratio: contrastRatio(childFg, childBg) });
  }
  const filtered = list.filter(c => {
    if (filter.value === 'none') return true;
    if (filter.value === 'aa') return c.ratio >= 4.5;
    if (filter.value === 'aaLarge') return c.ratio >= 3.0;
    return c.ratio >= 7.0; // AAA
  });
  return filtered
    .sort((x, y) => Math.abs(x.ratio - target.value) - Math.abs(y.ratio - target.value))
    .slice(0, 8);
});

function recompute() {
  bump.value++;
  pinned.value = null;
}

function promote(t: { bg: string; fg: string; ratio: number }) {
  pinned.value = t;
}

async function copyPair(t: { bg: string; fg: string; ratio: number }) {
  try {
    await navigator.clipboard.writeText(`${t.fg} on ${t.bg} (${t.ratio.toFixed(2)}:1)`);
  } catch {
    // Clipboard write failed, silently ignore
  }
}

function badgeLabel(r: number) {
  if (r >= 7) return 'AAA';
  if (r >= 4.5) return 'AA';
  if (r >= 3) return 'L';
  return '×';
}
function badgeClass(r: number) {
  if (r >= 7) return 'ok3';
  if (r >= 4.5) return 'ok2';
  if (r >= 3) return 'ok1';
  return 'bad';
}
</script>
<style scoped lang="scss">
@use '@/assets/styles/analysis-mixins' as mixins;

.t {
  @include mixins.analysis-heading;
}
.controls {
  @include mixins.analysis-controls;
}
.value-display {
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  color: var(--dracula-purple);
}
.btn-recompute {
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
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.card {
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  padding: 0.75rem;
}
.sample {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--surface-border);
  font-weight: 800;
}
.chips {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}
.chip {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid var(--surface-border);
}
.empty {
  color: var(--dracula-comment);
}
.topgrid {
  margin-top: 0.5rem;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.25rem;
}
.mini {
  height: 28px;
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  position: relative;
  cursor: pointer;
}
.mini .rt {
  position: absolute;
  right: 4px;
  bottom: 2px;
  font-size: 0.7rem;
  opacity: 0.9;
  font-weight: 600;
}
.mini .bdg {
  position: absolute;
  left: 4px;
  bottom: 2px;
  font-size: 0.65rem;
  padding: 0 0.25rem;
  border-radius: 4px;
  background: var(--surface-primary);
  border: 1px solid var(--surface-border);
}
.mini .bdg.ok3 {
  background: var(--dracula-green);
  color: #000;
}
.mini .bdg.ok2 {
  background: color-mix(in oklab, var(--dracula-green) 70%, var(--dracula-yellow));
  color: #000;
}
.mini .bdg.ok1 {
  background: var(--dracula-yellow);
  color: #000;
}
.mini .bdg.bad {
  background: var(--dracula-red);
  color: #fff;
}
@media (max-width: 820px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
