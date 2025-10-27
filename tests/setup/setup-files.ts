/**
 * Setup Files for Vitest
 * Runs before each test file - used for global test configuration
 */

// Extend expect with jest-dom matchers

import '@testing-library/jest-dom/vitest';

// Global test utilities and mocks
import { vi, afterEach, expect } from 'vitest';
import React from 'react';

// Mock Next.js router for tests
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    entries: vi.fn(),
    toString: vi.fn(),
  }),
  usePathname: () => '/test-path',
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock Next.js image component
vi.mock('next/image', () => ({
  default: vi.fn(({ src, alt, ...props }) => React.createElement('img', { src, alt, ...props })),
}));

// Environment variables are managed by Vitest v4 configuration
// Test environment variables should be set in vitest.config.ts or .env.test files

// Global cleanup after each test
afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks();

  // Clean up any DOM changes (only in DOM environments)
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  }
});

// Global performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  for (const entry of entries) {
    if (entry.duration > 1000) {
      // Log slow operations
      console.warn(`Slow test operation detected: ${entry.name} took ${entry.duration}ms`);
    }
  }
});

performanceObserver.observe({ entryTypes: ['measure'] });

// Add global test utilities
declare global {
  interface Window {
    __TEST_ENV__: boolean;
  }
}

if (globalThis.window) {
  globalThis.window.__TEST_ENV__ = true;
}

// Custom assertions and matchers can be added here
expect.extend({
  toBeValidSpotifyId(received: string) {
    const spotifyIdRegex = /^[a-zA-Z0-9]{22}$/;
    const pass = spotifyIdRegex.test(received);

    return {
      message: () => `expected ${received} to ${pass ? 'not ' : ''}be a valid Spotify ID`,
      pass,
    };
  },
});

// Type augmentation for custom matchers
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidSpotifyId(): T;
  }
  interface AsymmetricMatchersContaining {
    toBeValidSpotifyId(): any;
  }
}
