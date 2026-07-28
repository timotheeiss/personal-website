import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { handleChatRequest } from './api/chat'

function localChatApi(environment: Record<string, string>): Plugin {
  return {
    name: 'local-chat-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', (request, response) => {
        void handleChatRequest(request, response, environment)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), localChatApi(environment)],
  }
})
