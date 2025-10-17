<template>
  <section class="matrix-advanced">
    <div class="toolbar">
      <span class="t"><Icon name="contrast" :size="16" /> Contrast Matrix</span>
      <label class="opt"> <input type="checkbox" v-model="showHeatmap" /> Heatmap </label>
    </div>
    <ContrastMatrix :backgrounds="backgrounds" :accents="accents" />
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import ContrastMatrix from '../ContrastMatrix.vue';
import Icon from '../Icon.vue';

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

const showHeatmap = ref(false); // forwarded but not yet used; room for future
</script>
<style scoped lang="scss">
.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.t {
  font-weight: 600;
  color: var(--dracula-foreground);
}
.opt {
  color: var(--dracula-comment);
  font-size: 0.9rem;
}
</style>
