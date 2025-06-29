<template>
  <div id="app">
    <Header />
    <main class="main-content">
      <ColorInput
        v-model="inputColor"
        @color-change="handleColorChange"
      />
      <ColorSuggestions
        v-if="suggestions.length > 0"
        :suggestions="suggestions"
        @color-select="handleColorSelect"
      />
      <DraculaPalette
        :selected-color="selectedColor"
        @color-select="handlePaletteColorSelect"
        @notification="showNotification"
      />
      <PaletteGenerator
        :selected-color="selectedColor"
        @notification="showNotification"
      />
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
import { ref } from 'vue';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import ColorInput from './components/ColorInput.vue';
import ColorSuggestions from './components/ColorSuggestions.vue';
import DraculaPalette from './components/DraculaPalette.vue';
import PaletteGenerator from './components/PaletteGenerator.vue';
import Notification from './components/Notification.vue';
import { findClosestDraculaColors } from './utils/colorMatcher';
import type { DraculaColor, ColorSuggestion } from './types/color';

const inputColor = ref('#ff79c6');
const selectedColor = ref<DraculaColor | null>(null);
const suggestions = ref<ColorSuggestion[]>([]);
const notification = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
});

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
  suggestions.value = findClosestDraculaColors(color);
};

const handleColorSelect = (suggestion: ColorSuggestion) => {
  selectedColor.value = suggestion.draculaColor;
};

const handlePaletteColorSelect = (color: DraculaColor) => {
  selectedColor.value = color;
};

// Initialize with default color
handleColorChange(inputColor.value);
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
</style>
