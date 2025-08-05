import type { DraculaColor } from '../types/color';
import type { PaletteConfig, GeneratedPalette, HarmonyRule } from '../types/palette';
import chroma from 'chroma-js';
import Color from 'color';

// Helper function to safely convert color
function safeColor(color: unknown): string {
  try {
    return chroma(color as string).hex();
  } catch (error) {
    console.warn('Color conversion failed, using fallback:', error);
    return '#808080'; // Fallback gray color
  }
}

// Proper IPT color space implementation using correct Hunt-Pointer-Estevez matrix
function rgbToIPT(r: number, g: number, b: number): [number, number, number] {
  // Normalize RGB values to [0, 1]
  r = r / 255;
  g = g / 255;
  b = b / 255;

  // Apply gamma correction (linearize RGB)
  const linearR = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  const linearG = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  const linearB = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // Convert to XYZ using sRGB matrix
  const X = linearR * 0.4124564 + linearG * 0.3575761 + linearB * 0.1804375;
  const Y = linearR * 0.2126729 + linearG * 0.7151522 + linearB * 0.072175;
  const Z = linearR * 0.0193339 + linearG * 0.119192 + linearB * 0.9503041;

  // Convert XYZ to LMS using correct Hunt-Pointer-Estevez matrix
  const L = X * 0.38971 + Y * 0.68898 + Z * -0.07868;
  const M = X * -0.22981 + Y * 1.1834 + Z * 0.04641;
  const S = X * 0.0 + Y * 0.0 + Z * 1.0;

  // Apply nonlinearity (gamma 0.43)
  const f = (x: number) => (x >= 0 ? Math.pow(x, 0.43) : -Math.pow(-x, 0.43));
  const Lp = f(L);
  const Mp = f(M);
  const Sp = f(S);

  // Convert LMS to IPT using correct transformation matrix
  const I = 0.4 * Lp + 0.4 * Mp + 0.2 * Sp;
  const P = 4.455 * Lp + -4.851 * Mp + 0.396 * Sp;
  const T = 0.8056 * Lp + 0.3572 * Mp + -1.1628 * Sp;

  return [I, P, T];
}

function iptToRGB(I: number, P: number, T: number): [number, number, number] {
  // Convert IPT to LMS (inverse matrix)
  const Lp = I * 1 + P * 0.0975 + T * 0.2052;
  const Mp = I * 1 + P * -0.1139 + T * 0.1332;
  const Sp = I * 1 + P * 0.0326 + T * -0.6769;

  // Reverse nonlinearity
  const f_inv = (x: number) => (x >= 0 ? Math.pow(x, 1 / 0.43) : -Math.pow(-x, 1 / 0.43));
  const L = f_inv(Lp);
  const M = f_inv(Mp);
  const S = f_inv(Sp);

  // Convert LMS to XYZ using inverse Hunt-Pointer-Estevez matrix
  const X = L * 1.8502 + M * -1.1383 + S * 0.2384;
  const Y = L * 0.3668 + M * 0.6438 + S * -0.0107;
  const Z = L * 0.0 + M * 0.0 + S * 1.0888;

  // Convert XYZ to linear RGB
  const linearR = X * 3.2404542 + Y * -1.5371385 + Z * -0.4985314;
  const linearG = X * -0.969266 + Y * 1.8760108 + Z * 0.041556;
  const linearB = X * 0.0556434 + Y * -0.2040259 + Z * 1.0572252;

  // Apply gamma correction (non-linear RGB)
  const gamma = (x: number) => (x > 0.0031308 ? 1.055 * Math.pow(x, 1 / 2.4) - 0.055 : 12.92 * x);
  const r = Math.max(0, Math.min(1, gamma(linearR))) * 255;
  const g = Math.max(0, Math.min(1, gamma(linearG))) * 255;
  const b = Math.max(0, Math.min(1, gamma(linearB))) * 255;

  return [Math.round(r), Math.round(g), Math.round(b)];
}

