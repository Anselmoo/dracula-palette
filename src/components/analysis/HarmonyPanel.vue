<template>
  <section class="harmony">
    <h3 class="t"><Icon name="harmony" /><span>Harmony</span></h3>
    <div class="controls">
      <label
        >Source A
        <select v-model="srcIndexA">
          <option v-for="(c, i) in palette" :key="c.hex + i" :value="i">
            {{ c.name || c.hex }}
          </option>
        </select>
      </label>
      <label
        >Source B
        <select v-model="srcIndexB">
          <option v-for="(c, i) in palette" :key="'b' + c.hex + i" :value="i">
            {{ c.name || c.hex }}
          </option>
        </select>
      </label>
      <label
        >Source C
        <select v-model="srcIndexC">
          <option v-for="(c, i) in palette" :key="'c' + c.hex + i" :value="i">
            {{ c.name || c.hex }}
          </option>
        </select>
      </label>
      <label><input type="checkbox" v-model="showComp" /> Complementary</label>
      <label><input type="checkbox" v-model="showAnalog" /> Analogous</label>
      <label><input type="checkbox" v-model="showTriad" /> Triadic</label>
      <label><input type="checkbox" v-model="showTicks" /> Show degree ticks</label>
      <label><input type="checkbox" v-model="syncBC" /> Sync B/C with A</label>
    </div>
    <div class="wheels">
      <div class="wheel" aria-label="Wheel A">
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          role="img"
          @click="onWheelClick($event, 'A')"
        >
          <g transform="translate(110,110)">
            <template v-for="i in 36" :key="i">
              <path
                :d="arcPath((i - 1) * 10, i * 10, 80, 100)"
                :fill="`hsl(${(i - 1) * 10}, 80%, 50%)`"
              />
            </template>
            <template v-if="showTicks">
              <g v-for="i in 12" :key="'t' + i">
                <line
                  :x1="polarX(i * 30, 78)"
                  :y1="polarY(i * 30, 78)"
                  :x2="polarX(i * 30, 100)"
                  :y2="polarY(i * 30, 100)"
                  class="tick"
                />
                <text :x="polarX(i * 30, 70)" :y="polarY(i * 30, 70)" class="tick-txt">
                  {{ i * 30 }}°
                </text>
              </g>
            </template>
            <circle :cx="polarX(hA, 90)" :cy="polarY(hA, 90)" r="6" class="pin" :fill="aHex">
              <title>{{ aHex }}</title>
            </circle>
            <circle
              v-for="(h, idx) in huesA"
              :key="idx"
              :cx="polarX(h, 90)"
              :cy="polarY(h, 90)"
              r="5"
              class="pin sec"
              :fill="hueToHexA(h)"
            >
              <title>{{ hueToHexA(h) }} ({{ Math.round(h) }}°)</title>
            </circle>
          </g>
        </svg>
      </div>
      <div class="wheel" aria-label="Wheel B">
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          role="img"
          @click="onWheelClick($event, 'B')"
        >
          <g transform="translate(110,110)">
            <template v-for="i in 36" :key="i">
              <path
                :d="arcPath((i - 1) * 10, i * 10, 80, 100)"
                :fill="`hsl(${(i - 1) * 10}, 80%, 50%)`"
              />
            </template>
            <template v-if="showTicks">
              <g v-for="i in 12" :key="'tb' + i">
                <line
                  :x1="polarX(i * 30, 78)"
                  :y1="polarY(i * 30, 78)"
                  :x2="polarX(i * 30, 100)"
                  :y2="polarY(i * 30, 100)"
                  class="tick"
                />
                <text :x="polarX(i * 30, 70)" :y="polarY(i * 30, 70)" class="tick-txt">
                  {{ i * 30 }}°
                </text>
              </g>
            </template>
            <circle :cx="polarX(hB, 90)" :cy="polarY(hB, 90)" r="6" class="pin" :fill="bHex">
              <title>{{ bHex }}</title>
            </circle>
            <circle
              v-for="(h, idx) in huesB"
              :key="idx"
              :cx="polarX(h, 90)"
              :cy="polarY(h, 90)"
              r="5"
              class="pin sec"
              :fill="hueToHexB(h)"
            >
              <title>{{ hueToHexB(h) }} ({{ Math.round(h) }}°)</title>
            </circle>
          </g>
        </svg>
      </div>
      <div class="wheel" aria-label="Wheel C">
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          role="img"
          @click="onWheelClick($event, 'C')"
        >
          <g transform="translate(110,110)">
            <template v-for="i in 36" :key="i">
              <path
                :d="arcPath((i - 1) * 10, i * 10, 80, 100)"
                :fill="`hsl(${(i - 1) * 10}, 80%, 50%)`"
              />
            </template>
            <template v-if="showTicks">
              <g v-for="i in 12" :key="'tc' + i">
                <line
                  :x1="polarX(i * 30, 78)"
                  :y1="polarY(i * 30, 78)"
                  :x2="polarX(i * 30, 100)"
                  :y2="polarY(i * 30, 100)"
                  class="tick"
                />
                <text :x="polarX(i * 30, 70)" :y="polarY(i * 30, 70)" class="tick-txt">
                  {{ i * 30 }}°
                </text>
              </g>
            </template>
            <circle :cx="polarX(hC, 90)" :cy="polarY(hC, 90)" r="6" class="pin" :fill="cHex">
              <title>{{ cHex }}</title>
            </circle>
            <circle
              v-for="(h, idx) in huesC"
              :key="idx"
              :cx="polarX(h, 90)"
              :cy="polarY(h, 90)"
              r="5"
              class="pin sec"
              :fill="hueToHexC(h)"
            >
              <title>{{ hueToHexC(h) }} ({{ Math.round(h) }}°)</title>
            </circle>
          </g>
        </svg>
      </div>
    </div>
    <div class="row" v-if="palette.length">
      <div class="card">
        <h4>Complementary</h4>
        <div class="swatches">
          <div v-for="c in compA" :key="'a' + c" class="swl">
            <span class="sw" :style="{ background: c }" :title="c"></span
            ><span class="lb">{{ c }}</span>
          </div>
          <div v-for="c in compB" :key="'b' + c" class="swl">
            <span class="sw" :style="{ background: c }" :title="c"></span
            ><span class="lb">{{ c }}</span>
          </div>
          <div v-for="c in compC" :key="'c' + c" class="swl">
            <span class="sw" :style="{ background: c }" :title="c"></span
            ><span class="lb">{{ c }}</span>
          </div>
        </div>
      </div>
      <div class="card">
        <h4>Analogous</h4>
        <div class="swatches">
          <div v-for="c in analA" :key="'aa' + c" class="swl">
            <span class="sw" :style="{ background: c }" :title="c"></span
            ><span class="lb">{{ c }}</span>
          </div>
          <div v-for="c in analB" :key="'ab' + c" class="swl">
            <span class="sw" :style="{ background: c }" :title="c"></span
            ><span class="lb">{{ c }}</span>
          </div>
          <div v-for="c in analC" :key="'ac' + c" class="swl">
            <span class="sw" :style="{ background: c }" :title="c"></span
            ><span class="lb">{{ c }}</span>
          </div>
        </div>
      </div>
      <div class="card">
        <h4>Triadic</h4>
        <div class="swatches">
          <div v-for="c in triA" :key="'ta' + c" class="swl">
            <span class="sw" :style="{ background: c }" :title="c"></span
            ><span class="lb">{{ c }}</span>
          </div>
          <div v-for="c in triB" :key="'tb' + c" class="swl">
            <span class="sw" :style="{ background: c }" :title="c"></span
            ><span class="lb">{{ c }}</span>
          </div>
          <div v-for="c in triC" :key="'tc' + c" class="swl">
            <span class="sw" :style="{ background: c }" :title="c"></span
            ><span class="lb">{{ c }}</span>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="empty">No colors available</p>
    <div class="chords" v-if="palette.length && !noEffect">
      <svg width="300" height="180" viewBox="0 0 300 180" role="img" aria-label="Harmony relationship diagram">
        <g transform="translate(150,90)">
          <!-- Draw arcs for each source color at their hue positions -->
          <circle :cx="polarX(hA, 70)" :cy="polarY(hA, 70)" r="8" :fill="aHex" class="source-pin" />
          <circle :cx="polarX(hB, 70)" :cy="polarY(hB, 70)" r="8" :fill="bHex" class="source-pin" />
          <circle :cx="polarX(hC, 70)" :cy="polarY(hC, 70)" r="8" :fill="cHex" class="source-pin" />
          
          <!-- Complementary connections (only between actual sources if they are complementary) -->
          <line
            v-if="showComp && isHarmonyRelated(hA, hB, 180)"
            :x1="polarX(hA, 70)"
            :y1="polarY(hA, 70)"
            :x2="polarX(hB, 70)"
            :y2="polarY(hB, 70)"
            class="ch comp"
          />
          <line
            v-if="showComp && isHarmonyRelated(hA, hC, 180)"
            :x1="polarX(hA, 70)"
            :y1="polarY(hA, 70)"
            :x2="polarX(hC, 70)"
            :y2="polarY(hC, 70)"
            class="ch comp"
          />
          <line
            v-if="showComp && isHarmonyRelated(hB, hC, 180)"
            :x1="polarX(hB, 70)"
            :y1="polarY(hB, 70)"
            :x2="polarX(hC, 70)"
            :y2="polarY(hC, 70)"
            class="ch comp"
          />
          
          <!-- Analogous connections (±30°) -->
          <line
            v-if="showAnalog && isHarmonyRelated(hA, hB, 30)"
            :x1="polarX(hA, 70)"
            :y1="polarY(hA, 70)"
            :x2="polarX(hB, 70)"
            :y2="polarY(hB, 70)"
            class="ch analog"
          />
          <line
            v-if="showAnalog && isHarmonyRelated(hA, hC, 30)"
            :x1="polarX(hA, 70)"
            :y1="polarY(hA, 70)"
            :x2="polarX(hC, 70)"
            :y2="polarY(hC, 70)"
            class="ch analog"
          />
          <line
            v-if="showAnalog && isHarmonyRelated(hB, hC, 30)"
            :x1="polarX(hB, 70)"
            :y1="polarY(hB, 70)"
            :x2="polarX(hC, 70)"
            :y2="polarY(hC, 70)"
            class="ch analog"
          />
          
          <!-- Triadic connections (±120°) -->
          <line
            v-if="showTriad && isHarmonyRelated(hA, hB, 120)"
            :x1="polarX(hA, 70)"
            :y1="polarY(hA, 70)"
            :x2="polarX(hB, 70)"
            :y2="polarY(hB, 70)"
            class="ch triad"
          />
          <line
            v-if="showTriad && isHarmonyRelated(hA, hC, 120)"
            :x1="polarX(hA, 70)"
            :y1="polarY(hA, 70)"
            :x2="polarX(hC, 70)"
            :y2="polarY(hC, 70)"
            class="ch triad"
          />
          <line
            v-if="showTriad && isHarmonyRelated(hB, hC, 120)"
            :x1="polarX(hB, 70)"
            :y1="polarY(hB, 70)"
            :x2="polarX(hC, 70)"
            :y2="polarY(hC, 70)"
            class="ch triad"
          />
        </g>
      </svg>
      <p class="note">
        Lines connect sources that share harmony relationships: 
        <span class="comp-label">complementary (180°)</span>, 
        <span class="analog-label">analogous (±30°)</span>, 
        <span class="triad-label">triadic (±120°)</span>.
      </p>
    </div>
    <p v-else-if="noEffect" class="empty">
      Harmony chords hidden: palette near-neutral or negligible hue separation.
    </p>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Icon from '../Icon.vue';

