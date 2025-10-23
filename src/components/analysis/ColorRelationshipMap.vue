<template>
  <section class="relationship-map">
    <h3 class="relationship-map__heading">
      <Icon name="relations" :size="16" />
      Color Relationship Map
    </h3>
    <p class="relationship-map__description">
      Visualize contrast relationships between all selected colors. Inspired by
      <a
        href="https://contrast-triangle.com"
        target="_blank"
        rel="noopener noreferrer"
        class="relationship-map__link"
      >
        contrast-triangle
      </a>
      but extended to support multiple color combinations.
    </p>

    <div class="relationship-map__controls">
      <label class="relationship-map__control">
        <input type="checkbox" v-model="largeText" />
        Large text mode (AA: 3:1, AAA: 4.5:1)
      </label>
      <label class="relationship-map__control">
        <input type="checkbox" v-model="showOnlyPassing" />
        Show only passing pairs
      </label>
    </div>

    <div v-if="colors.length < 2" class="relationship-map__empty">
      Select at least 2 colors to see their contrast relationships.
    </div>

    <div v-else class="relationship-map__grid">
      <!-- Color swatches header -->
      <div class="relationship-map__swatch-row">
        <div class="relationship-map__swatch-label">Colors</div>
        <div
          v-for="(color, index) in colors"
          :key="`swatch-${index}`"
          class="relationship-map__swatch"
          :style="{ backgroundColor: color.hex }"
          :title="color.name || color.hex"
        >
          <span class="relationship-map__swatch-name">{{ color.name || color.hex }}</span>
        </div>
      </div>

      <!-- Contrast matrix -->
      <div
        v-for="(rowColor, rowIndex) in colors"
        :key="`row-${rowIndex}`"
        class="relationship-map__row"
      >
        <div
          class="relationship-map__swatch relationship-map__swatch--label"
          :style="{ backgroundColor: rowColor.hex }"
          :title="rowColor.name || rowColor.hex"
        >
          <span class="relationship-map__swatch-name">{{ rowColor.name || rowColor.hex }}</span>
        </div>
        <div
          v-for="(colColor, colIndex) in colors"
          :key="`cell-${rowIndex}-${colIndex}`"
          class="relationship-map__cell"
          :class="getCellClass(rowIndex, colIndex)"
          @click="selectPair(rowIndex, colIndex)"
        >
          <template v-if="rowIndex !== colIndex">
            <span class="relationship-map__ratio">{{
              getContrastRatio(rowIndex, colIndex).toFixed(2)
            }}</span>
            <span class="relationship-map__rating">{{
              getRating(rowIndex, colIndex)
            }}</span>
          </template>
          <template v-else>
            <span class="relationship-map__self">—</span>
          </template>
        </div>
      </div>
    </div>

    <!-- Selected pair details -->
    <div v-if="selectedPair" class="relationship-map__detail">
      <h4 class="relationship-map__detail-title">
        Selected Pair: {{ selectedPair.color1.name || selectedPair.color1.hex }} vs
        {{ selectedPair.color2.name || selectedPair.color2.hex }}
      </h4>
      <div class="relationship-map__detail-content">
        <div class="relationship-map__detail-swatches">
          <div
            class="relationship-map__detail-swatch"
            :style="{ backgroundColor: selectedPair.color1.hex }"
          >
            <span
              class="relationship-map__detail-text"
              :style="{ color: selectedPair.color2.hex }"
            >
              Sample Text
            </span>
          </div>
          <div
            class="relationship-map__detail-swatch"
            :style="{ backgroundColor: selectedPair.color2.hex }"
          >
            <span
              class="relationship-map__detail-text"
              :style="{ color: selectedPair.color1.hex }"
            >
              Sample Text
            </span>
          </div>
        </div>
        <div class="relationship-map__detail-stats">
          <div class="relationship-map__stat">
            <span class="relationship-map__stat-label">Contrast Ratio:</span>
            <span class="relationship-map__stat-value">{{ selectedPair.ratio.toFixed(2) }}:1</span>
          </div>
          <div class="relationship-map__stat">
            <span class="relationship-map__stat-label">Normal Text:</span>
            <span
              class="relationship-map__stat-value"
              :class="{ pass: selectedPair.normalTextAA, fail: !selectedPair.normalTextAA }"
            >
              {{ selectedPair.normalTextAA ? 'AA ✓' : 'Fail ✗' }}
            </span>
            <span
              class="relationship-map__stat-value"
              :class="{ pass: selectedPair.normalTextAAA, fail: !selectedPair.normalTextAAA }"
            >
              {{ selectedPair.normalTextAAA ? 'AAA ✓' : 'Fail ✗' }}
            </span>
          </div>
          <div class="relationship-map__stat">
            <span class="relationship-map__stat-label">Large Text:</span>
            <span
              class="relationship-map__stat-value"
              :class="{ pass: selectedPair.largeTextAA, fail: !selectedPair.largeTextAA }"
            >
              {{ selectedPair.largeTextAA ? 'AA ✓' : 'Fail ✗' }}
            </span>
            <span
              class="relationship-map__stat-value"
              :class="{ pass: selectedPair.largeTextAAA, fail: !selectedPair.largeTextAAA }"
            >
              {{ selectedPair.largeTextAAA ? 'AAA ✓' : 'Fail ✗' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="relationship-map__legend">
      <div class="relationship-map__legend-item">
        <span class="relationship-map__legend-swatch relationship-map__legend-swatch--aaa"></span>
        AAA (≥7:1 / ≥4.5:1)
      </div>
      <div class="relationship-map__legend-item">
        <span class="relationship-map__legend-swatch relationship-map__legend-swatch--aa"></span>
        AA (≥4.5:1 / ≥3:1)
      </div>
      <div class="relationship-map__legend-item">
        <span class="relationship-map__legend-swatch relationship-map__legend-swatch--fail"></span>
        Fail (&lt;4.5:1 / &lt;3:1)
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Icon from '../Icon.vue';
import { contrastRatio, wcagRating } from '../../utils/contrast';
import type { DraculaColor } from '../../types/color';

interface Props {
  palette: DraculaColor[];
}

const props = defineProps<Props>();
const largeText = ref(false);
const showOnlyPassing = ref(false);
const selectedPairIndices = ref<[number, number] | null>(null);

const colors = computed(() => props.palette.filter(c => c.hex));

function getContrastRatio(i: number, j: number): number {
  if (i === j) return 0;
  return contrastRatio(colors.value[i].hex, colors.value[j].hex);
}

function getRating(i: number, j: number): string {
  if (i === j) return '';
  const ratio = getContrastRatio(i, j);
  return wcagRating(ratio, largeText.value);
}

function getCellClass(i: number, j: number): string {
  if (i === j) return 'relationship-map__cell--self';
  
  const rating = getRating(i, j);
  const isSelected =
    selectedPairIndices.value &&
    ((selectedPairIndices.value[0] === i && selectedPairIndices.value[1] === j) ||
      (selectedPairIndices.value[0] === j && selectedPairIndices.value[1] === i));

  const classes = [`relationship-map__cell--${rating.toLowerCase()}`];
  if (isSelected) classes.push('relationship-map__cell--selected');
  if (showOnlyPassing.value && rating === 'fail') classes.push('relationship-map__cell--hidden');
  
  return classes.join(' ');
}

function selectPair(i: number, j: number) {
  if (i === j) return;
  
  // Toggle selection
  if (
    selectedPairIndices.value &&
    ((selectedPairIndices.value[0] === i && selectedPairIndices.value[1] === j) ||
      (selectedPairIndices.value[0] === j && selectedPairIndices.value[1] === i))
  ) {
    selectedPairIndices.value = null;
  } else {
    selectedPairIndices.value = [i, j];
  }
}

const selectedPair = computed(() => {
  if (!selectedPairIndices.value) return null;
  
  const [i, j] = selectedPairIndices.value;
  const ratio = getContrastRatio(i, j);
  
  return {
    color1: colors.value[i],
    color2: colors.value[j],
    ratio,
    normalTextAA: ratio >= 4.5,
    normalTextAAA: ratio >= 7.0,
    largeTextAA: ratio >= 3.0,
    largeTextAAA: ratio >= 4.5,
  };
});
</script>

<style scoped lang="scss">
@use '@/assets/styles/analysis-mixins' as mixins;

.relationship-map {
  @include mixins.analysis-panel;
  @include mixins.analysis-animation-fade-in;
}

.relationship-map__heading {
  @include mixins.analysis-heading;
}

.relationship-map__description {
  @include mixins.analysis-description;
}

.relationship-map__link {
  color: var(--dracula-cyan);
  text-decoration: underline;
  
  &:hover {
    color: var(--dracula-purple);
  }
}

.relationship-map__controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.relationship-map__control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--dracula-comment);
  cursor: pointer;
  
  input[type='checkbox'] {
    cursor: pointer;
  }
}

