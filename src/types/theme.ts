export interface ColourOption {
  id: string
  name: string
  value: string
}

export interface FontOption {
  id: string
  name: string
  body: string
  display: string
}

export interface ThemeOption {
  backgrounds: ColourOption[]
  accents: ColourOption[]
  fonts: FontOption[]
}

export interface ThemePreferences {
  backgroundId: string
  accentId: string
  fontId: string
}