const props = defineProps<{ palette: { hex: string; name?: string }[] }>();
const srcIndexA = ref(0);
const srcIndexB = ref(1);
const srcIndexC = ref(2);
const syncBC = ref(false);
const base = computed(() => props.palette[srcIndexA.value]?.hex ?? '#6f6dfa');

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
function hslToHex(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = [0, 0, 0];
  if (h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }
  const to = (v: number) => ('0' + Math.round((v + m) * 255).toString(16)).slice(-2);
  return `#${to(r)}${to(g)}${to(b)}`;
}
const analogous = computed(() => {
  const { h, s, l } = hexToHsl(base.value);
  return [hslToHex((h - 30 + 360) % 360, s, l), base.value, hslToHex((h + 30) % 360, s, l)];
});
const _comp = computed(() => {
  const { h, s, l } = hexToHsl(base.value);
  return [base.value, hslToHex((h + 180) % 360, s, l)];
});
const _triad = computed(() => {
  const { h, s, l } = hexToHsl(base.value);
  return [hslToHex(h, s, l), hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)];
});

// Per-source variants
const hA = computed(() => hexToHsl(props.palette[srcIndexA.value]?.hex ?? '#6f6dfa').h);
const hB = computed(() => {
  const idx = syncBC.value ? srcIndexA.value : srcIndexB.value;
  return hexToHsl(props.palette[idx]?.hex ?? props.palette[srcIndexA.value]?.hex ?? '#6f6dfa').h;
});
const hC = computed(() => {
  const idx = syncBC.value ? srcIndexA.value : srcIndexC.value;
  return hexToHsl(props.palette[idx]?.hex ?? props.palette[srcIndexB.value]?.hex ?? '#6f6dfa').h;
});
const huesA = computed(() => [
  ...(showComp.value ? [(hA.value + 180) % 360] : []),
  ...(showAnalog.value ? [(hA.value + 30) % 360, (hA.value - 30 + 360) % 360] : []),
  ...(showTriad.value ? [(hA.value + 120) % 360, (hA.value + 240) % 360] : []),
]);
const huesB = computed(() => [
  ...(showComp.value ? [(hB.value + 180) % 360] : []),
  ...(showAnalog.value ? [(hB.value + 30) % 360, (hB.value - 30 + 360) % 360] : []),
  ...(showTriad.value ? [(hB.value + 120) % 360, (hB.value + 240) % 360] : []),
]);
const huesC = computed(() => [
  ...(showComp.value ? [(hC.value + 180) % 360] : []),
  ...(showAnalog.value ? [(hC.value + 30) % 360, (hC.value - 30 + 360) % 360] : []),
  ...(showTriad.value ? [(hC.value + 120) % 360, (hC.value + 240) % 360] : []),
]);

