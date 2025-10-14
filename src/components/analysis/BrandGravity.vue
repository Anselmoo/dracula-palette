<template>
  <section>
    <h3 class="t"><Icon name="compass" /><span>Brand Gravity</span></h3>
    <p class="hint">
      Counts how often each accent passes AA (4.5:1) as text over backgrounds and as background
      under text. Visual proof shows coverage bar.
    </p>
    <ul class="list" role="list">
      <li v-for="row in ranking" :key="row.name" class="item" role="listitem">
        <span class="swatch" :style="{ background: row.hex }" aria-hidden="true"></span>
        <span class="name">{{ row.name }}</span>
        <div class="bar-wrap" :title="row.score + ' passes'">
          <div class="bar" :style="{ width: barWidth(row.score) }"></div>
        </div>
        <span class="score">{{ row.score }}</span>
      </li>
    </ul>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import Icon from '../Icon.vue';

const props = defineProps<{
  palette: { hex: string; name: string }[];
  textSamples?: { hex: string; name: string }[];
  bgSamples?: { hex: string; name: string }[];
}>();

function srgbToLin(c: number) {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function lum(hex: string) {
  const r = srgbToLin(parseInt(hex.slice(1, 3), 16));
  const g = srgbToLin(parseInt(hex.slice(3, 5), 16));
  const b = srgbToLin(parseInt(hex.slice(5, 7), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a: string, b: string) {
  const L1 = lum(a),
    L2 = lum(b);
  const [hi, lo] = L1 >= L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

const AA = 4.5;
const ranking = computed(() => {
  const accents = props.palette;
  const texts = props.textSamples ?? accents;
  const bgs = props.bgSamples ?? accents;
  return accents
    .map(a => {
      let score = 0;
      for (const t of texts) if (ratio(t.hex, a.hex) >= AA) score++;
      for (const b of bgs) if (ratio(b.hex, a.hex) >= AA) score++;
      return { name: a.name, hex: a.hex, score };
    })
    .sort((x, y) => y.score - x.score);
});

const maxScore = computed(() =>
  ranking.value.length ? Math.max(...ranking.value.map(r => r.score)) : 1
);
function barWidth(score: number) {
  const max = Math.max(1, maxScore.value);
  const pct = Math.round((score / max) * 100);
  return pct + '%';
}
</script>
<style scoped lang="scss">
.t {
  margin: 0 0 0.25rem;
}
.hint {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}
.list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.item {
  display: grid;
  grid-template-columns: 16px 1fr 140px 3ch;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0;
}
.swatch {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
.name {
  flex: 1;
}
.bar-wrap {
  height: 8px;
  background: color-mix(in oklab, var(--surface-primary) 70%, transparent);
  border: 1px solid var(--surface-border);
  border-radius: 999px;
  overflow: hidden;
}
.bar {
  height: 100%;
  background: linear-gradient(90deg, var(--dracula-green), var(--dracula-yellow));
}
.score {
  font-variant-numeric: tabular-nums;
  opacity: 0.9;
  text-align: right;
}
</style>
