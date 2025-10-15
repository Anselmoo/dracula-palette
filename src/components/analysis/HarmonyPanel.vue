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
    <div class="color-fan" v-if="palette.length && !noEffect">
      <h4 class="fan-title">Color Harmony Fan</h4>
      <div class="fan-container">
        <svg
          width="100%"
          height="240"
          viewBox="0 0 600 240"
          role="img"
          aria-label="Interactive color harmony fan"
          class="fan-svg"
        >
          <g transform="translate(300, 220)">
            <!-- Generate fan leaves for all hues -->
            <template v-for="i in 24" :key="'leaf' + i">
              <path
                :d="fanLeafPath(i, 24)"
                :fill="getFanColor(i, 24)"
                :class="[
                  'fan-leaf',
                  { active: isFanLeafActive(i, 24), highlight: isFanLeafHighlight(i, 24) },
                ]"
                @click="onFanLeafClick(i, 24)"
                @mouseenter="hoveredLeaf = i"
                @mouseleave="hoveredLeaf = null"
              >
                <title>{{ Math.round(((i - 1) * 180) / 24) }}° - {{ getFanColor(i, 24) }}</title>
              </path>
              <!-- Degree labels on active leaves -->
              <text
                v-if="isFanLeafActive(i, 24) || hoveredLeaf === i"
                :x="getFanLabelX(i, 24)"
                :y="getFanLabelY(i, 24)"
                class="fan-label"
                text-anchor="middle"
              >
                {{ Math.round(((i - 1) * 180) / 24) }}°
              </text>
            </template>
            <!-- Connection lines for harmony relationships -->
            <template v-if="showComp || showAnalog || showTriad">
              <g class="harmony-connections">
                <template v-for="h in [hA, hB, hC]" :key="'conn' + h">
                  <!-- Complementary connection (180°) -->
                  <line
                    v-if="showComp"
                    :x1="getFanConnectionX(h, 180)"
                    :y1="getFanConnectionY(h, 180)"
                    :x2="getFanConnectionX((h + 180) % 360, 180)"
                    :y2="getFanConnectionY((h + 180) % 360, 180)"
                    class="harmony-line comp"
                  />
                  <!-- Analogous connections (±30°) -->
                  <line
                    v-if="showAnalog"
                    :x1="getFanConnectionX(h, 180)"
                    :y1="getFanConnectionY(h, 180)"
                    :x2="getFanConnectionX((h + 30) % 360, 180)"
                    :y2="getFanConnectionY((h + 30) % 360, 180)"
                    class="harmony-line analog"
                  />
                  <line
                    v-if="showAnalog"
                    :x1="getFanConnectionX(h, 180)"
                    :y1="getFanConnectionY(h, 180)"
                    :x2="getFanConnectionX((h - 30 + 360) % 360, 180)"
                    :y2="getFanConnectionY((h - 30 + 360) % 360, 180)"
                    class="harmony-line analog"
                  />
                  <!-- Triadic connections (±120°) -->
                  <line
                    v-if="showTriad"
                    :x1="getFanConnectionX(h, 180)"
                    :y1="getFanConnectionY(h, 180)"
                    :x2="getFanConnectionX((h + 120) % 360, 180)"
                    :y2="getFanConnectionY((h + 120) % 360, 180)"
                    class="harmony-line triad"
                  />
                  <line
                    v-if="showTriad"
                    :x1="getFanConnectionX(h, 180)"
                    :y1="getFanConnectionY(h, 180)"
                    :x2="getFanConnectionX((h + 240) % 360, 180)"
                    :y2="getFanConnectionY((h + 240) % 360, 180)"
                    class="harmony-line triad"
                  />
                </template>
              </g>
            </template>
          </g>
        </svg>
      </div>
      <p class="fan-note">
        Click on fan leaves to select colors. Harmony connections show:
        <span v-if="showComp" class="conn-badge comp">Complementary (180°)</span>
        <span v-if="showAnalog" class="conn-badge analog">Analogous (±30°)</span>
        <span v-if="showTriad" class="conn-badge triad">Triadic (±120°)</span>
      </p>
    </div>
    <p v-else-if="noEffect" class="empty">
      Harmony fan hidden: palette near-neutral or negligible hue separation.
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
const hoveredLeaf = ref<number | null>(null);
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
  return `M ${x0} ${y0} L ${X0} ${Y0} A ${r1} ${r1} 0 0 1 ${X1} ${Y1} L ${x1} ${y1} A ${r0} ${r0} 0 0 0 ${x0} ${y0} Z`;
}

// Fan visualization helpers
function fanLeafPath(leafIndex: number, totalLeaves: number) {
  // Each leaf spans from 0° to 180° range (half circle)
  const anglePerLeaf = 180 / totalLeaves;
  const startAngle = (leafIndex - 1) * anglePerLeaf;
  const endAngle = leafIndex * anglePerLeaf;
  const outerRadius = 200;
  const innerRadius = 40;

  // Convert angles to radians (0° is at bottom, rotating counter-clockwise)
  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;

  const x1 = Math.cos(startRad) * innerRadius;
  const y1 = Math.sin(startRad) * innerRadius;
  const x2 = Math.cos(endRad) * innerRadius;
  const y2 = Math.sin(endRad) * innerRadius;
  const x3 = Math.cos(endRad) * outerRadius;
  const y3 = Math.sin(endRad) * outerRadius;
  const x4 = Math.cos(startRad) * outerRadius;
  const y4 = Math.sin(startRad) * outerRadius;

  return `M ${x1} ${y1} L ${x4} ${y4} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x2} ${y2} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`;
}

