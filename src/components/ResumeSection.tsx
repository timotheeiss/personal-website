import type { ReactNode } from 'react'

interface ResumeEntry {
  title: string
  role: string
  date: string
  description: ReactNode
}

interface ResumeSectionProps {
  title: string
  entries: ResumeEntry[]
}

export function ResumeSection({ title, entries }: ResumeSectionProps) {
  return (
    <section className="content-section" aria-labelledby={`${title.toLowerCase()}-heading`}>
      <h2 id={`${title.toLowerCase()}-heading`}>{title}</h2>
      <div className="resume-list">
        {entries.map((entry) => (
          <article className="resume-entry" key={`${entry.title}-${entry.role}`}>
            <h3>
              <span className="entry-title">{entry.title}</span> <span aria-hidden="true">·</span>{' '}
              <span className="resume-entry__role">{entry.role}</span>
              <span className="resume-entry__date">{entry.date}</span>
            </h3>
            <p>{entry.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