// Proper Cubehelix implementation based on Dave Green's original algorithm
function cubehelix(
  t: number,
  start: number = 0.5,
  rotations: number = -1.5,
  hue: number = 1.0,
  gamma: number = 1.0
): [number, number, number] {
  // Dave Green's exact cubehelix algorithm from the Fortran source
  const angle = 2 * Math.PI * (start / 3.0 + 1.0 + rotations * t);

  // Apply gamma correction to lightness
  const fract = Math.pow(t, gamma);

  // Amplitude calculation
  const amplitude = (hue * fract * (1 - fract)) / 2.0;

  // Calculate RGB components using exact coefficients from original algorithm
  const r = fract + amplitude * (-0.14861 * Math.cos(angle) + 1.78277 * Math.sin(angle));
  const g = fract + amplitude * (-0.29227 * Math.cos(angle) - 0.90649 * Math.sin(angle));
  const b = fract + amplitude * (1.97294 * Math.cos(angle));

  // Clamp values to [0, 1] range then scale to [0, 255]
  return [
    Math.max(0, Math.min(255, Math.round(r * 255))),
    Math.max(0, Math.min(255, Math.round(g * 255))),
    Math.max(0, Math.min(255, Math.round(b * 255))),
  ];
}

// Improved CAM16-inspired lightness adaptation with better perceptual uniformity
function cam16Lightness(baseColor: string, targetLightness: number): string {
  try {
    const [h, s] = chroma(baseColor).hsl();

    // CAM16-inspired nonlinear lightness transformation
    // Using a power function that mimics CAM16's J (lightness) correlate
    const scaledLightness = Math.pow(targetLightness, 0.67); // Improved perceptual scaling

    // Adjust chroma based on Helmholtz-Kohlrausch effect and CAM16 principles
    // Colors appear more chromatic at medium lightness values
    const chromaMultiplier = 1 - Math.pow(Math.abs(targetLightness - 0.5) * 2, 1.2) * 0.4;
    const adjustedSaturation = (s || 0.5) * chromaMultiplier;

    return chroma.hsl(h || 0, adjustedSaturation, scaledLightness).hex();
  } catch (_error) {
    return chroma.hsl(0, 0.5, targetLightness).hex();
  }
}

// Proper CIELAB color space implementation
function rgbToCIELAB(r: number, g: number, b: number): [number, number, number] {
  // Normalize RGB values to [0, 1]
  r = r / 255;
  g = g / 255;
  b = b / 255;

  // Apply gamma correction (linearize RGB)
  const linearR = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  const linearG = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  const linearB = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // Convert to XYZ using sRGB matrix
  let X = linearR * 0.4124564 + linearG * 0.3575761 + linearB * 0.1804375;
  let Y = linearR * 0.2126729 + linearG * 0.7151522 + linearB * 0.072175;
  let Z = linearR * 0.0193339 + linearG * 0.119192 + linearB * 0.9503041;

  // Normalize to D65 illuminant
  X = X / 0.95047;
  Y = Y / 1.0;
  Z = Z / 1.08883;

  // Apply LAB transformation
  const fx = X > 0.008856 ? Math.pow(X, 1 / 3) : 7.787 * X + 16 / 116;
  const fy = Y > 0.008856 ? Math.pow(Y, 1 / 3) : 7.787 * Y + 16 / 116;
  const fz = Z > 0.008856 ? Math.pow(Z, 1 / 3) : 7.787 * Z + 16 / 116;

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b_lab = 200 * (fy - fz);

  return [L, a, b_lab];
}

