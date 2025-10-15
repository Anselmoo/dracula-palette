<template>
  <div class="color-input-container">
    <div class="input-section">
      <label
        for="color-input"
        class="input-label"
      >
        Enter a CSS color:
      </label>
      <div class="input-wrapper">
        <input
          id="color-input"
          v-model="inputValue"
          type="text"
          class="color-input"
          :placeholder="getFallbackColor()"
          :class="{ error: hasError }"
          @input="handleInput"
          @blur="handleBlur"
        />
        <input
          ref="colorPicker"
          type="color"
          class="color-picker"
          id="native-color-picker"
          :value="pickerValue"
          @input="onPick"
          :aria-label="`Pick color, current ${inputValue}`"
        />
      </div>
      <p v-if="hasError" class="error-message">
        Invalid color format. Please enter a valid CSS color (hex, rgb, hsl, or color name).
      </p>
      <div class="format-examples">
        <p class="examples-title">Supported formats:</p>
        <div class="examples-grid">
          <span class="example">{{ exampleHex }}</span>
          <span class="example">{{ exampleRgb }}</span>
          <span class="example">{{ exampleHsl }}</span>
          <span class="example">pink</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { isValidColor, normalizeColorToHex } from '../utils/colorMatcher';
import { useTheme } from '../composables/useTheme';

interface Props {
  modelValue: string;
}

interface Emits {
  (_e: 'update:modelValue', _value: string): void;
  (_e: 'color-change', _value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { currentColors } = useTheme();

// Get theme-aware fallback color (Pink from current palette)
const getFallbackColor = () => {
  const pinkColor = currentColors.value.find(c => c.name === 'Pink');
  return pinkColor?.hex || '#ff79c6';
};

const inputValue = ref(props.modelValue);
const hasError = ref(false);
const colorPicker = ref<HTMLInputElement | null>(null);
const pickerValue = computed(() => (hasError.value ? '#000000' : inputValue.value || getFallbackColor()));

const previewColor = computed(() => {
  if (hasError.value) {
    return 'transparent';
  }
  return inputValue.value || getFallbackColor();
});

// Get example formats for the current theme's pink color
const exampleHex = computed(() => getFallbackColor());
const exampleRgb = computed(() => {
  const pinkColor = currentColors.value.find(c => c.name === 'Pink');
  if (pinkColor?.rgb) {
    const [r, g, b] = pinkColor.rgb;
    return `rgb(${r}, ${g}, ${b})`;
  }
  return 'rgb(255, 121, 198)'; // fallback
});
const exampleHsl = computed(() => {
  // For Dracula pink: hsl(326, 100%, 74%)
  // For Alucard pink: hsl(338, 78%, 36%)
  const pinkColor = currentColors.value.find(c => c.name === 'Pink');
  const hex = pinkColor?.hex || '#ff79c6';
  // Simple conversion for the known pink colors
  if (hex === '#ff79c6') {
    return 'hsl(326, 100%, 74%)';
  } else if (hex === '#a3144d') {
    return 'hsl(338, 78%, 36%)';
  }
  return 'hsl(326, 100%, 74%)'; // fallback
});

const handleInput = () => {
  const value = inputValue.value.trim();

  if (!value) {
    hasError.value = false;
    return;
  }

  if (isValidColor(value)) {
    hasError.value = false;
    const normalizedColor = normalizeColorToHex(value);
    emit('update:modelValue', normalizedColor);
    emit('color-change', normalizedColor);
  } else {
    hasError.value = true;
  }
};

const handleBlur = () => {
  if (!inputValue.value.trim()) {
    hasError.value = false;
    inputValue.value = props.modelValue;
  }
};

function onPick(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  if (isValidColor(value)) {
    hasError.value = false;
    const normalizedColor = normalizeColorToHex(value);
    inputValue.value = normalizedColor;
    emit('update:modelValue', normalizedColor);
    emit('color-change', normalizedColor);
  }
}

watch(
  () => props.modelValue,
  newValue => {
    inputValue.value = newValue;
  }
);

// Expose to satisfy some analyzers that don't link template usage to script-setup vars
defineExpose({
  inputValue,
  hasError,
  colorPicker,
  pickerValue,
  previewColor,
  handleInput,
  handleBlur,
  onPick,
});
</script>

<style lang="scss" scoped>
.color-input-container {
  margin-bottom: 3rem;
}

.input-section {
  max-width: 600px;
  margin: 0 auto;
}

.input-label {
  display: block;
  color: var(--dracula-foreground);
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.color-input {
  flex: 1;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  background: var(--surface-primary);
  border: 2px solid var(--surface-border);
  border-radius: 8px;
  color: var(--dracula-foreground);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--dracula-pink);
    box-shadow: 0 0 0 3px rgba(255, 121, 198, 0.1);
  }

  &.error {
    border-color: var(--dracula-red);
    box-shadow: 0 0 0 3px rgba(255, 85, 85, 0.1);
  }

  &::placeholder {
    color: var(--dracula-comment);
  }
}

.color-picker {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 2px solid var(--dracula-selection);
  transition: all 0.3s ease;
  flex-shrink: 0;
  cursor: pointer;
  padding: 0;
  overflow: hidden;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 6px;
  }

  &::-moz-color-swatch {
    border: none;
    border-radius: 6px;
  }

  &:hover {
    transform: scale(1.05);
    border-color: var(--dracula-pink);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &:focus {
    outline: none;
    border-color: var(--dracula-pink);
    box-shadow: 0 0 0 3px rgba(255, 121, 198, 0.3);
  }

  &:active {
    transform: scale(0.98);
  }
}

.error-message {
  color: var(--dracula-red);
  font-size: 0.9rem;
  margin: 0.5rem 0;
  text-align: center;
}

.format-examples {
  margin-top: 2rem;
  text-align: center;
}

.examples-title {
  color: var(--dracula-foreground);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
}

.example {
  background: var(--surface-primary);
  color: var(--dracula-cyan);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  border: 1px solid var(--surface-border);
}

@media (max-width: 768px) {
  .input-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .color-picker {
    width: 100%;
    height: 40px;
  }

  .examples-grid {
    grid-template-columns: 1fr;
  }
}
</style>
