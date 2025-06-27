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
      return `hsl(${Math.round(hsl[0] || 0)}, ${Math.round((hsl[1] || 0) * 100)}%, ${Math.round((hsl[2] || 0) * 100)}%)`;
    }
    case 'hsla': {
      const hsla = color.hsl();
      return `hsla(${Math.round(hsla[0] || 0)}, ${Math.round((hsla[1] || 0) * 100)}%, ${Math.round((hsla[2] || 0) * 100)}%, 1)`;
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

export function getColorFormatOptions(): {
  value: ColorFormat;
  label: string;
  description: string;
}[] {
  return [
    { value: 'hex', label: 'HEX', description: '#ff5555' },
    { value: 'rgb', label: 'RGB', description: 'rgb(255, 85, 85)' },
    { value: 'rgba', label: 'RGBA', description: 'rgba(255, 85, 85, 1)' },
    { value: 'hsl', label: 'HSL', description: 'hsl(0, 100%, 67%)' },
    { value: 'hsla', label: 'HSLA', description: 'hsla(0, 100%, 67%, 1)' },
    { value: 'oklch', label: 'OKLCH', description: 'oklch(0.685 0.179 26)' },
    { value: 'lch', label: 'LCH', description: 'lch(61 77 26)' },
    { value: 'lab', label: 'LAB', description: 'lab(61 57 29)' },
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
    baseColor: palette.baseColor.name,
    accessibility: palette.accessibility,
    colors: palette.colors.map(color => ({
      name: color.name,
      hex: color.hex,
      usage: color.usage,
      lightness: Math.round(color.lightness * 100),
      ...(color.chroma && { chroma: Math.round(color.chroma * 100) }),
      ...(color.hue && { hue: Math.round(color.hue) }),
    })),
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
