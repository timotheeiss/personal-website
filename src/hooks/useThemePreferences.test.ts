import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { defaultThemePreferences } from '../data/themeOptions'
import { THEME_STORAGE_KEY, readStoredTheme, useThemePreferences } from './useThemePreferences'

describe('theme preferences', () => {
  it('falls back safely when storage contains invalid JSON', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, '{broken')
    expect(readStoredTheme()).toEqual(defaultThemePreferences)
  })

  it('validates individual saved options', () => {
    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify({ backgroundId: 'mint-soda', accentId: 'unknown', fontId: 'mono' }),
    )
    expect(readStoredTheme()).toEqual({
      backgroundId: 'mint-soda',
      accentId: defaultThemePreferences.accentId,
      fontId: 'mono',
    })
  })

  it('persists a changed theme', () => {
    const { result } = renderHook(() => useThemePreferences())
    act(() => result.current.setPreferences((current) => ({ ...current, backgroundId: 'blue-frost' })))

    expect(JSON.parse(window.localStorage.getItem(THEME_STORAGE_KEY) ?? '{}')).toMatchObject({
      backgroundId: 'blue-frost',
    })
  })
})
