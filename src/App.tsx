import { useEffect, useState, type CSSProperties } from 'react'
import LogoGithub from '@gravity-ui/icons/LogoGithub'
import LogoLinkedin from '@gravity-ui/icons/LogoLinkedin'
import { ContactForm } from './components/ContactForm'
import { PaintCanvas } from './components/PaintCanvas'
import { Project } from './components/Project'
import { QuestionPreview } from './components/QuestionPreview'
import { ResumeSection } from './components/ResumeSection'
import { ThemeControls } from './components/ThemeControls'
import { useThemePreferences } from './hooks/useThemePreferences'

const newgrainMobileAlts = [
  'Newgrain mobile app overview with the feed and a featured post',
  'Newgrain mobile film-stock index and Portra 160 details',
  'Newgrain mobile photographer profile and post details',
  'Newgrain mobile discovery categories and photo search results',
]

const newgrainWebAlts = [
  'Newgrain web app overview with its photographic feed',
  'Newgrain web film-stock page with Ektar 100 photographs and details',
  'Newgrain web post details with photography metadata and discussion',
  'Newgrain web photographer profile and portfolio grid',
]

const newgrainImageVariants = {
  mobile: {
    dark: newgrainMobileAlts.map((alt, index) => ({
      src: `/projects/newgrain/mobile/dark/Mobile-${index + 1}-dark.jpg`,
      alt,
    })),
    light: newgrainMobileAlts.map((alt, index) => ({
      src: `/projects/newgrain/mobile/light/Mobile-${index + 1}-light.jpg`,
      alt,
    })),
  },
  web: {
    dark: newgrainWebAlts.map((alt, index) => ({
      src: `/projects/newgrain/web/dark/Web-${index + 1}-dark.jpg`,
      alt,
    })),
    light: newgrainWebAlts.map((alt, index) => ({
      src: `/projects/newgrain/web/light/Web-${index + 1}-light.jpg`,
      alt,
    })),
  },
}

const hivemindImages = [
  {
    src: '/projects/hivemind/01.jpg',
    alt: 'Hivemind semantic search homepage for finding relevant startup teams',
  },
  {
    src: '/projects/hivemind/02.jpg',
    alt: 'Hivemind search results for AI companies in finance',
  },
  {
    src: '/projects/hivemind/03.jpg',
    alt: 'Hivemind company details panel alongside semantic search results',
  },
]

const semtagImages = [
  {
    src: '/projects/semtag/01.jpg',
    alt: 'Semtag inspection overlay identifying interactive elements and missing semantic hints',
  },
  {
    src: '/projects/semtag/02.jpg',
    alt: 'Semtag semantic snapshot alongside an annotated product details page',
  },
  {
    src: '/projects/semtag/03.jpg',
    alt: 'Browser-agent test run using semantic hints to identify a planted interface bug',
  },
]

const projects = [
  {
    name: 'Newgrain',
    category: 'Consumer',
    description: (
      <>
        I founded{' '}
        <a
          className="inline-project-link"
          href="https://newgrain.app"
          target="_blank"
          rel="noreferrer"
          aria-label="Newgrain (opens in a new tab)"
        >
          Newgrain
        </a>{' '}to create a calmer, purpose-built community for film photographers. Over four years, I took it
        from a no-code prototype to a native iOS app and web platform, owning product design, engineering,
        growth, and monetization. I’ve grown it organically to 10k+ users, 45k+ posts, hundreds of paying
        subscribers, and{' '}
        <a
          className="inline-project-link"
          href="https://apps.apple.com/fr/app/newgrain-film-photo-community/id6444198677"
          target="_blank"
          rel="noreferrer"
          aria-label="350+ App Store ratings, rated 4.8 stars (opens in a new tab)"
        >
          350+ App Store ratings (4.8☆)
        </a>
      </>
    ),
    technologies: ['Swift', 'React', 'Firebase', 'AWS'],
    variant: 'film' as const,
    href: 'https://newgrain.app',
    imageVariants: newgrainImageVariants,
  },
  {
    name: 'Hivemind',
    category: 'Internal tool',
    description:
      'At Entrepreneurs First, valuable portfolio data and investor judgment were scattered across memos, Slack, and CRM records. I built Hivemind, a semantic search engine that lets investors find relevant teams and founders using natural language. Launched in mid-2025, it has helped investors make introductions and advise founders across EF cohorts.',
    technologies: ['React', 'Vertex AI', 'BigQuery', 'OpenAI API'],
    variant: 'search' as const,
    images: hivemindImages,
  },
  {
    name: 'Generating Agent-Testable GUIs',
    category: 'Research',
    description: (
      <>
        AI browser agents are increasingly used for application testing, but their heavy token use makes them
        expensive. For my master’s thesis, I’m developing an end-to-end agent that tests graphical interfaces and
        detects bugs by injecting semantic hints into the code. Early results show 30% lower token use than regular
        browser agents. The research is conducted with{' '}
        <a
          className="inline-project-link"
          href="https://codespeak.dev/"
          target="_blank"
          rel="noreferrer"
          aria-label="CodeSpeak (opens in a new tab)"
        >
          CodeSpeak
        </a>{' '}
        and Andrey Breslav, creator of Kotlin.
      </>
    ),
    technologies: ['Python', 'React', 'Agents SDK'],
    variant: 'agent' as const,
    images: semtagImages,
  },
]

const experience = [
  {
    title: 'Newgrain',
    role: 'Founder',
    date: '2022 – Present',
    description:
      'Founded and built a consumer startup based in the UK, led a team of four, and secured funding from LSE Generate and Sterling Road.',
  },
  {
    title: 'Entrepreneurs First',
    role: 'Data & Tech Analyst',
    date: '2024 – 2025',
    description:
      'Built 20+ internal tools and automations across investing, fund, marketing and leadership teams at Europe’s top pre-seed accelerator.',
  },
]

const education = [
  {
    title: 'Imperial College London',
    role: 'MSc Computing',
    date: '2025 – 2026',
    description:
      'Learned CS fundamentals: programming, low-level systems, algorithms, networks, machine learning. Developed fluency in C++, JS, Python, PyTorch. Currently achieving First Class Honours (highest UK master’s classification).',
  },
  {
    title: 'London School of Economics',
    role: 'BSc Management',
    date: '2020 – 2024',
    description: 'Graduated with First Class Honours.',
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
              I've shipped products from zero to 10k+ users, building end-to-end from design to engineering and
              growth. I’m graduating from my CS Master’s in
              September 2026 and looking to join an early-stage startup in San Francisco from autumn 2026.
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
            <ContactForm />
          </section>

          <QuestionPreview />
        </main>
      </div>
    </div>
  )
}
