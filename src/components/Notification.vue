<template>
  <div
    v-if="show"
    class="notification"
    :class="type"
  >
    {{ message }}
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  duration: 2000,
});

const show = ref(true);

watch(
  () => props.message,
  () => {
    show.value = true;
    if (props.duration > 0) {
      setTimeout(() => {
        show.value = false;
      }, props.duration);
    }
  }
);
</script>

<style lang="scss" scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  color: var(--dracula-foreground);
  font-weight: 500;
  z-index: 1000;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  &.success {
    background: var(--dracula-green);
    color: var(--dracula-background);
  }

  &.error {
    background: var(--dracula-red);
    color: var(--dracula-background);
  }

  &.info {
    background: var(--dracula-cyan);
    color: var(--dracula-background);
  }
}
</style>
