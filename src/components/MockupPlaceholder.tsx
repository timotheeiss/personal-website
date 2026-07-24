interface MockupPlaceholderProps {
  project: string
  image?: string
  alt?: string
  href?: string
  variant?: 'film' | 'search' | 'agent'
}

export function MockupPlaceholder({
  project,
  image,
  alt,
  href,
  variant = 'film',
}: MockupPlaceholderProps) {
  const content = image ? (
    <img src={image} alt={alt ?? `${project} product interface`} />
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
    <figure className="mockup" aria-label={image ? undefined : `${project} mockup placeholder`}>
      {href ? (
        <a href={href} aria-label={`View ${project}`}>
          {content}
        </a>
      ) : (
        content
      )}
    </figure>
  )
}
