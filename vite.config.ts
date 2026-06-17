import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
// Production builds are served from the GitHub Pages subpath
// (https://<user>.github.io/kanji-dojo/); local dev stays at the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/kanji-dojo/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    open: true,
    port: 5173,
    host: true, // expose on the local network so you can open it on your phone
  },
  preview: {
    port: 4173,
    host: true,
  },
}))
