import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// http://localhost:3000/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Restrict CORS to mitigate esbuild dev server vulnerability (GHSA-67mh-4wv8-2f99)
    cors: {
      origin: ['http://localhost:3000'],
    },
    proxy: {
      '/gemini-api': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gemini-api/, ''),
      },
    },
  }
})
