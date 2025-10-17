<template>
  <div class="palette-generator">
    <div class="generator-header">
      <h2 class="generator-title">Extended Palette Generator</h2>
      <p class="generator-description">
        Generate comprehensive color palettes using 10 different color standards to expand your
        Dracula theme beyond the basic colors. Select one or multiple base colors.
      </p>
    </div>

    <!-- Quick Preset Buttons -->
    <div class="preset-section">
      <h3>Quick Color Combinations</h3>
      <div class="preset-buttons">
        <button class="preset-btn" @click="generatePreset('red-green')" :disabled="isGenerating">
          <div class="preset-colors">
            <div class="preset-color" :style="{ backgroundColor: officialColors.red.hex }"></div>
            <div class="preset-color" :style="{ backgroundColor: officialColors.green.hex }"></div>
          </div>
          <span>Red & Green</span>
        </button>

        <button class="preset-btn" @click="generatePreset('purple-cyan')" :disabled="isGenerating">
          <div class="preset-colors">
            <div class="preset-color" :style="{ backgroundColor: officialColors.purple.hex }"></div>
            <div class="preset-color" :style="{ backgroundColor: officialColors.cyan.hex }"></div>
          </div>
          <span>Purple & Cyan</span>
        </button>

        <button class="preset-btn" @click="generatePreset('pink-yellow')" :disabled="isGenerating">
          <div class="preset-colors">
            <div class="preset-color" :style="{ backgroundColor: officialColors.pink.hex }"></div>
            <div class="preset-color" :style="{ backgroundColor: officialColors.yellow.hex }"></div>
          </div>
          <span>Pink & Yellow</span>
        </button>

        <button
          class="preset-btn"
          @click="generatePreset('orange-purple')"
          :disabled="isGenerating"
        >
          <div class="preset-colors">
            <div class="preset-color" :style="{ backgroundColor: officialColors.orange.hex }"></div>
            <div class="preset-color" :style="{ backgroundColor: officialColors.purple.hex }"></div>
          </div>
          <span>Orange & Purple</span>
        </button>

        <button class="preset-btn" @click="generatePreset('all-accents')" :disabled="isGenerating">
          <div class="preset-colors">
            <div class="preset-color" :style="{ backgroundColor: officialColors.red.hex }"></div>
            <div class="preset-color" :style="{ backgroundColor: officialColors.green.hex }"></div>
            <div class="preset-color" :style="{ backgroundColor: officialColors.purple.hex }"></div>
            <div class="preset-color" :style="{ backgroundColor: officialColors.pink.hex }"></div>
          </div>
          <span>All Accents</span>
        </button>
      </div>
    </div>

    <!-- Multi-Color Input Section -->
    <div class="multi-color-input">
      <h3>Base Colors</h3>
      <div class="color-inputs-container">
        <div class="official-base-colors">
          <label>Selected Official Colors:</label>
          <div v-if="officialBaseColors.length" class="selected-colors-grid">
            <div v-for="color in officialBaseColors" :key="color.name" class="selected-color-card">
              <div class="color-swatch" :style="{ backgroundColor: color.hex }"></div>
              <div class="color-meta">
                <span class="color-name">{{ color.name }}</span>
                <span class="color-hex">{{ color.hex }}</span>
              </div>
            </div>
          </div>
          <p v-else class="no-selection">
            Select one or more official colors from the palette above to use as base inputs.
          </p>
        </div>

        <div v-if="baseColorSummary" class="base-summary">
          <span class="summary-label">Base selection:</span>
          <span class="summary-value">{{ baseColorSummary }}</span>
        </div>

        <div v-if="selectedColor" class="last-picked-hint">
          <span class="hint-label">Last picked:</span>
          <span class="hint-value">{{ selectedColor.name }} · {{ selectedColor.hex }}</span>
        </div>

        <div class="additional-colors">
          <label>Additional Custom Colors (optional):</label>
          <div class="additional-color-inputs">
            <div
              v-for="(color, index) in additionalColors"
              :key="index"
              class="additional-color-item"
            >
              <input
                v-model="color.value"
                type="text"
                :placeholder="customColorPlaceholder(index)"
                class="additional-color-input"
                @input="validateAdditionalColor(index)"
              />
              <div
                class="additional-color-preview"
                :style="{
                  backgroundColor:
                    color.valid && color.normalized ? color.normalized : 'transparent',
                }"
                :class="{ invalid: !color.valid && color.value }"
              ></div>
              <button
                class="remove-color-btn"
                @click="removeAdditionalColor(index)"
                :disabled="additionalColors.length <= 1"
              >
                ×
              </button>
            </div>
          </div>
          <button
            class="add-color-btn"
            @click="addAdditionalColor"
            :disabled="additionalColors.length >= 5"
          >
            + Add Color
          </button>
        </div>
      </div>
    </div>

    <div class="standard-selector">
      <h3>Select Color Standards</h3>
      <div class="standards-grid">
        <div
          v-for="standard in availableStandards"
          :key="standard.key"
          class="standard-card"
          :class="{ selected: selectedStandards.includes(standard.key) }"
          @click="toggleStandard(standard.key)"
        >
          <div class="standard-header">
            <h4>{{ standard.name }}</h4>
            <div class="standard-badge">
              {{ standard.colorSpace }}
            </div>
          </div>
          <p class="standard-description">
            {{ standard.description }}
          </p>
          <p class="standard-best-for"><strong>Best for:</strong> {{ standard.bestFor }}</p>
        </div>
      </div>
    </div>

    <div class="generation-controls">
      <button
        class="generate-button"
        :disabled="
          getAllValidColors().length === 0 || selectedStandards.length === 0 || isGenerating
        "
        @click="generatePalettes"
      >
        <span v-if="isGenerating">Generating...</span>
        <span v-else>
          Generate from {{ getAllValidColors().length }} Color{{
            getAllValidColors().length !== 1 ? 's' : ''
          }}
          ({{ selectedStandards.length }} Standard{{ selectedStandards.length !== 1 ? 's' : '' }})
        </span>
      </button>

      <div class="quick-actions">
        <button class="quick-button" @click="selectPopularStandards">Popular</button>
        <button class="quick-button" @click="selectScientificStandards">Scientific</button>
        <button class="quick-button" @click="selectWebStandards">Web</button>
        <button class="quick-button" @click="selectArtisticStandards">Artistic</button>
        <button class="quick-button" @click="selectAllStandards">All</button>
        <button class="quick-button" @click="clearStandards">Clear</button>
      </div>
    </div>

    <div v-if="generatedPalettes.length > 0" class="generated-palettes">
      <div class="palettes-header">
        <h3>Generated Palettes</h3>
        <div class="palette-stats">
          <span class="stat">{{ generatedPalettes.length }} standards</span>
          <span class="stat">{{ totalColors }} total colors</span>
          <span class="stat">Base colors: {{ baseColorSummary || 'Custom selection' }}</span>
        </div>
      </div>

      <div class="palettes-container">
        <div v-for="palette in generatedPalettes" :key="palette.name" class="palette-section">
          <div class="palette-header">
            <h4>{{ palette.name }}</h4>
            <div class="palette-meta">
              <span class="accessibility-badge" :class="palette.accessibility.wcagLevel">
                {{ palette.accessibility.wcagLevel }}
              </span>
              <span class="color-count">{{ palette.colors.length }} colors</span>
            </div>
          </div>

          <div class="palette-colors">
            <div
              v-for="(color, index) in palette.colors"
              :key="index"
              class="palette-color"
              :style="{ backgroundColor: color.hex }"
              :title="copyTooltip(color)"
              @click="openExportModal(color.hex, color.name)"
            >
              <div class="color-overlay">
                <span class="color-hex">{{ color.hex }}</span>
                <span class="color-name">{{ color.name }}</span>
                <span class="color-usage">{{ color.usage }}</span>
                <button
                  class="color-export-btn"
                  :title="`Export ${color.name}`"
                  @click.stop="openExportModal(color.hex, color.name)"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                    />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="palette-actions">
            <button
              v-if="palette.accessibility.wcagLevel === 'fail'"
              class="accessibility-button"
              title="Generate accessible version of this palette"
              @click="makeAccessible(palette)"
            >
              Make Accessible
            </button>
            <button class="export-button" @click="exportPalette(palette)">Export CSS</button>
            <button class="export-button" @click="exportJSON(palette)">Export JSON</button>
            <button class="export-button" @click="exportSCSS(palette)">Export SCSS</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Color Export Modal -->
    <ColorExportModal
      :is-open="exportModal.isOpen"
      :color="exportModal.color"
      :color-name="exportModal.colorName"
      @close="closeExportModal"
      @copy="handleColorExport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import chroma from 'chroma-js';