.relationship-map__empty {
  padding: 2rem;
  text-align: center;
  color: var(--dracula-comment);
  background: var(--analysis-card-bg);
  border-radius: var(--radius-md);
}

.relationship-map__grid {
  display: grid;
  gap: 0.25rem;
  overflow-x: auto;
}

.relationship-map__swatch-row {
  display: grid;
  grid-template-columns: 120px repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.relationship-map__row {
  display: grid;
  grid-template-columns: 120px repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.25rem;
}

.relationship-map__swatch-label {
  font-weight: 600;
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: var(--analysis-card-bg);
  border-radius: var(--radius-sm);
}

.relationship-map__swatch {
  position: relative;
  height: 60px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--analysis-swatch-border);
  display: flex;
  align-items: flex-end;
  padding: 0.25rem;
  overflow: hidden;
  transition: transform var(--transition-fast);

  &:hover {
    transform: scale(1.05);
    z-index: 1;
  }

  &--label {
    height: 50px;
  }
}

.relationship-map__swatch-name {
  font-size: 0.7rem;
  color: var(--dracula-foreground);
  background: rgba(0, 0, 0, 0.7);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  .theme-alucard & {
    background: rgba(255, 255, 255, 0.9);
    color: var(--dracula-foreground);
  }
}

.relationship-map__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  border: 2px solid var(--surface-border);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 50px;

  &:hover:not(&--self) {
    transform: scale(1.05);
    box-shadow: var(--shadow-md);
    z-index: 1;
  }

  &--self {
    background: var(--surface);
    cursor: default;
    opacity: 0.5;
  }

  &--aaa {
    background: rgba(42, 157, 143, 0.2);
    border-color: rgba(42, 157, 143, 0.5);

    .theme-alucard & {
      background: rgba(20, 113, 10, 0.15);
      border-color: rgba(20, 113, 10, 0.4);
    }
  }

  &--aa {
    background: rgba(233, 196, 106, 0.2);
    border-color: rgba(233, 196, 106, 0.5);

    .theme-alucard & {
      background: rgba(163, 77, 20, 0.12);
      border-color: rgba(163, 77, 20, 0.35);
    }
  }

  &--fail {
    background: rgba(231, 111, 81, 0.2);
    border-color: rgba(231, 111, 81, 0.5);

    .theme-alucard & {
      background: rgba(189, 21, 41, 0.12);
      border-color: rgba(189, 21, 41, 0.35);
    }
  }

  &--selected {
    border-width: 3px;
    border-color: var(--dracula-purple);
    box-shadow: 0 0 0 2px var(--dracula-purple);
  }

  &--hidden {
    opacity: 0.3;
    pointer-events: none;
  }
}

