import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { handleChatRequest } from './api/chat'
import { handleContactRequest } from './api/contact'

function localApis(environment: Record<string, string>): Plugin {
  return {
    name: 'local-apis',
    configureServer(server) {
      server.middlewares.use('/api/chat', (request, response) => {
        void handleChatRequest(request, response, environment)
      })
      server.middlewares.use('/api/contact', (request, response) => {
        void handleContactRequest(request, response, environment)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), localApis(environment)],
  }
})
