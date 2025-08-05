import { DRACULA_COLORS } from '../data/draculaColors';
import type { ColorSuggestion } from '../types/color';
import chroma from 'chroma-js';

// Convert any color string to OKLCH using chroma-js
function _colorToOklch(color: string): [number, number, number] {
  try {
    const chromaColor = chroma(color);
    const [l, a, b] = chromaColor.lab();

    // Convert LAB to LCH (OKLCH approximation)
    const c = Math.sqrt(a * a + b * b);
    const h = Math.atan2(b, a) * (180 / Math.PI);

    return [
      l / 100, // Lightness 0-1
      c / 128, // Chroma scaled
      h < 0 ? h + 360 : h, // Hue 0-360
    ];
  } catch (error) {
    console.warn(`Failed to convert color ${color}:`, error);
    return [0.5, 0.2, 0]; // Default fallback
  }
}

// Calculate perceptual color distance using Delta E
function calculateColorDistance(color1: string, color2: string): number {
  try {
    const c1 = chroma(color1);
    const c2 = chroma(color2);
    return chroma.deltaE(c1, c2);
  } catch (error) {
    console.warn('Error calculating color distance:', error);
    return 100; // Maximum distance on error
  }
}

// Find the closest Dracula colors to the input color
export function findClosestDraculaColors(inputColor: string): ColorSuggestion[] {
  if (!isValidColor(inputColor)) {
    return [];
  }

  const suggestions: ColorSuggestion[] = DRACULA_COLORS.map(draculaColor => {
    const distance = calculateColorDistance(inputColor, draculaColor.hex);

    // Convert Delta E to similarity percentage (Delta E < 2 is imperceptible)
    // Delta E scale: 0-2 = imperceptible, 2-10 = perceptible, 10+ = different colors
    const similarity = Math.max(0, Math.min(100, 100 - distance * 4));

    return {
      distance,
      draculaColor,
      similarity: Math.round(similarity * 10) / 10, // Round to 1 decimal place
    };
  });

  // Sort by distance (closest first) and return top 5
  return suggestions.sort((a, b) => a.distance - b.distance).slice(0, 5);
}

// Validate if a string is a valid CSS color
export function isValidColor(color: string): boolean {
  try {
    // Use chroma-js to validate the color
    chroma(color);
    return true;
  } catch (_error) {
    return false;
  }
}

// Convert any CSS color to hex using chroma-js
export function normalizeColorToHex(color: string): string {
  try {
    return chroma(color).hex();
  } catch (error) {
    console.warn(`Failed to normalize color ${color}:`, error);
    return '#ff79c6'; // Default Dracula pink
  }
}
