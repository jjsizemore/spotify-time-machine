/**
 * Test Utilities and Helpers for Spotify Time Machine
 * Custom matchers, fixtures, and testing helpers
 */

import { expect } from 'vitest';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MOCK_DATA } from '../setup/test-config';

// Re-export factory functions from centralized config
export {
  createMockUser,
  createMockTrack,
  createMockArtist,
  createMockPlaylist,
  createMockSession,
  createMockTokenResponse,
  createMockResponse,
} from '../setup/test-config';

// Create a wrapper with all necessary providers
function Wrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div data-testid="test-wrapper">{children}</div>;
}

// Custom render function with providers
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export mock data from centralized config
export const mockSpotifyUser = MOCK_DATA.user;
export const mockSpotifyTrack = MOCK_DATA.track;
export const mockSpotifyArtist = MOCK_DATA.artist;
export const mockPlaylist = MOCK_DATA.playlist;
export const timeRanges = MOCK_DATA.timeRanges;
export const mockSession = MOCK_DATA.session;

// Utility to wait for element removal
export async function waitForElementToBeRemoved(
  callback: () => Element | null,
  options?: { timeout?: number }
) {
  const { timeout = 1000 } = options || {};
  const startTime = Date.now();

  return new Promise<void>((resolve, reject) => {
    const checkElement = () => {
      const element = callback();

      if (!element) {
        resolve();
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for element to be removed'));
        return;
      }

      setTimeout(checkElement, 50);
    };

    checkElement();
  });
}

// Custom assertions for Spotify-specific testing
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidSpotifyId(): T;
    toBeValidSpotifyUrl(): T;
    toHaveValidDuration(): T;
  }
  interface AsymmetricMatchersContaining {
    toBeValidSpotifyId(): any;
    toBeValidSpotifyUrl(): any;
    toHaveValidDuration(): any;
  }
}

// Extend expect with custom matchers
expect.extend({
  toBeValidSpotifyId(received: string) {
    const spotifyIdRegex = /^[a-zA-Z0-9]{22}$/;
    const pass = spotifyIdRegex.test(received);

    return {
      message: () => `expected ${received} to ${pass ? 'not ' : ''}be a valid Spotify ID`,
      pass,
    };
  },

  toBeValidSpotifyUrl(received: string) {
    const spotifyUrlRegex =
      /^https:\/\/open\.spotify\.com\/(track|artist|album|playlist)\/[a-zA-Z0-9]{22}$/;
    const pass = spotifyUrlRegex.test(received);

    return {
      message: () => `expected ${received} to ${pass ? 'not ' : ''}be a valid Spotify URL`,
      pass,
    };
  },

  toHaveValidDuration(received: number) {
    const pass = typeof received === 'number' && received > 0 && received < 10800000; // Max 3 hours

    return {
      message: () =>
        `expected ${received} to ${pass ? 'not ' : ''}be a valid duration in milliseconds`,
      pass,
    };
  },
});

// Performance testing utilities
export class PerformanceMonitor {
  private readonly measurements: Map<string, number[]> = new Map();

  start(name: string): () => number {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;

      if (!this.measurements.has(name)) {
        this.measurements.set(name, []);
      }

      this.measurements.get(name)!.push(duration);
      return duration;
    };
  }

  getStats(name: string) {
    const durations = this.measurements.get(name) || [];

    if (durations.length === 0) {
      return null;
    }

    const sorted = [...durations].toSorted((a, b) => a - b);

    return {
      count: durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      avg: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  clear() {
    this.measurements.clear();
  }
}

// Extend Performance interface for experimental memory measurement API
interface PerformanceWithMemory extends Performance {
  measureUserAgentSpecificMemory?: () => Promise<{ bytes: number; breakdown: unknown[] }>;
}

// Memory leak detection helper
export function detectMemoryLeaks(testFunction: () => void | Promise<void>) {
  return async () => {
    const perf = performance as PerformanceWithMemory;
    if (typeof perf.measureUserAgentSpecificMemory === 'function') {
      const initialMemory = await perf.measureUserAgentSpecificMemory();

      await testFunction();

      // Force garbage collection if available
      if ('gc' in globalThis && typeof globalThis.gc === 'function') {
        globalThis.gc();
      }

      const finalMemory = await perf.measureUserAgentSpecificMemory();
      const memoryDiff = finalMemory.bytes - initialMemory.bytes;

      // Warn if memory increased by more than 1MB
      if (memoryDiff > 1024 * 1024) {
        console.warn(`Potential memory leak detected: ${memoryDiff} bytes increased`);
      }
    } else {
      await testFunction();
    }
  };
}

// Export all utilities
export * from '@testing-library/react';
export * from '@testing-library/user-event';
