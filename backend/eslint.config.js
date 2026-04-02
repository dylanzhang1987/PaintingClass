import js from '@eslint/js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**'],
    extends: [
      js.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'commonjs',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-undef': 'error',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
      'indent': ['error', 2],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'eqeqeq': ['error', 'always'],
    },
  },
])
