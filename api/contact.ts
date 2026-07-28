import { randomUUID } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'

interface ContactEnvironment {
  RESEND_API_KEY?: string
  CONTACT_FROM_EMAIL?: string
  CONTACT_TO_EMAIL?: string
}

interface ContactSubmission {
  name: string
  email: string
  message: string
  website: string
}

type RequestWithBody = IncomingMessage & { body?: unknown }

const requestsByAddress = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 10 * 60_000
const RATE_LIMIT_MAX = 5
const MAX_REQUEST_BODY_LENGTH = 12_000
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

class ContactInputError extends Error {}

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
}

function getClientAddress(request: IncomingMessage) {
  const forwarded = request.headers['x-forwarded-for']
  return (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0])?.trim()
    || request.socket.remoteAddress
    || 'unknown'
}

function isRateLimited(request: IncomingMessage) {
  const now = Date.now()
  const address = getClientAddress(request)
  const recent = (requestsByAddress.get(address) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  )
  recent.push(now)
  requestsByAddress.set(address, recent)
  return recent.length > RATE_LIMIT_MAX
}

async function readJsonBody(request: RequestWithBody) {
  if (request.body !== undefined) return request.body

  let raw = ''
  for await (const chunk of request) {
    raw += chunk
    if (raw.length > MAX_REQUEST_BODY_LENGTH) {
      throw new ContactInputError('The message is too large.')
    }
  }

  try {
    return JSON.parse(raw)
  } catch {
    throw new ContactInputError('The message could not be read.')
  }
}

export function parseContactSubmission(value: unknown): ContactSubmission {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ContactInputError('Please complete the contact form.')
  }

  const submission = value as Record<string, unknown>
  const name = typeof submission.name === 'string' ? submission.name.trim() : ''
  const email = typeof submission.email === 'string' ? submission.email.trim() : ''
  const message = typeof submission.message === 'string' ? submission.message.trim() : ''
  const website = typeof submission.website === 'string' ? submission.website.trim() : ''

  if (name.length < 2 || name.length > 80 || /[\r\n]/.test(name)) {
    throw new ContactInputError('Please enter your name.')
  }
  if (email.length > 254 || /[\r\n]/.test(email) || !EMAIL_PATTERN.test(email)) {
    throw new ContactInputError('Please enter a valid email address.')
  }
  if (message.length < 10 || message.length > 3_000) {
    throw new ContactInputError('Your message must contain between 10 and 3,000 characters.')
  }

  return { name, email, message, website }
}

async function sendContactEmail(
  submission: ContactSubmission,
  environment: ContactEnvironment,
) {
  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${environment.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': randomUUID(),
      'User-Agent': 'timothee-portfolio/0.1.0',
    },
    body: JSON.stringify({
      from: environment.CONTACT_FROM_EMAIL || 'Timothee Portfolio <contact@timissenmann.com>',
      to: [environment.CONTACT_TO_EMAIL || 'timothee.issenmann@gmail.com'],
      reply_to: submission.email,
      subject: `Portfolio message from ${submission.name}`,
      text: [
        'New message from the portfolio contact form',
        '',
        `Name: ${submission.name}`,
        `Email: ${submission.email}`,
        '',
        submission.message,
      ].join('\n'),
    }),
  })

  if (!resendResponse.ok) {
    const responseText = await resendResponse.text()
    throw new Error(`Resend request failed (${resendResponse.status}): ${responseText.slice(0, 500)}`)
  }
}

export async function handleContactRequest(
  request: RequestWithBody,
  response: ServerResponse,
  environment: ContactEnvironment,
) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    sendJson(response, 405, { error: 'Method not allowed.' })
    return
  }

  if (isRateLimited(request)) {
    sendJson(response, 429, { error: 'Too many messages. Please try again later.' })
    return
  }

  const apiKey = environment.RESEND_API_KEY
  if (!apiKey || apiKey === 'replace_me') {
    sendJson(response, 503, { error: 'The contact form is not configured yet.' })
    return
  }

  try {
    const submission = parseContactSubmission(await readJsonBody(request))

    if (!submission.website) {
      await sendContactEmail(submission, environment)
    }

    sendJson(response, 200, { success: true })
  } catch (error) {
    if (error instanceof ContactInputError) {
      sendJson(response, 400, { error: error.message })
      return
    }

    console.error('Contact form failed:', error)
    sendJson(response, 500, { error: 'The message could not be sent. Please try again.' })
  }
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  await handleContactRequest(request, response, process.env)
}
