import { useState, type FormEvent } from 'react'
import ArrowUp from '@gravity-ui/icons/ArrowUp'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const suggestions = [
  'What has Tim built?',
  'What kind of role is Tim looking for?',
  'Where is Tim based?',
  'What is Tim passionate about?',
]

export function QuestionPreview() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [question, setQuestion] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
      const data = await response.json() as { reply?: string; error?: string }
      if (!response.ok || !data.reply) throw new Error(data.error || 'Unable to answer right now.')
      setMessages((current) => [...current, { role: 'assistant', content: data.reply as string }])
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
              {message.content}
            </div>
          ))}
          {isLoading && <div className="chat-message chat-message--assistant chat-message--loading">Thinking…</div>}
        </div>
      )}

      <div className="question-form-dock">
        <form className="question-form" onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor="portfolio-question">Ask a question about Timothee</label>
          <input
            id="portfolio-question"
            type="text"
            value={question}
            maxLength={500}
            autoComplete="off"
            placeholder="Ask something about Tim…"
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