.relationship-map__ratio {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--dracula-foreground);
}

.relationship-map__rating {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  margin-top: 0.2rem;
  
  .relationship-map__cell--aaa & {
    background: rgba(42, 157, 143, 0.8);
    color: white;

    .theme-alucard & {
      background: rgba(20, 113, 10, 0.85);
      color: white;
    }
  }
  
  .relationship-map__cell--aa & {
    background: rgba(233, 196, 106, 0.8);
    color: #282a36;

    .theme-alucard & {
      background: rgba(163, 77, 20, 0.85);
      color: white;
    }
  }
  
  .relationship-map__cell--fail & {
    background: rgba(231, 111, 81, 0.8);
    color: white;

    .theme-alucard & {
      background: rgba(189, 21, 41, 0.85);
      color: white;
    }
  }
}

.relationship-map__self {
  color: var(--dracula-comment);
  font-size: 1.5rem;
}

.relationship-map__detail {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--analysis-card-bg);
  border-radius: var(--radius-md);
  border: 2px solid var(--dracula-purple);
}

.relationship-map__detail-title {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: var(--dracula-cyan);
}

.relationship-map__detail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.relationship-map__detail-swatches {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.relationship-map__detail-swatch {
  padding: 1rem;
  border-radius: var(--radius-sm);
  border: 2px solid var(--analysis-swatch-border);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
}

.relationship-map__detail-text {
  font-size: 1.2rem;
  font-weight: 600;
}

.relationship-map__detail-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.relationship-map__stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.relationship-map__stat-label {
  font-weight: 600;
  color: var(--dracula-comment);
  min-width: 100px;
}

.relationship-map__stat-value {
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.9rem;
  border: 1px solid var(--surface-border);

  &.pass {
    background: rgba(42, 157, 143, 0.2);
    color: #2a9d8f;
    border-color: #2a9d8f;

    .theme-alucard & {
      background: rgba(20, 113, 10, 0.15);
      color: #14710a;
      border-color: #14710a;
    }
  }

  &.fail {
    background: rgba(231, 111, 81, 0.2);
    color: #e76f51;
    border-color: #e76f51;

    .theme-alucard & {
      background: rgba(189, 21, 41, 0.15);
      color: #bd1529;
      border-color: #bd1529;
    }
  }
}

.relationship-map__legend {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--surface);
  border-radius: var(--radius-sm);
  flex-wrap: wrap;
  font-size: 0.85rem;
}

.relationship-map__legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--dracula-comment);
}

.relationship-map__legend-swatch {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: 2px solid var(--surface-border);

  &--aaa {
    background: rgba(42, 157, 143, 0.5);

    .theme-alucard & {
      background: rgba(20, 113, 10, 0.4);
    }
  }

  &--aa {
    background: rgba(233, 196, 106, 0.5);

    .theme-alucard & {
      background: rgba(163, 77, 20, 0.35);
    }
  }

  &--fail {
    background: rgba(231, 111, 81, 0.5);

    .theme-alucard & {
      background: rgba(189, 21, 41, 0.35);
    }
  }
}
</style>
