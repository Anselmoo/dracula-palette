import { describe, it, expect } from 'vitest';
import { DRACULA_COLORS } from '../data/draculaColors';

describe('Dracula Colors', () => {
  it('should have all required colors', () => {
    expect(DRACULA_COLORS).toBeDefined();
    expect(Array.isArray(DRACULA_COLORS)).toBe(true);
    expect(DRACULA_COLORS.length).toBeGreaterThan(0);

    // Check that all expected categories are present
    const categories = DRACULA_COLORS.map(color => color.category);
    expect(categories).toContain('background');
    expect(categories).toContain('foreground');
    expect(categories).toContain('accent');
  });

  it('should have valid hex colors', () => {
    DRACULA_COLORS.forEach(color => {
      expect(color.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(color.name).toBeDefined();
      expect(color.category).toBeDefined();
    });
  });

  it('should have consistent OKLCH values', () => {
    DRACULA_COLORS.forEach(color => {
      expect(color.oklch).toBeDefined();
      expect(Array.isArray(color.oklch)).toBe(true);
      expect(color.oklch.length).toBe(3);
    });
  });
});
