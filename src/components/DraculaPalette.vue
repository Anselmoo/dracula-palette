<template>
  <div class="dracula-palette">
    <h2 class="palette-title">
      {{ currentTheme === 'dracula' ? 'Dracula' : 'Alucard' }} Color Palette
    </h2>
    <div class="palette-sections">
      <!-- Background Colors -->
      <div class="color-section" id="section-backgrounds">
        <h3 class="section-title">Background Colors</h3>
        <div class="colors-grid">
          <div
            v-for="color in backgroundColors"
            :key="color.name"
            class="color-item"
            :class="{ selected: isSelected(color) }"
            @click="handleColorClick(color)"
          >
            <div class="color-swatch" :style="{ backgroundColor: color.hex }" />
            <div class="color-info">
              <span class="color-name">{{ color.name }}</span>
              <span class="color-hex">{{ color.hex }}</span>
              <button
                class="copy-button"
                :title="`Export ${color.name} color`"
                @click.stop="openExportModal(color.hex, color.name)"
              >
                <svg
                  width="16"
                  height="16"
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
      </div>

      <!-- Accent Colors -->
      <div class="color-section" id="section-accents">
        <h3 class="section-title">Accent Colors</h3>
        <div class="colors-grid">
          <div
            v-for="color in accentColors"
            :key="color.name"
            class="color-item"
            :class="{ selected: isSelected(color) }"
            @click="handleColorClick(color)"
          >
            <div class="color-swatch" :style="{ backgroundColor: color.hex }" />
            <div class="color-info">
              <span class="color-name">{{ color.name }}</span>
              <span class="color-hex">{{ color.hex }}</span>
              <button
                class="copy-button"
                :title="`Export ${color.name} color`"
                @click.stop="openExportModal(color.hex, color.name)"
              >
                <svg
                  width="16"
                  height="16"
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
            <!-- Color variants preview -->
            <div v-if="color.variants" class="color-variants">
              <div
                v-for="(variant, shade) in getDisplayVariants(color.variants)"
                :key="shade"
                class="variant-swatch"
                :style="{ backgroundColor: variant }"
                :title="`${color.name} ${shade}`"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Foreground Colors -->
      <div class="color-section" id="section-foregrounds">
        <h3 class="section-title">Text Colors</h3>
        <div class="colors-grid">
          <div
            v-for="color in foregroundColors"
            :key="color.name"
            class="color-item"
            :class="{ selected: isSelected(color) }"
            @click="handleColorClick(color)"
          >
            <div class="color-swatch" :style="{ backgroundColor: color.hex }" />
            <div class="color-info">
              <span class="color-name">{{ color.name }}</span>
              <span class="color-hex">{{ color.hex }}</span>
              <button
                class="copy-button"
                :title="`Export ${color.name} color`"
                @click.stop="openExportModal(color.hex, color.name)"
              >
                <svg
                  width="16"
                  height="16"
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
import { computed, ref } from 'vue';
import { generateColorVariants } from '../data/draculaColors';
import { useTheme } from '../composables/useTheme';
import type { DraculaColor } from '../types/color';
import type { ColorFormat } from '../utils/exportUtils';
import { copyColorToClipboard } from '../utils/exportUtils';
import ColorExportModal from './ColorExportModal.vue';

interface Props {
  selectedColor?: DraculaColor | null;
  selectedColors?: DraculaColor[];
  selectionMode?: 'single' | 'multiple';
}

interface Emits {
  (_e: 'color-select', _color: DraculaColor): void;
  (_e: 'toggle-color', _color: DraculaColor): void;
  (_e: 'notification', _message: string, _type: 'success' | 'error'): void;
}

const props = withDefaults(defineProps<Props>(), {
  selectedColors: () => [],
  selectionMode: 'single',
});
const emit = defineEmits<Emits>();

// Get theme-aware colors
const { currentColors, currentTheme } = useTheme();

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
    await copyColorToClipboard(color, format);
    emit('notification', `${format.toUpperCase()} color copied to clipboard!`, 'success');
  } catch (_error) {
    emit('notification', 'Failed to copy color to clipboard', 'error');
  }
}

const backgroundColors = computed(() =>
  currentColors.value.filter(color => color.category === 'background')
);

const accentColors = computed(() => {
  const colors = currentColors.value.filter(color => color.category === 'accent');
  // Generate variants for accent colors
  return colors.map(color => ({
    ...color,
    variants: generateColorVariants(color),
  }));
});

const foregroundColors = computed(() =>
  currentColors.value.filter(color => color.category === 'foreground')
);

