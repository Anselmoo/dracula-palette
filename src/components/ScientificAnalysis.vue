<template>
  <section class="sci-analysis">
    <header class="head">
      <h2 class="title">Scientific Color Analysis</h2>
      <p class="desc">
        Deep-dive tools for palette quality, accessibility, gradients, and relationships.
      </p>
    </header>

    <SnapshotCard
      v-if="hasAnyData"
      :standards="analysisStandards"
      :sources="analysisSources"
      :insights="analysisInsights"
      :swatches="snapshotSwatches"
    />

    <div
      class="tab-cards"
      role="tablist"
      aria-label="Scientific analysis sections"
      @keydown="onTabsKeydown"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="card-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
        :title="tab.tooltip"
        type="button"
        role="tab"
        :id="`tab-${tab.id}`"
        :aria-controls="`panel-${tab.id}`"
        :aria-selected="activeTab === tab.id ? 'true' : 'false'"
        :tabindex="activeTab === tab.id ? 0 : -1"
      >
        <div class="card-tab__icon"><Icon :name="tab.icon" size="20" /></div>
        <div class="card-tab__body">
          <div class="card-tab__title">{{ tab.label }}</div>
          <div class="card-tab__hint">{{ tab.tooltip }}</div>
        </div>
      </button>
    </div>

    <div class="content">
      <!-- Middle-layer: global color selection for panels that accept a palette -->
      <div
        v-if="availableColors.length"
        class="selector"
        role="region"
        aria-label="Color selection"
      >
        <div class="selector__bar">
          <div class="selector__info">
            <strong>{{ selectedCount }}</strong> selected of {{ availableColors.length }}
            <span class="selector__hint" v-if="!showSelectorGrid"
              >Hidden - click "Show selection" to adjust</span
            >
          </div>
          <div class="selector__actions">
            <button
              type="button"
              class="btn"
              @click="showSelectorGrid = !showSelectorGrid"
              :aria-expanded="showSelectorGrid ? 'true' : 'false'"
            >
              {{ showSelectorGrid ? 'Hide selection' : 'Show selection' }}
            </button>
            <button
              type="button"
              class="btn"
              @click="selectAll"
              :disabled="selectedCount === availableColors.length"
            >
              Select all
            </button>
            <button
              type="button"
              class="btn"
              @click="clearSelection"
              :disabled="selectedCount === 0"
            >
              Clear
            </button>
            <button
              type="button"
              class="btn"
              @click="invertSelection"
              :disabled="availableColors.length === 0"
            >
              Invert
            </button>
          </div>
        </div>
        <div
          v-show="showSelectorGrid"
          class="selector__grid"
          role="listbox"
          aria-multiselectable="true"
        >
          <button
            v-for="c in availableColors"
            :key="c.hex"
            type="button"
            class="chip"
            :class="{ active: isSelected(c.hex) }"
            :title="c.name || c.hex"
            role="option"
            :aria-selected="isSelected(c.hex) ? 'true' : 'false'"
            @click="toggleSelect(c.hex)"
          >
            <span class="sw" :style="{ background: c.hex }" aria-hidden="true" />
            <span class="nm">{{ c.name || c.hex }}</span>
          </button>
        </div>
      </div>

      <section
        v-show="activeTab === 'contrast'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-contrast'"
        :id="'panel-contrast'"
      >
        <MatrixAdvanced :backgrounds="matrixBackgrounds" :accents="matrixAccents" />
        <ContrastTriangle class="mt" :palette="allColorsForTriangle" />
      </section>

      <section
        v-show="activeTab === 'gradients'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-gradients'"
        :id="'panel-gradients'"
      >
        <GradientLab :palette="selectedPalette" />
      </section>

      <section
        v-show="activeTab === 'advancedGradients'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-advancedGradients'"
        :id="'panel-advancedGradients'"
      >
        <AdvancedGradientExplore :palette="selectedPalette" />
      </section>

      <section
        v-show="activeTab === 'accessibility'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-accessibility'"
        :id="'panel-accessibility'"
      >
        <AccessibilityPanel :backgrounds="matrixBackgrounds" :accents="matrixAccents" />
      </section>

      <section
        v-show="activeTab === 'relations'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-relations'"
        :id="'panel-relations'"
      >
        <RelationshipIcons class="mt" :palette="selectedPalette" />
      </section>

      <section
        v-show="activeTab === 'polygon'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-polygon'"
        :id="'panel-polygon'"
      >
        <ContrastPolygon :palette="selectedPalette" />
      </section>

      <section
        v-show="activeTab === 'harmony'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-harmony'"
        :id="'panel-harmony'"
      >
        <HarmonyPanel :palette="selectedPalette" />
      </section>

      <section
        v-show="activeTab === 'temperature'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-temperature'"
        :id="'panel-temperature'"
      >
        <TemperaturePanel :palette="selectedPalette" />
      </section>

      <section
        v-show="activeTab === 'mixing'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-mixing'"
        :id="'panel-mixing'"
      >
        <MixingPanel :palette="selectedPalette" />
      </section>

      <!-- Feature-specific panels (formerly experimental) -->
      <section
        v-show="activeTab === 'hueSpiral'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-hueSpiral'"
        :id="'panel-hueSpiral'"
      >
        <HueSpiral :palette="selectedPalette" />
      </section>
      <section
        v-show="activeTab === 'brandGravity'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-brandGravity'"
        :id="'panel-brandGravity'"
      >
        <BrandGravity :palette="selectedPalette" />
      </section>
      <section
        v-show="activeTab === 'autoTint'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-autoTint'"
        :id="'panel-autoTint'"
      >
        <AutoTintSteps :palette="selectedPalette" />
      </section>
      <section
        v-show="activeTab === 'focusFinder'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-focusFinder'"
        :id="'panel-focusFinder'"
      >
        <FocusColorFinder :palette="selectedPalette" />
      </section>
      <section
        v-show="activeTab === 'permutationHunter'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-permutationHunter'"
        :id="'panel-permutationHunter'"
      >
        <PermutationHunter :palette="selectedPalette" />
      </section>
      <section
        v-show="activeTab === 'balanceIndex'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-balanceIndex'"
        :id="'panel-balanceIndex'"
      >
        <BalanceIndex :palette="selectedPalette" />
      </section>
      <section
        v-show="activeTab === 'drift'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-drift'"
        :id="'panel-drift'"
      >
        <DarkLightDrift :palette="selectedPalette" />
      </section>
      <section
        v-show="activeTab === 'geneticMixer'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-geneticMixer'"
        :id="'panel-geneticMixer'"
      >
        <GeneticMixer :palette="selectedPalette" />
      </section>
      <section
        v-show="activeTab === 'glass'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-glass'"
        :id="'panel-glass'"
      >
        <GlassmorphismReadability :palette="selectedPalette" />
      </section>
      <section
        v-show="activeTab === 'tokenAudit'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-tokenAudit'"
        :id="'panel-tokenAudit'"
      >
        <UITokenAudit :palette="selectedPalette" />
      </section>
      <section
        v-show="activeTab === 'ipsum'"
        class="panel"
        role="tabpanel"
        :aria-labelledby="'tab-ipsum'"
        :id="'panel-ipsum'"
      >
        <LoremIpsumAnalyzer
          :palette="selectedPalette"
          :backgrounds="matrixBackgrounds"
          :accents="matrixAccents"
        />
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, type ComputedRef } from 'vue';
import { useTheme } from '../composables/useTheme';
import type { DraculaColor } from '../types/color';
import type { PaletteAnalysisPayload, PaletteStandard, PaletteSourceColor } from '../types/palette';

