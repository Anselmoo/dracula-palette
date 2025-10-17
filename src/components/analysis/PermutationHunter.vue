<template>
  <section class="permute">
    <h3 class="t"><Icon name="shuffle" /><span>Permutation Hunter</span></h3>
    <div class="controls">
      <label
        >Min ratio
        <input
          type="number"
          v-model.number="minRatio"
          min="1"
          max="21"
          step="0.1"
          aria-label="Minimum contrast ratio"
      /></label>
      <label
        >Max results
        <input
          type="number"
          v-model.number="limit"
          min="5"
          max="100"
          step="5"
          aria-label="Maximum results to show"
      /></label>
      <label><input type="checkbox" v-model="largeText" /> Large text rules</label>
    </div>

    <div
      v-if="pairs.length"
      class="table"
      role="table"
      aria-label="Top background and foreground combinations by contrast"
    >
      <div class="thead" role="row">
        <div class="th" role="columnheader">Sample</div>
        <div class="th" role="columnheader">Background</div>
        <div class="th" role="columnheader">Foreground</div>
        <div class="th" role="columnheader">Ratio</div>
        <div class="th" role="columnheader">Rating</div>
      </div>
      <div v-for="(p, i) in pairs" :key="i" class="tr" role="row">
        <div class="td sample" role="cell">
          <div class="sample-box" :style="{ background: p.bg }">
            <span class="txt" :style="{ color: p.fg }">Aa</span>
          </div>
        </div>
        <div class="td" role="cell">
          <span class="chip" :style="{ background: p.bg }"></span>{{ p.bgName }}
        </div>
        <div class="td" role="cell">
          <span class="chip" :style="{ background: p.fg }"></span>{{ p.fgName }}
        </div>
        <div class="td mono" role="cell">{{ p.ratio.toFixed(2) }}:1</div>
        <div class="td" role="cell">
          <span class="badge" :class="p.rating">{{ p.rating.toUpperCase() }}</span>
        </div>
      </div>
    </div>
    <p v-else class="empty">No combinations meet the threshold.</p>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { contrastRatio, wcagRating } from '../../utils/contrast';
import Icon from '../Icon.vue';

type Entry = { hex: string; name?: string };
const props = defineProps<{ palette: Entry[] }>();

const minRatio = ref(4.5);
const limit = ref(30);
const largeText = ref(false);

const pairs = computed(() => {
  const items = props.palette ?? [];
  const out: {
    bg: string;
    fg: string;
    ratio: number;
    rating: ReturnType<typeof wcagRating>;
    bgName: string;
    fgName: string;
  }[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      if (i === j) continue;
      const bg = items[i];
      const fg = items[j];
      const r = contrastRatio(fg.hex, bg.hex);
      const rating = wcagRating(r, largeText.value);
      if (r >= minRatio.value) {
        out.push({
          bg: bg.hex,
          fg: fg.hex,
          ratio: r,
          rating,
          bgName: bg.name ?? bg.hex,
          fgName: fg.name ?? fg.hex,
        });
      }
    }
  }
  return out.sort((a, b) => b.ratio - a.ratio).slice(0, limit.value);
});
</script>
<style scoped lang="scss">
.t {
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.75rem;
}
.controls label {
  display: flex;
  gap: 0.35rem;
  align-items: center;
  font-size: 0.9rem;
}
.table {
  display: block;
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  overflow: hidden;
}
.thead,
.tr {
  display: grid;
  grid-template-columns: 120px 1fr 1fr 100px 100px;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  align-items: center;
}
.thead {
  background: var(--surface-secondary);
  font-weight: 600;
}
.tr {
  border-top: 1px solid var(--surface-border);
}
.sample-box {
  width: 100px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--surface-border);
}
.txt {
  font-weight: 700;
  font-size: 1rem;
}
.chip {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid var(--surface-border);
  margin-right: 0.4rem;
  vertical-align: middle;
}
.mono {
  font-variant-numeric: tabular-nums;
}
.badge {
  padding: 0.15rem 0.4rem;
  border-radius: 999px;
  font-size: 0.8rem;
  border: 1px solid var(--surface-border);
}
.badge.AAA {
  background: color-mix(in oklab, var(--dracula-green) 15%, transparent);
}
.badge.AA {
  background: color-mix(in oklab, var(--dracula-yellow) 15%, transparent);
}
.badge.fail {
  background: color-mix(in oklab, var(--dracula-red) 15%, transparent);
}
.empty {
  color: var(--dracula-comment);
}
@media (max-width: 720px) {
  .thead,
  .tr {
    grid-template-columns: 1fr 1fr;
  }
  .thead .th:nth-child(n + 3),
  .tr .td:nth-child(n + 3) {
    display: none;
  }
}
</style>
