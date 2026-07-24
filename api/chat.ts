import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleChatRequest } from '../server/http'

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  await handleChatRequest(request, response, process.env)
}
