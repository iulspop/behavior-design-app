import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    threads: false,
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./app/test/setup-integration-test-environment.ts'],
    include: ['**/*.integration.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    watchExclude: ['.*\\/node_modules\\/.*', '.*\\/build\\/.*'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
})
