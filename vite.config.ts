import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // three is only ever reached through the lazy scene import, so it
        // lands in its own chunk and never blocks the first paint.
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('gsap') || id.includes('lenis')) return 'motion'
          return undefined
        },
      },
    },
  },
})
