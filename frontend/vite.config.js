import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    globals: true, // Enables Jest-like globals using vi
    deps: {
      inline: ['@testing-library/jest-dom'], // Ensures Jest DOM works
    },
  },
});