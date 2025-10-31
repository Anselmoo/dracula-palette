<template>
  <section class="mixing">
    <h3 class="t"><Icon name="mixing" /><span>Mixing & Steps</span></h3>
    <div class="controls" v-if="palette.length >= 2">
      <label>
        A
        <select v-model="idxA" aria-label="First color">
          <option v-for="(p, i) in palette" :key="i" :value="i">{{ p.name || p.hex }}</option>
        </select>
      </label>
      <label>
        B
        <select v-model="idxB" aria-label="Second color">
          <option v-for="(p, i) in palette" :key="i" :value="i">{{ p.name || p.hex }}</option>
        </select>
      </label>
      <label>Steps <input type="number" v-model.number="N" min="2" max="24" /></label>
    </div>
    <div class="row" v-if="a && b">
      <div class="steps">
        <span
          v-for="(c, i) in stepsColors"
          :key="i"
          class="step"
          :style="{ background: c }"
          :title="c"
        ></span>
      </div>
    </div>
    <p v-else class="empty">Need at least two colors.</p>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import Icon from '../Icon.vue';
const props = defineProps<{ palette: { hex: string; name?: string }[] }>();
const palette = computed(() => props.palette ?? []);
const idxA = ref(0);
const idxB = ref(1);
const N = ref(8);
const a = computed(() => palette.value[idxA.value]?.hex);
const b = computed(() => palette.value[idxB.value]?.hex);

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

const stepsColors = computed(() => {
  if (!a.value || !b.value) return [] as string[];
  const out: string[] = [];
  const K = Math.max(2, Math.min(24, N.value));
  for (let i = 0; i <= K; i++) {
    out.push(mix(a.value, b.value, i / K));
  }
  return out;
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

  select {
    @include mixins.analysis-select;
  }
}
.steps {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 0.25rem;
}
.step {
  height: 22px;
  border-radius: 6px;
  border: 1px solid var(--surface-border);
}
.empty {
  color: var(--dracula-comment);
}
</style>
