<template>
  <section class="relationship-icons">
    <h3 class="relationship-icons__heading">
      <Icon name="network" />
      <span>Color Relationships</span>
    </h3>
    <p class="relationship-icons__description">
      Visualize how your selected colors relate: proximity, harmony, and contrast.
    </p>
    <!-- Placeholder for relationship graph -->
    <div class="relationship-icons__graph">
      <!-- Future D3 integration -->
      <div
        v-for="(c, i) in palette"
        :key="i"
        class="relationship-icons__node"
        :style="{ backgroundColor: c.hex }"
        :title="`${c.name || 'Color'}: ${c.hex}`"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import Icon from '../Icon.vue';
import type { DraculaColor } from '../../types/color';

interface Props {
  palette: DraculaColor[];
}

defineProps<Props>();
</script>

<style scoped lang="scss">
@use '@/assets/styles/analysis-mixins' as mixins;

.relationship-icons {
  @include mixins.analysis-panel-accent(var(--dracula-purple));
  @include mixins.analysis-animation-fade-in;
}

.relationship-icons__heading {
  @include mixins.analysis-heading;
}

.relationship-icons__description {
  @include mixins.analysis-description;
}

.relationship-icons__graph {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--analysis-card-bg);
  border-radius: var(--radius-md);
  min-height: 100px;
  align-items: center;
  justify-content: center;
}

.relationship-icons__node {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--analysis-swatch-border);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);

  &:hover {
    transform: scale(1.15);
    box-shadow: var(--shadow-md);
  }

  @include mixins.analysis-animation-pulse(3s);
}
</style>
