import { describe, expect, it } from 'vitest'
import { parseChatMessages } from './chat'

describe('parseChatMessages', () => {
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
})
