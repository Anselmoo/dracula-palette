import type { DraculaColor } from './color';

export type PaletteStandard =
  | 'material' // Material Design 3
  | 'hsluv' // HSLuv perceptually uniform
  | 'oklch' // OKLCH perceptually uniform
  | 'hcl' // HCL (CIE LCH)
  | 'cam16-ucs' // CAM16 Uniform Color Space
  | 'ipt' // IPT color space
  | 'color-harmony' // Color harmony rules
  | 'cielab' // CIE LAB curves
  | 'hpluv' // HPLuv pastel variant
  | 'cubehelix'; // Cubehelix algorithm

export type HarmonyRule =
  | 'monochromatic'
  | 'analogous'
  | 'complementary'
  | 'split-complementary'
  | 'triadic'
  | 'tetradic'
  | 'square'
  | 'double-split-complementary';

export interface PaletteConfig {
  standard: PaletteStandard;
  harmonyRule?: HarmonyRule;
  steps: number;
  lightnessRange: [number, number];
  chromaRange?: [number, number];
  hueShift?: number;
}

export interface GeneratedPalette {
  name: string;
  standard: PaletteStandard;
  baseColor: DraculaColor;
  colors: {
    hex: string;
    name: string;
    lightness: number;
    chroma?: number;
    hue?: number;
    usage: 'surface' | 'on-surface' | 'primary' | 'secondary' | 'accent' | 'neutral';
  }[];
  accessibility: {
    contrastRatios: { [key: string]: number };
    wcagLevel: 'AA' | 'AAA' | 'fail';
  };
}

export interface PaletteGenerationResult {
  palettes: GeneratedPalette[];
  baseColor: DraculaColor;
  totalColors: number;
  standards: PaletteStandard[];
}

export type PaletteSourceOrigin = 'preset' | 'manual' | 'custom' | 'input';

export interface PaletteSourceColor {
  hex: string;
  name: string;
  origin: PaletteSourceOrigin;
  category?: DraculaColor['category'];
}

export interface PaletteAnalysisPayload {
  palettes: GeneratedPalette[];
  sources: PaletteSourceColor[];
  standards: PaletteStandard[];
}
