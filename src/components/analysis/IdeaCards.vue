<template>
  <section class="ideas">
    <h3 class="t">
      <Icon name="ideas" />
      <span>Experimental Analyses</span>
    </h3>
    <div class="grid">
      <article
        v-for="card in cards"
        :key="card.id"
        class="card"
        :title="card.tip"
        @click="onClick(card)"
        tabindex="0"
        @keydown.enter.prevent="onClick(card)"
        role="button"
      >
        <header class="h">
          <Icon :name="card.icon" />
          <h4 class="ttl">{{ card.title }}</h4>
        </header>
        <p class="d">{{ card.desc }}</p>
      </article>
    </div>
  </section>
</template>
<script setup lang="ts">
import Icon from '../Icon.vue';
const _props = defineProps<{ palette: { hex: string; name: string }[] }>();
const emit = defineEmits<{
  (
    _e: 'navigate',
    _target: 'contrast' | 'accessibility' | 'harmony' | 'gradients' | 'temperature' | 'mixing'
  ): void;
  (_e: 'select', _key: string): void;
}>();

const cards = [
  {
    id: 1,
    key: 'glass',
    icon: 'glass',
    title: 'Glassmorphism Readability',
    desc: 'Blurred panel contrast checks against background imagery.',
    tip: 'Combine WCAG with backdrop-filter sampling.',
  },
  {
    id: 2,
    key: 'brandGravity',
    icon: 'compass',
    title: 'Brand Gravity',
    desc: 'Find the palette color that pulls the most combinations into AA.',
    tip: 'Rank accents by pass-rate across backgrounds.',
  },
  {
    id: 3,
    key: 'hueSpiral',
    icon: 'spiral',
    title: 'Hue Spiral',
    desc: 'Visualize palette positions along a spiral by hue→lightness.',
    tip: 'Detect gaps or crowding along the path.',
  },
  {
    id: 4,
    key: 'permutationHunter',
    icon: 'shuffle',
    title: 'Permutation Hunter',
    desc: 'Surface top N accent/background pairs by coverage and rating.',
    tip: 'Balance AAA rarity vs AA coverage.',
  },
  {
    id: 5,
    key: 'balanceIndex',
    icon: 'scale',
    title: 'Balance Index',
    desc: 'Score palette for warm/cool and vivid/muted symmetry.',
    tip: 'Use variance across categories.',
  },
  {
    id: 6,
    key: 'autoTint',
    icon: 'wand',
    title: 'Auto Tint Steps',
    desc: 'Suggest consistent 5/7/9-step ramps from any swatch.',
    tip: 'OKLCH lightness stepping for UI states.',
  },
  {
    id: 7,
    key: 'focusFinder',
    icon: 'target',
    title: 'Focus Color Finder',
    desc: 'Pick the best CTA color based on adjacent UI and link contrast.',
    tip: 'Contrast Triangle informed selection.',
  },
  {
    id: 8,
    key: 'drift',
    icon: 'drift',
    title: 'Dark/Light Drift',
    desc: 'Measure drift of roles between Dracula and Alucard modes.',
    tip: 'Quantify delta L* and perceived chroma.',
  },
  {
    id: 9,
    key: 'geneticMixer',
    icon: 'dna',
    title: 'Genetic Mixer',
    desc: 'Evolve blends to hit target contrast and harmony constraints.',
    tip: 'Crossover among candidate mixes.',
  },
  {
    id: 10,
    key: 'tokenAudit',
    icon: 'puzzle',
    title: 'UI Token Audit',
    desc: 'Map palette to tokens (fg/subtle/muted/border/solid) and gaps.',
    tip: 'Export design token suggestions.',
  },
];

function onClick(card: { id: number; key: string }) {
  // Lightweight mapping from experiment to existing panels for now
  if (card.id === 1 || card.id === 2 || card.id === 4 || card.id === 7)
    emit('navigate', 'contrast');
  else if (card.id === 3 || card.id === 5) emit('navigate', 'harmony');
  else if (card.id === 6 || card.id === 9) emit('navigate', 'mixing');
  else if (card.id === 8) emit('navigate', 'temperature');
  else emit('navigate', 'accessibility');
  emit('select', card.key);
}
</script>
<style scoped lang="scss">
.ideas {
  margin-top: 0.5rem;
}
.t {
  margin: 0 0 0.75rem;
  color: var(--dracula-foreground);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}
.card {
  background: var(--surface-secondary);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 0.9rem;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
}
.card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px var(--surface-shadow);
}
.card:focus-visible {
  outline: 2px solid var(--dracula-cyan);
  outline-offset: 3px;
}
.h {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}
.ttl {
  margin: 0;
  font-size: 1rem;
  color: var(--dracula-foreground);
}
.d {
  margin: 0;
  color: var(--dracula-comment);
}
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
