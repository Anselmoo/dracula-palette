<template>
  <section>
    <h3 class="t"><Icon name="wand" /><span>Auto Tint Steps</span></h3>
    <div class="controls">
      <label>
        Base
        <input type="color" v-model="baseHex" aria-label="Base color" />
      </label>
      <label>
        Steps
        <input type="range" min="3" max="9" v-model.number="steps" aria-label="Steps" />
      </label>
    </div>
    <div class="row">
      <div v-for="(c, i) in tints" :key="i" class="cell">
        <div class="sw" :style="{ background: c }"></div>
        <div class="hex">{{ c }}</div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import Icon from '../Icon.vue';

const props = defineProps<{ palette: { hex: string; name: string }[] }>();
const baseHex = ref(props.palette[0]?.hex ?? '#ff79c6');
const steps = ref(7);

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
function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    const hex = Math.round(255 * c)
      .toString(16)
      .padStart(2, '0');
    return hex;
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const tints = computed(() => {
  const { h, s, l } = hexToHsl(baseHex.value);
  const n = steps.value;
  const span = 70;
  const start = Math.max(0, l - span / 2);
  const end = Math.min(100, l + span / 2);
  const arr: string[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const L = Math.round(start + t * (end - start));
    arr.push(hslToHex(h, s, L));
  }
  return arr;
});
</script>
<style scoped lang="scss">
@use '@/assets/styles/analysis-mixins' as mixins;

.t {
  margin: 0 0 0.5rem;
}
.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.5rem;

  input[type='range'] {
    @include mixins.analysis-range;
  }
}
.row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 0.5rem;
}
.cell {
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  overflow: hidden;
  background: var(--card-bg, rgba(255, 255, 255, 0.03));
}
.sw {
  height: 48px;
}
.hex {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8rem;
  padding: 0.25rem 0.4rem;
}
</style>
