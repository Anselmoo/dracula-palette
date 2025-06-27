import type { DraculaColor } from '../types/color';
import type {
  PaletteStandard,
  PaletteConfig,
  GeneratedPalette,
  PaletteGenerationResult,
} from '../types/palette';
import {
  generateMaterialPalette,
  generateHSLuvPalette,
  generateOKLCHPalette,
  generateHCLPalette,
  generateCAM16Palette,
  generateIPTPalette,
  generateCIELABPalette,
  generateCubelixPalette,
  generateColorHarmonyPalette,
  generateHPLuvPalette,
  generateAccessibleVariants,
} from './paletteGenerator';

// Available palette generation standards
export const PALETTE_STANDARDS: {
  key: PaletteStandard;
  name: string;
  description: string;
  bestFor: string;
  colorSpace: string;
  category: 'popular' | 'scientific' | 'web' | 'artistic';
}[] = [
  {
    key: 'material',
    name: 'Material Design 3',
    description: "Google's Material Design 3 tonal palette system",
    bestFor: 'UI/UX design, Android apps, web interfaces',
    colorSpace: 'HCT (Hue-Chroma-Tone)',
    category: 'popular',
  },
  {
    key: 'hsluv',
    name: 'HSLuv',
    description: 'Perceptually uniform HSL alternative based on CIELUV',
    bestFor: 'Data visualization, perceptual uniformity',
    colorSpace: 'HSLuv',
    category: 'popular',
  },
  {
    key: 'oklch',
    name: 'OKLCH',
    description: 'Latest perceptually uniform color space (CSS Color 4)',
    bestFor: 'Modern web design, wide gamut displays',
    colorSpace: 'OKLCH',
    category: 'popular',
  },
  {
    key: 'hcl',
    name: 'HCL (CIE LCH)',
    description: 'Cylindrical representation of CIE LAB color space',
    bestFor: 'Print design, color science applications',
    colorSpace: 'LCH',
    category: 'scientific',
  },
  {
    key: 'cam16-ucs',
    name: 'CAM16-UCS',
    description: 'Latest CIE color appearance model with uniform color space',
    bestFor: 'Professional color matching, scientific applications',
    colorSpace: 'CAM16-UCS',
    category: 'scientific',
  },
  {
    key: 'ipt',
    name: 'IPT Color Space',
    description: 'Image Processing Transform for HDR and wide gamut',
    bestFor: 'HDR content, image processing, photography',
    colorSpace: 'IPT',
    category: 'scientific',
  },
  {
    key: 'color-harmony',
    name: 'Color Harmony',
    description: 'Traditional color harmony rules (complementary, triadic, etc.)',
    bestFor: 'Artistic design, color theory applications',
    colorSpace: 'Various',
    category: 'artistic',
  },
  {
    key: 'cielab',
    name: 'CIE LAB Curves',
    description: 'Bézier curves through CIE LAB color space',
    bestFor: 'Accessible color palettes, smooth gradients',
    colorSpace: 'CIE LAB',
    category: 'web',
  },
  {
    key: 'hpluv',
    name: 'HPLuv (Pastel)',
    description: 'HSLuv variant optimized for soft, pastel colors',
    bestFor: 'Pastel designs, soft UI themes, minimalist interfaces',
    colorSpace: 'HPLuv',
    category: 'artistic',
  },
  {
    key: 'cubehelix',
    name: 'Cubehelix',
    description: 'Perceptually uniform spiral through RGB cube',
    bestFor: 'Scientific visualization, data representation',
    colorSpace: 'RGB',
    category: 'scientific',
  },
];

// Helper functions to get standards by category
export const getStandardsByCategory = (category: 'popular' | 'scientific' | 'web' | 'artistic') => {
  return PALETTE_STANDARDS.filter(standard => standard.category === category).map(s => s.key);
};

