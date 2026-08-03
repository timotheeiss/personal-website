import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import ChevronLeft from '@gravity-ui/icons/ChevronLeft'
import ChevronRight from '@gravity-ui/icons/ChevronRight'
import Display from '@gravity-ui/icons/Display'
import Moon from '@gravity-ui/icons/Moon'
import Smartphone from '@gravity-ui/icons/Smartphone'
import Sun from '@gravity-ui/icons/Sun'
import Xmark from '@gravity-ui/icons/Xmark'

export interface MockupImage {
  src: string
  alt: string
}

export interface MockupImageVariants {
  mobile: {
    dark: MockupImage[]
    light: MockupImage[]
  }
  web: {
    dark: MockupImage[]
    light: MockupImage[]
  }
}

type MockupPlatform = keyof MockupImageVariants
type MockupAppearance = keyof MockupImageVariants['mobile']

interface MockupPlaceholderProps {
  project: string
  image?: string
  alt?: string
  images?: MockupImage[]
  imageVariants?: MockupImageVariants
  href?: string
  variant?: 'film' | 'search' | 'agent'
}

export function MockupPlaceholder({
  project,
  image,
  alt,
  images,
  imageVariants,
  href,
  variant = 'film',
}: MockupPlaceholderProps) {
  const [platform, setPlatform] = useState<MockupPlatform>('mobile')
  const [appearance, setAppearance] = useState<MockupAppearance>('dark')
  const slides = imageVariants?.[platform][appearance]
    ?? images
    ?? (image ? [{ src: image, alt: alt ?? `${project} product interface` }] : [])
  const [activeIndex, setActiveIndex] = useState(0)
  const [trackIndex, setTrackIndex] = useState(1)
  const [transitionEnabled, setTransitionEnabled] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [outgoingSlide, setOutgoingSlide] = useState<MockupImage | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const pointerStartX = useRef<number | null>(null)
  const didSwipe = useRef(false)
  const expandButtonRef = useRef<HTMLButtonElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const lightboxRef = useRef<HTMLDivElement | null>(null)
  const isCarousel = slides.length > 1
  const activeSlide = slides[activeIndex]
  const carouselSlides = isCarousel
    ? [slides[slides.length - 1], ...slides, slides[0]]
    : slides

  useEffect(() => {
    if (!imageVariants) return

    const preloadSources = (['mobile', 'web'] as const).flatMap((candidatePlatform) =>
      (['dark', 'light'] as const).map(
        (candidateAppearance) => imageVariants[candidatePlatform][candidateAppearance][activeIndex]?.src,
      ),
    )
    preloadSources.forEach((src) => {
      if (!src || src === activeSlide?.src) return
      const preload = new Image()
      preload.src = src
    })
  }, [activeIndex, activeSlide?.src, imageVariants])

  useEffect(() => {
    if (!outgoingSlide) return
    const cleanupTimer = window.setTimeout(() => setOutgoingSlide(null), 220)
    return () => window.clearTimeout(cleanupTimer)
  }, [outgoingSlide])

  useEffect(() => {
    if (!isLightboxOpen) return

    const pageRoot = document.getElementById('root')
    const rootWasInert = pageRoot?.hasAttribute('inert') ?? false
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    pageRoot?.setAttribute('inert', '')
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      if (!rootWasInert) pageRoot?.removeAttribute('inert')
      expandButtonRef.current?.focus()
    }
  }, [isLightboxOpen])

  const selectVariant = (nextPlatform: MockupPlatform, nextAppearance: MockupAppearance) => {
    if (nextPlatform === platform && nextAppearance === appearance) return
    setOutgoingSlide(activeSlide ?? null)
    setTransitionEnabled(false)
    setIsAnimating(false)
    setTrackIndex(activeIndex + 1)
    setPlatform(nextPlatform)
    setAppearance(nextAppearance)
  }

  const showSlide = (index: number) => {
    if (isAnimating || index === activeIndex) return
    setTransitionEnabled(true)
    setIsAnimating(true)
    setActiveIndex(index)
    setTrackIndex(index + 1)
  }

  const showPrevious = () => {
    if (isAnimating) return
    setTransitionEnabled(true)
    setIsAnimating(true)
    setActiveIndex((activeIndex - 1 + slides.length) % slides.length)
    setTrackIndex(trackIndex - 1)
  }

  const showNext = () => {
    if (isAnimating) return
    setTransitionEnabled(true)
    setIsAnimating(true)
    setActiveIndex((activeIndex + 1) % slides.length)
    setTrackIndex(trackIndex + 1)
  }

  const handleTransitionEnd = () => {
    setIsAnimating(false)
    if (trackIndex === 0) {
      setTransitionEnabled(false)
      setTrackIndex(slides.length)
    } else if (trackIndex === slides.length + 1) {
      setTransitionEnabled(false)
      setTrackIndex(1)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button, a')) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      showPrevious()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      showNext()
    }
  }

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    pointerStartX.current = event.clientX
    didSwipe.current = false
  }

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    if (pointerStartX.current === null) return
    const distance = event.clientX - pointerStartX.current
    pointerStartX.current = null
    if (Math.abs(distance) < 40) return
    didSwipe.current = true
    if (distance > 0) showPrevious()
    else showNext()
  }

  const openLightbox = (event: MouseEvent<HTMLButtonElement>) => {
    if (didSwipe.current) {
      event.preventDefault()
      didSwipe.current = false
      return
    }
    setIsLightboxOpen(true)
  }

  const handleLightboxKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setIsLightboxOpen(false)
      return
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      showPrevious()
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      showNext()
      return
    }
    if (event.key !== 'Tab') return

    const buttons = Array.from(
      lightboxRef.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [],
    )
    if (buttons.length === 0) return
    const firstButton = buttons[0]
    const lastButton = buttons[buttons.length - 1]
    if (event.shiftKey && document.activeElement === firstButton) {
      event.preventDefault()
      lastButton.focus()
    } else if (!event.shiftKey && document.activeElement === lastButton) {
      event.preventDefault()
      firstButton.focus()
    }
  }

  const content = isCarousel ? (
    <div
      className={`mockup-carousel__track${outgoingSlide ? ' mockup-carousel__track--variant-entering' : ''}`}
      key={`${platform}-${appearance}`}
      style={{
        transform: `translateX(-${trackIndex * 100}%)`,
        transition: transitionEnabled ? undefined : 'none',
      }}
      onTransitionEnd={handleTransitionEnd}
      onAnimationEnd={() => setOutgoingSlide(null)}
    >
      {carouselSlides.map((slide, index) => {
        const originalIndex = index === 0
          ? slides.length - 1
          : index === carouselSlides.length - 1
            ? 0
            : index - 1
        const isClone = index === 0 || index === carouselSlides.length - 1
        const isActive = !isClone && originalIndex === activeIndex

        return (
          <div className="mockup-carousel__slide" key={`${slide.src}-${index}`}>
            <img
              src={slide.src}
              alt={isActive ? slide.alt : ''}
              aria-hidden={isActive ? undefined : 'true'}
              decoding="async"
              loading="lazy"
            />
          </div>
        )
      })}
    </div>
  ) : activeSlide ? (
    <img
      src={activeSlide.src}
      alt={activeSlide.alt}
      decoding="async"
      loading="lazy"
    />
  ) : (
    <div className={`mockup-illustration mockup-illustration--${variant}`} aria-hidden="true">
      <div className="mockup-window">
        <div className="mockup-window__bar">
          <i />
          <i />
          <i />
        </div>
        <div className="mockup-window__body">
          <div className="mockup-sidebar" />
          <div className="mockup-content">
            <span className="mockup-line mockup-line--short" />
            <span className="mockup-line" />
            <div className="mockup-cards">
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      </div>
      <span className="mockup-caption">Project imagery coming soon</span>
    </div>
  )

  const lightbox = isLightboxOpen && activeSlide && typeof document !== 'undefined'
    ? createPortal(
      <div
        className="project-lightbox"
        ref={lightboxRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${project} image viewer`}
        onKeyDown={handleLightboxKeyDown}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsLightboxOpen(false)
        }}
      >
        <button
          className="project-lightbox__close"
          ref={closeButtonRef}
          type="button"
          aria-label={`Close ${project} image viewer`}
          onClick={() => setIsLightboxOpen(false)}
        >
          <Xmark aria-hidden="true" />
        </button>
        <div className="project-lightbox__content">
          <img key={activeSlide.src} src={activeSlide.src} alt={activeSlide.alt} />
          <p className="project-lightbox__caption">
            {project} · {activeIndex + 1} / {slides.length}
          </p>
        </div>
        <button
          className="project-lightbox__arrow project-lightbox__arrow--previous"
          type="button"
          aria-label={`Previous ${project} image in expanded view`}
          onClick={showPrevious}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          className="project-lightbox__arrow project-lightbox__arrow--next"
          type="button"
          aria-label={`Next ${project} image in expanded view`}
          onClick={showNext}
        >
          <ChevronRight aria-hidden="true" />
        </button>
        <div className="project-lightbox__dots" aria-label={`${project} expanded gallery slides`}>
          {slides.map((slide, index) => (
            <button
              type="button"
              key={slide.src}
              aria-label={`Show ${project} expanded image ${index + 1} of ${slides.length}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => showSlide(index)}
            />
          ))}
        </div>
      </div>,
      document.body,
    )
    : null

  return (
    <>
      <figure
      className={`mockup${isCarousel ? ' mockup--carousel' : ''}`}
      aria-label={isCarousel
        ? `${project}${imageVariants ? ` ${platform} ${appearance}` : ''} product gallery`
        : activeSlide ? undefined : `${project} mockup placeholder`}
      aria-roledescription={isCarousel ? 'carousel' : undefined}
      role={isCarousel ? 'group' : undefined}
      tabIndex={isCarousel ? 0 : undefined}
      onKeyDown={isCarousel ? handleKeyDown : undefined}
      onPointerDown={isCarousel ? handlePointerDown : undefined}
      onPointerUp={isCarousel ? handlePointerUp : undefined}
      onPointerCancel={isCarousel ? () => { pointerStartX.current = null } : undefined}
    >
      {outgoingSlide && (
        <img
          className="mockup-carousel__outgoing"
          src={outgoingSlide.src}
          alt=""
          aria-hidden="true"
        />
      )}
      {href ? (
        <a href={href} aria-label={`View ${project}`}>
          {content}
        </a>
      ) : (
        content
      )}
      {isCarousel && (
        <>
          <button
            className="mockup-carousel__expand"
            ref={expandButtonRef}
            type="button"
            aria-label={`Expand ${project} image ${activeIndex + 1}`}
            title="Expand image"
            onClick={openLightbox}
          />
          {imageVariants && (
            <div className="mockup-carousel__variants">
              <div className="mockup-carousel__variant-group" role="group" aria-label={`${project} platform`}>
                {(['mobile', 'web'] as const).map((option) => (
                  <button
                    type="button"
                    key={option}
                    aria-label={`Show ${project} ${option} images`}
                    aria-pressed={platform === option}
                    title={option === 'mobile' ? 'Mobile' : 'Web'}
                    onClick={() => selectVariant(option, appearance)}
                  >
                    {option === 'mobile'
                      ? <Smartphone aria-hidden="true" />
                      : <Display aria-hidden="true" />}
                  </button>
                ))}
              </div>
              <div className="mockup-carousel__variant-group" role="group" aria-label={`${project} appearance`}>
                {(['dark', 'light'] as const).map((option) => (
                  <button
                    type="button"
                    key={option}
                    aria-label={`Show ${project} in ${option} mode`}
                    aria-pressed={appearance === option}
                    title={option === 'dark' ? 'Dark' : 'Light'}
                    onClick={() => selectVariant(platform, option)}
                  >
                    {option === 'dark'
                      ? <Moon aria-hidden="true" />
                      : <Sun aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            className="mockup-carousel__arrow mockup-carousel__arrow--previous"
            type="button"
            aria-label={`Previous ${project} image`}
            onClick={showPrevious}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            className="mockup-carousel__arrow mockup-carousel__arrow--next"
            type="button"
            aria-label={`Next ${project} image`}
            onClick={showNext}
          >
            <span aria-hidden="true">→</span>
          </button>
          <div className="mockup-carousel__dots" aria-label={`${project} gallery slides`}>
            {slides.map((slide, index) => (
              <button
                type="button"
                key={slide.src}
                aria-label={`Show ${project} image ${index + 1} of ${slides.length}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => showSlide(index)}
              />
            ))}
          </div>
          <figcaption className="visually-hidden" aria-live="polite">
            {imageVariants && `${platform}, ${appearance}. `}
            Image {activeIndex + 1} of {slides.length}: {activeSlide.alt}
          </figcaption>
        </>
      )}
      </figure>
      {lightbox}
    </>
  )
}
