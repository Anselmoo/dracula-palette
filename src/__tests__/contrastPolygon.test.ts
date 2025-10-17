import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ContrastPolygon from '../components/analysis/ContrastPolygon.vue';
import { DRACULA_COLORS, ALUCARD_COLORS } from '../data/draculaColors';

describe('ContrastPolygon Theme Awareness', () => {
  it('should render with a palette prop', () => {
    const palette = [
      { hex: '#ff5555', name: 'Red' },
      { hex: '#50fa7b', name: 'Green' },
      { hex: '#bd93f9', name: 'Purple' },
    ];

    const wrapper = mount(ContrastPolygon, {
      props: {
        palette,
      },
    });

    // Check that the component renders
    expect(wrapper.find('.contrast-polygon').exists()).toBe(true);
    expect(wrapper.find('.contrast-polygon__heading').exists()).toBe(true);
  });

  it('should use theme-aware colors for edge coloring', () => {
    const palette = [
      { hex: '#ff5555', name: 'Red' },
      { hex: '#50fa7b', name: 'Green' },
    ];

    const wrapper = mount(ContrastPolygon, {
      props: {
        palette,
      },
    });

    const vm = wrapper.vm as any;
    
    // Access the themeColors computed property
    const themeColors = vm.themeColors;
    
    expect(themeColors).toBeDefined();
    expect(themeColors.green).toBeDefined();
    expect(themeColors.yellow).toBeDefined();
    expect(themeColors.orange).toBeDefined();
    expect(themeColors.red).toBeDefined();
    
    // Verify they are valid hex colors
    expect(themeColors.green).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(themeColors.yellow).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(themeColors.orange).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(themeColors.red).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('should return correct edge colors based on contrast ratios', () => {
    const palette = [
      { hex: '#ff5555', name: 'Red' },
      { hex: '#50fa7b', name: 'Green' },
    ];

    const wrapper = mount(ContrastPolygon, {
      props: {
        palette,
      },
    });

    const vm = wrapper.vm as any;
    const themeColors = vm.themeColors;
    
    // Test edgeColor function with different ratios
    const colorForAAA = vm.edgeColor(7); // AAA level
    const colorForAA = vm.edgeColor(4.5); // AA level
    const colorForAALarge = vm.edgeColor(3); // AA Large level
    const colorForFail = vm.edgeColor(1); // Fail level
    
    // Verify colors match the theme colors for each level
    expect(colorForAAA).toBe(themeColors.green);
    expect(colorForAA).toBe(themeColors.yellow);
    expect(colorForAALarge).toBe(themeColors.orange);
    expect(colorForFail).toBe(themeColors.red);
  });

  it('should have working filter controls', () => {
    const palette = [
      { hex: '#ff5555', name: 'Red' },
      { hex: '#50fa7b', name: 'Green' },
      { hex: '#bd93f9', name: 'Purple' },
    ];

    const wrapper = mount(ContrastPolygon, {
      props: {
        palette,
      },
    });

    // Check that filter controls exist
    const minRatioSelect = wrapper.find('select[aria-label="Minimum contrast ratio"]');
    const hideFailing = wrapper.find('input[type="checkbox"]');
    const resetButton = wrapper.find('.btn-reset');
    
    expect(minRatioSelect.exists()).toBe(true);
    expect(hideFailing.exists()).toBe(true);
    expect(resetButton.exists()).toBe(true);
  });

  it('should ensure red, orange, green, yellow are different between Dracula and Alucard', () => {
    const draculaRed = DRACULA_COLORS.find(c => c.name === 'Red');
    const draculaOrange = DRACULA_COLORS.find(c => c.name === 'Orange');
    const draculaYellow = DRACULA_COLORS.find(c => c.name === 'Yellow');
    const draculaGreen = DRACULA_COLORS.find(c => c.name === 'Green');
    
    const alucardRed = ALUCARD_COLORS.find(c => c.name === 'Red');
    const alucardOrange = ALUCARD_COLORS.find(c => c.name === 'Orange');
    const alucardYellow = ALUCARD_COLORS.find(c => c.name === 'Yellow');
    const alucardGreen = ALUCARD_COLORS.find(c => c.name === 'Green');

    // Verify colors exist in both themes
    expect(draculaRed).toBeDefined();
    expect(draculaOrange).toBeDefined();
    expect(draculaYellow).toBeDefined();
    expect(draculaGreen).toBeDefined();
    expect(alucardRed).toBeDefined();
    expect(alucardOrange).toBeDefined();
    expect(alucardYellow).toBeDefined();
    expect(alucardGreen).toBeDefined();

    // Verify they are different between themes
    expect(draculaRed?.hex).not.toBe(alucardRed?.hex);
    expect(draculaOrange?.hex).not.toBe(alucardOrange?.hex);
    expect(draculaYellow?.hex).not.toBe(alucardYellow?.hex);
    expect(draculaGreen?.hex).not.toBe(alucardGreen?.hex);
  });
});
