<template>
  <div class="color-input-container">
    <div class="input-section">
      <label
        for="color-input"
        class="input-label"
        @click.prevent="openPicker"
        role="button"
        tabindex="0"
        @keydown.enter.prevent="openPicker"
        @keydown.space.prevent="openPicker"
        aria-controls="native-color-picker"
      >
        Enter a CSS color:
      </label>
      <div class="input-wrapper">
        <input
          id="color-input"
          v-model="inputValue"
          type="text"
          class="color-input"
          placeholder="#ff79c6"
          :class="{ error: hasError }"
          @input="handleInput"
          @blur="handleBlur"
        />
        <button
          class="color-preview"
          type="button"
          :style="{ backgroundColor: previewColor }"
          @click="openPicker"
          :aria-label="`Pick color, current ${inputValue}`"
        ></button>
        <input
          ref="hiddenPicker"
          type="color"
          class="native-picker"
          id="native-color-picker"
          :value="pickerValue"
          @input="onPick"
        />
      </div>
      <p v-if="hasError" class="error-message">
        Invalid color format. Please enter a valid CSS color (hex, rgb, hsl, or color name).
      </p>
      <div class="format-examples">
        <p class="examples-title">Supported formats:</p>
        <div class="examples-grid">
          <span class="example">#ff79c6</span>
          <span class="example">rgb(255, 121, 198)</span>
          <span class="example">hsl(326, 100%, 74%)</span>
          <span class="example">pink</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { isValidColor, normalizeColorToHex } from '../utils/colorMatcher';

interface Props {
  modelValue: string;
}

interface Emits {
  (_e: 'update:modelValue', _value: string): void;
  (_e: 'color-change', _value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const inputValue = ref(props.modelValue);
const hasError = ref(false);
const hiddenPicker = ref<HTMLInputElement | null>(null);
const pickerValue = computed(() => (hasError.value ? '#000000' : inputValue.value || '#ff79c6'));

const previewColor = computed(() => {
  if (hasError.value) {
    return 'transparent';
  }
  return inputValue.value || '#ff79c6';
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

function openPicker() {
  hiddenPicker.value?.click();
}

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
  hiddenPicker,
  pickerValue,
  previewColor,
  handleInput,
  handleBlur,
  openPicker,
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

.color-preview {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 2px solid var(--dracula-selection);
  transition: all 0.3s ease;
  flex-shrink: 0;
  cursor: pointer;

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

.native-picker {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

@media (max-width: 768px) {
  .input-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .color-preview {
    width: 100%;
    height: 40px;
  }

  .examples-grid {
    grid-template-columns: 1fr;
  }
}
</style>
