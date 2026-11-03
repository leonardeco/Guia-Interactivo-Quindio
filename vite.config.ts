import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'quindio-tts',
      configureServer(server) {
        server.middlewares.use('/api/tts', (req, res) => {
          const incoming = req as unknown as {
            method?: string
            on(event: string, listener: (chunk?: Uint8Array) => void): void
          }
          if (incoming.method !== 'POST') {
            res.statusCode = 405
            res.end()
            return
          }
          const chunks: Uint8Array[] = []
          incoming.on('data', (chunk) => {
            if (chunk) chunks.push(chunk)
          })
          incoming.on('end', () => {
            void (async () => {
              try {
                const size = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0)
                const bodyBytes = new Uint8Array(size)
                let offset = 0
                for (const chunk of chunks) {
                  bodyBytes.set(chunk, offset)
                  offset += chunk.byteLength
                }
                const body = JSON.parse(new TextDecoder().decode(bodyBytes)) as {
                  text?: string
                  lang?: string
                  gender?: string
                  rate?: number
                }
                const { synthesize } = await import('./server/tts')
                const audio = await synthesize(body)
                if (!audio) {
                  res.statusCode = 502
                  res.end()
                  return
                }
                res.setHeader('Content-Type', 'audio/mpeg')
                res.end(audio)
              } catch {
                res.statusCode = 502
                res.end()
              }
            })()
          })
        })
      },
    },
  ],
  build: {
    outDir: 'dist',
    // MapLibre rarely changes: its own chunk stays cached on phones across app updates.
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        manualChunks: (id) => (id.includes('node_modules/maplibre-gl') ? 'maplibre' : undefined),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
