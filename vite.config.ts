import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { handleChatRequest } from './server/http'

function localChatApi(environment: Record<string, string>): Plugin {
  const middleware = () => ({ middlewares }: { middlewares: { use: Function } }) => {
    middlewares.use('/api/chat', (request: Parameters<typeof handleChatRequest>[0], response: Parameters<typeof handleChatRequest>[1]) => {
      void handleChatRequest(request, response, environment)
    })
  }

  return {
    name: 'local-chat-api',
    configureServer: middleware(),
    configurePreviewServer: middleware(),
  }
}

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), localChatApi(environment)],
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
  }
})
