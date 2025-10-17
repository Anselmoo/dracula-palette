<template>
  <section>
    <h3 class="t"><Icon name="target" /><span>Focus Color Finder</span></h3>
    <div class="controls">
      <label>
        Background
        <input type="color" v-model="bg" aria-label="Background color" />
      </label>
      <label>
        Min ratio
        <input
          type="number"
          v-model.number="minRatio"
          min="1"
          step="0.1"
          aria-label="Minimum contrast ratio"
        />
      </label>
    </div>
    <ol class="list">
      <li v-for="c in top" :key="c.name" class="item">
        <span class="chip" :style="{ background: c.hex }"></span>
        <span class="name">{{ c.name }}</span>
        <span class="ratio">{{ c.ratio.toFixed(2) }}:1</span>
      </li>
    </ol>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import Icon from '../Icon.vue';

const props = defineProps<{ palette: { hex: string; name: string }[] }>();
const bg = ref('#282a36');
const minRatio = ref(4.5);

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

const top = computed(() => {
  return props.palette
    .map(p => ({ name: p.name, hex: p.hex, ratio: ratio(p.hex, bg.value) }))
    .filter(x => x.ratio >= minRatio.value)
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 10);
});
</script>
<style scoped lang="scss">
.t {
  margin: 0 0 0.5rem;
}
.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.5rem;
}
.list {
  margin: 0;
  padding-left: 1.25rem;
}
.item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.chip {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.15);
}
.name {
  flex: 1;
}
.ratio {
  font-variant-numeric: tabular-nums;
  opacity: 0.9;
}
</style>
