import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { QuestionPreview } from './QuestionPreview'

function createStreamResponse(chunks: string[]) {
  const encoder = new TextEncoder()
  return {
    ok: true,
    body: new ReadableStream({
      start(controller) {
        chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)))
        controller.close()
      },
    }),
  } as Response
}

describe('QuestionPreview', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    window.sessionStorage.clear()
  })

  it('sends a question and displays the answer', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createStreamResponse([
      'data: {"type":"delta","delta":"I built **"}\n\n',
      'data: {"type":"delta","delta":"Newgrain"}\n\n',
      'data: {"type":"delta","delta":"**."}\n\n',
      'data: {"type":"done"}\n\n',
    ]))
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<QuestionPreview />)

    await user.type(screen.getByLabelText('Ask a question about Timothee'), 'What did Tim build?')
    await user.click(screen.getByRole('button', { name: 'Send question' }))

    const boldProjectName = await screen.findByText('Newgrain')
    expect(boldProjectName.tagName).toBe('STRONG')
    expect(boldProjectName.closest('.chat-message')).toHaveTextContent('I built Newgrain.')
    expect(fetchMock).toHaveBeenCalledWith('/api/chat', expect.objectContaining({ method: 'POST' }))
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit
    const body = JSON.parse(request.body as string) as { conversationId?: string }
    expect(body.conversationId).toMatch(/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i)
  })

  it('shows server errors accessibly', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      text: async () => JSON.stringify({ error: 'The portfolio assistant is not configured yet.' }),
    }))
    const user = userEvent.setup()
    render(<QuestionPreview />)

    await user.click(screen.getByRole('button', { name: 'What have you built?' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('not configured yet')
  })

  it('handles a plain-text platform error without exposing a JSON parsing message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      text: async () => 'A server error has occurred',
    }))
    const user = userEvent.setup()
    render(<QuestionPreview />)

    await user.click(screen.getByRole('button', { name: 'What have you built?' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('temporarily unavailable')
  })
})