export const STANDARD_CATEGORIES = {
  popular: ['material', 'hsluv', 'oklch'],
  scientific: ['hcl', 'cam16-ucs', 'ipt', 'cubehelix'],
  web: ['cielab'],
  artistic: ['color-harmony', 'hpluv'],
} as const;

// Default configurations for each standard
export const DEFAULT_CONFIGS: { [K in PaletteStandard]: PaletteConfig } = {
  material: {
    standard: 'material',
    steps: 11,
    lightnessRange: [0.05, 0.95],
  },
  hsluv: {
    standard: 'hsluv',
    steps: 9,
    lightnessRange: [0.1, 0.9],
  },
  oklch: {
    standard: 'oklch',
    steps: 11,
    lightnessRange: [0.05, 0.95],
    chromaRange: [0.02, 0.2],
  },
  hcl: {
    standard: 'hcl',
    steps: 9,
    lightnessRange: [0.15, 0.85],
  },
  'cam16-ucs': {
    standard: 'cam16-ucs',
    steps: 9,
    lightnessRange: [0.1, 0.9],
  },
  ipt: {
    standard: 'ipt',
    steps: 9,
    lightnessRange: [0.1, 0.9],
  },
  'color-harmony': {
    standard: 'color-harmony',
    steps: 12,
    lightnessRange: [0.2, 0.8],
    harmonyRule: 'analogous',
  },
  cielab: {
    standard: 'cielab',
    steps: 10,
    lightnessRange: [0.15, 0.85],
  },
  hpluv: {
    standard: 'hpluv',
    steps: 8,
    lightnessRange: [0.6, 0.95], // Focus on lighter colors for pastels
  },
  cubehelix: {
    standard: 'cubehelix',
    steps: 10,
    lightnessRange: [0.1, 0.9],
  },
};

// Main palette generation function
export function generatePalettesForColor(
  baseColor: DraculaColor,
  standards: PaletteStandard[] = ['material', 'hsluv', 'oklch']
): PaletteGenerationResult {
  const palettes: GeneratedPalette[] = [];

  for (const standard of standards) {
    const config = DEFAULT_CONFIGS[standard];
    let palette: GeneratedPalette;

    try {
      switch (standard) {
        case 'material':
          palette = generateMaterialPalette(baseColor, config);
          break;
        case 'hsluv':
          palette = generateHSLuvPalette(baseColor, config);
          break;
        case 'oklch':
          palette = generateOKLCHPalette(baseColor, config);
          break;
        case 'hcl':
          palette = generateHCLPalette(baseColor, config);
          break;
        case 'color-harmony':
          palette = generateColorHarmonyPalette(baseColor, config);
          break;
        case 'hpluv':
          palette = generateHPLuvPalette(baseColor, config);
          break;
        case 'cam16-ucs':
          palette = generateCAM16Palette(baseColor, config);
          break;
        case 'ipt':
          palette = generateIPTPalette(baseColor, config);
          break;
        case 'cielab':
          palette = generateCIELABPalette(baseColor, config);
          break;
        case 'cubehelix':
          palette = generateCubelixPalette(baseColor, config);
          break;
        default:
          continue;
      }

      palettes.push(palette);
    } catch (error) {
      console.warn(`Failed to generate ${standard} palette:`, error);
    }
  }

  const totalColors = palettes.reduce((sum, palette) => sum + palette.colors.length, 0);

  return {
    palettes,
    baseColor,
    totalColors,
    standards,
  };
}

// Helper functions
function _getUsageForLightness(
  lightness: number
): 'surface' | 'on-surface' | 'primary' | 'secondary' | 'accent' | 'neutral' {
  if (lightness > 0.8) return 'surface';
  if (lightness > 0.6) return 'secondary';
  if (lightness > 0.4) return 'primary';
  if (lightness > 0.2) return 'accent';
  return 'on-surface';
}

// Export the generateAccessibleVariants function for UI use
export { generateAccessibleVariants };
