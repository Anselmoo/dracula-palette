// Dracula color palette based on the official specification
// https://draculatheme.com/spec

export type ThemeMode = 'dark' | 'light';

export interface DraculaColor {
  name: string;
  hex: string;
  rgb: [number, number, number];
  oklch: [number, number, number]; // [lightness, chroma, hue]
  description: string;
  category: 'background' | 'foreground' | 'accent' | 'ansi';
  usage?: string; // Usage description from the spec
  variants?: {
    50?: string;
    100?: string;
    200?: string;
    300?: string;
    400?: string;
    500?: string;
    600?: string;
    700?: string;
    800?: string;
    900?: string;
    950?: string;
  };
}

export interface ColorSuggestion {
  distance: number;
  draculaColor: DraculaColor;
  similarity: number;
}

export interface ColorMatch {
  inputColor: string;
  closestMatch: DraculaColor;
  suggestions: ColorSuggestion[];
}
