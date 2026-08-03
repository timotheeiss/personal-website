import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import FontCase from '@gravity-ui/icons/FontCase'
import Pencil from '@gravity-ui/icons/Pencil'
import Volume from '@gravity-ui/icons/Volume'
import VolumeSlash from '@gravity-ui/icons/VolumeSlash'
import { themeOptions } from '../data/themeOptions'
import type { ThemePreferences } from '../types/theme'

type OpenControl = 'background' | 'accent' | 'font' | 'paint' | 'music' | null

interface ThemeControlsProps {
  preferences: ThemePreferences
  setPreferences: Dispatch<SetStateAction<ThemePreferences>>
  paintEnabled: boolean
  onPaintEnabledChange: (enabled: boolean) => void
  brushSize: number
  onBrushSizeChange: (size: number) => void
}

interface ControlButtonProps {
  label: string
  active?: boolean
  controls?: string
  children: React.ReactNode
  onClick: () => void
}

function ControlButton({ label, active, controls, children, onClick }: ControlButtonProps) {
  return (
    <button
      className="control-button"
      type="button"
      aria-label={label}
      aria-expanded={active}
      aria-controls={controls}
      onClick={onClick}
    >
      <span className="control-label">{label}</span>
      <span className="control-icon">{children}</span>
    </button>
  )
}

interface ThickSliderProps {
  id: string
  label: string
  valueText: string
  ariaLabel?: string
  ariaValueText?: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
}

function ThickSlider({
  id,
  label,
  valueText,
  ariaLabel,
  ariaValueText,
  min,
  max,
  step,
  value,
  onChange,
}: ThickSliderProps) {
  const progress = ((value - min) / (max - min)) * 100

  return (
    <div
      className="thick-slider"
      style={{ '--slider-progress': `${progress}%` } as React.CSSProperties}
    >
      <label htmlFor={id}>{label}</label>
      <output>{valueText}</output>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel}
        aria-valuetext={ariaValueText ?? valueText}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}

