import { useEffect, useRef, useState, type FormEvent } from 'react'
import ArrowUp from '@gravity-ui/icons/ArrowUp'
import ReactMarkdown from 'react-markdown'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatStreamEvent {
  type?: 'delta' | 'done' | 'error'
  delta?: string
  error?: string
}

const suggestions = [
  'What have you built?',
  'What role are you looking for?',
  'Where are you based?',
  'What are you passionate about?',
  'What are your strengths?',
]

async function getResponseError(response: Response) {
  const responseText = await response.text()
  try {
    const data = JSON.parse(responseText) as { error?: string }
    return data.error || 'Unable to answer right now.'
  } catch {
    return 'The portfolio assistant is temporarily unavailable. Please try again shortly.'
  }
}

async function readChatStream(response: Response, onDelta: (delta: string) => void) {
  if (!response.body) {
    throw new Error('The portfolio assistant is temporarily unavailable. Please try again shortly.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let completed = false

  const processBlock = (block: string) => {
    const payload = block
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .join('\n')

    if (!payload) return

    let event: ChatStreamEvent
    try {
      event = JSON.parse(payload) as ChatStreamEvent
    } catch {
      throw new Error('The portfolio assistant returned an invalid response.')
    }

    if (event.type === 'delta' && event.delta) onDelta(event.delta)
    if (event.type === 'done') completed = true
    if (event.type === 'error') throw new Error(event.error || 'Unable to answer right now.')
  }

  while (true) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value, { stream: !done })
    const blocks = buffer.split(/\r?\n\r?\n/)
    buffer = blocks.pop() ?? ''
    blocks.forEach(processBlock)
    if (done) break
  }

  if (buffer.trim()) processBlock(buffer)
  if (!completed) {
    throw new Error('The portfolio assistant response was interrupted. Please try again.')
  }
}

function AssistantMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      skipHtml
      allowedElements={['p', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'code', 'pre', 'br', 'blockquote']}
      unwrapDisallowed
      components={{
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noreferrer">{children}</a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export function QuestionPreview() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [question, setQuestion] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!messages.length) return

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const behavior = messages.at(-1)?.role === 'user' && !prefersReducedMotion
      ? 'smooth'
      : 'auto'

    chatEndRef.current?.scrollIntoView?.({ behavior, block: 'end' })
  }, [messages])

  const askQuestion = async (content: string) => {
    const trimmedQuestion = content.trim()
    if (!trimmedQuestion || isLoading) return

    const userMessage: ChatMessage = { role: 'user', content: trimmedQuestion }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setQuestion('')
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })
      if (!response.ok) throw new Error(await getResponseError(response))

      let streamedReply = ''
      await readChatStream(response, (delta) => {
        streamedReply += delta
        const nextReply = streamedReply
        setMessages((current) => {
          const withoutStreamingReply = current.at(-1)?.role === 'assistant'
            ? current.slice(0, -1)
            : current
          return [...withoutStreamingReply, { role: 'assistant', content: nextReply }]
        })
      })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to answer right now.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void askQuestion(question)
  }

  return (
    <section className="question-preview" aria-label="Ask questions about Timothee">
      {messages.length === 0 && (
        <div className="question-suggestions" aria-label="Suggested questions">
          {suggestions.map((suggestion) => (
            <button type="button" key={suggestion} onClick={() => void askQuestion(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div className="question-conversation" aria-live="polite" aria-busy={isLoading}>
          {messages.map((message, index) => (
            <div className={`chat-message chat-message--${message.role}`} key={`${message.role}-${index}`}>
              {message.role === 'assistant'
                ? <AssistantMessage content={message.content} />
                : message.content}
            </div>
          ))}
          {isLoading && messages.at(-1)?.role !== 'assistant' && (
            <div className="chat-message chat-message--assistant chat-message--loading">Thinking…</div>
          )}
        </div>
      )}

      <div ref={chatEndRef} className="chat-scroll-anchor" aria-hidden="true" />

      <div className="question-form-dock">
        <form className="question-form" onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor="portfolio-question">Ask a question about Timothee</label>
          <input
            id="portfolio-question"
            type="text"
            value={question}
            maxLength={500}
            autoComplete="off"
            autoFocus
            placeholder="Ask something about me..."
            disabled={isLoading}
            onChange={(event) => setQuestion(event.target.value)}
          />
          <button type="submit" disabled={!question.trim() || isLoading} aria-label="Send question">
            <ArrowUp width={15} height={15} aria-hidden="true" />
          </button>
        </form>

        {error && <p className="question-error" role="alert">{error}</p>}
      </div>
    </section>
  )
}
