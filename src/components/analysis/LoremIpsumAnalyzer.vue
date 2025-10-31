<template>
  <section class="ipsum">
    <h3 class="t"><Icon name="text" /><span>Lorem Ipsum Analyzer</span></h3>
    <div class="controls">
      <label><input type="checkbox" v-model="useMatrix" /> Use matrix backgrounds/accents</label>
      <label
        >Variant
        <select v-model="variant">
          <option v-for="v in variants" :key="v.key" :value="v.key">{{ v.label }}</option>
        </select>
      </label>
      <label
        >Paragraphs
        <input type="number" v-model.number="paras" min="1" max="8" />
      </label>
      <label
        >Length
        <select v-model="length">
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="long">Long</option>
          <option value="custom">Custom</option>
        </select>
      </label>
      <label v-if="length === 'custom'"
        >Custom Length (words)
        <input type="number" v-model.number="customWordCount" min="5" max="500" />
      </label>
    </div>
    <div class="color-controls">
      <label
        >Heading Color
        <select v-model="selectedHeadingColor">
          <option value="">Auto (from palette)</option>
          <option v-for="c in availableColors" :key="c.hex" :value="c.hex">
            {{ c.name || c.hex }}
          </option>
        </select>
      </label>
      <label
        >Strong Color
        <select v-model="selectedStrongColor">
          <option value="">Auto (from palette)</option>
          <option v-for="c in availableColors" :key="c.hex" :value="c.hex">
            {{ c.name || c.hex }}
          </option>
        </select>
      </label>
      <label
        >Emphasis Color
        <select v-model="selectedEmphasisColor">
          <option value="">Auto (from palette)</option>
          <option v-for="c in availableColors" :key="c.hex" :value="c.hex">
            {{ c.name || c.hex }}
          </option>
        </select>
      </label>
      <label
        >Code Color
        <select v-model="selectedCodeColor">
          <option value="">Auto (from palette)</option>
          <option v-for="c in availableColors" :key="c.hex" :value="c.hex">
            {{ c.name || c.hex }}
          </option>
        </select>
      </label>
      <label
        >Background Color
        <select v-model="selectedBackgroundColor">
          <option value="">Auto (from palette)</option>
          <option v-for="c in availableColors" :key="c.hex" :value="c.hex">
            {{ c.name || c.hex }}
          </option>
        </select>
      </label>
      <label
        >Border Color
        <select v-model="selectedBorderColor">
          <option value="">Auto (from palette)</option>
          <option v-for="c in availableColors" :key="c.hex" :value="c.hex">
            {{ c.name || c.hex }}
          </option>
        </select>
      </label>
    </div>
    <div class="stats">
      <span>Words: {{ wordCount }}</span>
      <span>Chars: {{ charCount }}</span>
      <span>Avg words/para: {{ avgWords.toFixed(1) }}</span>
    </div>
    <div class="preview" :class="length" :style="previewStyle">
      <h4 class="hdr">Sample Heading</h4>
      <p v-for="(p, i) in generated" :key="i">
        <strong>{{ p.split(' ').slice(0, 3).join(' ') }}</strong>
        <em> {{ p.split(' ').slice(3, 7).join(' ') }}</em>
        {{ ' ' + p.split(' ').slice(7).join(' ') }}
      </p>
      <pre class="code"><code>const demo = () => console.log('ipsum');</code></pre>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import Icon from '../Icon.vue';

type Entry = { hex: string; name?: string };
const props = defineProps<{ palette?: Entry[]; backgrounds?: Entry[]; accents?: Entry[] }>();

type VariantKey =
  | 'classic'
  | 'hipster'
  | 'bacon'
  | 'lorem-astro'
  | 'corporate'
  | 'hacker'
  | 'cupcake'
  | 'legal'
  | 'startup';
const variant = ref<VariantKey>('classic');
const paras = ref(2);
const length = ref<'short' | 'medium' | 'long' | 'custom'>('medium');
const customWordCount = ref(50);

// Color selection refs
const selectedHeadingColor = ref('');
const selectedStrongColor = ref('');
const selectedEmphasisColor = ref('');
const selectedCodeColor = ref('');
const selectedBackgroundColor = ref('');
const selectedBorderColor = ref('');