const compA = computed(() => {
  const { s, l } = hexToHsl(props.palette[srcIndexA.value]?.hex ?? '#6f6dfa');
  return [props.palette[srcIndexA.value]?.hex ?? '#6f6dfa', hslToHex((hA.value + 180) % 360, s, l)];
});
const compB = computed(() => {
  const { s, l } = hexToHsl(
    props.palette[syncBC.value ? srcIndexA.value : srcIndexB.value]?.hex ?? '#6f6dfa'
  );
  const hex = props.palette[syncBC.value ? srcIndexA.value : srcIndexB.value]?.hex ?? '#6f6dfa';
  return [hex, hslToHex((hB.value + 180) % 360, s, l)];
});
const compC = computed(() => {
  const { s, l } = hexToHsl(
    props.palette[syncBC.value ? srcIndexA.value : srcIndexC.value]?.hex ?? '#6f6dfa'
  );
  const hex = props.palette[syncBC.value ? srcIndexA.value : srcIndexC.value]?.hex ?? '#6f6dfa';
  return [hex, hslToHex((hC.value + 180) % 360, s, l)];
});
const analA = computed(() => {
  const { s, l } = hexToHsl(props.palette[srcIndexA.value]?.hex ?? '#6f6dfa');
  return [
    hslToHex((hA.value - 30 + 360) % 360, s, l),
    props.palette[srcIndexA.value]?.hex ?? '#6f6dfa',
    hslToHex((hA.value + 30) % 360, s, l),
  ];
});
const analB = computed(() => {
  const idx = syncBC.value ? srcIndexA.value : srcIndexB.value;
  const { s, l } = hexToHsl(props.palette[idx]?.hex ?? '#6f6dfa');
  return [
    hslToHex((hB.value - 30 + 360) % 360, s, l),
    props.palette[idx]?.hex ?? '#6f6dfa',
    hslToHex((hB.value + 30) % 360, s, l),
  ];
});
const analC = computed(() => {
  const idx = syncBC.value ? srcIndexA.value : srcIndexC.value;
  const { s, l } = hexToHsl(props.palette[idx]?.hex ?? '#6f6dfa');
  return [
    hslToHex((hC.value - 30 + 360) % 360, s, l),
    props.palette[idx]?.hex ?? '#6f6dfa',
    hslToHex((hC.value + 30) % 360, s, l),
  ];
});
const triA = computed(() => {
  const { s, l } = hexToHsl(props.palette[srcIndexA.value]?.hex ?? '#6f6dfa');
  return [
    hslToHex(hA.value, s, l),
    hslToHex((hA.value + 120) % 360, s, l),
    hslToHex((hA.value + 240) % 360, s, l),
  ];
});
const triB = computed(() => {
  const idx = syncBC.value ? srcIndexA.value : srcIndexB.value;
  const { s, l } = hexToHsl(props.palette[idx]?.hex ?? '#6f6dfa');
  return [
    hslToHex(hB.value, s, l),
    hslToHex((hB.value + 120) % 360, s, l),
    hslToHex((hB.value + 240) % 360, s, l),
  ];
});
const triC = computed(() => {
  const idx = syncBC.value ? srcIndexA.value : srcIndexC.value;
  const { s, l } = hexToHsl(props.palette[idx]?.hex ?? '#6f6dfa');
  return [
    hslToHex(hC.value, s, l),
    hslToHex((hC.value + 120) % 360, s, l),
    hslToHex((hC.value + 240) % 360, s, l),
  ];
});

