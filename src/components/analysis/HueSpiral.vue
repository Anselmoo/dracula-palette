<template>
  <section>
    <h3 class="t"><Icon name="spiral" /><span>Hue Spiral</span></h3>
    <div class="controls">
      <label
        ><span class="lbl">Turns</span
        ><input type="range" min="1" max="5" v-model.number="turns" /><span class="val">{{
          turns
        }}</span></label
      >
      <label
        ><span class="lbl">Radius</span
        ><input type="range" min="60" max="140" v-model.number="r1" /><span class="val">{{
          r1
        }}</span></label
      >
      <label
        ><span class="lbl">Dot</span
        ><input type="range" min="2" max="12" v-model.number="dot" /><span class="val">{{
          dot
        }}</span></label
      >
      <label><input type="checkbox" v-model="snap" /> Snap to hues</label>
      <label><input type="checkbox" v-model="showLabels" /> Show labels</label>
      <button class="btn" type="button" @click="reset">Reset</button>
    </div>
    <div class="spiral">
      <svg :width="size" :height="size" viewBox="0 0 200 200" role="img" aria-label="Hue spiral">
        <g transform="translate(100,100)">
          <circle cx="0" cy="0" r="2" fill="currentColor" />
          <template v-for="p in points" :key="p.hex">
            <g>
              <circle :cx="p.x" :cy="p.y" :r="dot" :fill="p.hex">
                <title>{{ p.name }} ({{ p.hex }})</title>
              </circle>
              <text
                v-if="showLabels"
                :x="p.x + 6"
                :y="p.y + 4"
                font-size="8"
                fill="var(--dracula-foreground)"
              >
                {{ p.name }}
              </text>
            </g>
          </template>
        </g>
      </svg>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import Icon from '../Icon.vue';

const props = defineProps<{ palette: { hex: string; name: string }[] }>();
const size = 220;
const turns = ref(2);
const r0 = 20;
const r1 = ref(90);
const dot = ref(5);
const snap = ref(false);
const showLabels = ref(false);
function reset() {
  turns.value = 2;
  r1.value = 90;
  dot.value = 5;
  snap.value = false;
  showLabels.value = false;
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

const points = computed(() => {
  const ordered = [...props.palette].sort((a, b) => hexToHsl(a.hex).h - hexToHsl(b.hex).h);
  const n = ordered.length || 1;
  return ordered.map((p, i) => {
    const idx = snap.value ? Math.round((i / n) * (n - 1)) : i;
    const t = idx / Math.max(1, n - 1);
    const r = r0 + t * (r1.value - r0);
    const a = Math.PI * 2 * t * turns.value;
    return { name: p.name, hex: p.hex, x: r * Math.cos(a), y: r * Math.sin(a) };
  });
});
</script>
<style scoped lang="scss">
.t {
  margin: 0 0 0.5rem;
}
.controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin: 0.25rem 0 0.5rem;
  flex-wrap: wrap;
}
.lbl {
  margin-right: 0.35rem;
  color: var(--dracula-comment);
}
.val {
  margin-left: 0.35rem;
  opacity: 0.85;
  font-size: 0.9rem;
}
.spiral {
  display: flex;
  justify-content: center;
}
.btn {
  appearance: none;
  background: var(--surface-primary);
  color: var(--dracula-foreground);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
  cursor: pointer;
}
</style>