const LOREM: Record<VariantKey, string[]> = {
  classic: [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.',
    'Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris.',
  ],
  hipster: [
    'Taxidermy quinoa biodiesel drinking vinegar, chambray mixtape kombucha vibecession cloud bread poke.',
    'Tbh everyday carry bodega boys tote bag mlkshk vibecation shabby chic ugh DIY hella.',
  ],
  bacon: [
    'Bacon ipsum dolor amet flank bresaola ham hock, tenderloin pancetta turkey alcatra kevin.',
    'Leberkas turducken spare ribs pastrami shankle tail franks ham.',
  ],
  'lorem-astro': [
    'In orbitis caelestis, stellae fulgent et silentia loquuntur; quaerimus colores inter nebulas.',
    'Praesent galaxia spirali, ubi gradientia lucent sicut aurorae boreales.',
  ],
  corporate: [
    'We leverage cross-functional synergies to unlock value and drive customer-centric outcomes at scale.',
    'Our north star is operational excellence with a relentless focus on stakeholder alignment.',
  ],
  hacker: [
    'Segfaults and race conditions lurk; patch the kernel, grep the logs, push to origin main.',
    'Refactor, lint, test: ship. Optimize loops, debounce IO, cache misses, profile hot paths.',
  ],
  cupcake: [
    'Sugar plum marzipan jelly-o dessert tiramisu icing sweet roll lemon drops cupcake.',
    'Macaron cotton candy brownie tart gummies lollipop cheesecake donut.',
  ],
  legal: [
    'Notwithstanding anything to the contrary herein, the foregoing shall survive termination for any reason whatsoever.',
    'Whereas the parties agree to the covenants set forth and duly executed by authorized signatories.',
  ],
  startup: [
    'We are pre-revenue but post-traction; hyperscaling via product-led growth and viral loops.',
    'Iterate fast, talk to users, make something people want, measure what matters.',
  ],
};

function buildParagraph(seed: string, len: 'short' | 'medium' | 'long' | 'custom') {
  const base = seed.split(' ');
  let words: number;
  if (len === 'custom') {
    words = Math.max(5, customWordCount.value);
  } else {
    const mult = len === 'short' ? 0.7 : len === 'long' ? 1.6 : 1.0;
    words = Math.max(6, Math.round(base.length * mult));
  }
  const out: string[] = [];
  let i = 0;
  while (out.length < words) {
    out.push(base[i % base.length]);
    i++;
  }
  const s = out.join(' ');
  return s.endsWith('.') ? s : s + '.';
}

const variants = [
  { key: 'classic', label: 'Classic Lorem' },
  { key: 'hipster', label: 'Hipster Ipsum' },
  { key: 'bacon', label: 'Bacon Ipsum' },
  { key: 'lorem-astro', label: 'Astronomy' },
  { key: 'corporate', label: 'Corporate' },
  { key: 'hacker', label: 'Hacker' },
  { key: 'cupcake', label: 'Cupcake' },
  { key: 'legal', label: 'Legalese' },
  { key: 'startup', label: 'Startup' },
] as const;

const generated = computed(() => {
  const seeds = LOREM[variant.value] ?? LOREM.classic;
  const res: string[] = [];
  for (let i = 0; i < paras.value; i++) {
    res.push(buildParagraph(seeds[i % seeds.length], length.value));
  }
  return res;
});

// Available colors for selection
const availableColors = computed(() => {
  const all = [...(props.palette ?? []), ...(props.backgrounds ?? []), ...(props.accents ?? [])];
  // Deduplicate by hex
  const seen = new Set<string>();
  return all.filter(c => {
    if (seen.has(c.hex)) return false;
    seen.add(c.hex);
    return true;
  });
});

