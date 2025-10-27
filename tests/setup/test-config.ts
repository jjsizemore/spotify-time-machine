/**
 * Centralized Test Configuration
 *
 * Single source of truth for ALL test environment values, mock data, and constants.
 * This file consolidates configuration from .env.test, mock data factories, and test constants.
 *
 * Benefits:
 * - Single source of truth - all test values in one place
 * - No duplication across test files
 * - Easy to update and maintain
 * - Type-safe access to all test configuration
 * - Tests always match the actual injected values
 *
 * Usage:
 * - Import TEST_CONFIG for environment values
 * - Import MOCK_DATA for Spotify entity fixtures
 * - Import TEST_CONSTANTS for timeouts, tokens, etc.
 */

// ============================================================================
// Environment Configuration
// ============================================================================

/**
 * Environment configuration values from .env.test with fallback defaults
 * These match values in .env.test and are injected via dotenvx
 */
export const TEST_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  SPOTIFY_CLIENT_ID: 'test-spotify-client-id-abc123def456',
  SPOTIFY_CLIENT_SECRET: 'test-client-secret',
  NEXTAUTH_SECRET: 'test-secret-that-is-at-least-32-characters-long-for-validation',
  NODE_ENV: 'test',

  // Analytics mock values
  GA_ID: 'G-TEST123456',
  POSTHOG_KEY: 'test-posthog-key',
  POSTHOG_HOST: 'https://app.posthog.com',
} as const;

/**
 * Get test configuration from environment with fallback to defaults
 * This matches the exact logic used in global-setup.ts
 */
export function getTestConfig() {
  return {
    baseUrl: process.env.TEST_BASE_URL || TEST_CONFIG.BASE_URL,
    spotifyClientId: process.env.TEST_SPOTIFY_CLIENT_ID || TEST_CONFIG.SPOTIFY_CLIENT_ID,
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET || TEST_CONFIG.SPOTIFY_CLIENT_SECRET,
    nextAuthSecret: process.env.NEXTAUTH_SECRET || TEST_CONFIG.NEXTAUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL || TEST_CONFIG.BASE_URL,
    gaId: process.env.NEXT_PUBLIC_GA_ID || TEST_CONFIG.GA_ID,
    posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY || TEST_CONFIG.POSTHOG_KEY,
    posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || TEST_CONFIG.POSTHOG_HOST,
  };
}

// ============================================================================
// Test Constants
// ============================================================================

/**
 * Common test constants for timeouts, durations, and retry logic
 */
export const TEST_CONSTANTS = {
  // Timeouts (in milliseconds)
  DEFAULT_TIMEOUT: 1000,
  API_TIMEOUT: 5000,
  ELEMENT_REMOVAL_TIMEOUT: 1000,
  ASYNC_OPERATION_DELAY: 100,

  // Spotify API constants
  TOKEN_EXPIRES_IN: 3600, // seconds
  TOKEN_EXPIRES_IN_MS: 3600000, // milliseconds
  MAX_TRACK_DURATION_MS: 10800000, // 3 hours in milliseconds

  // Mock tokens
  ACCESS_TOKEN: 'mock-access-token',
  REFRESH_TOKEN: 'mock-refresh-token',
  INVALID_TOKEN: 'invalid-token',

  // API URLs
  SPOTIFY_TOKEN_URL: 'https://accounts.spotify.com/api/token',
  SPOTIFY_API_BASE_URL: 'https://api.spotify.com/v1',

  // Session expiry
  SESSION_EXPIRES: '2024-12-31T23:59:59.999Z',

  // Performance thresholds
  SLOW_OPERATION_THRESHOLD_MS: 1000,
  MEMORY_LEAK_THRESHOLD_BYTES: 1024 * 1024, // 1MB
} as const;

// ============================================================================
// Mock Data
// ============================================================================

/**
 * Spotify entity mock data - used across all tests
 * Centralized to ensure consistency and easy updates
 */
export const MOCK_DATA = {
  // User data
  user: {
    id: 'test-user-123',
    display_name: 'Test User',
    email: 'test@example.com',
    images: [{ url: 'https://example.com/avatar.jpg' }],
    followers: { total: 42 },
    country: 'US',
    product: 'premium' as const,
  },

  // Track data
  track: {
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
  },

  // Artist data
  artist: {
    id: 'artist123',
    name: 'Test Artist',
    genres: ['pop', 'indie'],
    images: [{ url: 'https://example.com/artist.jpg' }],
    followers: { total: 1000000 },
    popularity: 85,
    external_urls: {
      spotify: 'https://open.spotify.com/artist/artist123',
    },
  },

  // Playlist data
  playlist: {
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
  },

  // Session data
  session: {
    user: {
      id: 'test-user-123',
      display_name: 'Test User',
      email: 'test@example.com',
      images: [{ url: 'https://example.com/avatar.jpg' }],
      followers: { total: 42 },
      country: 'US',
      product: 'premium' as const,
    },
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expires: '2024-12-31T23:59:59.999Z',
  },

  // Token refresh response
  tokenRefreshResponse: {
    access_token: 'new-access-token',
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: 'mock-refresh-token',
    scope: 'user-read-email user-library-read',
  },

  // Time ranges
  timeRanges: {
    short_term: { id: 'short_term', label: 'Last 4 Weeks', period: '4 weeks' },
    medium_term: { id: 'medium_term', label: 'Last 6 Months', period: '6 months' },
    long_term: { id: 'long_term', label: 'All Time', period: 'all time' },
  },

  // Spotify scopes
  requiredScopes: [
    'user-read-email',
    'user-read-private',
    'user-library-read',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-read-recently-played',
    'user-top-read',
  ],
} as const;

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a mock Spotify user with custom properties
 */
export function createMockUser(overrides: Partial<typeof MOCK_DATA.user> = {}) {
  return { ...MOCK_DATA.user, ...overrides };
}

/**
 * Create a mock Spotify track with custom properties
 */
export function createMockTrack(overrides: Partial<typeof MOCK_DATA.track> = {}) {
  return { ...MOCK_DATA.track, ...overrides };
}

/**
 * Create a mock Spotify artist with custom properties
 */
export function createMockArtist(overrides: Partial<typeof MOCK_DATA.artist> = {}) {
  return { ...MOCK_DATA.artist, ...overrides };
}

/**
 * Create a mock playlist with custom properties
 */
export function createMockPlaylist(overrides: Partial<typeof MOCK_DATA.playlist> = {}) {
  return { ...MOCK_DATA.playlist, ...overrides };
}

/**
 * Create a mock session with custom properties
 */
export function createMockSession(overrides: Partial<typeof MOCK_DATA.session> = {}) {
  return { ...MOCK_DATA.session, ...overrides };
}

/**
 * Create a mock token refresh response
 */
export function createMockTokenResponse(
  overrides: Partial<typeof MOCK_DATA.tokenRefreshResponse> = {}
) {
  return { ...MOCK_DATA.tokenRefreshResponse, ...overrides };
}

/**
 * Create a mock API response with status and data
 */
export function createMockResponse<T>(data: T, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Type-safe test configuration
 */
export type TestConfig = ReturnType<typeof getTestConfig>;

/**
 * Mock data types for type safety
 */
export type MockUser = typeof MOCK_DATA.user;
export type MockTrack = typeof MOCK_DATA.track;
export type MockArtist = typeof MOCK_DATA.artist;
export type MockPlaylist = typeof MOCK_DATA.playlist;
export type MockSession = typeof MOCK_DATA.session;
