import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.js'], // Apply to all JS files
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node, // Keep Node globals
      },
    },
    rules: {
      'no-unused-vars': 'warn', // Warn on unused vars
      'no-undef': 'error', // Keep undefined strict
    },
  },
  {
    files: ['**/__tests__/**/*.js'], // Target test files specifically
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest, // Add Jest globals
      },
    },
    rules: {
      'no-unused-vars': 'warn', // Allow unused error vars in tests
      'no-undef': 'error',
    },
  },
]);