export function ThemeControls({
  preferences,
  setPreferences,
  paintEnabled,
  onPaintEnabledChange,
  brushSize,
  onBrushSizeChange,
}: ThemeControlsProps) {
  const [openControl, setOpenControl] = useState<OpenControl>(null)
  const [musicOn, setMusicOn] = useState(false)
  const [musicVolume, setMusicVolume] = useState(80)
  const railRef = useRef<HTMLElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    return () => audioRef.current?.pause()
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.volume = musicVolume / 100
  }, [musicVolume])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!railRef.current?.contains(event.target as Node)) setOpenControl(null)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenControl(null)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const toggle = (control: Exclude<OpenControl, null>) => {
    setOpenControl((current) => (current === control ? null : control))
  }

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return

    if (musicOn) {
      audio.pause()
      setMusicOn(false)
      setOpenControl(null)
      return
    }

    setOpenControl('music')
    setMusicOn(true)
    audio.play()?.catch(() => {
      setMusicOn(false)
      setOpenControl(null)
    })
  }

  const fontIndex = Math.max(
    0,
    themeOptions.fonts.findIndex(({ id }) => id === preferences.fontId),
  )

  return (
    <aside className="theme-rail" aria-label="Personalise this page" ref={railRef}>
      <audio ref={audioRef} loop preload="metadata" onError={() => setMusicOn(false)}>
        <source src="/audio/background-music.m4a" type="audio/mp4" />
      </audio>
      <div className="control-item">
        <ControlButton
          label="Accent color"
          active={openControl === 'accent'}
          controls="accent-options"
          onClick={() => toggle('accent')}
        >
          <span className="accent-dot" />
        </ControlButton>
        {openControl === 'accent' && (
          <div className="control-popover colour-options" id="accent-options" role="group" aria-label="Accent colors">
            {themeOptions.accents.map((option) => (
              <button
                type="button"
                className="colour-option"
                key={option.id}
                style={{ '--option-colour': option.value } as React.CSSProperties}
                aria-label={option.name}
                aria-pressed={preferences.accentId === option.id}
                onClick={() => setPreferences((current) => ({ ...current, accentId: option.id }))}
              />
            ))}
          </div>
        )}
      </div>

      <div className="control-item">
        <ControlButton
          label="Background color"
          active={openControl === 'background'}
          controls="background-options"
          onClick={() => toggle('background')}
        >
          <span className="background-dot" />
        </ControlButton>
        {openControl === 'background' && (
          <div className="control-popover colour-options" id="background-options" role="group" aria-label="Background colors">
            {themeOptions.backgrounds.map((option) => (
              <button
                type="button"
                className="colour-option"
                key={option.id}
                style={{ '--option-colour': option.value } as React.CSSProperties}
                aria-label={option.name}
                aria-pressed={preferences.backgroundId === option.id}
                onClick={() => setPreferences((current) => ({ ...current, backgroundId: option.id }))}
              />
            ))}
          </div>
        )}
      </div>

      <div className="control-item control-item--font">
        <ControlButton
          label="Font"
          active={openControl === 'font'}
          controls="font-options"
          onClick={() => toggle('font')}
        >
          <FontCase width={20} height={20} aria-hidden="true" />
        </ControlButton>
        {openControl === 'font' && (
          <div className="control-popover font-options" id="font-options">
            <ThickSlider
              id="font-slider"
              label="Font"
              valueText={themeOptions.fonts[fontIndex].name}
              min={0}
              max={themeOptions.fonts.length - 1}
              step={1}
              value={fontIndex}
              onChange={(value) => {
                const font = themeOptions.fonts[value]
                setPreferences((current) => ({ ...current, fontId: font.id }))
              }}
            />
          </div>
        )}
      </div>

      <div className="control-item control-item--paint">
        <button
          className="control-button control-button--paint"
          type="button"
          aria-label={`Doodle ${paintEnabled ? 'on' : 'off'}`}
          aria-pressed={paintEnabled}
          aria-expanded={openControl === 'paint'}
          aria-controls="paint-options"
          onClick={() => {
            setOpenControl(paintEnabled ? null : 'paint')
            onPaintEnabledChange(!paintEnabled)
          }}
        >
          <span className="control-label">Doodle <small>{paintEnabled ? 'on' : 'off'}</small></span>
          <span className="control-icon">
            <Pencil width={20} height={20} aria-hidden="true" />
          </span>
        </button>
        {openControl === 'paint' && (
          <div className="control-popover paint-options" id="paint-options">
            <ThickSlider
              id="paint-size-slider"
              label="Brush size"
              valueText={`${brushSize}px`}
              ariaLabel="Brush thickness"
              min={8}
              max={160}
              step={4}
              value={brushSize}
              onChange={onBrushSizeChange}
            />
          </div>
        )}
      </div>
      <div className="control-item control-item--music">
        <button
          className="control-button control-button--rail-action"
          type="button"
          aria-label={`Music ${musicOn ? 'on' : 'off'}`}
          aria-pressed={musicOn}
          aria-expanded={openControl === 'music'}
          aria-controls="music-options"
          onClick={toggleMusic}
        >
          <span className="control-label">Music <small>{musicOn ? 'on' : 'off'}</small></span>
          <span className="control-icon">
            {musicOn ? (
              <Volume width={20} height={20} aria-hidden="true" />
            ) : (
              <VolumeSlash width={20} height={20} aria-hidden="true" />
            )}
          </span>
        </button>
        {openControl === 'music' && (
          <div className="control-popover music-options" id="music-options">
            <ThickSlider
              id="music-volume-slider"
              label="Volume"
              valueText={`${musicVolume}%`}
              ariaLabel="Music volume"
              min={0}
              max={100}
              step={1}
              value={musicVolume}
              onChange={setMusicVolume}
            />
          </div>
        )}
      </div>
    </aside>
  )
}