// Helpers for pin tooltips
const aHex = computed(() => props.palette[srcIndexA.value]?.hex ?? '#6f6dfa');
const bHex = computed(
  () => props.palette[syncBC.value ? srcIndexA.value : srcIndexB.value]?.hex ?? '#6f6dfa'
);
const cHex = computed(
  () => props.palette[syncBC.value ? srcIndexA.value : srcIndexC.value]?.hex ?? '#6f6dfa'
);
const hueToHexA = (h: number) => {
  const { s, l } = hexToHsl(aHex.value);
  return hslToHex(h, s, l);
};
const hueToHexB = (h: number) => {
  const { s, l } = hexToHsl(bHex.value);
  return hslToHex(h, s, l);
};
const hueToHexC = (h: number) => {
  const { s, l } = hexToHsl(cHex.value);
  return hslToHex(h, s, l);
};

// Clamp indices when palette changes
watch(
  () => props.palette.length,
  n => {
    if (!n) return;
    srcIndexA.value = Math.min(srcIndexA.value, n - 1);
    srcIndexB.value = Math.min(srcIndexB.value, n - 1);
    srcIndexC.value = Math.min(srcIndexC.value, n - 1);
  }
);

// Wheel helpers
const baseHsl = computed(() => hexToHsl(base.value));
const baseHue = computed(() => baseHsl.value.h);
const _harmonyHues = computed(() => [
  ...(showComp.value ? [(baseHue.value + 180) % 360] : []),
  ...(showAnalog.value ? [(baseHue.value + 30) % 360, (baseHue.value - 30 + 360) % 360] : []),
  ...(showTriad.value ? [(baseHue.value + 120) % 360, (baseHue.value + 240) % 360] : []),
]);
function polarX(h: number, r: number) {
  const a = ((h - 90) * Math.PI) / 180;
  return Math.cos(a) * r;
}
function polarY(h: number, r: number) {
  const a = ((h - 90) * Math.PI) / 180;
  return Math.sin(a) * r;
}
function arcPath(start: number, end: number, r0: number, r1: number) {
  const a0 = ((start - 90) * Math.PI) / 180,
    a1 = ((end - 90) * Math.PI) / 180;
  const x0 = Math.cos(a0) * r0,
    y0 = Math.sin(a0) * r0;
  const x1 = Math.cos(a1) * r0,
    y1 = Math.sin(a1) * r0;
  const X0 = Math.cos(a0) * r1,
    Y0 = Math.sin(a0) * r1;
  const X1 = Math.cos(a1) * r1,
    Y1 = Math.sin(a1) * r1;
  const large = end - start > 180 ? 1 : 0;
  return `M ${x0} ${y0} L ${X0} ${Y0} A ${r1} ${r1} 0 ${large} 1 ${X1} ${Y1} L ${x1} ${y1} A ${r0} ${r0} 0 ${large} 0 ${x0} ${y0} Z`;
}
// UI toggles and no-effect detection
const showComp = ref(true);
const showAnalog = ref(true);
const showTriad = ref(true);
const showTicks = ref(false);
const noEffect = computed(() => {
  if (baseHsl.value.s * 100 < 8) return true; // near-neutral saturation
  // analogous collapsing detection
  const a = analogous.value;
  const uniq = new Set(a.map(x => x.toLowerCase()));
  return uniq.size <= 2 && !showComp.value && !showTriad.value;
});

