import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'

export interface MockupImage {
  src: string
  alt: string
}

interface MockupPlaceholderProps {
  project: string
  image?: string
  alt?: string
  images?: MockupImage[]
  href?: string
  variant?: 'film' | 'search' | 'agent'
}

export function MockupPlaceholder({
  project,
  image,
  alt,
  images,
  href,
  variant = 'film',
}: MockupPlaceholderProps) {
  const slides = images ?? (image ? [{ src: image, alt: alt ?? `${project} product interface` }] : [])
  const [activeIndex, setActiveIndex] = useState(0)
  const [trackIndex, setTrackIndex] = useState(1)
  const [transitionEnabled, setTransitionEnabled] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const pointerStartX = useRef<number | null>(null)
  const isCarousel = slides.length > 1
  const activeSlide = slides[activeIndex]
  const carouselSlides = isCarousel
    ? [slides[slides.length - 1], ...slides, slides[0]]
    : slides

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
  }

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    if (pointerStartX.current === null) return
    const distance = event.clientX - pointerStartX.current
    pointerStartX.current = null
    if (Math.abs(distance) < 40) return
    if (distance > 0) showPrevious()
    else showNext()
  }

  const content = isCarousel ? (
    <div
      className="mockup-carousel__track"
      style={{
        transform: `translateX(-${trackIndex * 100}%)`,
        transition: transitionEnabled ? undefined : 'none',
      }}
      onTransitionEnd={handleTransitionEnd}
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

  return (
    <figure
      className={`mockup${isCarousel ? ' mockup--carousel' : ''}`}
      aria-label={isCarousel ? `${project} product gallery` : activeSlide ? undefined : `${project} mockup placeholder`}
      aria-roledescription={isCarousel ? 'carousel' : undefined}
      role={isCarousel ? 'group' : undefined}
      tabIndex={isCarousel ? 0 : undefined}
      onKeyDown={isCarousel ? handleKeyDown : undefined}
      onPointerDown={isCarousel ? handlePointerDown : undefined}
      onPointerUp={isCarousel ? handlePointerUp : undefined}
      onPointerCancel={isCarousel ? () => { pointerStartX.current = null } : undefined}
    >
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
            Image {activeIndex + 1} of {slides.length}: {activeSlide.alt}
          </figcaption>
        </>
      )}
    </figure>
  )
}
