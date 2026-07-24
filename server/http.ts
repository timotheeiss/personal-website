import type { IncomingMessage, ServerResponse } from 'node:http'
import { createChatReply, parseChatMessages } from './chat'

interface ChatEnvironment {
  OPENAI_API_KEY?: string
  OPENAI_MODEL?: string
  OPENAI_VECTOR_STORE_ID?: string
}

type RequestWithBody = IncomingMessage & { body?: unknown }

const requestsByAddress = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 12

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
    if (raw.length > 16_000) throw new Error('Request body is too large.')
  }
  return JSON.parse(raw)
}

export async function handleChatRequest(
  request: RequestWithBody,
  response: ServerResponse,
  environment: ChatEnvironment,
) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    sendJson(response, 405, { error: 'Method not allowed.' })
    return
  }

  if (isRateLimited(request)) {
    sendJson(response, 429, { error: 'Too many questions. Please try again in a minute.' })
    return
  }

  const apiKey = environment.OPENAI_API_KEY
  if (!apiKey || apiKey === 'replace_me') {
    sendJson(response, 503, { error: 'The portfolio assistant is not configured yet.' })
    return
  }

  try {
    const body = await readJsonBody(request) as { messages?: unknown }
    const messages = parseChatMessages(body?.messages)
    const reply = await createChatReply({
      apiKey,
      messages,
      model: environment.OPENAI_MODEL,
      vectorStoreId: environment.OPENAI_VECTOR_STORE_ID,
    })
    sendJson(response, 200, { reply })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to answer right now.'
    const isInputError = message.startsWith('Messages')
      || message.startsWith('Each message')
      || message.startsWith('The final message')
      || message.startsWith('Request body')
      || error instanceof SyntaxError

    if (!isInputError) console.error('Portfolio chat failed:', error)
    sendJson(response, isInputError ? 400 : 500, {
      error: isInputError ? message : 'Unable to answer right now. Please try again.',
    })
  }
}