const normalizeColorIdentifier = (color: DraculaColor) => `${color.category}:${color.name}`;

const isSelected = (color: DraculaColor): boolean => {
  if (props.selectionMode === 'multiple') {
    return props.selectedColors.some(
      selected => normalizeColorIdentifier(selected) === normalizeColorIdentifier(color)
    );
  }
  return props.selectedColor?.name === color.name;
};

const handleColorClick = (color: DraculaColor) => {
  emit('color-select', color);
  if (props.selectionMode === 'multiple') {
    emit('toggle-color', color);
  }
};

const getDisplayVariants = (variants: DraculaColor['variants']) => {
  if (!variants) return {};

  // Show key variants: 100, 300, 500, 700, 900
  return {
    100: variants[100],
    300: variants[300],
    500: variants[500],
    700: variants[700],
    900: variants[900],
  };
};

// Mark component imports as used for TypeScript analysis that doesn't see template usage
void ColorExportModal;

// Expose to satisfy analyzers that don't link template to script
defineExpose({
  currentTheme,
  backgroundColors,
  accentColors,
  foregroundColors,
  normalizeColorIdentifier,
  openExportModal,
  closeExportModal,
  handleColorExport,
  isSelected,
  handleColorClick,
  getDisplayVariants,
});
</script>

<style lang="scss" scoped>
.dracula-palette {
  margin-top: 2rem;
}

.palette-title {
  color: var(--dracula-foreground);
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(
    135deg,
    var(--heading-gradient-start, var(--dracula-cyan)),
    var(--heading-gradient-end, var(--dracula-purple))
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.palette-sections {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.color-section {
  background: var(--surface-primary);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid var(--surface-border);
  box-shadow: 0 12px 24px var(--surface-shadow);
}

.section-title {
  color: var(--dracula-foreground);
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    width: 4px;
    height: 1.4rem;
    background: linear-gradient(135deg, var(--dracula-pink), var(--dracula-purple));
    border-radius: 2px;
  }
}

.colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.color-item {
  background: var(--surface-secondary);
  border: 2px solid var(--surface-border);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-2px);
      border-color: var(--dracula-pink);
      box-shadow: 0 4px 16px var(--surface-shadow);
    }
  }

  &.selected {
    border-color: var(--dracula-green);
    box-shadow: 0 0 0 3px rgba(80, 250, 123, 0.2);

    &::after {
      content: '✓';
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: var(--dracula-green);
      color: var(--dracula-background);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
    }
  }
}

.color-swatch {
  width: 100%;
  height: 60px;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid var(--surface-border);
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  position: relative;
}

.color-name {
  color: var(--dracula-foreground);
  font-weight: 600;
  font-size: 1rem;
}

.color-hex {
  color: var(--dracula-cyan);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  user-select: all;
}

.copy-button {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--dracula-selection);
  border: 1px solid var(--dracula-comment);
  color: var(--dracula-foreground);
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  padding: 0.25rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (hover: hover) {
    &:hover {
      background: var(--dracula-purple);
      color: var(--dracula-background);
      border-color: var(--dracula-purple);
      transform: scale(1.1);
    }
  }

  svg {
    stroke-width: 2;
  }
}

.color-item:hover .copy-button {
  opacity: 1;
}

@media (hover: hover) {
  .color-item:hover .copy-button {
    opacity: 1;
  }
}

.color-hex {
  @media (hover: hover) {
    &:hover {
      background: var(--dracula-selection);
      padding: 0.1rem 0.3rem;
      border-radius: 3px;
    }
  }
}

.color-variants {
  display: flex;
  gap: 2px;
  margin-top: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  position: relative;
}

.color-variants::before {
  content: 'Variants';
  position: absolute;
  top: -8px;
  left: 8px;
  background: var(--surface-secondary);
  color: var(--dracula-comment);
  font-size: 0.7rem;
  padding: 0 0.5rem;
}

.variant-swatch {
  flex: 1;
  height: 16px;
  border-radius: 2px;
  cursor: pointer;
  transition: transform 0.2s ease;
  border: 1px solid transparent;

  @media (hover: hover) {
    &:hover {
      transform: scale(1.2);
      border-color: var(--dracula-pink);
      z-index: 1;
      position: relative;
    }
  }

  &:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  &:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
}

@media (max-width: 768px) {
  .colors-grid {
    grid-template-columns: 1fr;
  }

  .color-section {
    padding: 1.5rem;
  }

  .copy-button {
    min-height: 44px;
    min-width: 44px;
    padding: 0.75rem;
  }

  .color-variant {
    min-height: 44px;
    min-width: 44px;
  }
}
</style>
