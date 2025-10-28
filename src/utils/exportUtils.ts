import type { GeneratedPalette } from '../types/palette';
import chroma from 'chroma-js';

// Color format types
export type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'oklch' | 'lch' | 'lab';

// Single color export functions
export function formatColor(hex: string, format: ColorFormat): string {
  const color = chroma(hex);

  switch (format) {
    case 'hex':
      return color.hex();
    case 'rgb': {
      const rgb = color.rgb();
      return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    }
    case 'rgba': {
      const rgba = color.rgba();
      return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`;
    }
    case 'hsl': {
      const hsl = color.hsl();
      // Ensure consistent rounding for better color matching
      const h = isNaN(hsl[0]) ? 0 : Math.round(hsl[0]);
      const s = Math.round((hsl[1] || 0) * 100);
      const l = Math.round((hsl[2] || 0) * 100);
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
    case 'hsla': {
      const hsla = color.hsl();
      // Ensure consistent rounding for better color matching
      const h = isNaN(hsla[0]) ? 0 : Math.round(hsla[0]);
      const s = Math.round((hsla[1] || 0) * 100);
      const l = Math.round((hsla[2] || 0) * 100);
      return `hsla(${h}, ${s}%, ${l}%, 1)`;
    }
    case 'oklch': {
      const oklch = color.oklch();
      return `oklch(${(oklch[0] || 0).toFixed(3)} ${(oklch[1] || 0).toFixed(3)} ${Math.round(oklch[2] || 0)})`;
    }
    case 'lch': {
      const lch = color.lch();
      return `lch(${Math.round(lch[0] || 0)} ${Math.round(lch[1] || 0)} ${Math.round(lch[2] || 0)})`;
    }
    case 'lab': {
      const lab = color.lab();
      return `lab(${Math.round(lab[0] || 0)} ${Math.round(lab[1] || 0)} ${Math.round(lab[2] || 0)})`;
    }
    default:
      return color.hex();
  }
}

export async function copyColorToClipboard(
  hex: string,
  format: ColorFormat = 'hex'
): Promise<void> {
  const formattedColor = formatColor(hex, format);
  await navigator.clipboard.writeText(formattedColor);
}

export function getColorFormatOptions(hex: string): {
  value: ColorFormat;
  label: string;
  description: string;
}[] {
  return [
    { value: 'hex', label: 'HEX', description: formatColor(hex, 'hex') },
    { value: 'rgb', label: 'RGB', description: formatColor(hex, 'rgb') },
    { value: 'rgba', label: 'RGBA', description: formatColor(hex, 'rgba') },
    { value: 'hsl', label: 'HSL', description: formatColor(hex, 'hsl') },
    { value: 'hsla', label: 'HSLA', description: formatColor(hex, 'hsla') },
    { value: 'oklch', label: 'OKLCH', description: formatColor(hex, 'oklch') },
    { value: 'lch', label: 'LCH', description: formatColor(hex, 'lch') },
    { value: 'lab', label: 'LAB', description: formatColor(hex, 'lab') },
  ];
}

export function generateCSSVariables(palette: GeneratedPalette): string {
  const paletteName = palette.name.toLowerCase().replace(/\s+/g, '-');
  const cssVars = palette.colors
    .map(color => {
      const colorName = color.name.toLowerCase().replace(/\s+/g, '-');
      return `  --${paletteName}-${colorName}: ${color.hex};`;
    })
    .join('\n');

  return `:root {\n${cssVars}\n}`;
}

export function generateSCSSVariables(palette: GeneratedPalette): string {
  const paletteName = palette.name.toLowerCase().replace(/\s+/g, '-');
  const scssVars = palette.colors
    .map(color => {
      const colorName = color.name.toLowerCase().replace(/\s+/g, '-');
      return `$${paletteName}-${colorName}: ${color.hex};`;
    })
    .join('\n');

  return `// ${palette.name} Palette\n${scssVars}\n\n// Usage mixin\n@mixin ${paletteName}-colors {\n${palette.colors
    .map(color => {
      const colorName = color.name.toLowerCase().replace(/\s+/g, '-');
      return `  --${paletteName}-${colorName}: #{$${paletteName}-${colorName}};`;
    })
    .join('\n')}\n}`;
}

export function generateTailwindConfig(palette: GeneratedPalette): string {
  const paletteName = palette.name.toLowerCase().replace(/\s+/g, '-');
  const tailwindColors: { [key: string]: string } = {};

  palette.colors.forEach(color => {
    const colorName = color.name.toLowerCase().replace(/\s+/g, '-');
    tailwindColors[colorName] = color.hex;
  });

  return `// Add to your tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        '${paletteName}': ${JSON.stringify(tailwindColors, null, 8)}
      }
    }
  }
}`;
}

export function generateJSONExport(palette: GeneratedPalette): string {
  const exportData = {
    name: palette.name,
    standard: palette.standard,
    baseColor: {
      name: palette.baseColor.name,
      hex: palette.baseColor.hex,
    },
    accessibility: {
      wcagLevel: palette.accessibility.wcagLevel,
      // Don't include the verbose contrast ratios object
    },
    colors: palette.colors.map(color => {
      const chromaColor = chroma(color.hex);
      const [h, s, l] = chromaColor.hsl();
      const [r, g, b] = chromaColor.rgb();

      return {
        name: color.name,
        hex: color.hex.toUpperCase(),
        rgb: {
          r: Math.round(r),
          g: Math.round(g),
          b: Math.round(b),
        },
        hsl: {
          h: isNaN(h) ? 0 : Math.round(h),
          s: Math.round((s || 0) * 100),
          l: Math.round(l * 100),
        },
        usage: color.usage,
        lightness: Math.round(color.lightness * 100),
        ...(color.chroma && { chroma: Math.round(color.chroma * 100) }),
        ...(color.hue !== undefined && { hue: Math.round(color.hue) }),
      };
    }),
    totalColors: palette.colors.length,
    generatedAt: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
}

export function generateFigmaTokens(palette: GeneratedPalette): string {
  const paletteName = palette.name.toLowerCase().replace(/\s+/g, '-');
  const tokens: { [key: string]: { value: string; type: string; description?: string } } = {};

  palette.colors.forEach(color => {
    const colorName = color.name.toLowerCase().replace(/\s+/g, '-');
    tokens[`${paletteName}-${colorName}`] = {
      value: color.hex,
      type: 'color',
      description: `${color.name} - ${color.usage} color`,
    };
  });

  return JSON.stringify(
    {
      [paletteName]: tokens,
    },
    null,
    2
  );
}

/**
 * Sanitizes a palette name for use in filenames by:
 * - Converting to lowercase
 * - Replacing spaces with hyphens
 * - Replacing bracketed suffixes with hyphenated versions (e.g., "(Accessible)" -> "-accessible")
 * - Removing any remaining special characters that aren't alphanumeric or hyphens
 *
 * @param name - The palette name to sanitize
 * @returns A filename-safe version of the name
 *
 * @example
 * sanitizeFilename("Material Pink") // "material-pink"
 * sanitizeFilename("Material Pink (Accessible)") // "material-pink-accessible"
 * sanitizeFilename("OKLCH Red (Accessible)") // "oklch-red-accessible"
 */
export function sanitizeFilename(name: string): string {
  return (
    name
      .toLowerCase()
      // Replace bracketed text with hyphenated version
      .replace(/\s*\(([^)]+)\)/g, (_match, content) => `-${content.toLowerCase()}`)
      // Replace spaces with hyphens
      .replace(/\s+/g, '-')
      // Remove any remaining special characters except hyphens and alphanumeric
      .replace(/[^a-z0-9-]/g, '')
      // Replace multiple consecutive hyphens with a single hyphen
      .replace(/-+/g, '-')
      // Remove leading or trailing hyphens
      .replace(/^-+|-+$/g, '')
  );
}

export function downloadFile(filename: string, content: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
