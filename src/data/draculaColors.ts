import type { DraculaColor } from '../types/color';

// Official Dracula color palette with OKLCH values for perceptually uniform scaling
export const DRACULA_COLORS: DraculaColor[] = [
  // Background colors
  {
    name: 'Background',
    hex: '#282a36',
    rgb: [40, 42, 54],
    oklch: [0.19, 0.02, 264],
    description: 'Main background color',
    category: 'background',
  },
  {
    name: 'Current Line',
    hex: '#44475a',
    rgb: [68, 71, 90],
    oklch: [0.31, 0.03, 264],
    description: 'Current line highlight',
    category: 'background',
  },
  {
    name: 'Selection',
    hex: '#6272a4',
    rgb: [98, 114, 164],
    oklch: [0.49, 0.08, 264],
    description: 'Selection background',
    category: 'background',
  },
  {
    name: 'Foreground',
    hex: '#f8f8f2',
    rgb: [248, 248, 242],
    oklch: [0.97, 0.01, 102],
    description: 'Main text color',
    category: 'foreground',
  },
  {
    name: 'Comment',
    hex: '#6272a4',
    rgb: [98, 114, 164],
    oklch: [0.49, 0.08, 264],
    description: 'Comments and secondary text',
    category: 'foreground',
  },
  // Accent colors
  {
    name: 'Cyan',
    hex: '#8be9fd',
    rgb: [139, 233, 253],
    oklch: [0.87, 0.08, 199],
    description: 'Cyan accent color',
    category: 'accent',
  },
  {
    name: 'Green',
    hex: '#50fa7b',
    rgb: [80, 250, 123],
    oklch: [0.85, 0.15, 141],
    description: 'Green accent color',
    category: 'accent',
  },
  {
    name: 'Orange',
    hex: '#ffb86c',
    rgb: [255, 184, 108],
    oklch: [0.79, 0.1, 71],
    description: 'Orange accent color',
    category: 'accent',
  },
  {
    name: 'Pink',
    hex: '#ff79c6',
    rgb: [255, 121, 198],
    oklch: [0.74, 0.15, 334],
    description: 'Pink accent color',
    category: 'accent',
  },
  {
    name: 'Purple',
    hex: '#bd93f9',
    rgb: [189, 147, 249],
    oklch: [0.72, 0.12, 293],
    description: 'Purple accent color',
    category: 'accent',
  },
  {
    name: 'Red',
    hex: '#ff5555',
    rgb: [255, 85, 85],
    oklch: [0.67, 0.17, 27],
    description: 'Red accent color',
    category: 'accent',
  },
  {
    name: 'Yellow',
    hex: '#f1fa8c',
    rgb: [241, 250, 140],
    oklch: [0.92, 0.08, 102],
    description: 'Yellow accent color',
    category: 'accent',
  },
];

// Generate tonal variants for each color using OKLCH
export function generateColorVariants(baseColor: DraculaColor): DraculaColor['variants'] {
  const [baseLightness, baseChroma, baseHue] = baseColor.oklch;

  const variants: { [key: string]: string } = {};
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  steps.forEach(step => {
    // Calculate lightness based on step (50 = lightest, 950 = darkest)
    let lightness: number;
    if (step <= 500) {
      // Lighter variants (50-500)
      lightness = 0.95 - ((500 - step) / 500) * (0.95 - baseLightness);
    } else {
      // Darker variants (600-950)
      lightness = baseLightness - ((step - 500) / 450) * (baseLightness - 0.05);
    }

    // Ensure lightness is within valid range
    lightness = Math.max(0.05, Math.min(0.95, lightness));

    // Convert OKLCH to hex
    variants[step.toString()] = oklchToHex(lightness, baseChroma, baseHue);
  });

  return variants as DraculaColor['variants'];

  return variants;
}

// Convert OKLCH to hex color
function oklchToHex(l: number, c: number, h: number): string {
  // This is a simplified conversion - in a real app you'd use a proper color library
  // For now, we'll use a basic approximation
  const chroma = c * 100;
  const hue = h;
  const lightness = l * 100;

  // Convert to HSL approximately (this is simplified)
  const s = Math.min(100, chroma);
  const hsl = `hsl(${hue}, ${s}%, ${lightness}%)`;

  // For production, you should use a proper color conversion library like culori
  return hsl;
}