// Derive preview colors from chosen palette if provided
const useMatrix = ref(false);
onMounted(() => {
  const s = localStorage.getItem('ipsum-use-matrix');
  if (s) useMatrix.value = s === '1';
  // Load saved color selections
  const savedHeading = localStorage.getItem('ipsum-heading-color');
  const savedStrong = localStorage.getItem('ipsum-strong-color');
  const savedEmphasis = localStorage.getItem('ipsum-emphasis-color');
  const savedCode = localStorage.getItem('ipsum-code-color');
  const savedBackground = localStorage.getItem('ipsum-background-color');
  const savedBorder = localStorage.getItem('ipsum-border-color');
  if (savedHeading) selectedHeadingColor.value = savedHeading;
  if (savedStrong) selectedStrongColor.value = savedStrong;
  if (savedEmphasis) selectedEmphasisColor.value = savedEmphasis;
  if (savedCode) selectedCodeColor.value = savedCode;
  if (savedBackground) selectedBackgroundColor.value = savedBackground;
  if (savedBorder) selectedBorderColor.value = savedBorder;
});
watch(useMatrix, v => localStorage.setItem('ipsum-use-matrix', v ? '1' : '0'));
watch(selectedHeadingColor, v => localStorage.setItem('ipsum-heading-color', v));
watch(selectedStrongColor, v => localStorage.setItem('ipsum-strong-color', v));
watch(selectedEmphasisColor, v => localStorage.setItem('ipsum-emphasis-color', v));
watch(selectedCodeColor, v => localStorage.setItem('ipsum-code-color', v));
watch(selectedBackgroundColor, v => localStorage.setItem('ipsum-background-color', v));
watch(selectedBorderColor, v => localStorage.setItem('ipsum-border-color', v));

const previewStyle = computed(() => {
  // Heuristics by name if present
  const byName = (arr: Entry[] | undefined, needle: RegExp) =>
    arr?.find(c => (c.name || '').toLowerCase().match(needle))?.hex;
  const p = useMatrix.value ? (props.accents ?? props.palette ?? []) : (props.palette ?? []);
  const bgp = useMatrix.value ? (props.backgrounds ?? []) : [];

  // Use selected colors if available, otherwise use heuristics
  const h = selectedHeadingColor.value || byName(p, /heading|title|purple|red|brand/) || p[0]?.hex;
  const st = selectedStrongColor.value || byName(p, /strong|bold|pink|accent/) || p[1]?.hex;
  const emc = selectedEmphasisColor.value || byName(p, /em|emphasis|cyan|info/) || p[2]?.hex;
  const code = selectedCodeColor.value || byName(p, /code|green|success/) || p[3]?.hex;
  const surface =
    selectedBackgroundColor.value ||
    byName(bgp, /bg|surface|paper|base/) ||
    bgp[0]?.hex ||
    p[4]?.hex;
  const border =
    selectedBorderColor.value || byName(bgp, /border|line|hairline/) || bgp[1]?.hex || p[5]?.hex;
  const style: Record<string, string> = {};
  if (h) style['--ipsum-hdr'] = h;
  if (st) style['--ipsum-strong'] = st;
  if (emc) style['--ipsum-em'] = emc;
  if (code) style['--ipsum-code'] = code;
  if (surface) style['--ipsum-surface'] = surface;
  if (border) style['--ipsum-border'] = border;
  return style;
});

const wordCount = computed(() => generated.value.join(' ').split(/\s+/).filter(Boolean).length);
const charCount = computed(() => generated.value.join('\n').length);
const avgWords = computed(() =>
  generated.value.length ? wordCount.value / generated.value.length : 0
);
</script>
<style scoped lang="scss">
@use '@/assets/styles/analysis-mixins' as mixins;

.t {
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 0.5rem;

  select {
    @include mixins.analysis-select;
  }

  input[type='checkbox'] {
    @include mixins.analysis-checkbox;
  }
}
.color-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: var(--surface-secondary);
  border-radius: 6px;

  select {
    @include mixins.analysis-select;
  }
}
.color-controls label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}
.stats {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  opacity: 0.85;
  margin-bottom: 0.5rem;
}
.preview {
  border: 1px solid var(--ipsum-border, var(--surface-border));
  border-radius: 10px;
  padding: 0.75rem;
  background: var(--ipsum-surface, var(--surface-primary));
  line-height: 1.6;
}
.preview .hdr {
  margin: 0.25rem 0 0.5rem;
  color: var(--ipsum-hdr, var(--dracula-purple));
}
.preview strong {
  color: var(--ipsum-strong, var(--dracula-pink));
}
.preview em {
  color: var(--ipsum-em, var(--dracula-cyan));
  font-style: italic;
}
.preview .code {
  margin: 0.5rem 0 0;
  padding: 0.5rem;
  background: var(--dracula-current-line);
  border: 1px solid var(--ipsum-border, var(--surface-border));
  border-radius: 6px;
  color: var(--ipsum-code, var(--dracula-green));
  overflow: auto;
}
.preview.short p {
  margin: 0.35rem 0;
}
.preview.medium p {
  margin: 0.5rem 0;
}
.preview.long p {
  margin: 0.75rem 0;
}
</style>
