import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Include specific polyfills
      include: ['events', 'util', 'buffer', 'stream'],
      // Whether to polyfill `node:` protocol imports
      protocolImports: true,
    }),
  ],
  define: {
    global: 'globalThis',
  },
})
