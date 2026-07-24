import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@chill/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
})