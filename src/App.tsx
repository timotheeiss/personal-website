import { useEffect, useState, type CSSProperties } from 'react'
import LogoGithub from '@gravity-ui/icons/LogoGithub'
import LogoLinkedin from '@gravity-ui/icons/LogoLinkedin'
import { PaintCanvas } from './components/PaintCanvas'
import { Project } from './components/Project'
import { QuestionPreview } from './components/QuestionPreview'
import { ResumeSection } from './components/ResumeSection'
import { ThemeControls } from './components/ThemeControls'
import { useThemePreferences } from './hooks/useThemePreferences'

const projects = [
  {
    name: 'NEWGRAIN',
    category: 'Consumer',
    description: (
      <>
        <a
          className="inline-project-link"
          href="https://newgrain.app"
          target="_blank"
          rel="noreferrer"
          aria-label="Newgrain (opens in a new tab)"
        >
          Newgrain
        </a>{' '}
        is a film photography platform I’ve been building for over 4 years. I took it from prototype to live
        product, launched a native iOS app and a web app, and drove growth to 10k+ users. Now with 45k+ posts,{' '}
        <a
          className="inline-project-link"
          href="https://apps.apple.com/fr/app/newgrain-film-photo-community/id6444198677"
          target="_blank"
          rel="noreferrer"
          aria-label="350+ App Store reviews, rated 4.8 stars (opens in a new tab)"
        >
          350+ App Store reviews (4.8☆)
        </a>
        {', and hundreds of paying subscribers, it is a growing home for the analog photography community.'}
      </>
    ),
    technologies: ['React', 'Swift', 'Firebase', 'AWS'],
    variant: 'film' as const,
    href: 'https://newgrain.app',
  },
  {
    name: 'HIVEMIND',
    category: 'Internal tool',
    description:
      'Hivemind is an internal semantic search engine I built while working at Entrepreneurs First. It allowed EF investors to discover portfolio teams and founders by typing ideas, industries or technologies in natural language. Launched mid-2025, it was the company’s first ever internal AI tool.',
    technologies: ['React', 'Vertex AI', 'BigQuery', 'OpenAI API'],
    variant: 'search' as const,
  },
  {
    name: 'SEMTAG',
    category: 'Devtool',
    description:
      'SemTag is an end-to-end testing agent that tests your GUI app using 50% less tokens than regular browser agents. It’s the result of my master’s thesis on optimising AI browsing agents for end-to-end GUI testing. (Still in development)',
    technologies: ['Python', 'React', 'Agents SDK'],
    variant: 'agent' as const,
  },
]

const experience = [
  {
    title: 'NEWGRAIN',
    role: 'Founder',
    description:
      'Incorporated in the UK, grew team of 4, raised funding from LSE Generate and Sterling Road.',
  },
  {
    title: 'ENTREPRENEURS FIRST',
    role: 'Data & Tech Analyst',
    description:
      'Built 20+ internal tools across investing, fund, marketing and leadership teams at Europe’s top pre-seed accelerator.',
  },
]

const education = [
  {
    title: 'IMPERIAL COLLEGE LONDON',
    role: 'MSc Computing',
    description:
      'Learned CS fundamentals – programming, low-level systems, algorithms, networks, machine learning – and developed fluency in C++, JS, Python, PyTorch. So far with highest honors (First Class Honors)',
  },
  {
    title: 'LONDON SCHOOL OF ECONOMICS (LSE)',
    role: 'BSc Management',
    description: 'Graduated in top 10% of year group with highest honors (First Class Honors)',
  },
]

export default function App() {
  const { preferences, setPreferences, resolved } = useThemePreferences()
  const [paintEnabled, setPaintEnabled] = useState(false)
  const [brushSize, setBrushSize] = useState(24)

  useEffect(() => {
    document.documentElement.style.setProperty('--page-background', resolved.background.value)
    return () => {
      document.documentElement.style.removeProperty('--page-background')
    }
  }, [resolved.background.value])

  const themeStyles = {
    '--page-background': resolved.background.value,
    '--accent': resolved.accent.value,
    '--font-body': resolved.font.body,
    '--font-display': resolved.font.display,
  } as CSSProperties

  return (
    <div className="app-shell" style={themeStyles}>
      <PaintCanvas enabled={paintEnabled} color={resolved.accent.value} brushSize={brushSize} />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="page-frame">
        <ThemeControls
          preferences={preferences}
          setPreferences={setPreferences}
          paintEnabled={paintEnabled}
          onPaintEnabledChange={setPaintEnabled}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
        />

        <main id="main-content">
          <header className="profile-header">
            <img
              className="profile-photo"
              src="/assets/timothee-issenmann.png"
              width="110"
              height="110"
              alt="Timothee Issenmann"
            />
            <div className="profile-name-row">
              <h1>Timothee Issenmann</h1>
              <div className="profile-social-links">
                <a
                  className="profile-social-link"
                  href="https://linkedin.com/in/timothee-issenmann"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Timothee Issenmann on LinkedIn (opens in a new tab)"
                >
                  <LogoLinkedin width={17} height={17} aria-hidden="true" />
                </a>
                <a
                  className="profile-social-link"
                  href="https://github.com/timotheeiss"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Timothee Issenmann on GitHub (opens in a new tab)"
                >
                  <LogoGithub width={17} height={17} aria-hidden="true" />
                </a>
              </div>
            </div>
            <p className="profile-subtitle">Product Engineer & Founder · Relocating to San Francisco</p>
            <p className="profile-introduction">
              I've shipped products from zero to 10k+ users, owning everything from design to code. I’m
              graduating from my CS Master’s in September 2026 and looking for product engineering roles at
              early-stage startups in San Francisco.
            </p>
          </header>

          <section className="content-section projects-section" aria-labelledby="projects-heading">
            <h2 id="projects-heading">Featured Projects</h2>
            <div className="project-list">
              {projects.map((project) => <Project key={project.name} {...project} />)}
            </div>
          </section>

          <ResumeSection title="Experience" entries={experience} />
          <ResumeSection title="Education" entries={education} />

          <section className="content-section contact-section" aria-labelledby="contact-heading">
            <h2 id="contact-heading">Contact</h2>
            <p>
              For more information about my work, please contact me at{' '}
              <a href="mailto:timothee.issenmann@gmail.com">timothee.issenmann@gmail.com</a>.
            </p>
          </section>

          <QuestionPreview />
        </main>
      </div>
    </div>
  )
}
