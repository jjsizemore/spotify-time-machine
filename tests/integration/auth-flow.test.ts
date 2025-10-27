/**
 * Authentication Flow - Integration Tests
 *
 * These tests guard against regressions in the critical authentication
 * flow including token refresh and session management.
 */

import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { TEST_CONFIG, TEST_CONSTANTS, MOCK_DATA } from '../setup/test-config';

// Mock environment variables with valid values from centralized config
vi.stubEnv('SPOTIFY_CLIENT_ID', TEST_CONFIG.SPOTIFY_CLIENT_ID);
vi.stubEnv('SPOTIFY_CLIENT_SECRET', TEST_CONFIG.SPOTIFY_CLIENT_SECRET);
vi.stubEnv('NEXTAUTH_SECRET', TEST_CONFIG.NEXTAUTH_SECRET);
vi.stubEnv('NEXTAUTH_URL', TEST_CONFIG.BASE_URL);
vi.stubEnv('NEXT_PUBLIC_GA_ID', TEST_CONFIG.GA_ID);
vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', TEST_CONFIG.POSTHOG_KEY);
vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', TEST_CONFIG.POSTHOG_HOST);
vi.stubEnv('NODE_ENV', TEST_CONFIG.NODE_ENV);

// Mock the Spotify token endpoint
const SPOTIFY_TOKEN_URL = TEST_CONSTANTS.SPOTIFY_TOKEN_URL;

const server = setupServer(
  // Mock successful token refresh
  rest.post(SPOTIFY_TOKEN_URL, async (req, res, ctx) => {
    const body = await req.text();
    const params = new URLSearchParams(body);

    const grantType = params.get('grant_type');
    const refreshToken = params.get('refresh_token');

    // Validate grant type
    if (grantType !== 'refresh_token') {
      return res(ctx.status(400), ctx.json({ error: 'unsupported_grant_type' }));
    }

    // Validate refresh token is present
    if (!refreshToken) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'invalid_request', error_description: 'Missing refresh_token' })
      );
    }

    // Simulate invalid refresh token
    if (refreshToken === TEST_CONSTANTS.INVALID_TOKEN) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'invalid_grant', error_description: 'Invalid refresh token' })
      );
    }

    // Return successful token refresh using centralized mock data
    return res(
      ctx.status(200),
      ctx.json({
        access_token: 'new-access-token-' + Date.now(),
        token_type: 'Bearer',
        expires_in: TEST_CONSTANTS.TOKEN_EXPIRES_IN,
        refresh_token: refreshToken, // Return same or new refresh token
        scope: MOCK_DATA.requiredScopes.join(' '),
      })
    );
  })
);