// New modular sub-panels
import SnapshotCard from './analysis/SnapshotCard.vue';
import GradientLab from './analysis/GradientLab.vue';
import AdvancedGradientExplore from './analysis/AdvancedGradientExplore.vue';
import AccessibilityPanel from './analysis/AccessibilityPanel.vue';
import HarmonyPanel from './analysis/HarmonyPanel.vue';
import RelationshipIcons from './analysis/RelationshipIcons.vue';
import ContrastPolygon from './analysis/ContrastPolygon.vue';
import MatrixAdvanced from './analysis/MatrixAdvanced.vue';
import ContrastTriangle from './analysis/ContrastTriangle.vue';
import TemperaturePanel from './analysis/TemperaturePanel.vue';
import MixingPanel from './analysis/MixingPanel.vue';
// Feature panels (promoted)
import HueSpiral from './analysis/HueSpiral.vue';
import BrandGravity from './analysis/BrandGravity.vue';
import AutoTintSteps from './analysis/AutoTintSteps.vue';
import FocusColorFinder from './analysis/FocusColorFinder.vue';
import PermutationHunter from './analysis/PermutationHunter.vue';
import BalanceIndex from './analysis/BalanceIndex.vue';
import DarkLightDrift from './analysis/DarkLightDrift.vue';
import GeneticMixer from './analysis/GeneticMixer.vue';
import GlassmorphismReadability from './analysis/GlassmorphismReadability.vue';
import UITokenAudit from './analysis/UITokenAudit.vue';
import LoremIpsumAnalyzer from './analysis/LoremIpsumAnalyzer.vue';
import Icon from './Icon.vue';

