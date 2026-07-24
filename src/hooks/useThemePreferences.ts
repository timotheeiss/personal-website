import { useEffect, useMemo, useState } from 'react'
import { defaultThemePreferences, themeOptions } from '../data/themeOptions'
import type { ThemePreferences } from '../types/theme'

export const THEME_STORAGE_KEY = 'timothee-portfolio-theme-v1'

const isKnownId = (ids: string[], value: unknown): value is string =>
  typeof value === 'string' && ids.includes(value)

export function readStoredTheme(): ThemePreferences {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (!stored) return defaultThemePreferences

    const parsed = JSON.parse(stored) as Partial<ThemePreferences>
    return {
      backgroundId: isKnownId(
        themeOptions.backgrounds.map(({ id }) => id),
        parsed.backgroundId,
      )
        ? parsed.backgroundId
        : defaultThemePreferences.backgroundId,
      accentId: isKnownId(
        themeOptions.accents.map(({ id }) => id),
        parsed.accentId,
      )
        ? parsed.accentId
        : defaultThemePreferences.accentId,
      fontId: isKnownId(
        themeOptions.fonts.map(({ id }) => id),
        parsed.fontId,
      )
        ? parsed.fontId
        : defaultThemePreferences.fontId,
    }
  } catch {
    return defaultThemePreferences
  }
}

export function useThemePreferences() {
  const [preferences, setPreferences] = useState<ThemePreferences>(readStoredTheme)

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(preferences))
    } catch {
      // The theme still works when storage is disabled or full.
    }
  }, [preferences])

  const resolved = useMemo(() => {
    const background =
      themeOptions.backgrounds.find(({ id }) => id === preferences.backgroundId) ??
      themeOptions.backgrounds[0]
    const accent =
      themeOptions.accents.find(({ id }) => id === preferences.accentId) ??
      themeOptions.accents[0]
    const font =
      themeOptions.fonts.find(({ id }) => id === preferences.fontId) ?? themeOptions.fonts[0]

    return { background, accent, font }
  }, [preferences])

  return { preferences, setPreferences, resolved }
}
