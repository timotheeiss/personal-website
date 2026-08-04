import { afterEach, describe, expect, it, vi } from 'vitest'
import { parseChatMessages, parseConversationId, saveChatTurn } from './chat'

describe('parseChatMessages', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('accepts a long assistant reply followed by a short user message', () => {
    const messages = parseChatMessages([
      { role: 'user', content: 'What have you built?' },
      { role: 'assistant', content: 'A'.repeat(1_200) },
      { role: 'user', content: 'What else?' },
    ])

    expect(messages).toHaveLength(3)
    expect(messages.at(-1)?.content).toBe('What else?')
  })

  it('still rejects user messages longer than 500 characters', () => {
    expect(() => parseChatMessages([
      { role: 'user', content: 'A'.repeat(501) },
    ])).toThrow('Messages from users must not exceed 500 characters.')
  })

  it('accepts UUID conversation IDs and rejects invalid values', () => {
    expect(parseConversationId('550e8400-e29b-41d4-a716-446655440000'))
      .toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(() => parseConversationId('not-a-session')).toThrow('Conversation ID must be a valid UUID.')
  })

  it('records completed turns through the server-side Supabase API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    await saveChatTurn({
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SECRET_KEY: 'sb_secret_example',
    }, {
      conversationId: '550e8400-e29b-41d4-a716-446655440000',
      turnNumber: 2,
      userPrompt: 'What are you passionate about?',
      assistantResponse: 'I enjoy turning messy problems into useful products.',
      createdAt: '2026-08-04T12:00:00.000Z',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      new URL('https://project.supabase.co/rest/v1/chat_turns'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ apikey: 'sb_secret_example' }),
      }),
    )
    expect(JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string)).toMatchObject({
      conversation_id: '550e8400-e29b-41d4-a716-446655440000',
      turn_number: 2,
      user_prompt: 'What are you passionate about?',
      assistant_response: 'I enjoy turning messy problems into useful products.',
      created_at: '2026-08-04T12:00:00.000Z',
    })
  })
})