interface Props {
  analysis?: PaletteAnalysisPayload | null;
}

const props = defineProps<Props>();
defineEmits<{ (_e: 'notification', _message: string, _type: 'success' | 'error'): void }>();

const { currentColors, currentTheme } = useTheme();

const activeTab = ref<
  | 'contrast'
  | 'gradients'
  | 'advancedGradients'
  | 'accessibility'
  | 'relations'
  | 'polygon'
  | 'harmony'
  | 'temperature'
  | 'mixing'
  | 'hueSpiral'
  | 'brandGravity'
  | 'autoTint'
  | 'focusFinder'
  | 'permutationHunter'
  | 'balanceIndex'
  | 'drift'
  | 'geneticMixer'
  | 'glass'
  | 'tokenAudit'
  | 'ipsum'
>('contrast');

const tabs = [
  { id: 'contrast', icon: 'contrast', label: 'Contrast', tooltip: 'Matrix + triangle; scrollable' },
  {
    id: 'gradients',
    icon: 'gradients',
    label: 'Gradients',
    tooltip: 'Linear/Radial/Conic + steps',
  },
  {
    id: 'advancedGradients',
    icon: 'gradients',
    label: 'Advanced Gradient',
    tooltip: 'Bubbles, Aurora, Mesh, Plasma, etc.',
  },
  { id: 'accessibility', icon: 'accessibility', label: 'Accessibility', tooltip: 'WCAG checks' },
  { id: 'relations', icon: 'relations', label: 'Relations', tooltip: 'Cycle map + icons' },
  {
    id: 'polygon',
    icon: 'network',
    label: 'Polygon',
    tooltip: 'Interactive contrast polygon visualization',
  },
  { id: 'harmony', icon: 'harmony', label: 'Harmony', tooltip: 'Analogous, triadic, etc.' },
  { id: 'temperature', icon: 'temperature', label: 'Temperature', tooltip: 'Warm vs cool balance' },
  { id: 'mixing', icon: 'mixing', label: 'Mixing', tooltip: 'Blend colors and generate steps' },
  {
    id: 'hueSpiral',
    icon: 'spiral',
    label: 'Hue Spiral',
    tooltip: 'Visualize palette along hue spiral',
  },
  {
    id: 'brandGravity',
    icon: 'compass',
    label: 'Brand Gravity',
    tooltip: 'Rank accents by AA pass-rate',
  },
  { id: 'autoTint', icon: 'wand', label: 'Auto Tint Steps', tooltip: 'Generate even tint ramps' },
  { id: 'focusFinder', icon: 'target', label: 'Focus Finder', tooltip: 'Pick best CTA color' },
  {
    id: 'permutationHunter',
    icon: 'shuffle',
    label: 'Permutation Hunter',
    tooltip: 'Top background×accent pairs',
  },
  {
    id: 'balanceIndex',
    icon: 'scale',
    label: 'Balance Index',
    tooltip: 'Warm/cool and vivid/muted symmetry',
  },
  { id: 'drift', icon: 'drift', label: 'Dark/Light Drift', tooltip: 'Role drift between modes' },
  {
    id: 'geneticMixer',
    icon: 'dna',
    label: 'Genetic Mixer',
    tooltip: 'Evolve blends to constraints',
  },
  {
    id: 'glass',
    icon: 'glass',
    label: 'Glass Readability',
    tooltip: 'Backdrop/blur readability checks',
  },
  {
    id: 'tokenAudit',
    icon: 'puzzle',
    label: 'UI Token Audit',
    tooltip: 'Map palette to tokens/gaps',
  },
  { id: 'ipsum', icon: 'text', label: 'Lorem Ipsum', tooltip: 'Generate sample text + stats' },
] as const;

