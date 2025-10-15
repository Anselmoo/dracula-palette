<template>
  <svg
    :width="sizePx"
    :height="sizePx"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    class="icon"
    role="img"
  >
    <g v-if="path" v-html="path" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{ name: string; size?: number | string }>(), {
  size: 18,
});

const sizePx = computed(() => (typeof props.size === 'number' ? `${props.size}` : props.size));

// Minimal inline SVG paths (original, simple geometry)
const ICONS: Record<string, string> = {
  // Navigation icons
  contrast:
    '<path d="M3 4h8v8H3z"/><path d="M13 4h8v5h-8z"/><path d="M13 11h8v6h-8z" opacity=".6"/><path d="M3 14h8v3H3z" opacity=".6"/>',
  gradients:
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity="1"/><stop offset="100%" stop-color="currentColor" stop-opacity=".2"/></linearGradient></defs><rect x="3" y="5" width="18" height="14" rx="3" ry="3" fill="url(#g)" stroke="currentColor" stroke-width="1"/>',
  accessibility:
    '<path d="M12 3a2 2 0 110 4 2 2 0 010-4z"/><path d="M4 9h16l-1 2-5 1v7h-4v-7l-5-1z"/>',
  relations:
    '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M8 7l4 9M16 7l-4 9M8 6h8" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  harmony:
    '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 3v18M3 12h18" stroke="currentColor" stroke-width="1.5"/>',
  temperature:
    '<path d="M10 5a2 2 0 114 0v6.5a4 4 0 11-4 0V5z"/><path d="M12 7v8" stroke="currentColor" stroke-width="1.5"/>',
  mixing:
    '<path d="M7 3h10l-5 9z"/><circle cx="9" cy="16" r="3" opacity=".6"/><circle cx="15" cy="16" r="3"/>',
  ideas:
    '<path d="M12 3a6 6 0 016 6c0 2.3-1.3 4-3 5v2H9v-2c-1.7-1-3-2.7-3-5a6 6 0 016-6z"/><rect x="9" y="18" width="6" height="2" rx="1"/>',

  // Theme icons
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  moon: '<path d="M15 2a9 9 0 100 20 8 8 0 01-8-8 8 8 0 008-12z"/>',

  // Experimental cards
  glass:
    '<rect x="4" y="5" width="16" height="14" rx="2" ry="2" fill="none" stroke="currentColor"/><path d="M6 7h12" stroke="currentColor" opacity=".5"/><path d="M8 10h6" stroke="currentColor" opacity=".5"/>',
  compass:
    '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor"/><path d="M14.5 9.5l-3 6-4-2 7-4z"/>',
  spiral:
    '<path d="M12 5a7 7 0 100 14 3 3 0 100-6 1 1 0 110-2 5 5 0 110 10" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  shuffle:
    '<path d="M4 18h4l8-12h4" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M16 6h4v4" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M4 6h4l3 4" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M16 14h4v4" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  scale:
    '<path d="M12 5v14" stroke="currentColor" stroke-width="1.5"/><path d="M6 9l-3 3h6l-3-3zM18 9l-3 3h6l-3-3z"/>',
  wand: '<rect x="4" y="15" width="10" height="2" transform="rotate(-30 4 15)"/><path d="M16 5l1 2M19 7l-2 1M18 3l1 2" stroke="currentColor" stroke-width="1.5"/>',
  target:
    '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor"/>',
  drift:
    '<path d="M7 6a5 5 0 109 4 4 4 0 11-9-4z"/><path d="M5 19l14-14" stroke="currentColor" stroke-width="1.5"/>',
  dna: '<path d="M7 5c3 4 7 4 10 0M7 19c3-4 7-4 10 0" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8 8h8M8 16h8" stroke="currentColor"/>',
  puzzle: '<path d="M9 3h3a2 2 0 012 2v2h2a2 2 0 012 2v3h-3a2 2 0 01-2-2v-1h-1a2 2 0 01-2-2V3z"/>',
  text: '<path d="M4 6h16v2H13v10h-2V8H4z"/>',
  network:
    '<circle cx="12" cy="12" r="2"/><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M10 11L8 8M14 11l2-2M10 13l-2 3M14 13l2 3" stroke="currentColor" stroke-width="1.5" fill="none"/>',
};

const path = computed(() => ICONS[props.name] ?? '');
</script>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