import {
  PALETTE_STANDARDS,
  generatePalettesForColor,
  generateAccessibleVariants,
  STANDARD_CATEGORIES,
} from '../utils/paletteManager';
import type { DraculaColor } from '../types/color';
import type {
  PaletteStandard,
  GeneratedPalette,
  PaletteSourceColor,
  PaletteAnalysisPayload,
  PaletteSourceOrigin,
} from '../types/palette';
import type { ColorFormat } from '../utils/exportUtils';
import {
  copyColorToClipboard as copyColorToClipboardUtil,
  generateJSONExport,
  generateCSSVariables,
  generateSCSSVariables,
  downloadFile,
} from '../utils/exportUtils';
import { hexToRgb } from '../utils/contrast';
import ColorExportModal from './ColorExportModal.vue';
import { useTheme } from '../composables/useTheme';

interface Props {
  selectedColor?: DraculaColor | null;
  selectedColors?: DraculaColor[];
}

interface Emits {
  (_e: 'notification', _message: string, _type: 'success' | 'error'): void;
  (_e: 'palettes-update', _payload: PaletteAnalysisPayload): void;
}

const props = withDefaults(defineProps<Props>(), {
  selectedColors: () => [],
});
const emit = defineEmits<Emits>();

// Get current theme colors
const { currentColors } = useTheme();

