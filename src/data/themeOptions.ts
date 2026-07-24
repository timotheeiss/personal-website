import type { ThemeOption, ThemePreferences } from '../types/theme'

export const themeOptions: ThemeOption = {
  backgrounds: [
    { id: 'paper', name: 'Paper', value: '#ffffff' },
    { id: 'bone', name: 'Bone', value: '#f6f1e8' },
    { id: 'mist', name: 'Mist', value: '#eef4f8' },
    { id: 'sage', name: 'Sage', value: '#edf3ec' },
    { id: 'blush', name: 'Blush', value: '#f7eeee' },
  ],
  accents: [
    { id: 'ink', name: 'Ink', value: '#151515' },
    { id: 'cobalt', name: 'Cobalt', value: '#2450c7' },
    { id: 'clay', name: 'Clay', value: '#a43d28' },
    { id: 'moss', name: 'Moss', value: '#355e42' },
    { id: 'plum', name: 'Plum', value: '#673d66' },
  ],
  fonts: [
    {
      id: 'modern',
      name: 'Modern',
      body: '"Inter Variable", ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: '"Lora Variable", Georgia, "Times New Roman", serif',
    },
    {
      id: 'editorial',
      name: 'Editorial',
      body: 'Georgia, "Times New Roman", serif',
      display: 'Georgia, "Times New Roman", serif',
    },
    {
      id: 'humanist',
      name: 'Humanist',
      body: '"Trebuchet MS", "Segoe UI", sans-serif',
      display: '"Trebuchet MS", "Segoe UI", sans-serif',
    },
    {
      id: 'mono',
      name: 'Mono',
      body: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
      display: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
    },
  ],
}

export const defaultThemePreferences: ThemePreferences = {
  backgroundId: 'paper',
  accentId: 'ink',
  fontId: 'modern',
}