function getFanColor(leafIndex: number, totalLeaves: number) {
  const hue = ((leafIndex - 1) * 180) / totalLeaves;
  return `hsl(${hue}, 80%, 50%)`;
}

function isFanLeafActive(leafIndex: number, totalLeaves: number) {
  const leafHue = ((leafIndex - 1) * 180) / totalLeaves;
  const tolerance = 180 / totalLeaves + 2; // Slight tolerance
  return (
    isHueNear(leafHue, hA.value, tolerance) ||
    isHueNear(leafHue, hB.value, tolerance) ||
    isHueNear(leafHue, hC.value, tolerance)
  );
}

function isFanLeafHighlight(leafIndex: number, totalLeaves: number) {
  const leafHue = ((leafIndex - 1) * 180) / totalLeaves;
  const tolerance = 180 / totalLeaves + 2;

  // Check if this leaf matches any harmony relationship
  for (const h of [hA.value, hB.value, hC.value]) {
    if (showComp.value && isHueNear(leafHue, (h + 180) % 360, tolerance)) return true;
    if (
      showAnalog.value &&
      (isHueNear(leafHue, (h + 30) % 360, tolerance) ||
        isHueNear(leafHue, (h - 30 + 360) % 360, tolerance))
    )
      return true;
    if (
      showTriad.value &&
      (isHueNear(leafHue, (h + 120) % 360, tolerance) ||
        isHueNear(leafHue, (h + 240) % 360, tolerance))
    )
      return true;
  }
  return false;
}

function isHueNear(h1: number, h2: number, tolerance: number) {
  let diff = Math.abs(h1 - h2);
  if (diff > 180) diff = 360 - diff;
  return diff <= tolerance;
}

function getFanLabelX(leafIndex: number, totalLeaves: number) {
  const hue = ((leafIndex - 1) * 180) / totalLeaves;
  const angle = ((hue - 90) * Math.PI) / 180;
  return Math.cos(angle) * 160;
}

function getFanLabelY(leafIndex: number, totalLeaves: number) {
  const hue = ((leafIndex - 1) * 180) / totalLeaves;
  const angle = ((hue - 90) * Math.PI) / 180;
  return Math.sin(angle) * 160;
}

function getFanConnectionX(hue: number, radius: number) {
  const angle = ((hue - 90) * Math.PI) / 180;
  return Math.cos(angle) * radius;
}

function getFanConnectionY(hue: number, radius: number) {
  const angle = ((hue - 90) * Math.PI) / 180;
  return Math.sin(angle) * radius;
}

function onFanLeafClick(leafIndex: number, totalLeaves: number) {
  const leafHue = ((leafIndex - 1) * 180) / totalLeaves;

  // Find the color in the palette closest to this hue
  let bestIdx = 0;
  let bestDist = 999;

  for (let i = 0; i < props.palette.length; i++) {
    const { h } = hexToHsl(props.palette[i].hex);
    let d = Math.abs(h - leafHue);
    d = Math.min(d, 360 - d);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }

  // Assign to the next available source (A, B, or C)
  if (!isFanLeafActive(leafIndex, totalLeaves)) {
    // Find which source to update
    const aActive = isFanLeafActive(
      Math.round((hA.value * totalLeaves) / 180) + 1,
      totalLeaves
    );
    const bActive = isFanLeafActive(
      Math.round((hB.value * totalLeaves) / 180) + 1,
      totalLeaves
    );

    if (!aActive) srcIndexA.value = bestIdx;
    else if (!bActive) srcIndexB.value = bestIdx;
    else srcIndexC.value = bestIdx;
  }
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
.color-fan {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--surface-primary);
  border-radius: 12px;
  border: 1px solid var(--surface-border);
}
.fan-title {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: var(--dracula-foreground);
  text-align: center;
}
.fan-container {
  display: flex;
  justify-content: center;
  overflow-x: auto;
}
.fan-svg {
  max-width: 100%;
  height: auto;
}
.fan-leaf {
  cursor: pointer;
  stroke: var(--surface-border);
  stroke-width: 0.5;
  opacity: 0.7;
  transition: all 0.3s ease;

  &:hover {
    opacity: 1;
    stroke-width: 2;
    filter: brightness(1.1);
  }

  &.active {
    opacity: 1;
    stroke: var(--dracula-pink);
    stroke-width: 2.5;
    filter: drop-shadow(0 0 4px rgba(255, 121, 198, 0.6));
  }

  &.highlight {
    opacity: 0.95;
    stroke: var(--dracula-cyan);
    stroke-width: 1.5;
    animation: highlightPulse 2s ease-in-out infinite;
  }
}
@keyframes highlightPulse {
  0%,
  100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.2);
  }
}
.fan-label {
  font-size: 11px;
  font-weight: 600;
  fill: var(--dracula-foreground);
  pointer-events: none;
  text-shadow: 0 0 3px var(--dracula-background);
}
.harmony-connections {
  pointer-events: none;
}
.harmony-line {
  stroke-width: 2;
  opacity: 0.6;
  animation: connectionPulse 2s ease-in-out infinite;

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
@keyframes connectionPulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}
.fan-note {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--dracula-comment);
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}
.conn-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;

  &.comp {
    background: rgba(255, 121, 198, 0.2);
    color: var(--dracula-pink);
    border: 1px solid var(--dracula-pink);
  }

  &.analog {
    background: rgba(139, 233, 253, 0.2);
    color: var(--dracula-cyan);
    border: 1px solid var(--dracula-cyan);
  }

  &.triad {
    background: rgba(189, 147, 249, 0.2);
    color: var(--dracula-purple);
    border: 1px solid var(--dracula-purple);
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
