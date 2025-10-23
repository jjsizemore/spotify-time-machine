/**
 * Test Utilities and Helpers for Spotify Time Machine
 * Custom matchers, fixtures, and testing helpers
 */

import { expect } from 'vitest';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

// Create a wrapper with all necessary providers
function Wrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div data-testid="test-wrapper">{children}</div>;
}

// Custom render function with providers
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: Wrapper, ...options });
}

// Mock data factories
export const mockSpotifyUser = {
  id: 'test-user-123',
  display_name: 'Test User',
  email: 'test@example.com',
  images: [{ url: 'https://example.com/avatar.jpg' }],
  followers: { total: 42 },
  country: 'US',
  product: 'premium' as const,
};

export const mockSpotifyTrack = {
  id: '4uLU6hMCjMI75M1A2tKUQC',
  name: 'Test Track',
  artists: [{ id: 'artist123', name: 'Test Artist' }],
  album: {
    id: 'album123',
    name: 'Test Album',
    images: [{ url: 'https://example.com/album.jpg' }],
  },
  duration_ms: 180000,
  explicit: false,
  popularity: 75,
  preview_url: 'https://example.com/preview.mp3',
  external_urls: {
    spotify: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC',
  },
};

export const mockSpotifyArtist = {
  id: 'artist123',
  name: 'Test Artist',
  genres: ['pop', 'indie'],
  images: [{ url: 'https://example.com/artist.jpg' }],
  followers: { total: 1000000 },
  popularity: 85,
  external_urls: {
    spotify: 'https://open.spotify.com/artist/artist123',
  },
};

export const mockPlaylist = {
  id: 'playlist123',
  name: 'My Test Playlist',
  description: 'A playlist for testing',
  images: [{ url: 'https://example.com/playlist.jpg' }],
  tracks: { total: 25 },
  owner: { id: 'test-user-123', display_name: 'Test User' },
  public: true,
  collaborative: false,
  external_urls: {
    spotify: 'https://open.spotify.com/playlist/playlist123',
  },
};

// Test helpers for time ranges
export const timeRanges = {
  short_term: { id: 'short_term', label: 'Last 4 Weeks', period: '4 weeks' },
  medium_term: { id: 'medium_term', label: 'Last 6 Months', period: '6 months' },
  long_term: { id: 'long_term', label: 'All Time', period: 'all time' },
} as const;

// Mock session data
export const mockSession = {
  user: mockSpotifyUser,
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expires: '2024-12-31T23:59:59.999Z',
};

// Utility to create mock API responses
export function createMockResponse<T>(data: T, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

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
  private measurements: Map<string, number[]> = new Map();

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