// Export modal state
const exportModal = ref({
  isOpen: false,
  color: '',
  colorName: '',
});

function openExportModal(color: string, colorName: string) {
  exportModal.value = {
    isOpen: true,
    color,
    colorName,
  };
}

function closeExportModal() {
  exportModal.value.isOpen = false;
}

async function handleColorExport(color: string, format: ColorFormat) {
  try {
    await copyColorToClipboardUtil(color, format);
    emit('notification', `${format.toUpperCase()} color copied to clipboard!`, 'success');
  } catch (_error) {
    emit('notification', 'Failed to copy color to clipboard', 'error');
  }
}

const availableStandards = PALETTE_STANDARDS;
const selectedStandards = ref<PaletteStandard[]>(['material', 'hsluv', 'oklch']);
const generatedPalettes = ref<GeneratedPalette[]>([]);
const isGenerating = ref(false);
const lastSources = ref<PaletteSourceColor[]>([]);

const officialBaseColors = computed<DraculaColor[]>(() => {
  if (props.selectedColors?.length) {
    return props.selectedColors;
  }
  return props.selectedColor ? [props.selectedColor] : [];
});

interface AdditionalColor {
  value: string;
  valid: boolean;
  normalized?: string;
}

const additionalColors = ref<AdditionalColor[]>([
  { value: '', valid: false, normalized: undefined },
]);

const customColorPlaceholder = (index: number) => {
  const colors = officialColors.value;
  const samples = [
    colors.pink.hex,
    colors.green.hex,
    colors.purple.hex,
    colors.cyan.hex,
    colors.red.hex,
  ];
  return samples[index] ?? '#ffffff';
};

