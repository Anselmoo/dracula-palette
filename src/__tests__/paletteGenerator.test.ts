import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PaletteGenerator from '../components/PaletteGenerator.vue';
import { DRACULA_COLORS, ALUCARD_COLORS } from '../data/draculaColors';

describe('PaletteGenerator Theme Awareness', () => {
  it('should use Dracula colors for presets when in Dracula theme', () => {
    const wrapper = mount(PaletteGenerator, {
      props: {
        selectedColors: [],
      },
    });

    // Check that officialColors computed property uses Dracula colors
    const vm = wrapper.vm as any;
    const officialColors = vm.officialColors;

    // Get Dracula theme colors
    const draculaRed = DRACULA_COLORS.find(c => c.name.toLowerCase() === 'red');
    const draculaGreen = DRACULA_COLORS.find(c => c.name.toLowerCase() === 'green');

    expect(officialColors.red.hex).toBe(draculaRed?.hex);
    expect(officialColors.green.hex).toBe(draculaGreen?.hex);
  });

  it('should have theme-aware preset buttons', () => {
    const wrapper = mount(PaletteGenerator, {
      props: {
        selectedColors: [],
      },
    });

    // Check that preset buttons exist
    const presetButtons = wrapper.findAll('.preset-btn');
    expect(presetButtons.length).toBeGreaterThan(0);

    // Check that color previews use dynamic colors
    const colorPreviews = wrapper.findAll('.preset-color');
    expect(colorPreviews.length).toBeGreaterThan(0);

    // Verify that colors are applied via style binding (not hardcoded)
    const firstPreview = colorPreviews[0];
    expect(firstPreview.attributes('style')).toContain('background-color');
  });

  it('should have all required preset combinations', () => {
    const wrapper = mount(PaletteGenerator, {
      props: {
        selectedColors: [],
      },
    });

    const presetButtons = wrapper.findAll('.preset-btn');
    const presetLabels = presetButtons.map(btn => btn.text());

    expect(presetLabels).toContain('Red & Green');
    expect(presetLabels).toContain('Purple & Cyan');
    expect(presetLabels).toContain('Pink & Yellow');
    expect(presetLabels).toContain('Orange & Purple');
    expect(presetLabels).toContain('All Accents');
  });

  it('should map all accent colors correctly', () => {
    const wrapper = mount(PaletteGenerator, {
      props: {
        selectedColors: [],
      },
    });

    const vm = wrapper.vm as any;
    const officialColors = vm.officialColors;

    // Verify all required colors are mapped
    expect(officialColors.red).toBeDefined();
    expect(officialColors.green).toBeDefined();
    expect(officialColors.purple).toBeDefined();
    expect(officialColors.cyan).toBeDefined();
    expect(officialColors.pink).toBeDefined();
    expect(officialColors.yellow).toBeDefined();
    expect(officialColors.orange).toBeDefined();

    // Verify they all have hex values
    expect(officialColors.red.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(officialColors.green.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(officialColors.purple.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(officialColors.cyan.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(officialColors.pink.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(officialColors.yellow.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(officialColors.orange.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('should ensure Dracula and Alucard colors are different', () => {
    // This test verifies that the two themes have different color values
    const draculaRed = DRACULA_COLORS.find(c => c.name.toLowerCase() === 'red');
    const alucardRed = ALUCARD_COLORS.find(c => c.name.toLowerCase() === 'red');

    expect(draculaRed?.hex).not.toBe(alucardRed?.hex);

    const draculaGreen = DRACULA_COLORS.find(c => c.name.toLowerCase() === 'green');
    const alucardGreen = ALUCARD_COLORS.find(c => c.name.toLowerCase() === 'green');

    expect(draculaGreen?.hex).not.toBe(alucardGreen?.hex);
  });
});
