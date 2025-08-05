import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock global fetch for tests
global.fetch = vi.fn();

// Mock axios globally to avoid real API calls
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));