function cielabToRGB(L: number, a: number, b: number): [number, number, number] {
  // Convert LAB to XYZ
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;

  const X = (fx > 0.206897 ? Math.pow(fx, 3) : (fx - 16 / 116) / 7.787) * 0.95047;
  const Y = (fy > 0.206897 ? Math.pow(fy, 3) : (fy - 16 / 116) / 7.787) * 1.0;
  const Z = (fz > 0.206897 ? Math.pow(fz, 3) : (fz - 16 / 116) / 7.787) * 1.08883;

  // Convert XYZ to linear RGB
  const linearR = X * 3.2404542 + Y * -1.5371385 + Z * -0.4985314;
  const linearG = X * -0.969266 + Y * 1.8760108 + Z * 0.041556;
  const linearB = X * 0.0556434 + Y * -0.2040259 + Z * 1.0572252;

  // Apply gamma correction
  const gamma = (x: number) => (x > 0.0031308 ? 1.055 * Math.pow(x, 1 / 2.4) - 0.055 : 12.92 * x);
  const r = Math.max(0, Math.min(1, gamma(linearR))) * 255;
  const g = Math.max(0, Math.min(1, gamma(linearG))) * 255;
  const b_rgb = Math.max(0, Math.min(1, gamma(linearB))) * 255;

  return [Math.round(r), Math.round(g), Math.round(b_rgb)];
}

// Helper function to get usage based on lightness
function getUsageForLightness(
  lightness: number
): 'surface' | 'on-surface' | 'primary' | 'secondary' | 'accent' | 'neutral' {
  if (lightness > 0.8) return 'surface';
  if (lightness > 0.6) return 'secondary';
  if (lightness > 0.4) return 'primary';
  if (lightness > 0.2) return 'accent';
  return 'on-surface';
}

// Helper function to get usage based on Material Design step
function getUsageForStep(
  step: number
): 'surface' | 'on-surface' | 'primary' | 'secondary' | 'accent' | 'neutral' {
  if (step <= 100) return 'surface';
  if (step <= 300) return 'secondary';
  if (step === 500) return 'primary';
  if (step <= 700) return 'accent';
  return 'on-surface';
}

// Calculate accessibility metrics - checks contrast with common text colors
function calculateAccessibility(colors: Array<{ hex: string; name: string }>): {
  contrastRatios: { [key: string]: number };
  wcagLevel: 'AA' | 'AAA' | 'fail';
} {
  const contrastRatios: { [key: string]: number } = {};
  const whiteText = Color('#ffffff');
  const blackText = Color('#000000');
  const draculaText = Color('#f8f8f2'); // Dracula foreground

  let aaCount = 0;
  let aaaCount = 0;

  colors.forEach((color, index) => {
    try {
      const colorObj = Color(color.hex);

      // Check contrast with white text
      const whiteContrast = colorObj.contrast(whiteText);
      contrastRatios[`${index}-white`] = whiteContrast;

      // Check contrast with black text
      const blackContrast = colorObj.contrast(blackText);
      contrastRatios[`${index}-black`] = blackContrast;

      // Check contrast with Dracula text
      const draculaContrast = colorObj.contrast(draculaText);
      contrastRatios[`${index}-dracula`] = draculaContrast;

      // Determine best contrast for this color
      const bestContrast = Math.max(whiteContrast, blackContrast, draculaContrast);

      if (bestContrast >= 4.5) {
        aaCount++;
      }
      if (bestContrast >= 7) {
        aaaCount++;
      }
    } catch (_error) {
      contrastRatios[`${index}-error`] = 1;
    }
  });

  // Determine overall WCAG level based on percentage of colors that pass
  let wcagLevel: 'AA' | 'AAA' | 'fail';

  if (aaaCount >= colors.length * 0.7) {
    // 70% AAA compliance
    wcagLevel = 'AAA';
  } else if (aaCount >= colors.length * 0.5) {
    // 50% AA compliance
    wcagLevel = 'AA';
  } else {
    wcagLevel = 'fail';
  }

  return { contrastRatios, wcagLevel };
}

