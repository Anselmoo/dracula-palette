<template>
  <section class="balance">
    <h3 class="t"><Icon name="scale" /><span>Balance Index</span></h3>
    <div class="grid">
      <div class="card">
        <h4>Warm vs Cool</h4>
        <div class="gauge">
          <div class="bar">
            <span class="warm" :style="{ width: warmPct + '%' }"></span>
            <span class="cool" :style="{ width: coolPct + '%' }"></span>
          </div>
          <div class="labels">
            <span>Warm {{ warmPct }}%</span><span>Cool {{ coolPct }}%</span>
          </div>
        </div>
        <p class="note">
          Score: <strong>{{ warmCoolScore.toFixed(2) }}</strong> (0 = skewed, 1 = balanced)
        </p>
      </div>
      <div class="card">
        <h4>Vivid vs Muted</h4>
        <div class="gauge">
          <div class="bar">
            <span class="vivid" :style="{ width: vividPct + '%' }"></span>
            <span class="muted" :style="{ width: mutedPct + '%' }"></span>
          </div>
          <div class="labels">
            <span>Vivid {{ vividPct }}%</span><span>Muted {{ mutedPct }}%</span>
          </div>
        </div>
        <p class="note">
          Score: <strong>{{ vividMutedScore.toFixed(2) }}</strong>
        </p>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import Icon from '../Icon.vue';

type Entry = { hex: string; name?: string };
const props = defineProps<{ palette: Entry[] }>();

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

const hues = computed(() => props.palette.map(p => hexToHsl(p.hex).h));
const sats = computed(() => props.palette.map(p => hexToHsl(p.hex).s));

const warmCount = computed(
  () => hues.value.filter(h => (h >= 0 && h < 60) || (h >= 300 && h <= 360)).length
);
const _coolCount = computed(() => Math.max(0, hues.value.length - warmCount.value));
const warmPct = computed(() =>
  hues.value.length ? Math.round((warmCount.value / hues.value.length) * 100) : 0
);
const coolPct = computed(() => 100 - warmPct.value);

const vividCount = computed(() => sats.value.filter(s => s >= 0.45).length);
const _mutedCount = computed(() => Math.max(0, sats.value.length - vividCount.value));
const vividPct = computed(() =>
  sats.value.length ? Math.round((vividCount.value / sats.value.length) * 100) : 0
);
const mutedPct = computed(() => 100 - vividPct.value);

// Balance score ~ 1 - |warmPct-coolPct|/100
const warmCoolScore = computed(() => 1 - Math.abs(warmPct.value - coolPct.value) / 100);
const vividMutedScore = computed(() => 1 - Math.abs(vividPct.value - mutedPct.value) / 100);
</script>
<style scoped lang="scss">
.t {
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}
.card {
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  padding: 0.75rem;
}
.gauge .bar {
  display: flex;
  height: 16px;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid var(--surface-border);
}
.gauge .labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.35rem;
  font-size: 0.85rem;
  opacity: 0.9;
}
.warm {
  background: linear-gradient(90deg, #b44, #f08);
}
.cool {
  background: linear-gradient(90deg, #39a, #6f6dfa);
}
.vivid {
  background: linear-gradient(90deg, #ffb703, #fb5607);
}
.muted {
  background: linear-gradient(90deg, #94a1b2, #8a8f98);
}
@media (max-width: 800px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
