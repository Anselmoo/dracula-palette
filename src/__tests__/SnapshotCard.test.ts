import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SnapshotCard from '../components/analysis/SnapshotCard.vue';
import type { PaletteStandard, PaletteSourceColor } from '../types/palette';

describe('SnapshotCard Interactive Color Reveal', () => {
  const mockSources: PaletteSourceColor[] = [
    { name: 'Red', hex: '#ff5555' },
    { name: 'Green', hex: '#50fa7b' },
    { name: 'Purple', hex: '#bd93f9' },
    { name: 'Cyan', hex: '#8be9fd' },
    { name: 'Pink', hex: '#ff79c6' },
  ];

  const mockSwatches = ['#ff5555', '#50fa7b', '#bd93f9', '#8be9fd', '#ff79c6'];

  const mockInsights = {
    lightnessRange: [50, 96] as [number, number],
    averageChroma: 0.655,
    vividShare: 100,
    totalColors: 5,
  };

  const mockStandards: PaletteStandard[] = ['material', 'hsluv', 'oklch'];

  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    wrapper = mount(SnapshotCard, {
      props: {
        standards: mockStandards,
        sources: mockSources,
        insights: mockInsights,
        swatches: mockSwatches,
      },
    });
  });

  describe('Initial State - Only One Color Visible', () => {
    it('should render only one source color on initial load', () => {
      const sourceChips = wrapper.findAll('.color-chip');
      const visibleChips = sourceChips.filter(chip => chip.isVisible());
      expect(visibleChips.length).toBe(1);
    });

    it('should render only one swatch on initial load', () => {
      const swatchElements = wrapper.findAll('.clickable-swatch');
      const visibleSwatches = swatchElements.filter(swatch => swatch.isVisible());
      expect(visibleSwatches.length).toBe(1);
    });

    it('should show the first source color', () => {
      const firstChip = wrapper.find('.color-chip');
      expect(firstChip.text()).toBe('Red');
    });
  });

  describe('Interactive Reveal - Click to Show More', () => {
    it('should reveal next source color when clicked', async () => {
      const firstChip = wrapper.find('.color-chip');
      await firstChip.trigger('click');

      const sourceChips = wrapper.findAll('.color-chip');
      const visibleChips = sourceChips.filter(chip => chip.isVisible());
      expect(visibleChips.length).toBe(2);
    });

    it('should reveal next swatch when clicked', async () => {
      const firstSwatch = wrapper.find('.clickable-swatch');
      await firstSwatch.trigger('click');

      const swatchElements = wrapper.findAll('.clickable-swatch');
      const visibleSwatches = swatchElements.filter(swatch => swatch.isVisible());
      expect(visibleSwatches.length).toBe(2);
    });

    it('should reveal all colors sequentially when clicked multiple times', async () => {
      // Click to reveal all sources - click any visible chip to increment counter
      for (let i = 0; i < mockSources.length - 1; i++) {
        const firstChip = wrapper.find('.color-chip');
        await firstChip.trigger('click');
      }

      const allSourceChips = wrapper.findAll('.color-chip');
      const visibleChips = allSourceChips.filter(chip => chip.isVisible());
      expect(visibleChips.length).toBe(mockSources.length);
    });

    it('should not reveal more colors when all are already visible', async () => {
      // Reveal all colors first
      for (let i = 0; i < mockSources.length - 1; i++) {
        const firstChip = wrapper.find('.color-chip');
        await firstChip.trigger('click');
      }

      // Try to reveal more
      const firstChip = wrapper.find('.color-chip');
      await firstChip.trigger('click');

      const allSourceChips = wrapper.findAll('.color-chip');
      const visibleChips = allSourceChips.filter(chip => chip.isVisible());
      expect(visibleChips.length).toBe(mockSources.length);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for color chips', () => {
      const firstChip = wrapper.find('.color-chip');
      expect(firstChip.attributes('aria-label')).toContain('Red');
      expect(firstChip.attributes('aria-label')).toContain('Click to reveal next color');
    });

    it('should update ARIA labels when all colors are visible', async () => {
      // Reveal all colors
      for (let i = 0; i < mockSources.length - 1; i++) {
        const firstChip = wrapper.find('.color-chip');
        await firstChip.trigger('click');
      }

      const firstChip = wrapper.find('.color-chip');
      expect(firstChip.attributes('aria-label')).toBe('Red');
      expect(firstChip.attributes('aria-label')).not.toContain('Click to reveal');
    });

    it('should be keyboard accessible with tabindex', () => {
      const firstChip = wrapper.find('.color-chip');
      expect(firstChip.attributes('tabindex')).toBe('0');
    });

    it('should have role="button" for interactive elements', () => {
      const firstChip = wrapper.find('.color-chip');
      expect(firstChip.attributes('role')).toBe('button');
    });

    it('should support Enter key to reveal next color', async () => {
      const firstChip = wrapper.find('.color-chip');
      await firstChip.trigger('keydown.enter');

      const sourceChips = wrapper.findAll('.color-chip');
      const visibleChips = sourceChips.filter(chip => chip.isVisible());
      expect(visibleChips.length).toBe(2);
    });

    it('should support Space key to reveal next color', async () => {
      const firstChip = wrapper.find('.color-chip');
      await firstChip.trigger('keydown.space');

      const sourceChips = wrapper.findAll('.color-chip');
      const visibleChips = sourceChips.filter(chip => chip.isVisible());
      expect(visibleChips.length).toBe(2);
    });
  });

  describe('Animation Classes', () => {
    it('should apply reveal-animation class to newly revealed color', async () => {
      const firstChip = wrapper.find('.color-chip');
      await firstChip.trigger('click');

      const sourceChips = wrapper.findAll('.color-chip');
      const visibleChips = sourceChips.filter(chip => chip.isVisible());
      const lastVisibleChip = visibleChips[visibleChips.length - 1];

      expect(lastVisibleChip.classes()).toContain('reveal-animation');
    });
  });

  describe('No Regression - Component Rendering', () => {
    it('should still render standards section correctly', () => {
      const standardChips = wrapper.findAll('.chip');
      const standardTexts = standardChips
        .filter(chip => !chip.classes().includes('color-chip'))
        .map(chip => chip.text());

      expect(standardTexts).toContain('material');
      expect(standardTexts).toContain('hsluv');
      expect(standardTexts).toContain('oklch');
    });

    it('should still render insights metrics correctly', () => {
      const metrics = wrapper.findAll('.metric');
      expect(metrics.length).toBe(4);

      const metricLabels = wrapper.findAll('.m-label').map(el => el.text());
      expect(metricLabels).toContain('Lightness');
      expect(metricLabels).toContain('Avg Chroma');
      expect(metricLabels).toContain('Vivid');
      expect(metricLabels).toContain('Count');
    });

    it('should render the section with proper aria-label', () => {
      const section = wrapper.find('.snapshot');
      expect(section.attributes('aria-label')).toBe('Palette Snapshot');
    });

    it('should reset to show only 1 color when props change', async () => {
      // Reveal multiple colors
      const firstChip = wrapper.find('.color-chip');
      await firstChip.trigger('click');
      await firstChip.trigger('click');

      let visibleChips = wrapper.findAll('.color-chip').filter(chip => chip.isVisible());
      expect(visibleChips.length).toBeGreaterThan(1);

      // Update props with new sources
      const newSources: PaletteSourceColor[] = [
        { name: 'Blue', hex: '#0000ff' },
        { name: 'Yellow', hex: '#ffff00' },
      ];

      await wrapper.setProps({ sources: newSources });

      // Should reset to showing only 1
      visibleChips = wrapper.findAll('.color-chip').filter(chip => chip.isVisible());
      expect(visibleChips.length).toBe(1);
    });
  });
});