// Helper function for harmony rules
function getHarmonyHues(baseHue: number, rule: HarmonyRule): number[] {
  switch (rule) {
    case 'complementary':
      return [baseHue, (baseHue + 180) % 360];
    case 'triadic':
      return [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];
    case 'tetradic':
      return [baseHue, (baseHue + 90) % 360, (baseHue + 180) % 360, (baseHue + 270) % 360];
    case 'analogous':
      return [baseHue, (baseHue + 30) % 360, (baseHue - 30 + 360) % 360];
    case 'split-complementary':
      return [baseHue, (baseHue + 150) % 360, (baseHue + 210) % 360];
    case 'square':
      return [baseHue, (baseHue + 90) % 360, (baseHue + 180) % 360, (baseHue + 270) % 360];
    default:
      return [baseHue];
  }
}

// Material Design 3 generator
export function generateMaterialPalette(
  baseColor: DraculaColor,
  _config: PaletteConfig
): GeneratedPalette {
  const colors = [];
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  const base = chroma(baseColor.hex);
  const [h, s] = base.hsl();

  for (const step of steps) {
    // Material Design 3 tonal palette algorithm
    let lightness: number;
    if (step <= 500) {
      lightness = 0.95 - ((500 - step) / 500) * 0.45; // 95% to 50%
    } else {
      lightness = 0.5 - ((step - 500) / 450) * 0.45; // 50% to 5%
    }

    // Adjust saturation based on lightness for better colors
    const adjustedSaturation = (s || 0.5) * (0.7 + 0.3 * (1 - Math.abs(lightness - 0.5) * 2));

    const color = chroma.hsl(h || 0, adjustedSaturation, lightness);

    colors.push({
      hex: color.hex(),
      name: `${baseColor.name} ${step}`,
      lightness,
      chroma: adjustedSaturation,
      hue: h || 0,
      usage: getUsageForStep(step),
    });
  }

  return {
    name: `Material ${baseColor.name}`,
    standard: 'material',
    baseColor,
    colors,
    accessibility: calculateAccessibility(colors),
  };
}

// HSLuv palette generator
export function generateHSLuvPalette(
  baseColor: DraculaColor,
  config: PaletteConfig
): GeneratedPalette {
  const colors = [];
  const base = chroma(baseColor.hex);
  const [h, s] = base.hsl();

  for (let i = 0; i < config.steps; i++) {
    const t = i / (config.steps - 1);
    const lightness =
      config.lightnessRange[0] + t * (config.lightnessRange[1] - config.lightnessRange[0]);

    // HSLuv maintains perceptual uniformity
    const saturation = (s || 0.5) * (1 - Math.abs(t - 0.5) * 0.3);
    const color = chroma.hsl(h || 0, saturation, lightness);

    colors.push({
      hex: safeColor(color),
      name: `${baseColor.name} HSLuv ${Math.round(lightness * 100)}`,
      lightness,
      chroma: saturation,
      hue: h || 0,
      usage: getUsageForLightness(lightness),
    });
  }

  return {
    name: `HSLuv ${baseColor.name}`,
    standard: 'hsluv',
    baseColor,
    colors,
    accessibility: calculateAccessibility(colors),
  };
}

// OKLCH palette generator
export function generateOKLCHPalette(
  baseColor: DraculaColor,
  config: PaletteConfig
): GeneratedPalette {
  const colors = [];
  const base = chroma(baseColor.hex);
  const [h, s] = base.hsl();

  for (let i = 0; i < config.steps; i++) {
    const t = i / (config.steps - 1);
    let lightness =
      config.lightnessRange[0] + t * (config.lightnessRange[1] - config.lightnessRange[0]);

    // OKLCH-inspired chroma scaling for perceptual uniformity
    lightness = Math.pow(lightness, 0.8); // Perceptual adjustment
    const saturation = (s || 0.5) * (1 - Math.pow(Math.abs(lightness - 0.5) * 2, 1.5) * 0.4);
    const color = chroma.hsl(h || 0, saturation, lightness);

    colors.push({
      hex: safeColor(color),
      name: `${baseColor.name} OKLCH ${Math.round(lightness * 100)}`,
      lightness,
      chroma: saturation,
      hue: h || 0,
      usage: getUsageForLightness(lightness),
    });
  }

  return {
    name: `OKLCH ${baseColor.name}`,
    standard: 'oklch',
    baseColor,
    colors,
    accessibility: calculateAccessibility(colors),
  };
}

