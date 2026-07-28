import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { QuestionPreview } from './QuestionPreview'

describe('QuestionPreview', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('sends a question and displays the answer', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ reply: 'Tim built Newgrain.' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<QuestionPreview />)

    await user.type(screen.getByLabelText('Ask a question about Timothee'), 'What did Tim build?')
    await user.click(screen.getByRole('button', { name: 'Send question' }))

    expect(await screen.findByText('Tim built Newgrain.')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('/api/chat', expect.objectContaining({ method: 'POST' }))
  })

  it('shows server errors accessibly', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      text: async () => JSON.stringify({ error: 'The portfolio assistant is not configured yet.' }),
    }))
    const user = userEvent.setup()
    render(<QuestionPreview />)

    await user.click(screen.getByRole('button', { name: 'What has Tim built?' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('not configured yet')
  })

  it('handles a plain-text platform error without exposing a JSON parsing message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      text: async () => 'A server error has occurred',
    }))
    const user = userEvent.setup()
    render(<QuestionPreview />)

    await user.click(screen.getByRole('button', { name: 'What has Tim built?' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('temporarily unavailable')
  })
})
