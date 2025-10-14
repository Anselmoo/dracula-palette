<template>
  <section>
    <h3 class="t"><Icon name="temperature" /><span>Color Temperature</span></h3>
    <div class="bar">
      <div class="warm" :style="{ width: warmPct + '%' }">Warm {{ warmPct }}%</div>
      <div class="cool" :style="{ width: coolPct + '%' }">Cool {{ coolPct }}%</div>
    </div>
    <div class="meta">
      <span>Hue centroid: {{ centroid.toFixed(0) }}°</span>
      <span>Spread: {{ Math.round(spread) }}°</span>
    </div>
    <div class="hist">
      <div
        v-for="(b, i) in bins"
        :key="i"
        class="bin"
        :style="{
          height: ((b / maxBin) * 100).toFixed(0) + '%',
          background: `hsl(${i * binSize}, 75%, 50%)`,
        }"
      ></div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import Icon from '../Icon.vue';
const props = defineProps<{ palette: { hex: string }[] }>();

function hue(hex: string) {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0;
  if (max === min) return 0;
  const d = max - min;
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
  return (h / 6) * 360;
}
const hues = computed(() => props.palette.map(c => hue(c.hex)));
const warm = computed(
  () => hues.value.filter(h => (h >= 0 && h < 60) || (h >= 300 && h <= 360)).length
);
const _cool = computed(() => hues.value.length - warm.value);
const warmPct = computed(() =>
  hues.value.length ? Math.round((warm.value / hues.value.length) * 100) : 0
);
const coolPct = computed(() => 100 - warmPct.value);

// Hue histogram and centroid
const binSize = 15; // 24 bins
const bins = computed(() => {
  const out = new Array(Math.ceil(360 / binSize)).fill(0);
  hues.value.forEach(h => {
    const idx = Math.min(out.length - 1, Math.floor(h / binSize));
    out[idx] += 1;
  });
  return out;
});
const maxBin = computed(() => Math.max(1, ...bins.value));
const centroid = computed(() => {
  if (!hues.value.length) return 0;
  // Circular mean
  const toRad = (d: number) => (d * Math.PI) / 180;
  const cx = hues.value.reduce((s, h) => s + Math.cos(toRad(h)), 0) / hues.value.length;
  const cy = hues.value.reduce((s, h) => s + Math.sin(toRad(h)), 0) / hues.value.length;
  const angle = (Math.atan2(cy, cx) * 180) / Math.PI;
  return (angle + 360) % 360;
});
const spread = computed(() => {
  if (!hues.value.length) return 0;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const meanR = Math.hypot(
    hues.value.reduce((s, h) => s + Math.cos(toRad(h)), 0) / hues.value.length,
    hues.value.reduce((s, h) => s + Math.sin(toRad(h)), 0) / hues.value.length
  );
  // Approximate circular variance converted to degrees
  return (1 - meanR) * 180;
});
</script>
<style scoped lang="scss">
.t {
  margin: 0 0 0.5rem;
}
.bar {
  display: flex;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  overflow: hidden;
  height: 32px;
}
.warm {
  background: linear-gradient(90deg, #a83232, #e76f51);
  color: #fff;
  text-align: center;
}
.cool {
  background: linear-gradient(90deg, #2a9d8f, #6f6dfa);
  color: #fff;
  text-align: center;
}
.meta {
  display: flex;
  gap: 1rem;
  margin: 0.5rem 0;
  opacity: 0.9;
  font-size: 0.9rem;
}
.hist {
  display: flex;
  gap: 2px;
  align-items: flex-end;
  height: 90px;
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  padding: 2px;
}
.bin {
  width: calc((100% - 46px) / 24);
  border-radius: 2px;
}
</style>
