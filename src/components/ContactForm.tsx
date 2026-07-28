import Xmark from '@gravity-ui/icons/Xmark'
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'

interface ContactFields {
  name: string
  email: string
  message: string
  website: string
}

const emptyFields: ContactFields = {
  name: '',
  email: '',
  message: '',
  website: '',
}

const contactEmail = 'timothee.issenmann@gmail.com'

async function getResponseError(response: Response) {
  const responseText = await response.text()
  try {
    const data = JSON.parse(responseText) as { error?: string }
    return data.error || 'The message could not be sent. Please try again.'
  } catch {
    return 'The message could not be sent. Please try again.'
  }
}

export function ContactForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [fields, setFields] = useState<ContactFields>(emptyFields)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle')
  const [error, setError] = useState('')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const [showCopyHint, setShowCopyHint] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const copyStatusTimerRef = useRef<number | undefined>(undefined)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => () => {
    if (copyStatusTimerRef.current) window.clearTimeout(copyStatusTimerRef.current)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    nameInputRef.current?.focus()

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        return
      }

      if (event.key !== 'Tab') return
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled])',
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [isOpen])

  const openModal = () => {
    setStatus('idle')
    setError('')
    setIsOpen(true)
  }

  const copyEmail = async () => {
    setShowCopyHint(false)

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(contactEmail)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = contactEmail
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        const copied = document.execCommand('copy')
        textarea.remove()
        if (!copied) throw new Error('Copy failed')
      }
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }

    if (copyStatusTimerRef.current) window.clearTimeout(copyStatusTimerRef.current)
    copyStatusTimerRef.current = window.setTimeout(() => setCopyStatus('idle'), 1_800)
  }

  const updateField = (field: keyof ContactFields, value: string) => {
    setFields((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'sending') return

    setStatus('sending')
    setError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (!response.ok) throw new Error(await getResponseError(response))

      setFields(emptyFields)
      setStatus('success')
    } catch (requestError) {
      setStatus('idle')
      setError(requestError instanceof Error ? requestError.message : 'The message could not be sent.')
    }
  }

  const handleBackdropKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') setIsOpen(false)
  }

  return (
    <>
      <div className="contact-actions-line">
        I’m looking for product-engineering roles at ambitious early-stage startups in San Francisco,
        starting autumn 2026.{' '}
        If you think I could be useful to your team,{' '}
        <span className="contact-copy-action">
          <button
            className="contact-inline-action"
            type="button"
            onMouseEnter={() => setShowCopyHint(true)}
            onMouseLeave={() => setShowCopyHint(false)}
            onFocus={() => setShowCopyHint(true)}
            onBlur={() => setShowCopyHint(false)}
            onClick={() => void copyEmail()}
          >
            email me
          </button>
          {(copyStatus !== 'idle' || showCopyHint) && (
            <span
              className="contact-copy-confirmation"
              role={copyStatus === 'idle' ? undefined : 'status'}
            >
              {copyStatus === 'idle'
                ? 'Copy email'
                : copyStatus === 'copied'
                  ? 'Email copied!'
                  : 'Couldn’t copy email'}
            </span>
          )}
        </span>{' '}
        or send a message here.
      </div>

      <button className="contact-message-button" type="button" onClick={openModal}>
        Send a message
      </button>

      {isOpen && (
        <div
          className="contact-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false)
          }}
          onKeyDown={handleBackdropKeyDown}
        >
          <div
            ref={modalRef}
            className="contact-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
          >
            <button
              className="contact-modal__close"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close contact form"
            >
              <Xmark width={17} height={17} aria-hidden="true" />
            </button>

            <h3 id={titleId}>Send me a message</h3>
            <p id={descriptionId} className="contact-modal__description">
              This sends an email directly to{' '}
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
              I’ll reply to the email address you provide.
            </p>

            {status === 'success' ? (
              <div className="contact-modal__success" role="status">
                <p>Your message has been sent. I’ll get back to you as soon as I can.</p>
                <button type="button" onClick={() => setIsOpen(false)}>Close</button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <label>
                  <span>Name</span>
                  <input
                    ref={nameInputRef}
                    name="name"
                    type="text"
                    value={fields.name}
                    maxLength={80}
                    autoComplete="name"
                    required
                    onChange={(event) => updateField('name', event.target.value)}
                  />
                </label>

                <label>
                  <span>Email</span>
                  <input
                    name="email"
                    type="email"
                    value={fields.email}
                    maxLength={254}
                    autoComplete="email"
                    required
                    onChange={(event) => updateField('email', event.target.value)}
                  />
                </label>

                <label>
                  <span>Message</span>
                  <textarea
                    name="message"
                    value={fields.message}
                    minLength={10}
                    maxLength={3_000}
                    rows={6}
                    required
                    onChange={(event) => updateField('message', event.target.value)}
                  />
                </label>

                <label className="contact-honeypot" aria-hidden="true">
                  <span>Website</span>
                  <input
                    name="website"
                    type="text"
                    value={fields.website}
                    tabIndex={-1}
                    autoComplete="off"
                    onChange={(event) => updateField('website', event.target.value)}
                  />
                </label>

                {error && <p className="contact-form__error" role="alert">{error}</p>}

                <button className="contact-form__submit" type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