// Click to pick nearest hue from wheel segments
function onWheelClick(evt: MouseEvent, which: 'A' | 'B' | 'C') {
  const svg = evt.currentTarget as SVGSVGElement | null;
  if (!svg || !props.palette.length) return;
  const rect = svg.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = evt.clientX - cx;
  const dy = evt.clientY - cy;
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI + 90; // reverse of polar helper
  const hue = (ang + 360) % 360;
  // find nearest palette color by hue distance
  let best = 0;
  let bestDist = 1e9;
  for (let i = 0; i < props.palette.length; i++) {
    const h = hexToHsl(props.palette[i].hex).h;
    let d = Math.abs(h - hue);
    d = Math.min(d, 360 - d);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  if (which === 'A') srcIndexA.value = best;
  else if (which === 'B') srcIndexB.value = best;
  else srcIndexC.value = best;
}

// Helper function to check if two hues have a harmony relationship
function isHarmonyRelated(h1: number, h2: number, targetDiff: number): boolean {
  let diff = Math.abs(h1 - h2);
  if (diff > 180) diff = 360 - diff;
  // Allow some tolerance (±15°) for the relationship
  return Math.abs(diff - targetDiff) <= 15;
}
</script>
<style scoped lang="scss">
.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin: 0.25rem 0 0.5rem;
  color: var(--dracula-comment);
}
.t {
  margin: 0 0 0.5rem;
}
.wheels {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
  justify-items: center;
}
.wheel {
  display: flex;
  justify-content: center;
}
.pin {
  stroke: var(--surface-border);
  stroke-width: 1.5;
}
.pin.sec {
  opacity: 0.85;
}
.tick {
  stroke: var(--surface-border);
  stroke-width: 1;
  opacity: 0.7;
}
.tick-txt {
  font-size: 9px;
  fill: var(--dracula-foreground);
  text-anchor: middle;
  dominant-baseline: middle;
  opacity: 0.65;
}
.row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}
.card {
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  padding: 0.75rem;
}
.swatches {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-wrap: wrap;
}
.sw {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid var(--surface-border);
}
.swl {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--surface-primary);
  border: 1px solid var(--surface-border);
  padding: 0.2rem 0.4rem;
  border-radius: 999px;
}
.lb {
  font-size: 0.8rem;
  opacity: 0.85;
}
.empty {
  color: var(--dracula-comment);
}
.chords {
  margin-top: 0.5rem;
  text-align: center;
}
.ch {
  stroke-width: 2;
  opacity: 0.5;
  animation: chordPulse 2s ease-in-out infinite;
  
  &.comp {
    stroke: var(--dracula-pink);
  }
  
  &.analog {
    stroke: var(--dracula-cyan);
  }
  
  &.triad {
    stroke: var(--dracula-purple);
  }
}
.source-pin {
  stroke: var(--dracula-foreground);
  stroke-width: 2;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5));
}
@keyframes chordPulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.7;
  }
}
.note {
  font-size: 0.85rem;
  opacity: 0.8;
  margin: 0.25rem 0 0;
  
  .comp-label {
    color: var(--dracula-pink);
    font-weight: 600;
  }
  
  .analog-label {
    color: var(--dracula-cyan);
    font-weight: 600;
  }
  
  .triad-label {
    color: var(--dracula-purple);
    font-weight: 600;
  }
}
@media (max-width: 900px) {
  .row {
    grid-template-columns: 1fr;
  }
  .wheels {
    grid-template-columns: 1fr;
  }
}
</style>
