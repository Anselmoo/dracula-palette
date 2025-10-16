<template>
  <div id="app">
    <Header />
    <main class="main-content">
      <section id="section-start">
        <ColorInput v-model="inputColor" @color-change="handleColorChange" />
      </section>
      <section id="section-suggestions">
        <ColorSuggestions
          v-if="suggestions.length > 0"
          :suggestions="suggestions"
          @color-select="handleColorSelect"
        />
      </section>
      <section id="section-palette">
        <DraculaPalette
          :selected-color="selectedColor"
          :selected-colors="selectedColors"
          selection-mode="multiple"
          @color-select="handlePaletteColorSelect"
          @toggle-color="handlePaletteColorToggle"
          @notification="showNotification"
        />
      </section>
      <section id="section-generator">
        <PaletteGenerator
          :selected-color="selectedColor"
          :selected-colors="selectedColors"
          @notification="showNotification"
          @palettes-update="handlePalettesUpdate"
        />
      </section>

      <!-- Scientific Analysis Section (moved below Extended Palette Generator) -->
      <section id="section-analysis">
        <ScientificAnalysis :analysis="paletteAnalysis" @notification="showNotification" />
      </section>
    </main>

    <!-- Notification Component -->
    <Notification
      v-if="notification.show"
      :message="notification.message"
      :type="notification.type"
      @close="hideNotification"
    />

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import ColorInput from './components/ColorInput.vue';
import ColorSuggestions from './components/ColorSuggestions.vue';
import DraculaPalette from './components/DraculaPalette.vue';
import PaletteGenerator from './components/PaletteGenerator.vue';
import ScientificAnalysis from './components/ScientificAnalysis.vue';
import Notification from './components/Notification.vue';
import { findClosestDraculaColors } from './utils/colorMatcher';
import { useTheme } from './composables/useTheme';
import type { DraculaColor, ColorSuggestion } from './types/color';
import type { PaletteAnalysisPayload } from './types/palette';

// Initialize theme
const { currentTheme, currentColors } = useTheme();

// Get theme-aware default color (Purple from current palette)
const getDefaultColor = () => {
  const colors = currentColors.value;
  const purpleColor = colors.find(c => c.name === 'Purple');
  return purpleColor?.hex || '#bd93f9';
};

const inputColor = ref(getDefaultColor());
const selectedColor = ref<DraculaColor | null>(null);
const selectedColors = ref<DraculaColor[]>([]);
const suggestions = ref<ColorSuggestion[]>([]);
const notification = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
});
const paletteAnalysis = ref<PaletteAnalysisPayload | null>(null);

function showNotification(message: string, type: 'success' | 'error') {
  notification.value = {
    show: true,
    message,
    type,
  };

  // Auto-hide after 3 seconds
  setTimeout(() => {
    hideNotification();
  }, 3000);
}

function hideNotification() {
  notification.value.show = false;
}

const handleColorChange = (color: string) => {
  inputColor.value = color;
  suggestions.value = findClosestDraculaColors(color, currentTheme.value);
};

const handleColorSelect = (suggestion: ColorSuggestion) => {
  selectedColor.value = suggestion.draculaColor;
};

const normalizeColorIdentifier = (color: DraculaColor) => `${color.category}:${color.name}`;

const handlePaletteColorToggle = (color: DraculaColor) => {
  const targetId = normalizeColorIdentifier(color);
  const index = selectedColors.value.findIndex(
    selected => normalizeColorIdentifier(selected) === targetId
  );

  if (index === -1) {
    selectedColors.value.push(color);
    selectedColor.value = color;
  } else {
    selectedColors.value.splice(index, 1);
    if (selectedColor.value && normalizeColorIdentifier(selectedColor.value) === targetId) {
      selectedColor.value = selectedColors.value[selectedColors.value.length - 1] ?? null;
    }
  }
};

const handlePaletteColorSelect = (color: DraculaColor) => {
  selectedColor.value = color;
};

const handlePalettesUpdate = (payload: PaletteAnalysisPayload) => {
  paletteAnalysis.value = payload;
};

// Initialize with default color
handleColorChange(inputColor.value);

watch(currentTheme, () => {
  selectedColors.value = [];
  selectedColor.value = null;
  inputColor.value = getDefaultColor();
  handleColorChange(inputColor.value);
});

void {
  Header,
  Footer,
  ColorInput,
  ColorSuggestions,
  DraculaPalette,
  PaletteGenerator,
  ScientificAnalysis,
  Notification,
  showNotification,
  hideNotification,
  handleColorChange,
  handleColorSelect,
  handlePaletteColorSelect,
  handlePaletteColorToggle,
  handlePalettesUpdate,
};
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--dracula-background);
  color: var(--dracula-foreground);
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
}
</style>
