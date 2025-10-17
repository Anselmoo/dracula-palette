<template>
  <div v-if="suggestions.length > 0" class="color-suggestions">
    <h2 class="suggestions-title">Closest {{ isDarkMode ? 'Dracula' : 'Alucard' }} Colors</h2>
    <div class="suggestions-grid">
      <div
        v-for="(suggestion, index) in suggestions"
        :key="suggestion.draculaColor.name"
        class="suggestion-card"
        :class="{ 'rank-1': index === 0, 'rank-2': index === 1, 'rank-3': index === 2 }"
        @click="handleSuggestionClick(suggestion)"
      >
        <div class="suggestion-header">
          <div class="color-swatch" :style="{ backgroundColor: suggestion.draculaColor.hex }" />
          <div class="suggestion-info">
            <h3 class="color-name">
              {{ suggestion.draculaColor.name }}
            </h3>
            <p class="color-hex">
              {{ suggestion.draculaColor.hex }}
            </p>
          </div>
        </div>
        <div class="suggestion-meta">
          <div class="similarity">
            <span class="similarity-label">Similarity:</span>
            <span class="similarity-value">{{ suggestion.similarity }}%</span>
          </div>
          <div class="color-category">
            {{ suggestion.draculaColor.category }}
          </div>
        </div>
        <p class="color-description">
          {{ suggestion.draculaColor.description }}
        </p>
        <div v-if="index < 3" class="rank-badge">
          {{ index + 1 }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme';
import type { ColorSuggestion } from '../types/color';

interface Props {
  suggestions: ColorSuggestion[];
}

interface Emits {
  (_e: 'color-select', _suggestion: ColorSuggestion): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const { isDarkMode } = useTheme();

const handleSuggestionClick = (suggestion: ColorSuggestion) => {
  emit('color-select', suggestion);
};
</script>

<style lang="scss" scoped>
.color-suggestions {
  margin-bottom: 4rem;
}

.suggestions-title {
  color: var(--dracula-foreground);
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: center;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.suggestion-card {
  background: var(--surface-primary);
  border: 2px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px var(--surface-shadow);
      border-color: var(--dracula-pink);
    }
  }

  &.rank-1 {
    border-color: var(--dracula-green);

    @media (hover: hover) {
      &:hover {
        border-color: var(--dracula-green);
        box-shadow: 0 8px 32px rgba(80, 250, 123, 0.2);
      }
    }
  }

  &.rank-2 {
    border-color: var(--dracula-yellow);

    @media (hover: hover) {
      &:hover {
        border-color: var(--dracula-yellow);
        box-shadow: 0 8px 32px rgba(241, 250, 140, 0.2);
      }
    }
  }

  &.rank-3 {
    border-color: var(--dracula-orange);

    @media (hover: hover) {
      &:hover {
        border-color: var(--dracula-orange);
        box-shadow: 0 8px 32px rgba(255, 184, 108, 0.2);
      }
    }
  }
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.color-swatch {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 2px solid var(--dracula-selection);
  flex-shrink: 0;
}

.suggestion-info {
  flex: 1;
}

.color-name {
  color: var(--dracula-foreground);
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.color-hex {
  color: var(--dracula-cyan);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  margin: 0;
}

.suggestion-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--surface-secondary);
  border: 1px solid var(--surface-border); // add outline to separate from card bg in light mode
  border-radius: 6px;
}

.similarity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.similarity-label {
  color: var(--dracula-comment);
  font-size: 0.85rem;
}

.similarity-value {
  color: var(--dracula-green);
  font-weight: 600;
  font-size: 0.9rem;
}

.color-category {
  background: var(--dracula-purple);
  color: var(--dracula-background);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.color-description {
  color: var(--dracula-comment);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}

.rank-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  background: var(--dracula-pink);
  color: var(--dracula-background);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.rank-1 .rank-badge {
  background: var(--dracula-green);
}

.rank-2 .rank-badge {
  background: var(--dracula-yellow);
  color: var(--dracula-background);
}

.rank-3 .rank-badge {
  background: var(--dracula-orange);
}

@media (max-width: 768px) {
  .suggestions-grid {
    grid-template-columns: 1fr;
  }

  .suggestion-meta {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
