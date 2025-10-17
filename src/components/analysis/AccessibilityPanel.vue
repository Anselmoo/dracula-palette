<template>
  <section class="access" aria-label="Accessibility">
    <h3 class="t"><Icon name="accessibility" :size="16" /> Accessibility Quick Checks</h3>
    <div class="controls">
      <label><input type="checkbox" v-model="largeText" /> Large text (≥18px/14px bold)</label>
    </div>
    <div class="list">
      <div v-for="bg in backgrounds" :key="bg.hex" class="card">
        <div class="bg" :style="{ background: bg.hex }"></div>
        <div class="pairs">
          <div v-for="fg in accents" :key="bg.hex + fg.hex" class="pair">
            <span class="sw" :style="{ background: fg.hex }" :title="fg.name"></span>
            <span class="ratio">{{ ratio(fg.hex, bg.hex).toFixed(2) }}:1</span>
            <span class="rate" :class="ratingClass(rating(ratio(fg.hex, bg.hex)))">{{
              rating(ratio(fg.hex, bg.hex))
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import Icon from '../Icon.vue';
import { contrastRatio, wcagRating } from '../../utils/contrast';

withDefaults(
  defineProps<{
    backgrounds: { hex: string; name: string }[];
    accents: { hex: string; name: string }[];
  }>(),
  {
    backgrounds: () => [],
    accents: () => [],
  }
);

const largeText = ref(false);
const ratio = (fg: string, bg: string) => contrastRatio(fg, bg);
const rating = (r: number) => wcagRating(r, largeText.value);
const ratingClass = (r: 'AAA' | 'AA' | 'fail') => ({ AAA: 'ok3', AA: 'ok2', fail: 'fail' })[r];
</script>
<style scoped lang="scss">
.t {
  margin: 0 0 0.5rem;
  color: var(--dracula-foreground);
}
.controls {
  color: var(--dracula-comment);
  margin-bottom: 0.5rem;
}
.list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}
.card {
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  overflow: hidden;
}
.bg {
  height: 36px;
  border-bottom: 1px solid var(--surface-border);
}
.pairs {
  padding: 0.5rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}
.pair {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
}
.sw {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid var(--surface-border);
  display: inline-block;
}
.ratio {
  color: var(--dracula-comment);
}
.rate {
  font-weight: 600;
}
.ok3 {
  color: #2a9d8f;
}
.ok2 {
  color: #e9c46a;
}
.fail {
  color: #e76f51;
}
@media (max-width: 900px) {
  .list {
    grid-template-columns: 1fr;
  }
  .pairs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
