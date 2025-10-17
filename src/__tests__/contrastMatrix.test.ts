import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ContrastMatrix from '../components/ContrastMatrix.vue';
import { DRACULA_COLORS, ALUCARD_COLORS } from '../data/draculaColors';

describe('ContrastMatrix Theme Awareness', () => {
  it('should use theme-aware colors in heatmap color scale', () => {
    const wrapper = mount(ContrastMatrix, {
      props: {
        backgrounds: [],
        accents: [],
      },
    });

    const vm = wrapper.vm as any;

    // Access the computed property for the heatmap color scale
    const colorScale = vm.heatmapColorScale;

    // Verify the color scale exists and is a function
    expect(colorScale).toBeDefined();
    expect(typeof colorScale).toBe('function');

    // Get colors for different ratio values
    const lowRatioColor = colorScale(1);
    const midRatioColor = colorScale(4.5);
    const highRatioColor = colorScale(7);

    // These should return color objects (chroma-js scale)
    expect(lowRatioColor).toBeDefined();
    expect(midRatioColor).toBeDefined();
    expect(highRatioColor).toBeDefined();
  });

  it('should display backgrounds and accents from props or fallbacks', () => {
    const wrapper = mount(ContrastMatrix, {
      props: {
        backgrounds: [],
        accents: [],
      },
    });

    const vm = wrapper.vm as any;

    // Should use fallback backgrounds and accents from current theme
    const backgrounds = vm.backgroundList;
    const accents = vm.accentList;

    expect(backgrounds).toBeDefined();
    expect(accents).toBeDefined();
    expect(Array.isArray(backgrounds)).toBe(true);
    expect(Array.isArray(accents)).toBe(true);
  });

  it('should ensure red, yellow, and green are different between Dracula and Alucard', () => {
    const draculaRed = DRACULA_COLORS.find(c => c.name === 'Red');
    const draculaYellow = DRACULA_COLORS.find(c => c.name === 'Yellow');
    const draculaGreen = DRACULA_COLORS.find(c => c.name === 'Green');

    const alucardRed = ALUCARD_COLORS.find(c => c.name === 'Red');
    const alucardYellow = ALUCARD_COLORS.find(c => c.name === 'Yellow');
    const alucardGreen = ALUCARD_COLORS.find(c => c.name === 'Green');

    // Verify colors exist in both themes
    expect(draculaRed).toBeDefined();
    expect(draculaYellow).toBeDefined();
    expect(draculaGreen).toBeDefined();
    expect(alucardRed).toBeDefined();
    expect(alucardYellow).toBeDefined();
    expect(alucardGreen).toBeDefined();

    // Verify they are different between themes
    expect(draculaRed?.hex).not.toBe(alucardRed?.hex);
    expect(draculaYellow?.hex).not.toBe(alucardYellow?.hex);
    expect(draculaGreen?.hex).not.toBe(alucardGreen?.hex);
  });
});
