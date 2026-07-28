import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ContactForm } from './ContactForm'

describe('ContactForm', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('sends a message and shows confirmation', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.click(screen.getByRole('button', { name: 'Send a message' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Message'), 'I would like to discuss a product engineering role.')
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Your message has been sent')
    expect(fetchMock).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('ada@example.com'),
    }))
  })

  it('copies the email address and confirms it', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.click(screen.getByRole('button', { name: 'email me' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Email copied!')
    await expect(navigator.clipboard.readText()).resolves.toBe('timothee.issenmann@gmail.com')
  })
})