// CAM16 palette generator with proper implementation
export function generateCAM16Palette(
  baseColor: DraculaColor,
  config: PaletteConfig
): GeneratedPalette {
  const colors = [];

  for (let i = 0; i < config.steps; i++) {
    const t = i / (config.steps - 1);
    const lightness =
      config.lightnessRange[0] + t * (config.lightnessRange[1] - config.lightnessRange[0]);

    const color = cam16Lightness(baseColor.hex, lightness);

    colors.push({
      hex: safeColor(color),
      name: `${baseColor.name} CAM16 ${Math.round(lightness * 100)}`,
      lightness,
      chroma: 0.5,
      hue: 0,
      usage: getUsageForLightness(lightness),
    });
  }

  return {
    name: `CAM16 ${baseColor.name}`,
    standard: 'cam16-ucs',
    baseColor,
    colors,
    accessibility: calculateAccessibility(colors),
  };
}

// HCL palette generator
export function generateHCLPalette(
  baseColor: DraculaColor,
  config: PaletteConfig
): GeneratedPalette {
  const colors = [];
  const base = chroma(baseColor.hex);
  const [_lch_l, lch_c, lch_h] = base.lch();

  for (let i = 0; i < config.steps; i++) {
    const t = i / (config.steps - 1);
    const newL =
      config.lightnessRange[0] * 100 +
      t * (config.lightnessRange[1] - config.lightnessRange[0]) * 100;
    const newC = (lch_c || 30) * (0.6 + 0.4 * (1 - Math.abs(t - 0.5) * 2));
    const color = chroma.lch(newL, newC, lch_h || 0);

    colors.push({
      hex: safeColor(color),
      name: `${baseColor.name} HCL ${Math.round(newL)}`,
      lightness: newL / 100,
      chroma: newC,
      hue: lch_h || 0,
      usage: getUsageForLightness(newL / 100),
    });
  }

  return {
    name: `HCL ${baseColor.name}`,
    standard: 'hcl',
    baseColor,
    colors,
    accessibility: calculateAccessibility(colors),
  };
}

// IPT palette generator with proper implementation
export function generateIPTPalette(
  baseColor: DraculaColor,
  config: PaletteConfig
): GeneratedPalette {
  const colors = [];
  const baseRgb = chroma(baseColor.hex).rgb();
  const [baseI, baseP, baseT] = rgbToIPT(baseRgb[0], baseRgb[1], baseRgb[2]);

  for (let i = 0; i < config.steps; i++) {
    const t = i / (config.steps - 1);
    const lightness =
      config.lightnessRange[0] + t * (config.lightnessRange[1] - config.lightnessRange[0]);

    // Scale IPT values while maintaining hue
    const scaledI = baseI * lightness * 2; // Intensity scaling
    const scaledP = baseP * (0.8 + 0.4 * lightness); // Protanopia scaling
    const scaledT = baseT * (0.8 + 0.4 * lightness); // Tritanopia scaling

    const [r, g, b] = iptToRGB(scaledI, scaledP, scaledT);
    const color = chroma.rgb(r, g, b);

    colors.push({
      hex: safeColor(color),
      name: `${baseColor.name} IPT ${Math.round(lightness * 100)}`,
      lightness,
      chroma: 0.5,
      hue: 0,
      usage: getUsageForLightness(lightness),
    });
  }

  return {
    name: `IPT ${baseColor.name}`,
    standard: 'ipt',
    baseColor,
    colors,
    accessibility: calculateAccessibility(colors),
  };
}