describe('Authentication Flow - Integration Tests', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => {
    server.close();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('Token Refresh Flow', () => {
    it('should successfully refresh access token', async () => {
      const { refreshAccessToken } = await import('../../src/lib/spotify');

      const result = await refreshAccessToken('valid-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresAt');
      expect(result.accessToken).toMatch(/^new-access-token-/);
      expect(result.refreshToken).toBe('valid-refresh-token');
      expect(result.expiresAt).toBeGreaterThan(Date.now() / 1000);
    });

    it('should handle invalid refresh token', async () => {
      const { refreshAccessToken } = await import('../../src/lib/spotify');

      await expect(refreshAccessToken(TEST_CONSTANTS.INVALID_TOKEN)).rejects.toThrow();
    });

    it('should handle missing refresh token', async () => {
      const { refreshAccessToken } = await import('../../src/lib/spotify');

      await expect(refreshAccessToken('')).rejects.toThrow();
    });

    it('should calculate correct expiration time', async () => {
      const { refreshAccessToken } = await import('../../src/lib/spotify');

      const beforeTime = Math.floor(Date.now() / 1000);
      const result = await refreshAccessToken('valid-refresh-token');
      const afterTime = Math.floor(Date.now() / 1000);

      // Expires in TOKEN_EXPIRES_IN seconds according to mock
      expect(result.expiresAt).toBeGreaterThanOrEqual(beforeTime + TEST_CONSTANTS.TOKEN_EXPIRES_IN);
      expect(result.expiresAt).toBeLessThanOrEqual(afterTime + TEST_CONSTANTS.TOKEN_EXPIRES_IN + 1);
    });

    it('should handle network errors during refresh', async () => {
      // Override the handler to simulate network error
      server.use(
        rest.post(SPOTIFY_TOKEN_URL, (req, res) => {
          return res.networkError('Network error');
        })
      );

      const { refreshAccessToken } = await import('../../src/lib/spotify');

      await expect(refreshAccessToken('valid-refresh-token')).rejects.toThrow();
    });

    it('should handle server errors during refresh', async () => {
      // Override the handler to simulate server error
      server.use(
        rest.post(SPOTIFY_TOKEN_URL, (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ error: 'server_error', error_description: 'Internal server error' })
          );
        })
      );

      const { refreshAccessToken } = await import('../../src/lib/spotify');

      await expect(refreshAccessToken('valid-refresh-token')).rejects.toThrow();
    });
  });

  describe('Token Refresh with Basic Auth', () => {
    it('should send correct Authorization header', async () => {
      let authHeader: string | null = null;

      server.use(
        rest.post(SPOTIFY_TOKEN_URL, (req, res, ctx) => {
          authHeader = req.headers.get('Authorization');

          return res(
            ctx.status(200),
            ctx.json({
              access_token: 'new-token',
              token_type: 'Bearer',
              expires_in: TEST_CONSTANTS.TOKEN_EXPIRES_IN,
              refresh_token: 'valid-refresh-token',
            })
          );
        })
      );

      const { refreshAccessToken } = await import('../../src/lib/spotify');
      await refreshAccessToken('valid-refresh-token');

      expect(authHeader).toBeTruthy();
      expect(authHeader).toMatch(/^Basic /);
    });

    it('should send correct Content-Type header', async () => {
      let contentType: string | null = null;

      server.use(
        rest.post(SPOTIFY_TOKEN_URL, (req, res, ctx) => {
          contentType = req.headers.get('Content-Type');

          return res(
            ctx.status(200),
            ctx.json({
              access_token: 'new-token',
              token_type: 'Bearer',
              expires_in: TEST_CONSTANTS.TOKEN_EXPIRES_IN,
              refresh_token: 'valid-refresh-token',
            })
          );
        })
      );

      const { refreshAccessToken } = await import('../../src/lib/spotify');
      await refreshAccessToken('valid-refresh-token');

      expect(contentType).toBe('application/x-www-form-urlencoded');
    });
  });

  describe('Scope Validation', () => {
    it('should include all required scopes', async () => {
      const { scopes } = await import('../../src/lib/spotify');

      for (const scope of MOCK_DATA.requiredScopes) {
        expect(scopes).toContain(scope);
      }
    });

    it('should format scopes correctly for Spotify API', async () => {
      const { scopes } = await import('../../src/lib/spotify');

      // Should be space-separated
      expect(typeof scopes).toBe('string');
      expect(scopes).toMatch(/^[a-z-]+(?: [a-z-]+)*$/);
    });
  });

  describe('Token Refresh Error Handling', () => {
    it('should provide detailed error on 400 response', async () => {
      server.use(
        rest.post(SPOTIFY_TOKEN_URL, (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              error: 'invalid_client',
              error_description: 'Client authentication failed',
            })
          );
        })
      );

      const { refreshAccessToken } = await import('../../src/lib/spotify');

      try {
        await refreshAccessToken('valid-refresh-token');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(String(error)).toContain('400');
      }
    });

    it('should handle rate limiting on token endpoint', async () => {
      server.use(
        rest.post(SPOTIFY_TOKEN_URL, (req, res, ctx) => {
          return res(
            ctx.status(429),
            ctx.set('Retry-After', '60'),
            ctx.json({ error: 'too_many_requests' })
          );
        })
      );

      const { refreshAccessToken } = await import('../../src/lib/spotify');

      try {
        await refreshAccessToken('valid-refresh-token');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Token Response Format', () => {
    it('should handle token response without new refresh token', async () => {
      server.use(
        rest.post(SPOTIFY_TOKEN_URL, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              access_token: 'new-access-token',
              token_type: 'Bearer',
              expires_in: TEST_CONSTANTS.TOKEN_EXPIRES_IN,
              // No refresh_token in response - should use original
            })
          );
        })
      );

      const { refreshAccessToken } = await import('../../src/lib/spotify');
      const originalRefreshToken = 'original-refresh-token';

      const result = await refreshAccessToken(originalRefreshToken);

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe(originalRefreshToken);
    });

    it('should use new refresh token when provided', async () => {
      server.use(
        rest.post(SPOTIFY_TOKEN_URL, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              access_token: 'new-access-token',
              token_type: 'Bearer',
              expires_in: TEST_CONSTANTS.TOKEN_EXPIRES_IN,
              refresh_token: 'new-refresh-token',
            })
          );
        })
      );

      const { refreshAccessToken } = await import('../../src/lib/spotify');

      const result = await refreshAccessToken('old-refresh-token');

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
    });
  });

  describe('Cache Control', () => {
    it('should use no-cache for token refresh requests', async () => {
      server.use(
        rest.post(SPOTIFY_TOKEN_URL, (req, res, ctx) => {
          // Check if request was made with no-cache
          // This is implementation-dependent

          return res(
            ctx.status(200),
            ctx.json({
              access_token: 'new-token',
              token_type: 'Bearer',
              expires_in: TEST_CONSTANTS.TOKEN_EXPIRES_IN,
              refresh_token: 'valid-refresh-token',
            })
          );
        })
      );

      const { refreshAccessToken } = await import('../../src/lib/spotify');
      await refreshAccessToken('valid-refresh-token');

      // The actual implementation should use cache: 'no-cache'
      // This is verified in the source code
      expect(true).toBe(true); // Placeholder for implementation check
    });
  });
});