const validateAdditionalColor = (index: number) => {
  const entry = additionalColors.value[index];
  if (!entry) return;

  const raw = entry.value.trim();
  if (!raw) {
    entry.valid = false;
    entry.normalized = undefined;
    return;
  }

  try {
    const normalized = chroma(raw).hex();
    entry.valid = true;
    entry.normalized = normalized;
  } catch {
    entry.valid = false;
    entry.normalized = undefined;
  }
};

const addAdditionalColor = () => {
  if (additionalColors.value.length < 5) {
    additionalColors.value.push({ value: '', valid: false, normalized: undefined });
  }
};

const removeAdditionalColor = (index: number) => {
  if (additionalColors.value.length > 1) {
    additionalColors.value.splice(index, 1);
  }
};

const createSourceSummary = (
  color: DraculaColor,
  origin: PaletteSourceOrigin
): PaletteSourceColor => ({
  hex: color.hex,
  name: color.name,
  origin,
  category: color.category,
});

const createCustomSourceSummary = (hex: string, name: string): PaletteSourceColor => ({
  hex,
  name,
  origin: 'custom',
});

const createCustomColor = (hex: string, index: number): DraculaColor | null => {
  try {
    const normalized = chroma(hex).hex();
    const { r, g, b } = hexToRgb(normalized);
    const [l, c, h] = chroma(normalized).oklch();
    return {
      name: `Custom ${index + 1}`,
      hex: normalized,
      rgb: [r, g, b],
      oklch: [Number.isFinite(l) ? l : 0, Number.isFinite(c) ? c : 0, Number.isFinite(h) ? h : 0],
      description: 'Custom color input',
      category: 'accent',
    };
  } catch (error) {
    console.warn('Failed to normalize custom color', hex, error);
    return null;
  }
};

const getAllValidColors = () => {
  const colors: DraculaColor[] = [...officialBaseColors.value];

  additionalColors.value.forEach((color, index) => {
    if (color.valid && color.normalized) {
      const custom = createCustomColor(color.normalized, index);
      if (custom) {
        colors.push(custom);
      }
    }
  });

  return colors;
};

const customColorCount = computed(
  () => additionalColors.value.filter(color => color.valid && color.normalized).length
);

const baseColorSummary = computed(() => {
  const officialNames = officialBaseColors.value.map(color => color.name);
  const officialSummary = officialNames.length
    ? officialNames.length <= 3
      ? officialNames.join(', ')
      : `${officialNames.length} official colors`
    : '';

  const customSummary = customColorCount.value
    ? `${customColorCount.value} custom ${customColorCount.value === 1 ? 'color' : 'colors'}`
    : '';

  return [officialSummary, customSummary].filter(Boolean).join(' + ');
});

const collectBaseSources = (): PaletteSourceColor[] => {
  const sources: PaletteSourceColor[] = [];
  const manualSelectionActive = (props.selectedColors?.length ?? 0) > 0;

  officialBaseColors.value.forEach(color => {
    sources.push(createSourceSummary(color, manualSelectionActive ? 'manual' : 'input'));
  });

  additionalColors.value.forEach((color, index) => {
    if (color.valid && color.normalized) {
      sources.push(createCustomSourceSummary(color.normalized, `Custom ${index + 1}`));
    }
  });

  return sources;
};

const emitPaletteUpdate = (sources: PaletteSourceColor[], standards: PaletteStandard[]) => {
  lastSources.value = sources;
  const uniqueStandards = Array.from(new Set(standards));
  emit('palettes-update', {
    palettes: [...generatedPalettes.value],
    sources,
    standards: uniqueStandards,
  });
};

