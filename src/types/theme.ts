export type ThemeMode = 'dracula' | 'alucard';

export interface ThemeConfig {
  mode: ThemeMode;
  label: string;
  description: string;
}

export const THEME_CONFIGS: Record<ThemeMode, ThemeConfig> = {
  dracula: {
    mode: 'dracula',
    label: 'Dracula',
    description: 'Dark theme - The vampire that cannot stand the light',
  },
  alucard: {
    mode: 'alucard',
    label: 'Alucard',
    description: 'Light theme - The dhampir bridging light and dark',
  },
};