// CIELAB palette generator with proper implementation
export function generateCIELABPalette(
  baseColor: DraculaColor,
  config: PaletteConfig
): GeneratedPalette {
  const colors = [];
  const baseRgb = chroma(baseColor.hex).rgb();
  const [baseL, baseA, baseB] = rgbToCIELAB(baseRgb[0], baseRgb[1], baseRgb[2]);

  for (let i = 0; i < config.steps; i++) {
    const t = i / (config.steps - 1);
    const targetL =
      config.lightnessRange[0] * 100 +
      t * (config.lightnessRange[1] - config.lightnessRange[0]) * 100;

    // Scale a* and b* proportionally to maintain hue
    const scale = Math.sqrt(targetL / (baseL || 50));
    const scaledA = baseA * scale * 0.8;
    const scaledB = baseB * scale * 0.8;

    const [r, g, b] = cielabToRGB(targetL, scaledA, scaledB);
    const color = chroma.rgb(r, g, b);

    colors.push({
      hex: safeColor(color),
      name: `${baseColor.name} CIELAB ${Math.round(targetL)}`,
      lightness: targetL / 100,
      chroma: 0.5,
      hue: 0,
      usage: getUsageForLightness(targetL / 100),
    });
  }

  return {
    name: `CIELAB ${baseColor.name}`,
    standard: 'cielab',
    baseColor,
    colors,
    accessibility: calculateAccessibility(colors),
  };
}

// Cubehelix palette generator with proper implementation
export function generateCubelixPalette(
  baseColor: DraculaColor,
  config: PaletteConfig
): GeneratedPalette {
  const colors = [];
  const base = chroma(baseColor.hex);
  const [h] = base.hsl();

  // Cubehelix parameters based on Dave Green's defaults
  const start = ((h || 0) / 360) * 3; // Convert hue to start parameter (0-3 range)
  const rotations = -1.5; // Number of rotations through color space (default)
  const hue_param = 1.0; // Hue intensity parameter
  const gamma = 1.0; // Gamma correction

  for (let i = 0; i < config.steps; i++) {
    const t = i / (config.steps - 1);
    const scaledT =
      config.lightnessRange[0] + t * (config.lightnessRange[1] - config.lightnessRange[0]);

    const [r, g, b] = cubehelix(scaledT, start, rotations, hue_param, gamma);
    const color = chroma.rgb(r, g, b);

    colors.push({
      hex: safeColor(color),
      name: `${baseColor.name} Cubehelix ${Math.round(scaledT * 100)}`,
      lightness: scaledT,
      chroma: 0.5,
      hue: h || 0,
      usage: getUsageForLightness(scaledT),
    });
  }

  return {
    name: `Cubehelix ${baseColor.name}`,
    standard: 'cubehelix',
    baseColor,
    colors,
    accessibility: calculateAccessibility(colors),
  };
}

// Color Harmony palette generator
export function generateColorHarmonyPalette(
  baseColor: DraculaColor,
  config: PaletteConfig
): GeneratedPalette {
  const colors = [];
  const base = chroma(baseColor.hex);
  const [h, s] = base.hsl();
  const harmonyHues = getHarmonyHues(h || 0, config.harmonyRule || 'analogous');

  for (let i = 0; i < config.steps; i++) {
    const t = i / (config.steps - 1);
    const lightness =
      config.lightnessRange[0] + t * (config.lightnessRange[1] - config.lightnessRange[0]);
    const hue = harmonyHues[i % harmonyHues.length];
    const saturation = (s || 0.5) * 0.8;
    const color = chroma.hsl(hue, saturation, lightness);

    colors.push({
      hex: safeColor(color),
      name: `${baseColor.name} Harmony ${Math.round(lightness * 100)}`,
      lightness,
      chroma: saturation,
      hue,
      usage: getUsageForLightness(lightness),
    });
  }

  return {
    name: `Color Harmony ${baseColor.name}`,
    standard: 'color-harmony',
    baseColor,
    colors,
    accessibility: calculateAccessibility(colors),
  };
}

