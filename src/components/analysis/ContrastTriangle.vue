<template>
  <section class="triangle">
    <h3 class="t"><Icon name="contrast" :size="16" /> Contrast Triangle</h3>
    <div class="controls">
      <label class="ctl">
        <input type="checkbox" v-model="underlinesOff" />
        Underlines off (links must differ from text by ≥ 3:1)
      </label>
      <label class="ctl">
        <input type="checkbox" v-model="largeText" />
        Large text (AA18, 3:1 threshold for bg pairs)
      </label>
    </div>
    <div class="rows">
      <div class="row" v-for="pair in pairs" :key="pair.label">
        <span class="lbl">{{ pair.label }}</span>
        <span class="val" :class="cls(pair.ratio)">{{ pair.ratio.toFixed(2) }}:1</span>
        <span class="chip" :class="statusClass(pair.label)">{{ statusText(pair.label) }}</span>
      </div>
    </div>
    <p class="hint">
      Rules: Without underlines, Link:Text must be ≥ 3:1. Background pairs must be ≥
      {{ bgThreshold.toFixed(1) }}:1 (AA){{ largeText ? ' for large text' : '' }}.
    </p>
  </section>
</template>
<script setup lang="ts">
// Implements rules aligned with contrast-triangle.com guidance:
// - If underlines are off, Link vs Text >= 3:1
// - Background vs Text and Background vs Link >= 4.5:1 (or 3:1 for large text)
import { computed, ref } from 'vue';
import Icon from '../Icon.vue';
import { contrastRatio } from '../../utils/contrast';

const props = defineProps<{ palette: { hex: string; name?: string }[] }>();
const a = computed(() => props.palette[0]?.hex ?? '#222222');
const b = computed(() => props.palette[1]?.hex ?? '#6f6dfa');
const c = computed(() => props.palette[2]?.hex ?? '#ffffff');

const pairs = computed(() => [
  { label: 'Link:Text', ratio: contrastRatio(b.value, a.value) },
  { label: 'Background:Text', ratio: contrastRatio(c.value, a.value) },
  { label: 'Background:Link', ratio: contrastRatio(c.value, b.value) },
]);

const cls = (r: number) => (r >= 7 ? 'aaa' : r >= 4.5 ? 'aa' : r >= 3 ? 'aa18' : 'fail');

const underlinesOff = ref(true);
const largeText = ref(false);
const bgThreshold = computed(() => (largeText.value ? 3 : 4.5));

function status(label: string) {
  const linkText = pairs.value[0].ratio;
  const bgText = pairs.value[1].ratio;
  const bgLink = pairs.value[2].ratio;
  if (label === 'Link:Text') {
    if (!underlinesOff.value) return { ok: true, text: 'Advisory' };
    return linkText >= 3 ? { ok: true, text: 'Pass' } : { ok: false, text: 'Fail' };
  }
  const th = bgThreshold.value;
  if (label === 'Background:Text') {
    return bgText >= th ? { ok: true, text: 'Pass' } : { ok: false, text: 'Fail' };
  }
  if (label === 'Background:Link') {
    return bgLink >= th ? { ok: true, text: 'Pass' } : { ok: false, text: 'Fail' };
  }
  return { ok: true, text: '' };
}

const statusClass = (label: string) => (status(label).ok ? 'ok' : 'bad');
const statusText = (label: string) => status(label).text;
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
  flex-wrap: wrap;
}
.ctl {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: var(--dracula-comment);
}
.rows {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}
.row {
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.lbl {
  color: var(--dracula-comment);
}
.val {
  font-weight: 600;
}
.chip {
  font-size: 0.8rem;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  border: 1px solid currentColor;
}
.ok {
  color: #2a9d8f;
}
.bad {
  color: #e76f51;
}
.aaa {
  color: #2a9d8f;
}
.aa {
  color: #e9c46a;
}
.aa18 {
  color: #f4a261;
}
.fail {
  color: #e76f51;
}
.hint {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: var(--dracula-comment);
}
@media (max-width: 900px) {
  .rows {
    grid-template-columns: 1fr;
  }
}
</style>