// Official color mappings for presets - computed based on current theme
const officialColors = computed(() => {
  const colors = currentColors.value;
  const colorMap: Record<string, DraculaColor> = {};

  // Map colors by their names (case-insensitive)
  colors.forEach(color => {
    const key = color.name.toLowerCase();
    colorMap[key] = color;
  });

  return {
    red:
      colorMap['red'] ||
      colors.find(c => c.category === 'accent' && c.name.toLowerCase().includes('red'))!,
    green:
      colorMap['green'] ||
      colors.find(c => c.category === 'accent' && c.name.toLowerCase().includes('green'))!,
    purple:
      colorMap['purple'] ||
      colors.find(c => c.category === 'accent' && c.name.toLowerCase().includes('purple'))!,
    cyan:
      colorMap['cyan'] ||
      colors.find(c => c.category === 'accent' && c.name.toLowerCase().includes('cyan'))!,
    pink:
      colorMap['pink'] ||
      colors.find(c => c.category === 'accent' && c.name.toLowerCase().includes('pink'))!,
    yellow:
      colorMap['yellow'] ||
      colors.find(c => c.category === 'accent' && c.name.toLowerCase().includes('yellow'))!,
    orange:
      colorMap['orange'] ||
      colors.find(c => c.category === 'accent' && c.name.toLowerCase().includes('orange'))!,
  };
});

// Generate preset combinations
const generatePreset = async (presetType: string) => {
  const colors = officialColors.value;
  const presetConfigs: Record<string, DraculaColor[]> = {
    'red-green': [colors.red, colors.green],
    'purple-cyan': [colors.purple, colors.cyan],
    'pink-yellow': [colors.pink, colors.yellow],
    'orange-purple': [colors.orange, colors.purple],
    'all-accents': [
      colors.red,
      colors.green,
      colors.purple,
      colors.cyan,
      colors.pink,
      colors.yellow,
      colors.orange,
    ],
  };

  const colorsToGenerate = presetConfigs[presetType];
  if (!colorsToGenerate) return;

  // Set popular standards for presets
  selectedStandards.value = ['material', 'hsluv', 'oklch'];

  isGenerating.value = true;

  try {
    generatedPalettes.value = [];
    const sourceSummaries = colorsToGenerate.map(color => createSourceSummary(color, 'preset'));

    // Generate palettes for each color in the preset
    for (const color of colorsToGenerate) {
      const result = generatePalettesForColor(color, selectedStandards.value);

      // Add source color identifier to each palette
      result.palettes.forEach(palette => {
        palette.name = `${palette.name} (${color.name})`;
      });

      generatedPalettes.value.push(...result.palettes);
    }
    emitPaletteUpdate(sourceSummaries, selectedStandards.value);

    const totalColors = generatedPalettes.value.reduce((sum, p) => sum + p.colors.length, 0);
    emit(
      'notification',
      `Generated ${generatedPalettes.value.length} palettes with ${totalColors} colors from ${colorsToGenerate.length} preset colors`,
      'success'
    );
  } catch (error) {
    console.error('Failed to generate preset palettes:', error);
    emit('notification', 'Failed to generate preset palettes. Please try again.', 'error');
    generatedPalettes.value = [];
  } finally {
    isGenerating.value = false;
  }
};

const totalColors = computed(() =>
  generatedPalettes.value.reduce((sum, palette) => sum + palette.colors.length, 0)
);

const toggleStandard = (standard: PaletteStandard) => {
  const index = selectedStandards.value.indexOf(standard);
  if (index > -1) {
    selectedStandards.value.splice(index, 1);
  } else {
    selectedStandards.value.push(standard);
  }
};

const selectPopularStandards = () => {
  selectedStandards.value = [...STANDARD_CATEGORIES.popular];
};

const selectScientificStandards = () => {
  selectedStandards.value = [...STANDARD_CATEGORIES.scientific];
};

const selectWebStandards = () => {
  selectedStandards.value = [...STANDARD_CATEGORIES.web];
};

const selectArtisticStandards = () => {
  selectedStandards.value = [...STANDARD_CATEGORIES.artistic];
};

const selectAllStandards = () => {
  selectedStandards.value = [...availableStandards.map(s => s.key)];
};

const clearStandards = () => {
  selectedStandards.value = [];
};

