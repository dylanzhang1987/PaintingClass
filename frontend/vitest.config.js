import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  test: {
    // Test environment
    environment: 'jsdom',

    // Enable global test APIs (describe, it, expect, etc.)
    globals: true,

    // UI configuration for visual test runner
    ui: true,

    // Test file patterns
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    exclude: ['node_modules/', 'dist/'],

    // Setup files - run before all tests
    setupFiles: ['./src/test/setup.js'],

    // Mock behavior
    mockReset: true,
    restoreMocks: true,

    // Coverage configuration (optional, commented out)
    // coverage: {
    //   provider: 'v8',
    //   reporter: ['text', 'html'],
    //   exclude: [
    //     'node_modules/',
    //     'dist/',
    //     '**/*.test.{js,jsx}',
    //     '**/*.spec.{js,jsx}',
    //     '**/main.jsx',
    //     '**/App.jsx'
    //   ]
    // },

    // Default test timeout
    testTimeout: 10000,

    // Watch mode configuration
    watch: true
  },

  // Path aliases (same as vite.config.js for consistency)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@api': path.resolve(__dirname, './src/api'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@context': path.resolve(__dirname, './src/context')
    }
  }
})