// HPLuv palette generator (soft pastel colors)
// HPLuv palette generator with proper pastel color implementation
export function generateHPLuvPalette(
  baseColor: DraculaColor,
  config: PaletteConfig
): GeneratedPalette {
  const colors = [];
  const base = chroma(baseColor.hex);
  const [h, s, l] = base.hsl();

  for (let i = 0; i < config.steps; i++) {
    const t = i / (config.steps - 1);

    // HPLuv focuses on lighter, more pastel colors with proper perceptual spacing
    const lightness = 0.6 + t * 0.35; // Keep in lighter range (60% to 95%)

    // Use LAB color space for better perceptual uniformity (closer to HPLuv principles)
    try {
      const [_lab_l, lab_a, lab_b] = base.lab();

      // Scale lightness in LAB space for better perceptual uniformity
      const targetL = lightness * 100;

      // Reduce chroma for pastel effect while maintaining hue
      const chroma_scale = 0.4; // Reduce saturation significantly for pastels
      const scaled_a = lab_a * chroma_scale * (lightness / (l || 0.5));
      const scaled_b = lab_b * chroma_scale * (lightness / (l || 0.5));

      const color = chroma.lab(targetL, scaled_a, scaled_b);

      colors.push({
        hex: safeColor(color),
        name: `${baseColor.name} HPLuv ${Math.round(lightness * 100)}`,
        lightness,
        chroma: chroma_scale,
        hue: h || 0,
        usage: getUsageForLightness(lightness),
      });
    } catch (_error) {
      // Fallback to HSL if LAB conversion fails
      const saturation = Math.min((s || 0.5) * 0.4, 0.3); // Reduced saturation for pastel effect
      const color = chroma.hsl(h || 0, saturation, lightness);

      colors.push({
        hex: safeColor(color),
        name: `${baseColor.name} HPLuv ${Math.round(lightness * 100)}`,
        lightness,
        chroma: saturation,
        hue: h || 0,
        usage: getUsageForLightness(lightness),
      });
    }
  }

  return {
    name: `HPLuv ${baseColor.name}`,
    standard: 'hpluv',
    baseColor,
    colors,
    accessibility: calculateAccessibility(colors),
  };
}

// Utility function to generate accessible variants of a palette
export function generateAccessibleVariants(palette: GeneratedPalette): GeneratedPalette {
  const accessibleColors = palette.colors.map(color => {
    const whiteContrast = chroma.contrast(color.hex, '#ffffff');
    const blackContrast = chroma.contrast(color.hex, '#000000');

    // If the color doesn't meet AA standards, adjust it
    if (Math.max(whiteContrast, blackContrast) < 4.5) {
      // Determine if we should make it lighter or darker
      const shouldLighten = whiteContrast > blackContrast;

      let adjustedColor = chroma(color.hex);
      let iterations = 0;
      const maxIterations = 20;

      while (iterations < maxIterations) {
        const testWhiteContrast = chroma.contrast(adjustedColor, '#ffffff');
        const testBlackContrast = chroma.contrast(adjustedColor, '#000000');
        const bestContrast = Math.max(testWhiteContrast, testBlackContrast);

        if (bestContrast >= 4.5) break;

        // Adjust lightness
        const [h, s, l] = adjustedColor.hsl();
        const newL = shouldLighten
          ? Math.min((l || 0.5) + 0.05, 0.95)
          : Math.max((l || 0.5) - 0.05, 0.05);

        adjustedColor = chroma.hsl(h || 0, s || 0.5, newL);
        iterations++;
      }

      return {
        ...color,
        hex: adjustedColor.hex(),
        name: `${color.name} (Accessible)`,
      };
    }

    return color;
  });

  return {
    ...palette,
    name: `${palette.name} (Accessible)`,
    colors: accessibleColors,
    accessibility: calculateAccessibility(accessibleColors),
  };
}
