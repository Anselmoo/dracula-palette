<template>
  <div class="color-visualization">
    <div class="visualization-header">
      <h3 class="visualization-title">Palette Relationships</h3>
      <p class="visualization-description">
        Analyze official {{ isDarkMode ? 'Dracula' : 'Alucard' }} colors or newly generated palettes
        using scientific color theory.
      </p>
    </div>

    <div class="color-selection">
      <h4>Select Official Colors to Analyze</h4>
      <div class="official-colors-grid">
        <div
          v-for="color in availableColors"
          :key="color.name"
          class="color-option"
          :class="{
            selected: selectedColors.includes(color.hex),
            primary: primaryColor === color.hex,
            secondary: secondaryColor === color.hex,
          }"
          @click="toggleColorSelection(color)"
        >
          <div class="color-swatch" :style="{ backgroundColor: color.hex }"></div>
          <span class="color-name">{{ color.name }}</span>
          <span class="color-hex">{{ color.hex }}</span>
        </div>
      </div>
    </div>

    <div v-if="selectedColors.length >= 2" class="analysis-section">
      <div class="visualization-modes">
        <button
          v-for="mode in visualizationModes"
          :key="mode.key"
          class="mode-button"
          :class="{ active: activeMode === mode.key }"
          @click="activeMode = mode.key"
        >
          <span class="mode-icon">{{ mode.icon }}</span>
          <span class="mode-label">{{ mode.label }}</span>
        </button>
      </div>

      <div class="visualization-content">
        <!-- Color Harmony Analysis -->
        <div v-if="activeMode === 'harmony'" class="harmony-analysis">
          <h4>Color Harmony Analysis</h4>
          <div class="harmony-grid">
            <div class="harmony-item">
              <h5>Complementary Relationship</h5>
              <div class="harmony-colors">
                <div
                  v-for="color in getComplementaryColors()"
                  :key="color"
                  class="harmony-color"
                  :style="{ backgroundColor: color }"
                ></div>
              </div>
              <p class="harmony-description">
                Colors positioned opposite on the color wheel create vibrant contrast.
              </p>
            </div>

            <div class="harmony-item">
              <h5>Analogous Relationship</h5>
              <div class="harmony-colors">
                <div
                  v-for="color in getAnalogousColors()"
                  :key="color"
                  class="harmony-color"
                  :style="{ backgroundColor: color }"
                ></div>
              </div>
              <p class="harmony-description">
                Adjacent colors create harmonious, pleasing combinations.
              </p>
            </div>

            <div class="harmony-item">
              <h5>Triadic Relationship</h5>
              <div class="harmony-colors">
                <div
                  v-for="color in getTriadicColors()"
                  :key="color"
                  class="harmony-color"
                  :style="{ backgroundColor: color }"
                ></div>
              </div>
              <p class="harmony-description">
                Three equally spaced colors provide balanced contrast.
              </p>
            </div>
          </div>
        </div>

        <!-- Gradient Analysis -->
        <div v-if="activeMode === 'gradient'" class="gradient-analysis">
          <h4>Color Gradient Analysis</h4>
          <div class="gradient-container">
            <div class="gradient-bar" :style="{ background: generateGradient() }"></div>
            <div class="gradient-info">
              <div class="gradient-stops">
                <div v-for="(color, index) in selectedColors" :key="color" class="gradient-stop">
                  <div class="stop-color" :style="{ backgroundColor: color }"></div>
                  <span class="stop-position"
                    >{{ Math.round((index / (selectedColors.length - 1)) * 100) }}%</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="gradient-variations">
            <h5>Alternative Gradients</h5>
            <div class="variations-grid">
              <div class="variation-item">
                <div
                  class="variation-gradient"
                  :style="{ background: generateLinearGradient('to right') }"
                ></div>
                <span class="variation-label">Linear Horizontal</span>
              </div>
              <div class="variation-item">
                <div
                  class="variation-gradient"
                  :style="{ background: generateRadialGradient() }"
                ></div>
                <span class="variation-label">Radial</span>
              </div>
              <div class="variation-item">
                <div
                  class="variation-gradient"
                  :style="{ background: generateConicGradient() }"
                ></div>
                <span class="variation-label">Conic</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Color Properties -->
        <div v-if="activeMode === 'properties'" class="properties-analysis">
          <h4>Color Properties Analysis</h4>
          <div class="properties-grid">
            <div v-for="colorHex in selectedColors" :key="colorHex" class="property-card">
              <div class="property-header">
                <div class="property-swatch" :style="{ backgroundColor: colorHex }"></div>
                <span class="property-name">{{ getColorName(colorHex) }}</span>
              </div>
              <div class="property-values">
                <div class="property-row">
                  <span class="property-label">Hue:</span>
                  <span class="property-value">{{ getHue(colorHex) }}°</span>
                </div>
                <div class="property-row">
                  <span class="property-label">Saturation:</span>
                  <span class="property-value">{{ getSaturation(colorHex) }}%</span>
                </div>
                <div class="property-row">
                  <span class="property-label">Lightness:</span>
                  <span class="property-value">{{ getLightness(colorHex) }}%</span>
                </div>
                <div class="property-row">
                  <span class="property-label">Temperature:</span>
                  <span class="property-value">{{ getTemperature(colorHex) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Accessibility Analysis -->
        <div v-if="activeMode === 'accessibility'" class="accessibility-analysis">
          <h4>Accessibility Analysis</h4>
          <div class="contrast-pairs">
            <div
              v-for="pair in getContrastPairs()"
              :key="`${pair.color1}-${pair.color2}`"
              class="contrast-pair"
            >
              <div class="pair-colors">
                <div class="pair-color" :style="{ backgroundColor: pair.color1 }"></div>
                <div class="pair-color" :style="{ backgroundColor: pair.color2 }"></div>
              </div>
              <div class="pair-info">
                <div class="contrast-ratio">
                  <span class="ratio-value">{{ pair.contrast }}:1</span>
                  <span class="ratio-grade" :class="pair.grade.toLowerCase()">{{
                    pair.grade
                  }}</span>
                </div>
                <div class="wcag-compliance">
                  <span class="wcag-aa" :class="{ pass: pair.passAA }"
                    >AA {{ pair.passAA ? '✓' : '✗' }}</span
                  >
                  <span class="wcag-aaa" :class="{ pass: pair.passAAA }"
                    >AAA {{ pair.passAAA ? '✓' : '✗' }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-selection">
      <p>Select at least 2 official colors to begin analysis.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useTheme } from '../composables/useTheme';

interface AnalysisColor {
  hex: string;
  name: string;
  category?: string;
  origin?: string;
}

interface Props {
  dynamicColors?: AnalysisColor[];
}

interface Emits {
  (_e: 'notification', _message: string, _type: 'success' | 'error'): void;
}

const props = defineProps<Props>();
const _emit = defineEmits<Emits>();

// Theme and colors
const { currentColors, isDarkMode } = useTheme();

const availableColors = computed<AnalysisColor[]>(() => {
  if (props.dynamicColors && props.dynamicColors.length) {
    return props.dynamicColors;
  }

  return currentColors.value.map(color => ({
    hex: color.hex,
    name: color.name,
    category: color.category,
  }));
});

// Selection state
const selectedColors = ref<string[]>([]);
const primaryColor = ref<string>('');
const secondaryColor = ref<string>('');
const activeMode = ref('harmony');

const visualizationModes = [
  { key: 'harmony', label: 'Color Harmony', icon: 'harmony' },
  { key: 'gradient', label: 'Gradients', icon: 'gradients' },
  { key: 'properties', label: 'Properties', icon: 'properties' },
  { key: 'accessibility', label: 'Accessibility', icon: 'accessibility' },
];

// Color selection logic
const toggleColorSelection = (color: AnalysisColor) => {
  const colorHex = color.hex;

  if (selectedColors.value.includes(colorHex)) {
    selectedColors.value = selectedColors.value.filter(c => c !== colorHex);
    if (primaryColor.value === colorHex) primaryColor.value = selectedColors.value[0] || '';
    if (secondaryColor.value === colorHex) secondaryColor.value = selectedColors.value[1] || '';
  } else {
    selectedColors.value.push(colorHex);
    if (!primaryColor.value) primaryColor.value = colorHex;
    else if (!secondaryColor.value) secondaryColor.value = colorHex;
  }
};

// Color analysis functions
const getColorName = (hex: string) => {
  const normalized = hex.toLowerCase();
  const dynamicMatch = availableColors.value.find(c => c.hex.toLowerCase() === normalized);
  if (dynamicMatch?.name) {
    return dynamicMatch.name;
  }

  const color = currentColors.value.find(c => c.hex.toLowerCase() === normalized);
  return color?.name || hex;
};

const hexToHsl = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

const getHue = (hex: string) => Math.round(hexToHsl(hex).h);
const getSaturation = (hex: string) => Math.round(hexToHsl(hex).s);
const getLightness = (hex: string) => Math.round(hexToHsl(hex).l);

const getTemperature = (hex: string) => {
  const hue = getHue(hex);
  if ((hue >= 0 && hue < 60) || hue >= 300) return 'Warm';
  if (hue >= 60 && hue < 180) return 'Cool';
  return 'Neutral';
};

// Harmony calculations
const getComplementaryColors = () => {
  return selectedColors.value.map(color => {
    const hsl = hexToHsl(color);
    const compHue = (hsl.h + 180) % 360;
    return `hsl(${compHue}, ${hsl.s}%, ${hsl.l}%)`;
  });
};

const getAnalogousColors = () => {
  const result: string[] = [];
  selectedColors.value.forEach((color: string) => {
    const hsl = hexToHsl(color);
    result.push(
      `hsl(${(hsl.h + 30) % 360}, ${hsl.s}%, ${hsl.l}%)`,
      `hsl(${(hsl.h - 30 + 360) % 360}, ${hsl.s}%, ${hsl.l}%)`
    );
  });
  return result;
};

const getTriadicColors = () => {
  const result: string[] = [];
  selectedColors.value.forEach((color: string) => {
    const hsl = hexToHsl(color);
    result.push(
      `hsl(${(hsl.h + 120) % 360}, ${hsl.s}%, ${hsl.l}%)`,
      `hsl(${(hsl.h + 240) % 360}, ${hsl.s}%, ${hsl.l}%)`
    );
  });
  return result;
};

// Gradient functions
const generateGradient = () => {
  return `linear-gradient(45deg, ${selectedColors.value.join(', ')})`;
};

const generateLinearGradient = (direction: string) => {
  return `linear-gradient(${direction}, ${selectedColors.value.join(', ')})`;
};

const generateRadialGradient = () => {
  return `radial-gradient(circle, ${selectedColors.value.join(', ')})`;
};

const generateConicGradient = () => {
  return `conic-gradient(${selectedColors.value.join(', ')})`;
};

// Contrast calculations
const getContrastRatio = (color1: string, color2: string) => {
  const getLuminance = (hex: string) => {
    const rgb = [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

const getContrastPairs = () => {
  const pairs = [];
  for (let i = 0; i < selectedColors.value.length; i++) {
    for (let j = i + 1; j < selectedColors.value.length; j++) {
      const color1 = selectedColors.value[i];
      const color2 = selectedColors.value[j];
      const contrast = getContrastRatio(color1, color2);
      const passAA = contrast >= 4.5;
      const passAAA = contrast >= 7;

      let grade = 'Poor';
      if (contrast >= 7) grade = 'Excellent';
      else if (contrast >= 4.5) grade = 'Good';
      else if (contrast >= 3) grade = 'Fair';

      pairs.push({
        color1,
        color2,
        contrast: contrast.toFixed(2),
        grade,
        passAA,
        passAAA,
      });
    }
  }
  return pairs;
};

watch(
  () => props.dynamicColors,
  newColors => {
    if (!newColors || !newColors.length) {
      return;
    }

    const normalized = newColors.map(color => color.hex.toLowerCase());
    selectedColors.value = selectedColors.value.filter(hex =>
      normalized.includes(hex.toLowerCase())
    );

    if (selectedColors.value.length < 2) {
      const autoSelect = newColors.slice(0, Math.min(4, newColors.length)).map(color => color.hex);
      selectedColors.value = autoSelect;
    }

    primaryColor.value = selectedColors.value[0] || '';
    secondaryColor.value = selectedColors.value[1] || '';
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.color-visualization {
  padding: 1.5rem;
}

.visualization-header {
  text-align: center;
  margin-bottom: 2rem;
}

.visualization-title {
  color: var(--dracula-foreground);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.visualization-description {
  color: var(--dracula-foreground);
  opacity: 0.8;
  font-size: 1rem;
}

.color-selection {
  margin-bottom: 2rem;
}

.color-selection h4 {
  color: var(--dracula-foreground);
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.official-colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.color-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--surface-secondary);
  border: 2px solid var(--surface-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--dracula-purple);
    background: var(--surface-hover);
  }

  &.selected {
    border-color: var(--dracula-purple);
    background: var(--surface-hover);
  }

  &.primary {
    border-color: var(--dracula-green);
  }

  &.secondary {
    border-color: var(--dracula-orange);
  }
}

.color-swatch {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 0.5rem;
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.color-name {
  font-weight: 600;
  color: var(--dracula-foreground);
  margin-bottom: 0.25rem;
}

.color-hex {
  font-size: 0.9rem;
  color: var(--dracula-foreground);
  opacity: 0.7;
}

.visualization-modes {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--surface-border);
  padding-bottom: 0;
}

.mode-button {
  background: transparent;
  border: none;
  padding: 1rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--dracula-foreground);
  opacity: 0.7;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;

  &:hover {
    opacity: 1;
    background: var(--surface-hover);
  }

  &.active {
    opacity: 1;
    border-bottom-color: var(--dracula-purple);
    color: var(--dracula-purple);
  }
}

.harmony-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.harmony-item {
  background: var(--surface-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--surface-border);
}

.harmony-item h5 {
  color: var(--dracula-foreground);
  margin-bottom: 1rem;
}

.harmony-colors {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.harmony-color {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.harmony-description {
  color: var(--dracula-foreground);
  opacity: 0.8;
  font-size: 0.9rem;
}

.gradient-bar {
  height: 60px;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.variations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.variation-gradient {
  height: 40px;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.property-card {
  background: var(--surface-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--surface-border);
}

.property-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.property-swatch {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.property-name {
  font-weight: 600;
  color: var(--dracula-foreground);
}

.property-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.property-label {
  color: var(--dracula-foreground);
  opacity: 0.8;
}

.property-value {
  color: var(--dracula-foreground);
  font-weight: 500;
}

.contrast-pairs {
  display: grid;
  gap: 1rem;
}

.contrast-pair {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--surface-secondary);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--surface-border);
}

.pair-colors {
  display: flex;
  gap: 0.5rem;
}

.pair-color {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.contrast-ratio {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.ratio-value {
  font-weight: 600;
  color: var(--dracula-foreground);
}

.ratio-grade {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;

  &.excellent {
    background: var(--dracula-green);
    color: black;
  }
  &.good {
    background: var(--dracula-yellow);
    color: black;
  }
  &.fair {
    background: var(--dracula-orange);
    color: black;
  }
  &.poor {
    background: var(--dracula-red);
    color: white;
  }
}

.wcag-compliance {
  display: flex;
  gap: 0.5rem;
}

.wcag-aa,
.wcag-aaa {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  background: var(--dracula-red);
  color: white;

  &.pass {
    background: var(--dracula-green);
    color: black;
  }
}

.no-selection {
  text-align: center;
  padding: 3rem;
  color: var(--dracula-foreground);
  opacity: 0.7;
}
</style>