const onTabsKeydown = (e: KeyboardEvent) => {
  const order = tabs.map(t => t.id);
  const idx = order.indexOf(activeTab.value);
  if (e.key === 'ArrowRight') {
    const next = (idx + 1) % order.length;
    activeTab.value = order[next] as typeof activeTab.value;
    e.preventDefault();
  } else if (e.key === 'ArrowLeft') {
    const prev = (idx - 1 + order.length) % order.length;
    activeTab.value = order[prev] as typeof activeTab.value;
    e.preventDefault();
  } else if (e.key === 'Home') {
    activeTab.value = order[0] as typeof activeTab.value;
    e.preventDefault();
  } else if (e.key === 'End') {
    activeTab.value = order[order.length - 1] as typeof activeTab.value;
    e.preventDefault();
  }
};

interface AnalysisColor {
  hex: string;
  name: string;
  usage?: 'surface' | 'on-surface' | 'primary' | 'secondary' | 'accent' | 'neutral';
  origin?: string;
  standard?: PaletteStandard;
  lightness?: number;
  chroma?: number;
}

const mapThemeColor = (color: DraculaColor, usage: AnalysisColor['usage']): AnalysisColor => ({
  hex: color.hex,
  name: color.name,
  usage,
});

const analysisPaletteColors = computed<AnalysisColor[]>(() => {
  if (!props.analysis?.palettes?.length) return [];
  const colorMap = new Map<string, AnalysisColor>();
  props.analysis.palettes.forEach(palette => {
    palette.colors.forEach(color => {
      const key = color.hex.toLowerCase();
      if (!colorMap.has(key)) {
        colorMap.set(key, {
          hex: color.hex,
          name: color.name,
          usage: color.usage,
          lightness: color.lightness,
          chroma: color.chroma,
          origin: palette.name,
          standard: palette.standard,
        });
      }
    });
  });
  props.analysis.sources?.forEach(source => {
    const key = source.hex.toLowerCase();
    if (!colorMap.has(key)) {
      colorMap.set(key, {
        hex: source.hex,
        name: source.name,
        usage: 'accent',
        origin: source.origin,
      });
    }
  });
  return Array.from(colorMap.values());
});

const themeBackgrounds = computed(() =>
  currentColors.value
    .filter(color => color.category === 'background')
    .map(color => mapThemeColor(color, 'surface'))
);

const themeAccents = computed(() =>
  currentColors.value
    .filter(color => color.category === 'accent')
    .map(color => mapThemeColor(color, 'accent'))
);

// Prefer Alucard (light) role pairing when the theme is 'alucard'.
// Backgrounds come from theme role 'background' or analysis "surface/neutral".
const analysisBackgrounds = computed(() => {
  const backgrounds = analysisPaletteColors.value.filter(
    c => c.usage === 'surface' || c.usage === 'neutral'
  );
  const base = backgrounds.length ? backgrounds : themeBackgrounds.value;
  if (currentTheme.value !== 'alucard') return base;
  // In Alucard (light), prefer only light backgrounds
  const lightnessOf = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    return (max + min) / 2; // HSL L in [0,1]
  };
  const filtered = base.filter(
    c => (typeof c.lightness === 'number' ? c.lightness : lightnessOf(c.hex)) >= 0.6
  );
  return filtered.length ? filtered : base;
});

