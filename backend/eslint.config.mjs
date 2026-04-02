import js from '@eslint/js'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**'],
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
      'no-console': 'off',
      'no-var': 'warn',
      'prefer-const': 'warn',
      'no-undef': 'error',
      'semi': ['warn', 'always'],
      'quotes': ['warn', 'single'],
      'indent': ['warn', 2],
      'no-multiple-empty-lines': ['warn', { max: 1 }],
      'eqeqeq': ['warn', 'always'],
    },
  },
]
