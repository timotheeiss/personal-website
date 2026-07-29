import ArrowUpRightFromSquare from '@gravity-ui/icons/ArrowUpRightFromSquare'
import type { ReactNode } from 'react'
import { MockupPlaceholder, type MockupImage } from './MockupPlaceholder'

interface ProjectProps {
  name: string
  category: string
  description: ReactNode
  technologies: string[]
  variant: 'film' | 'search' | 'agent'
  href?: string
  images?: MockupImage[]
}

export function Project({ name, category, description, technologies, variant, href, images }: ProjectProps) {
  return (
    <article className="project">
      <div className="project__heading-row">
        <h3>
          <span className="entry-title">{name}</span> <span aria-hidden="true">·</span>{' '}
          <span className="project__category">{category}</span>
        </h3>
        {href && (
          <a
            className="project__external-link"
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Visit ${name} (opens in a new tab)`}
          >
            <ArrowUpRightFromSquare width={15} height={15} aria-hidden="true" />
          </a>
        )}
      </div>
      <p>{description}</p>
      <p className="project__stack" aria-label={`Technologies: ${technologies.join(', ')}`}>
        {technologies.join(' | ')}
      </p>
      <MockupPlaceholder project={name} variant={variant} images={images} />
    </article>
  )
}
