import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { defaultThemePreferences } from '../data/themeOptions'
import type { ThemePreferences } from '../types/theme'
import { ThemeControls } from './ThemeControls'

function Harness() {
  const [preferences, setPreferences] = useState<ThemePreferences>(defaultThemePreferences)
  const [paintEnabled, setPaintEnabled] = useState(false)
  const [brushSize, setBrushSize] = useState(24)
  return (
    <ThemeControls
      preferences={preferences}
      setPreferences={setPreferences}
      paintEnabled={paintEnabled}
      onPaintEnabledChange={setPaintEnabled}
      brushSize={brushSize}
      onBrushSizeChange={setBrushSize}
    />
  )
}

describe('ThemeControls', () => {
  it('keeps only one options panel open and closes with Escape', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Accent color' }))
    expect(screen.getByRole('group', { name: 'Accent colors' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Background color' }))
    expect(screen.queryByRole('group', { name: 'Accent colors' })).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Background colors' })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('group', { name: 'Background colors' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Accent color' }))
    expect(screen.getByRole('group', { name: 'Accent colors' })).toBeInTheDocument()
    await user.click(document.body)
    expect(screen.queryByRole('group', { name: 'Accent colors' })).not.toBeInTheDocument()
  })

  it('marks the future pet control as unavailable and toggles action states', () => {
    render(<Harness />)
    expect(screen.getByRole('button', { name: 'Pet, coming soon' })).toHaveAttribute('aria-disabled', 'true')

    const paintButton = screen.getByRole('button', { name: 'Paint off' })
    expect(paintButton).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(paintButton)
    expect(screen.getByRole('button', { name: 'Paint on' })).toHaveAttribute('aria-pressed', 'true')
    const thicknessSlider = screen.getByRole('slider', { name: 'Brush thickness' })
    expect(thicknessSlider).toHaveValue('24')
    fireEvent.change(thicknessSlider, { target: { value: '40' } })
    expect(thicknessSlider).toHaveValue('40')

    const musicButton = screen.getByRole('button', { name: 'Music off' })
    expect(musicButton).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(musicButton)
    expect(screen.getByRole('button', { name: 'Music on' })).toHaveAttribute('aria-pressed', 'true')
  })
})
