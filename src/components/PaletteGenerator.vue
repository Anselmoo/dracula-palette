<template>
  <div class="palette-generator">
    <div class="generator-header">
      <h2 class="generator-title">Extended Palette Generator</h2>
      <p class="generator-description">
        Generate comprehensive color palettes using 10 different color standards to expand your
        Dracula theme beyond the basic colors.
      </p>
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
        :disabled="!selectedColor || selectedStandards.length === 0"
        @click="generatePalettes"
      >
        Generate {{ selectedStandards.length }} Palette{{
          selectedStandards.length !== 1 ? 's' : ''
        }}
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
          <span class="stat">Based on {{ selectedColor?.name }}</span>
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
import {
  PALETTE_STANDARDS,
  generatePalettesForColor,
  generateAccessibleVariants,
  STANDARD_CATEGORIES,
} from '../utils/paletteManager';
import type { DraculaColor } from '../types/color';
import type { PaletteStandard, GeneratedPalette } from '../types/palette';
import type { ColorFormat } from '../utils/exportUtils';
import { copyColorToClipboard as copyColorToClipboardUtil } from '../utils/exportUtils';
import ColorExportModal from './ColorExportModal.vue';

interface Props {
  selectedColor?: DraculaColor | null;
}

interface Emits {
  (e: 'notification', message: string, type: 'success' | 'error'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

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
  } catch (error) {
    emit('notification', 'Failed to copy color to clipboard', 'error');
  }
}

const availableStandards = PALETTE_STANDARDS;
const selectedStandards = ref<PaletteStandard[]>(['material', 'hsluv', 'oklch']);
const generatedPalettes = ref<GeneratedPalette[]>([]);
const isGenerating = ref(false);

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
  if (!props.selectedColor) return;

  isGenerating.value = true;

  try {
    const result = generatePalettesForColor(props.selectedColor, selectedStandards.value);
    generatedPalettes.value = result.palettes;
  } catch (error) {
    console.error('Failed to generate palettes:', error);
  } finally {
    isGenerating.value = false;
  }
};

const copyTooltip = (color: { name: string; hex: string; usage: string; lightness: number }) => {
  return `${color.name}\n${color.hex}\nUsage: ${color.usage}\nLightness: ${Math.round(color.lightness * 100)}%`;
};

const exportPalette = (palette: GeneratedPalette) => {
  const css = generateCSS(palette);
  downloadFile(`${palette.name.toLowerCase().replace(/\s+/g, '-')}.css`, css);
};

const exportJSON = (palette: GeneratedPalette) => {
  const json = JSON.stringify(palette, null, 2);
  downloadFile(`${palette.name.toLowerCase().replace(/\s+/g, '-')}.json`, json);
};

const exportSCSS = (palette: GeneratedPalette) => {
  const scss = generateSCSS(palette);
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

const generateCSS = (palette: GeneratedPalette): string => {
  const cssVars = palette.colors
    .map(
      color =>
        `  --${palette.name.toLowerCase().replace(/\s+/g, '-')}-${color.name.toLowerCase().replace(/\s+/g, '-')}: ${color.hex};`
    )
    .join('\n');

  return `:root {\n${cssVars}\n}`;
};

const generateSCSS = (palette: GeneratedPalette): string => {
  const scssVars = palette.colors
    .map(
      color =>
        `$${palette.name.toLowerCase().replace(/\s+/g, '-')}-${color.name.toLowerCase().replace(/\s+/g, '-')}: ${color.hex};`
    )
    .join('\n');

  return `// ${palette.name} Palette\n${scssVars}`;
};

const downloadFile = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<style lang="scss" scoped>
.palette-generator {
  margin-top: 3rem;
  padding: 2rem;
  background: var(--dracula-current-line);
  border-radius: 12px;
  border: 1px solid var(--dracula-selection);
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
  background: linear-gradient(135deg, var(--dracula-cyan), var(--dracula-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.generator-description {
  color: var(--dracula-comment);
  font-size: 1.1rem;
  max-width: 800px;
  margin: 0 auto;
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
  background: var(--dracula-background);
  border: 2px solid var(--dracula-selection);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--dracula-pink);
    transform: translateY(-2px);
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

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 121, 198, 0.3);
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

  &:hover {
    background: var(--dracula-comment);
    color: var(--dracula-background);
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

  &:hover {
    transform: scale(1.05);
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

  &:hover {
    background: var(--dracula-purple);
    border-color: var(--dracula-purple);
    transform: scale(1.1);
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

  &:hover {
    background: var(--dracula-green);
    transform: translateY(-1px);
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

  &:hover {
    background: var(--dracula-yellow);
    transform: translateY(-1px);
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

  .quick-actions {
    justify-content: center;
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
  }
}
</style>
