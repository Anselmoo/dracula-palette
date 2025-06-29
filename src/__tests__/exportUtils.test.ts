import { describe, it, expect } from 'vitest';
import { formatColor, generateJSONExport } from '../utils/exportUtils';
import type { GeneratedPalette } from '../types/palette';

describe('Export Utils', () => {
  describe('formatColor', () => {
    it('should format HEX colors correctly', () => {
      expect(formatColor('#ff5555', 'hex')).toBe('#ff5555');
      expect(formatColor('#FF5555', 'hex')).toBe('#ff5555');
    });

    it('should format RGB colors with proper rounding', () => {
      const rgb = formatColor('#ff5555', 'rgb');
      expect(rgb).toBe('rgb(255, 85, 85)');
    });

    it('should format HSL colors with consistent rounding', () => {
      const hsl = formatColor('#ff5555', 'hsl');
      // This should be consistent with the HEX representation
      expect(hsl).toMatch(/hsl\(\d+, \d+%, \d+%\)/);

      // Test specific case - Dracula red
      expect(formatColor('#ff5555', 'hsl')).toBe('hsl(0, 100%, 67%)');
    });

    it('should handle edge cases in HSL conversion', () => {
      // Test achromatic colors (should have hue 0)
      expect(formatColor('#ffffff', 'hsl')).toBe('hsl(0, 0%, 100%)');
      expect(formatColor('#000000', 'hsl')).toBe('hsl(0, 0%, 0%)');
      expect(formatColor('#808080', 'hsl')).toBe('hsl(0, 0%, 50%)');
    });

    it('should format OKLCH colors correctly', () => {
      const oklch = formatColor('#ff5555', 'oklch');
      expect(oklch).toMatch(/oklch\(\d+\.\d+ \d+\.\d+ \d+\)/);
    });
  });

  describe('generateJSONExport', () => {
    const mockPalette: GeneratedPalette = {
      name: 'Test Palette',
      standard: 'material',
      baseColor: {
        name: 'Red',
        hex: '#ff5555',
        rgb: [255, 85, 85],
        oklch: [0.67, 0.17, 27],
        description: 'Test red',
        category: 'accent',
      },
      colors: [
        {
          hex: '#ff5555',
          name: 'Red 500',
          lightness: 0.67,
          chroma: 0.17,
          hue: 27,
          usage: 'primary',
        },
        {
          hex: '#ffffff',
          name: 'White',
          lightness: 1.0,
          usage: 'surface',
        },
      ],
      accessibility: {
        contrastRatios: {},
        wcagLevel: 'AA',
      },
    };

    it('should always include RGB values in JSON export', () => {
      const json = generateJSONExport(mockPalette);
      const parsed = JSON.parse(json);

      // Check that all colors have RGB values
      parsed.colors.forEach((color: { rgb: { r: number; g: number; b: number } }) => {
        expect(color.rgb).toBeDefined();
        expect(color.rgb.r).toBeTypeOf('number');
        expect(color.rgb.g).toBeTypeOf('number');
        expect(color.rgb.b).toBeTypeOf('number');
      });
    });

    it('should include properly rounded HSL values', () => {
      const json = generateJSONExport(mockPalette);
      const parsed = JSON.parse(json);

      // Check HSL values are properly rounded
      parsed.colors.forEach((color: { hsl: { h: number; s: number; l: number } }) => {
        expect(color.hsl).toBeDefined();
        expect(Number.isInteger(color.hsl.h)).toBe(true);
        expect(Number.isInteger(color.hsl.s)).toBe(true);
        expect(Number.isInteger(color.hsl.l)).toBe(true);
      });
    });

    it('should handle colors with and without chroma/hue values', () => {
      const json = generateJSONExport(mockPalette);
      const parsed = JSON.parse(json);

      expect(parsed.colors).toHaveLength(2);

      // First color has chroma and hue
      expect(parsed.colors[0].chroma).toBeDefined();
      expect(parsed.colors[0].hue).toBeDefined();

      // Second color might not have chroma and hue (optional)
      expect(parsed.colors[1].hue).toBeUndefined();
    });

    it('should include metadata fields', () => {
      const json = generateJSONExport(mockPalette);
      const parsed = JSON.parse(json);

      expect(parsed.name).toBe('Test Palette');
      expect(parsed.standard).toBe('material');
      expect(parsed.baseColor).toBeDefined();
      expect(parsed.accessibility).toBeDefined();
      expect(parsed.totalColors).toBe(2);
      expect(parsed.generatedAt).toBeDefined();
    });
  });
});
