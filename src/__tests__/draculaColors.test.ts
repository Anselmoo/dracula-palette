import { describe, it, expect } from 'vitest';
import { DRACULA_COLORS, DRACULA_DARK_COLORS, DRACULA_LIGHT_COLORS, getDraculaColors } from '../data/draculaColors';

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

  it('should have dark mode colors', () => {
    expect(DRACULA_DARK_COLORS).toBeDefined();
    expect(Array.isArray(DRACULA_DARK_COLORS)).toBe(true);
    expect(DRACULA_DARK_COLORS.length).toBeGreaterThan(0);
    
    // Verify dark mode has correct background color
    const darkBg = DRACULA_DARK_COLORS.find(c => c.name === 'Background');
    expect(darkBg?.hex).toBe('#282a36');
  });

  it('should have light mode colors', () => {
    expect(DRACULA_LIGHT_COLORS).toBeDefined();
    expect(Array.isArray(DRACULA_LIGHT_COLORS)).toBe(true);
    expect(DRACULA_LIGHT_COLORS.length).toBeGreaterThan(0);
    
    // Verify light mode has correct background color
    const lightBg = DRACULA_LIGHT_COLORS.find(c => c.name === 'Background');
    expect(lightBg?.hex).toBe('#fffbeb');
  });

  it('should return dark colors by default', () => {
    const colors = getDraculaColors();
    expect(colors).toEqual(DRACULA_DARK_COLORS);
  });

  it('should return light colors when requested', () => {
    const colors = getDraculaColors('light');
    expect(colors).toEqual(DRACULA_LIGHT_COLORS);
  });

  it('should return dark colors when explicitly requested', () => {
    const colors = getDraculaColors('dark');
    expect(colors).toEqual(DRACULA_DARK_COLORS);
  });

  it('should have usage descriptions for colors', () => {
    DRACULA_LIGHT_COLORS.forEach(color => {
      expect(color.usage).toBeDefined();
      expect(color.usage).not.toBe('');
    });

    DRACULA_DARK_COLORS.forEach(color => {
      expect(color.usage).toBeDefined();
      expect(color.usage).not.toBe('');
    });
  });
});
