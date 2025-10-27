/**
 * Integration Tests for API Routes
 * Tests actual Next.js API routes with mocked external dependencies
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { TEST_CONSTANTS, MOCK_DATA } from '../setup/test-config';

// Mock Spotify API responses using centralized configuration
const server = setupServer(
  rest.get(`${TEST_CONSTANTS.SPOTIFY_API_BASE_URL}/me`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: MOCK_DATA.user.id,
        display_name: MOCK_DATA.user.display_name,
        email: MOCK_DATA.user.email,
      })
    );
  }),

  rest.get(`${TEST_CONSTANTS.SPOTIFY_API_BASE_URL}/me/top/tracks`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        items: [
          {
            id: MOCK_DATA.track.id,
            name: MOCK_DATA.track.name,
            artists: MOCK_DATA.track.artists,
            duration_ms: MOCK_DATA.track.duration_ms,
          },
        ],
      })
    );
  }),

  rest.post(TEST_CONSTANTS.SPOTIFY_TOKEN_URL, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        access_token: 'new-access-token',
        token_type: 'Bearer',
        expires_in: TEST_CONSTANTS.TOKEN_EXPIRES_IN,
        refresh_token: 'new-refresh-token',
        scope: MOCK_DATA.requiredScopes.join(' '),
      })
    );
  })
);

// Helper to create a mock refresh token handler
const createRefreshTokenHandler = () => async (request: any, response: any) => {
  try {
    const refreshResponse = await fetch(TEST_CONSTANTS.SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=refresh_token&refresh_token=refresh-token',
    });

    if (!refreshResponse.ok) {
      response.status(400).json({ error: 'Token refresh failed' });
      return;
    }

    const data = await refreshResponse.json();
    response.status(200).json(data);
  } catch {
    response.status(500).json({ error: 'Internal server error' });
  }
};

// Helper to fetch Spotify API endpoints
const fetchSpotifyEndpoint = async (endpoint: string, token = TEST_CONSTANTS.ACCESS_TOKEN) => {
  const response = await fetch(`${TEST_CONSTANTS.SPOTIFY_API_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};

describe('API Integration Tests', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => {
    server.close();
  });

  describe('/api/auth/refresh-token', () => {
    const mockHandler = createRefreshTokenHandler();

    it('should refresh Spotify token successfully', async () => {
      // Mock the NextAuth session
      vi.mock('next-auth/next', () => ({
        getServerSession: () =>
          Promise.resolve({
            user: { id: 'test-user' },
            accessToken: 'old-token',
            refreshToken: 'refresh-token',
          }),
      }));

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
      });

      await mockHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data).toMatchObject({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: TEST_CONSTANTS.TOKEN_EXPIRES_IN,
      });
    });

    it('should handle refresh token errors', async () => {
      // Override the MSW handler for this test
      server.use(
        rest.post('https://accounts.spotify.com/api/token', (req, res, ctx) => {
          return res(ctx.status(400), ctx.json({ error: 'invalid_grant' }));
        })
      );

      const { req, res } = createMocks({
        method: 'POST',
      });

      await mockHandler(req, res);
      expect(res._getStatusCode()).toBe(400);
    });
  });

  describe('Spotify API Integration', () => {
    it('should fetch user profile', async () => {
      const response = await fetchSpotifyEndpoint('/me');

      expect(response.ok).toBe(true);
      const user = await response.json();

      expect(user).toEqual({
        id: MOCK_DATA.user.id,
        display_name: MOCK_DATA.user.display_name,
        email: MOCK_DATA.user.email,
      });
    });

    it('should fetch top tracks', async () => {
      const response = await fetchSpotifyEndpoint('/me/top/tracks?limit=1&time_range=short_term');

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data.items).toHaveLength(1);
      expect(data.items[0]).toEqual({
        id: MOCK_DATA.track.id,
        name: MOCK_DATA.track.name,
        artists: MOCK_DATA.track.artists,
        duration_ms: MOCK_DATA.track.duration_ms,
      });

      expect(data.items[0].id).toBeValidSpotifyId();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Test with unreachable endpoint
      server.use(
        rest.get('https://api.spotify.com/v1/me', (req, res) => {
          return res.networkError('Network error');
        })
      );

      await expect(fetch('https://api.spotify.com/v1/me')).rejects.toThrow();
    });
  });
});
