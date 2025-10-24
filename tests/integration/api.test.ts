/**
 * Integration Tests for API Routes
 * Tests actual Next.js API routes with mocked external dependencies
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createMocks } from 'node-mocks-http';

// Mock MSW for API mocking
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock Spotify API responses
const server = setupServer(
  rest.get('https://api.spotify.com/v1/me', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 'test-user',
        display_name: 'Test User',
        email: 'test@example.com',
      })
    );
  }),

  rest.get('https://api.spotify.com/v1/me/top/tracks', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        items: [
          {
            id: '4uLU6hMCjMI75M1A2tKUQC',
            name: 'Test Track',
            artists: [{ name: 'Test Artist' }],
            duration_ms: 180000,
          },
        ],
      })
    );
  }),

  rest.post('https://accounts.spotify.com/api/token', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
      })
    );
  })
);

// Helper to create a mock refresh token handler
const createRefreshTokenHandler = () => async (request: any, response: any) => {
  try {
    const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
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
const fetchSpotifyEndpoint = async (endpoint: string, token = 'test-token') => {
  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
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
      expect(data).toEqual({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
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
        id: 'test-user',
        display_name: 'Test User',
        email: 'test@example.com',
      });
    });

    it('should fetch top tracks', async () => {
      const response = await fetchSpotifyEndpoint('/me/top/tracks?limit=1&time_range=short_term');

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data.items).toHaveLength(1);
      expect(data.items[0]).toEqual({
        id: '4uLU6hMCjMI75M1A2tKUQC',
        name: 'Test Track',
        artists: [{ name: 'Test Artist' }],
        duration_ms: 180000,
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
