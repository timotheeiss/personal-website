import type { ThemeOption, ThemePreferences } from '../types/theme'

export const themeOptions: ThemeOption = {
  backgrounds: [
    { id: 'white', name: 'White', value: '#ffffff' },
    { id: 'cotton-candy', name: 'Cotton Candy', value: '#fff0f6' },
    { id: 'peach-cream', name: 'Peach Cream', value: '#fff3e8' },
    { id: 'lilac-milk', name: 'Lilac Milk', value: '#f5f0ff' },
    { id: 'blue-frost', name: 'Blue Frost', value: '#edf4ff' },
    { id: 'mint-soda', name: 'Mint Soda', value: '#eafbf7' },
  ],
  accents: [
    { id: 'black', name: 'Black', value: '#151515' },
    { id: 'raspberry', name: 'Raspberry', value: '#c2185b' },
    { id: 'tangerine', name: 'Tangerine', value: '#b93800' },
    { id: 'grape', name: 'Grape', value: '#6d28d9' },
    { id: 'electric-blue', name: 'Electric Blue', value: '#1d4ed8' },
    { id: 'teal', name: 'Teal', value: '#00766c' },
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
  backgroundId: 'white',
  accentId: 'black',
  fontId: 'modern',
}
