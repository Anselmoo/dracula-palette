<template>
  <div class="color-input-container">
    <div class="input-section">
      <label for="color-input" class="input-label"> Enter a CSS color: </label>
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
        <div class="color-preview" :style="{ backgroundColor: previewColor }" />
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
  (e: 'update:modelValue', value: string): void;
  (e: 'color-change', value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const inputValue = ref(props.modelValue);
const hasError = ref(false);

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

watch(
  () => props.modelValue,
  newValue => {
    inputValue.value = newValue;
  }
);
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
  background: var(--dracula-current-line);
  border: 2px solid var(--dracula-selection);
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
  background: var(--dracula-current-line);
  color: var(--dracula-cyan);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  border: 1px solid var(--dracula-selection);
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
