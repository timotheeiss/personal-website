import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleContactRequest, parseContactSubmission } from './contact'

describe('parseContactSubmission', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('accepts a valid contact message', () => {
    expect(parseContactSubmission({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'I would like to discuss a product engineering role.',
      website: '',
    })).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'I would like to discuss a product engineering role.',
      website: '',
    })
  })

  it('rejects an invalid reply address', () => {
    expect(() => parseContactSubmission({
      name: 'Ada Lovelace',
      email: 'not-an-email',
      message: 'I would like to discuss a product engineering role.',
      website: '',
    })).toThrow('Please enter a valid email address.')
  })

  it('sends to Timothee with the visitor as the reply address', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    const request = {
      method: 'POST',
      headers: {},
      socket: { remoteAddress: 'contact-test' },
      body: {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        message: 'I would like to discuss a product engineering role.',
        website: '',
      },
    } as unknown as Parameters<typeof handleContactRequest>[0]
    const response = {
      statusCode: 0,
      setHeader: vi.fn(),
      end: vi.fn(),
    } as unknown as Parameters<typeof handleContactRequest>[1]

    await handleContactRequest(request, response, {
      RESEND_API_KEY: 'test-key',
      CONTACT_FROM_EMAIL: 'Portfolio <contact@timissenmann.com>',
      CONTACT_TO_EMAIL: 'timothee.issenmann@gmail.com',
    })

    const requestOptions = fetchMock.mock.calls[0][1] as RequestInit
    const email = JSON.parse(requestOptions.body as string) as Record<string, unknown>
    expect(email.to).toEqual(['timothee.issenmann@gmail.com'])
    expect(email.reply_to).toBe('ada@example.com')
    expect(response.statusCode).toBe(200)
  })
})