// Accents include primary/secondary/accent from analysis, else theme accents.
const analysisAccents = computed(() => {
  const accents = analysisPaletteColors.value.filter(
    c => c.usage === 'primary' || c.usage === 'secondary' || c.usage === 'accent'
  );
  const base = accents.length ? accents : themeAccents.value;
  if (currentTheme.value !== 'alucard') return base;
  // In Alucard (light), prefer darker accents suitable for text/icons
  const lightnessOf = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    return (max + min) / 2; // HSL L
  };
  const filtered = base.filter(
    c => (typeof c.lightness === 'number' ? c.lightness : lightnessOf(c.hex)) <= 0.5
  );
  return filtered.length ? filtered : base;
});

const analysisSources = computed<PaletteSourceColor[]>(() => {
  if (!props.analysis?.sources?.length) return [];
  const seen = new Set<string>();
  return props.analysis.sources.filter(source => {
    const key = source.hex.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
});

const analysisStandards = computed(() => props.analysis?.standards ?? []);
const hasAnalysis = computed(() => analysisPaletteColors.value.length > 0);
const hasAnyData = computed(() => hasAnalysis.value || currentColors.value.length > 0);

const analysisInsights = computed(() => {
  if (!analysisPaletteColors.value.length) return null;
  let minLightness = 1;
  let maxLightness = 0;
  let chromaTotal = 0;
  let chromaSamples = 0;
  let vividCount = 0;
  analysisPaletteColors.value.forEach(color => {
    if (typeof color.lightness === 'number') {
      minLightness = Math.min(minLightness, color.lightness);
      maxLightness = Math.max(maxLightness, color.lightness);
    }
    if (typeof color.chroma === 'number') {
      chromaTotal += color.chroma;
      chromaSamples += 1;
      if (color.chroma > 0.12) vividCount += 1;
    }
  });
  if (!chromaSamples && minLightness === 1 && maxLightness === 0) return null;
  return {
    lightnessRange: [Math.round(minLightness * 100), Math.round(maxLightness * 100)] as [
      number,
      number,
    ],
    averageChroma: chromaSamples ? Number((chromaTotal / chromaSamples).toFixed(3)) : null,
    vividShare: chromaSamples ? Math.round((vividCount / chromaSamples) * 100) : null,
    totalColors: analysisPaletteColors.value.length,
  } as const;
});

const snapshotSwatches = computed(() => {
  const fromAnalysis = analysisPaletteColors.value.map(c => c.hex);
  const fromTheme = currentColors.value.map(c => c.hex);
  const unique: string[] = [];
  [...fromAnalysis, ...fromTheme].forEach(h => {
    const k = h.toLowerCase();
    if (!unique.includes(k)) unique.push(k);
  });
  return unique.slice(0, 10);
});

// Alucard-first role pairing: when in light mode, prefer darker text against light backgrounds.
// We surface backgrounds as lighter surfaces, and accents as darker/strong tones for text/UI.
const matrixBackgrounds = computed(() => {
  // In alucard, ensure backgrounds are the light roles by checking hex lightness roughly via oklch if available.
  if (currentTheme.value === 'alucard') {
    // Sort by lightness desc to keep lightest first
    return [...analysisBackgrounds.value].sort((a, b) => (b.lightness ?? 0) - (a.lightness ?? 0));
  }
  return analysisBackgrounds.value;
});

const matrixAccents = computed(() => {
  if (currentTheme.value === 'alucard') {
    // Prefer darker accents first for text on light surfaces
    return [...analysisAccents.value].sort((a, b) => (a.lightness ?? 0) - (b.lightness ?? 0));
  }
  return analysisAccents.value;
});

const allColorsForTriangle = computed(() => {
  const set = new Map<string, { hex: string; name: string }>();
  currentColors.value.forEach(c => set.set(c.hex.toLowerCase(), { hex: c.hex, name: c.name }));
  analysisPaletteColors.value.forEach(c =>
    set.set(c.hex.toLowerCase(), { hex: c.hex, name: c.name })
  );
  return Array.from(set.values());
});

const availableColors = computed(() => allColorsForTriangle.value);

// Global selection layer state
const selectedSet = ref<Set<string>>(new Set());
const showSelectorGrid = ref(true);

// Initialize selection when available colors change: default to all
watch(
  availableColors,
  list => {
    const next = new Set<string>();
    list.forEach(c => next.add(c.hex.toLowerCase()));
    selectedSet.value = next;
  },
  { immediate: true }
);

function isSelected(hex: string) {
  return selectedSet.value.has(hex.toLowerCase());
}
function toggleSelect(hex: string) {
  const key = hex.toLowerCase();
  const copy = new Set(selectedSet.value);
  if (copy.has(key)) copy.delete(key);
  else copy.add(key);
  selectedSet.value = copy;
}
function selectAll() {
  const all = new Set<string>();
  availableColors.value.forEach(c => all.add(c.hex.toLowerCase()));
  selectedSet.value = all;
}
function clearSelection() {
  selectedSet.value = new Set();
}
function invertSelection() {
  const next = new Set<string>();
  availableColors.value.forEach(c => {
    const k = c.hex.toLowerCase();
    if (!selectedSet.value.has(k)) next.add(k);
  });
  selectedSet.value = next;
}

const selectedPalette = computed(() =>
  availableColors.value.filter(c => selectedSet.value.has(c.hex.toLowerCase()))
) as unknown as ComputedRef<DraculaColor[]>;
const selectedCount = computed(() => selectedSet.value.size);
</script>

<style lang="scss" scoped>
.sci-analysis {
  margin-top: 3rem;
  padding: 2rem;
  background: var(--surface-primary);
  border-radius: 12px;
  border: 1px solid var(--surface-border);
  box-shadow: 0 12px 24px var(--surface-shadow);
}
.head {
  text-align: center;
  margin-bottom: 1.5rem;
}
.title {
  margin: 0 0 0.25rem;
  background: linear-gradient(135deg, var(--dracula-cyan), var(--dracula-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.8rem;
  font-weight: 700;
}
.desc {
  opacity: 0.8;
}
/* Card selector */
.tab-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 1rem 0 1.25rem;
}
.card-tab {
  background: var(--surface-secondary);
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  padding: 0.9rem 0.9rem;
  text-align: left;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  color: var(--dracula-foreground);
  cursor: pointer;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    border-color 0.12s ease,
    background-color 0.12s ease;
}
.card-tab:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px var(--surface-shadow);
}
.card-tab:focus-visible {
  outline: 2px solid var(--dracula-cyan);
  outline-offset: 2px;
}
.card-tab.active {
  border-color: var(--dracula-purple);
  box-shadow: 0 8px 16px var(--surface-shadow);
  background: color-mix(in oklab, var(--surface-secondary) 90%, var(--dracula-purple));
}
.card-tab__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--dracula-purple);
}
.card-tab__title {
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1.1;
}
.card-tab__hint {
  opacity: 0.7;
  font-size: 0.8rem;
  line-height: 1.1;
}
@media (max-width: 1100px) {
  .tab-cards {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .tab-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 520px) {
  .tab-cards {
    grid-template-columns: 1fr;
  }
}
/* .emoji removed */
.content {
  min-height: 420px;
}
.panel {
  animation: fadeIn 0.24s ease-in-out;
}
.mt {
  margin-top: 1.5rem;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Selection layer */
.selector {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  background: var(--surface-secondary);
}
.selector__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}
.selector__info {
  color: var(--dracula-comment);
}
.selector__actions {
  display: flex;
  gap: 0.5rem;
}
.selector__hint {
  margin-left: 0.5rem;
  font-size: 0.85rem;
  opacity: 0.8;
}
.btn {
  appearance: none;
  background: var(--surface-primary);
  color: var(--dracula-foreground);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 0.35rem 0.6rem;
  font-size: 0.9rem;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.5;
  cursor: default;
}
.selector__grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.5rem;
}
.chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--surface-border);
  background: var(--surface-primary);
  color: var(--dracula-foreground);
  cursor: pointer;
  text-align: left;
}
.chip:hover {
  box-shadow: 0 4px 10px var(--surface-shadow);
}
.chip.active {
  outline: 2px solid var(--dracula-purple);
  outline-offset: 0;
}
.sw {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid var(--surface-border);
}
.nm {
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media (max-width: 1200px) {
  .selector__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (max-width: 700px) {
  .selector__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