const generatePalettes = async () => {
  const allColors = getAllValidColors();
  if (allColors.length === 0) {
    emit('notification', 'Please select at least one color to generate palettes', 'error');
    return;
  }

  if (selectedStandards.value.length === 0) {
    emit('notification', 'Please select at least one color standard', 'error');
    return;
  }

  isGenerating.value = true;

  try {
    const baseSources = collectBaseSources();
    const usedStandards = [...selectedStandards.value];
    // Use requestIdleCallback for better mobile performance
    const generateFn = () => {
      generatedPalettes.value = [];

      // Generate palettes for each color
      for (const color of allColors) {
        const result = generatePalettesForColor(color, selectedStandards.value);

        // Add source color identifier to each palette
        result.palettes.forEach(palette => {
          palette.name = `${palette.name} (${color.name})`;
        });

        generatedPalettes.value.push(...result.palettes);
      }
      emitPaletteUpdate(baseSources.length ? baseSources : lastSources.value, usedStandards);

      const totalColors = generatedPalettes.value.reduce((sum, p) => sum + p.colors.length, 0);
      emit(
        'notification',
        `Generated ${generatedPalettes.value.length} palettes with ${totalColors} colors from ${allColors.length} base color${allColors.length > 1 ? 's' : ''}`,
        'success'
      );
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(generateFn, { timeout: 5000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(generateFn, 10);
    }
  } catch (error) {
    console.error('Failed to generate palettes:', error);
    emit('notification', 'Failed to generate palettes. Please try again.', 'error');
    generatedPalettes.value = [];
  } finally {
    isGenerating.value = false;
  }
};

const copyTooltip = (color: { name: string; hex: string; usage: string; lightness: number }) => {
  return `${color.name}\n${color.hex}\nUsage: ${color.usage}\nLightness: ${Math.round(color.lightness * 100)}%`;
};

const exportPalette = (palette: GeneratedPalette) => {
  const css = generateCSSVariables(palette);
  downloadFile(`${palette.name.toLowerCase().replace(/\s+/g, '-')}.css`, css);
};

const exportJSON = (palette: GeneratedPalette) => {
  const json = generateJSONExport(palette);
  downloadFile(`${palette.name.toLowerCase().replace(/\s+/g, '-')}.json`, json);
};

const exportSCSS = (palette: GeneratedPalette) => {
  const scss = generateSCSSVariables(palette);
  downloadFile(`${palette.name.toLowerCase().replace(/\s+/g, '-')}.scss`, scss);
};

const makeAccessible = (palette: GeneratedPalette) => {
  const accessiblePalette = generateAccessibleVariants(palette);

  // Add the accessible palette to the generated palettes
  const existingIndex = generatedPalettes.value.findIndex(p => p.name === accessiblePalette.name);
  if (existingIndex >= 0) {
    // Replace existing accessible version
    generatedPalettes.value[existingIndex] = accessiblePalette;
  } else {
    // Add new accessible version
    generatedPalettes.value.push(accessiblePalette);
  }
};

void {
  openExportModal,
  closeExportModal,
  handleColorExport,
  baseColorSummary,
  totalColors,
  customColorPlaceholder,
  validateAdditionalColor,
  addAdditionalColor,
  removeAdditionalColor,
  generatePreset,
  toggleStandard,
  selectPopularStandards,
  selectScientificStandards,
  selectWebStandards,
  selectArtisticStandards,
  selectAllStandards,
  clearStandards,
  generatePalettes,
  copyTooltip,
  exportPalette,
  exportJSON,
  exportSCSS,
  makeAccessible,
  ColorExportModal,
};
</script>

<style lang="scss" scoped>
.palette-generator {
  margin-top: 3rem;
  padding: 2rem;
  background: var(--surface-primary);
  border-radius: 12px;
  border: 1px solid var(--surface-border);
  box-shadow: 0 12px 24px var(--surface-shadow);
}

.generator-header {
  text-align: center;
  margin-bottom: 3rem;
}

.generator-title {
  color: var(--dracula-foreground);
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  background: linear-gradient(
    135deg,
    var(--heading-gradient-start, var(--dracula-cyan)),
    var(--heading-gradient-end, var(--dracula-purple))
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.generator-description {
  color: var(--dracula-foreground);
  font-size: 1.1rem;
  max-width: 800px;
  margin: 0 auto;
  opacity: 0.8;
}

.preset-section {
  margin-bottom: 3rem;
  text-align: center;
}

.preset-section h3 {
  color: var(--dracula-foreground);
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
}

.preset-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  max-width: 1000px;
  margin: 0 auto;
}

.preset-btn {
  background: var(--surface-secondary);
  border: 2px solid var(--surface-border);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--dracula-foreground);
  font-weight: 500;

  &:hover:not(:disabled) {
    border-color: var(--dracula-purple);
    background: var(--surface-hover);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px var(--surface-shadow);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  span {
    font-size: 0.9rem;
  }
}

.preset-colors {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.preset-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.standard-selector {
  margin-bottom: 3rem;
}

.standard-selector h3 {
  color: var(--dracula-foreground);
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
}

.standards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.standard-card {
  background: var(--surface-secondary);
  border: 2px solid var(--surface-border);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  @media (hover: hover) {
    &:hover {
      border-color: var(--dracula-pink);
      transform: translateY(-2px);
    }
  }

  &.selected {
    border-color: var(--dracula-green);
    background: var(--dracula-green-10);
  }
}

.standard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.standard-header h4 {
  color: var(--dracula-foreground);
  font-size: 1.1rem;
  margin: 0;
}

.standard-badge {
  background: var(--dracula-purple);
  color: var(--dracula-background);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.standard-description {
  color: var(--dracula-comment);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.standard-best-for {
  color: var(--dracula-foreground);
  font-size: 0.85rem;
}

.generation-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.generate-button {
  background: linear-gradient(135deg, var(--dracula-pink), var(--dracula-purple));
  color: var(--dracula-background);
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  @media (hover: hover) {
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255, 121, 198, 0.3);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.quick-actions {
  display: flex;
  gap: 1rem;
}

.quick-button {
  background: var(--dracula-selection);
  color: var(--dracula-foreground);
  border: 1px solid var(--dracula-comment);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  @media (hover: hover) {
    &:hover {
      background: var(--dracula-comment);
      color: var(--dracula-background);
    }
  }
}

.generated-palettes {
  margin-top: 3rem;
}

.palettes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.palettes-header h3 {
  color: var(--dracula-foreground);
  font-size: 1.6rem;
}

.palette-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat {
  background: var(--dracula-background);
  color: var(--dracula-cyan);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  border: 1px solid var(--dracula-selection);
}

.palettes-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.palette-section {
  background: var(--dracula-background);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--dracula-selection);
}

.palette-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.palette-header h4 {
  color: var(--dracula-foreground);
  font-size: 1.2rem;
  margin: 0;
}

.palette-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.accessibility-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;

  &.AAA {
    background: var(--dracula-green);
    color: var(--dracula-background);
  }

  &.AA {
    background: var(--dracula-yellow);
    color: var(--dracula-background);
  }

  &.fail {
    background: var(--dracula-red);
    color: var(--dracula-foreground);
  }
}

.color-count {
  color: var(--dracula-comment);
  font-size: 0.85rem;
}

.palette-colors {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.palette-color {
  aspect-ratio: 1;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease;

  @media (hover: hover) {
    &:hover {
      transform: scale(1.05);
    }
  }
}

.color-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 0.5rem;
  text-align: center;

  .palette-color:hover & {
    opacity: 1;
  }
}

.color-export-btn {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 4px;
  padding: 0.2rem;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (hover: hover) {
    &:hover {
      background: var(--dracula-purple);
      border-color: var(--dracula-purple);
      transform: scale(1.1);
    }
  }

  .color-overlay:hover & {
    opacity: 1;
  }
}

.color-hex {
  font-family: var(--font-family-mono);
  font-size: 0.8rem;
  font-weight: 600;
}

.color-name {
  font-size: 0.7rem;
  margin-top: 0.25rem;
}

.color-usage {
  font-size: 0.6rem;
  opacity: 0.8;
  margin-top: 0.1rem;
}

.palette-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.export-button {
  background: var(--dracula-cyan);
  color: var(--dracula-background);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  @media (hover: hover) {
    &:hover {
      background: var(--dracula-green);
      transform: translateY(-1px);
    }
  }
}

.accessibility-button {
  background: var(--dracula-orange);
  color: var(--dracula-background);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  @media (hover: hover) {
    &:hover {
      background: var(--dracula-yellow);
      transform: translateY(-1px);
    }
  }
}

@media (max-width: 768px) {
  .palette-generator {
    padding: 1rem;
  }

  .standards-grid {
    grid-template-columns: 1fr;
  }

  .generation-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .generate-button {
    min-height: 44px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  .quick-actions {
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .quick-button {
    min-height: 44px;
    min-width: 44px;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .palettes-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .palette-colors {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }

  .palette-actions {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .export-button,
  .accessibility-button {
    min-height: 44px;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .color-export-btn {
    min-height: 44px;
    min-width: 44px;
    padding: 0.75rem;
  }
}

/* Multi-Color Input Styles */
.multi-color-input {
  background: var(--surface-primary);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.multi-color-input h3 {
  color: var(--dracula-foreground);
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.color-inputs-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.official-base-colors label {
  display: block;
  color: var(--dracula-foreground);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.selected-colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.selected-color-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  background: var(--surface-secondary);
  box-shadow: 0 4px 16px var(--surface-shadow);
  transition: transform 0.2s ease;
}

.selected-color-card:hover {
  transform: translateY(-2px);
  border-color: var(--dracula-purple);
}

.selected-color-card .color-swatch {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--surface-border);
}

.selected-color-card .color-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.selected-color-card .color-name {
  color: var(--dracula-foreground);
  font-weight: 600;
  font-size: 0.95rem;
}

.selected-color-card .color-hex {
  color: var(--text-secondary);
  font-family: var(--font-family-mono);
  font-size: 0.8rem;
}

.base-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--surface-tertiary);
  border-left: 4px solid var(--dracula-purple);
  border-radius: 8px;
  color: var(--dracula-foreground);
}

.summary-label {
  font-weight: 600;
}

.summary-value {
  font-family: var(--font-family-mono);
  color: var(--text-secondary);
}

.last-picked-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: var(--surface-secondary);
  border: 1px solid var(--surface-border);
  color: var(--dracula-foreground);
}

.hint-label {
  font-weight: 600;
}

.hint-value {
  font-family: var(--font-family-mono);
  color: var(--text-secondary);
}

.no-selection {
  color: var(--dracula-comment);
  font-style: italic;
  margin: 0;
}

.additional-colors label {
  display: block;
  color: var(--dracula-foreground);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.additional-color-inputs {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.additional-color-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.additional-color-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  background: var(--surface-secondary);
  color: var(--dracula-foreground);
  font-family: var(--font-family-mono);
}

.additional-color-input:focus {
  outline: none;
  border-color: var(--dracula-purple);
  box-shadow: 0 0 0 2px rgba(189, 147, 249, 0.2);
}

.additional-color-preview {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--surface-border);
  flex-shrink: 0;
}

.additional-color-preview.invalid {
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 4px,
    var(--dracula-red) 4px,
    var(--dracula-red) 8px
  );
}

.remove-color-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--surface-border);
  background: var(--surface-secondary);
  color: var(--dracula-red);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  transition: var(--transition-fast);
}

.remove-color-btn:hover:not(:disabled) {
  background: var(--dracula-red);
  color: var(--dracula-background);
}

.remove-color-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-color-btn {
  background: var(--dracula-purple);
  color: var(--dracula-background);
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition-fast);
}

.add-color-btn:hover:not(:disabled) {
  background: var(--dracula-pink);
}

.add-color-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--dracula-comment);
}

@media (max-width: 768px) {
  .multi-color-input {
    padding: 1rem;
  }

  .additional-color-item {
    flex-wrap: wrap;
  }

  .additional-color-input {
    min-width: 200px;
  }
}
</style>
