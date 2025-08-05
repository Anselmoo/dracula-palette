<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Export Color</h3>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>

      <div class="color-preview">
        <div class="color-swatch" :style="{ backgroundColor: color }" />
        <div class="color-info">
          <h4>{{ colorName }}</h4>
          <p class="current-hex">
            {{ color }}
          </p>
        </div>
      </div>

      <div class="format-selection">
        <h4>Choose Export Format</h4>
        <div class="format-grid">
          <button
            v-for="format in formatOptions"
            :key="format.value"
            class="format-button"
            :class="{ active: selectedFormat === format.value }"
            @click="selectedFormat = format.value"
          >
            <div class="format-label">
              {{ format.label }}
            </div>
            <div class="format-example">
              {{ format.description }}
            </div>
          </button>
        </div>
      </div>

      <div class="preview-section">
        <h4>Preview</h4>
        <div class="preview-code">
          <code>{{ formattedColor }}</code>
          <button class="copy-preview-btn" :class="{ copied: previewCopied }" @click="copyPreview">
            <svg
              v-if="!previewCopied"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <svg
              v-else
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </button>
        </div>
      </div>

      <div class="modal-actions">
        <button class="primary-button" @click="copyAndClose">Copy & Close</button>
        <button class="secondary-button" @click="closeModal">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { formatColor, getColorFormatOptions, type ColorFormat } from '../utils/exportUtils';

interface Props {
  isOpen: boolean;
  color: string;
  colorName: string;
}

interface Emits {
  (_e: 'close'): void;
  (_e: 'copy', _color: string, _format: ColorFormat): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const selectedFormat = ref<ColorFormat>('hex');
const previewCopied = ref(false);
const formatOptions = getColorFormatOptions();

const formattedColor = computed(() => {
  return formatColor(props.color, selectedFormat.value);
});

watch(
  () => props.isOpen,
  isOpen => {
    if (isOpen) {
      selectedFormat.value = 'hex';
      previewCopied.value = false;
    }
  }
);

function closeModal() {
  emit('close');
}

async function copyPreview() {
  try {
    await navigator.clipboard.writeText(formattedColor.value);
    previewCopied.value = true;
    setTimeout(() => {
      previewCopied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
}

async function copyAndClose() {
  emit('copy', props.color, selectedFormat.value);
  closeModal();
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--dracula-background);
  background-color: #282a36; /* Fallback */
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--dracula-selection, #44475a);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h3 {
    margin: 0;
    color: var(--dracula-foreground, #f8f8f2);
    font-size: 1.25rem;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--dracula-comment, #6272a4);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background: var(--dracula-selection, #44475a);
      color: var(--dracula-foreground, #f8f8f2);
    }
  }
}

.color-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--dracula-selection, #44475a);
  border-radius: 8px;

  .color-swatch {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    border: 2px solid var(--dracula-comment, #6272a4);
    flex-shrink: 0;
  }

  .color-info {
    h4 {
      margin: 0 0 0.25rem 0;
      color: var(--dracula-foreground, #f8f8f2);
      font-size: 1rem;
    }

    .current-hex {
      margin: 0;
      color: var(--dracula-comment, #6272a4);
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
    }
  }
}

.format-selection {
  margin-bottom: 1.5rem;

  h4 {
    margin: 0 0 1rem 0;
    color: var(--foreground);
    font-size: 1rem;
  }

  .format-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.5rem;
  }

  .format-button {
    background: var(--dracula-selection, #44475a);
    border: 1px solid var(--dracula-comment, #6272a4);
    border-radius: 6px;
    padding: 0.75rem 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;

    &:hover {
      background: var(--dracula-current-line, #44475a);
      border-color: var(--dracula-purple, #bd93f9);
    }

    &.active {
      background: var(--dracula-purple, #bd93f9);
      border-color: var(--dracula-purple, #bd93f9);
      color: var(--dracula-background, #282a36);

      .format-example {
        color: var(--dracula-background, #282a36);
        opacity: 0.8;
      }
    }

    .format-label {
      font-weight: 600;
      color: var(--dracula-foreground, #f8f8f2);
      margin-bottom: 0.25rem;
      font-size: 0.9rem;
    }

    .format-example {
      font-family: 'Courier New', monospace;
      font-size: 0.7rem;
      color: var(--dracula-comment, #6272a4);
      line-height: 1.2;
    }

    &.active .format-label {
      color: var(--dracula-background, #282a36);
    }
  }
}

.preview-section {
  margin-bottom: 1.5rem;

  h4 {
    margin: 0 0 0.75rem 0;
    color: var(--foreground);
    font-size: 1rem;
  }

  .preview-code {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--current-line);
    border: 1px solid var(--comment);
    border-radius: 6px;
    padding: 0.75rem;

    code {
      flex: 1;
      font-family: 'Courier New', monospace;
      color: var(--foreground);
      background: none;
      font-size: 0.9rem;
    }

    .copy-preview-btn {
      background: none;
      border: none;
      color: var(--comment);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: var(--foreground);
        background: var(--selection);
      }

      &.copied {
        color: var(--green);
      }
    }
  }
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;

  button {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .primary-button {
    background: var(--dracula-purple, #bd93f9);
    color: var(--dracula-background, #282a36);
    border: none;

    &:hover {
      background: var(--dracula-pink, #ff79c6);
    }
  }

  .secondary-button {
    background: var(--dracula-selection, #44475a);
    color: var(--dracula-foreground, #f8f8f2);
    border: 1px solid var(--dracula-comment, #6272a4);

    &:hover {
      background: var(--dracula-current-line, #44475a);
      border-color: var(--dracula-purple, #bd93f9);
    }
  }
}

@media (max-width: 600px) {
  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }

  .format-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-actions {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
}
</style>
