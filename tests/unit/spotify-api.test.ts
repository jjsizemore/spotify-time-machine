/**
 * Spotify API Client - Regression Tests
 *
 * These tests guard against regressions in the critical Spotify API client
 * functionality including request queuing, retry logic, and token refresh.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { spotifyApi, SpotifyApiError } from '../../src/lib/spotify';

describe('Spotify API Client - Critical Regression Tests', () => {
  beforeEach(() => {
    // Reset the API client state before each test
    spotifyApi.clearPendingRequests();
    spotifyApi.resetAccessToken();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Token Management', () => {
    it('should throw error when no access token is set', async () => {
      spotifyApi.resetAccessToken();

      await expect(spotifyApi.getMyTopTracks({ limit: 10 })).rejects.toThrow(
        'No access token available'
      );
    });

    it('should accept and store access token', () => {
      const testToken = 'test-access-token-123';
      spotifyApi.setAccessToken(testToken);

      // Verify token was set (indirectly by not throwing)
      expect(() => spotifyApi.setAccessToken(testToken)).not.toThrow();
    });

    it('should allow token refresh callback to be registered', () => {
      const mockRefreshCallback = vi.fn().mockResolvedValue({
        accessToken: 'new-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 3600000,
      });

      expect(() => {
        spotifyApi.setTokenRefreshCallback(mockRefreshCallback);
      }).not.toThrow();
    });
  });

  describe('Request Deduplication', () => {
    it('should deduplicate identical GET requests', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ items: [], total: 0 }),
      });

      vi.stubGlobal('fetch', mockFetch);
      spotifyApi.setAccessToken('test-token');

      // Make two identical requests simultaneously
      const [result1, result2] = await Promise.all([
        spotifyApi.getMyTopTracks({ limit: 10, time_range: 'short_term' }),
        spotifyApi.getMyTopTracks({ limit: 10, time_range: 'short_term' }),
      ]);

      // Should only make one actual fetch call due to deduplication
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });

    it('should NOT deduplicate requests with different parameters', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ items: [], total: 0 }),
      });

      vi.stubGlobal('fetch', mockFetch);
      spotifyApi.setAccessToken('test-token');

      // Make two requests with different parameters
      await Promise.all([
        spotifyApi.getMyTopTracks({ limit: 10 }),
        spotifyApi.getMyTopTracks({ limit: 20 }),
      ]);

      // Should make separate fetch calls
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 Unauthorized errors', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers(),
        json: async () => ({ error: { message: 'Invalid access token' } }),
      });

      vi.stubGlobal('fetch', mockFetch);
      spotifyApi.setAccessToken('invalid-token');

      await expect(spotifyApi.getMyTopTracks({ limit: 10 })).rejects.toThrow(SpotifyApiError);
    });

    it('should handle rate limit (429) responses', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({ 'Retry-After': '1' }),
        json: async () => ({ error: { message: 'Rate limit exceeded' } }),
      });

      vi.stubGlobal('fetch', mockFetch);
      spotifyApi.setAccessToken('test-token');

      await expect(spotifyApi.getMyTopTracks({ limit: 10 })).rejects.toThrow(
        'API rate limit exceeded'
      );
    }, 10000);

    it('should include status code in SpotifyApiError', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        json: async () => ({ error: { message: 'Resource not found' } }),
      });

      vi.stubGlobal('fetch', mockFetch);
      spotifyApi.setAccessToken('test-token');

      try {
        await spotifyApi.getMyTopTracks({ limit: 10 });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(SpotifyApiError);
        expect((error as SpotifyApiError).status).toBe(404);
      }
    });
  });

  describe('API Methods - Parameter Handling', () => {
    let mockFetch: any;

    beforeEach(() => {
      mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ items: [], total: 0 }),
      });

      vi.stubGlobal('fetch', mockFetch);
      spotifyApi.setAccessToken('test-token');
    });

    it('getMyTopTracks should construct correct URL with parameters', async () => {
      await spotifyApi.getMyTopTracks({
        time_range: 'short_term',
        limit: 50,
        offset: 10,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('time_range=short_term'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=50'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=10'),
        expect.any(Object)
      );
    });

    it('getMyTopArtists should construct correct URL with parameters', async () => {
      await spotifyApi.getMyTopArtists({
        time_range: 'medium_term',
        limit: 20,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/me/top/artists'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('time_range=medium_term'),
        expect.any(Object)
      );
    });

    it('getMyRecentlyPlayedTracks should handle timestamp parameters', async () => {
      const afterTimestamp = Date.now() - 86400000; // 24 hours ago

      await spotifyApi.getMyRecentlyPlayedTracks({
        limit: 50,
        after: afterTimestamp,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/me/player/recently-played'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`after=${afterTimestamp}`),
        expect.any(Object)
      );
    });

    it('getMySavedTracks should handle pagination', async () => {
      await spotifyApi.getMySavedTracks({
        limit: 50,
        offset: 100,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/me/tracks'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=50'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=100'),
        expect.any(Object)
      );
    });

    it('getArtists should handle empty array', async () => {
      const result = await spotifyApi.getArtists([]);

      expect(result.body.artists).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('getArtists should join multiple IDs correctly', async () => {
      const artistIds = ['artist1', 'artist2', 'artist3'];

      await spotifyApi.getArtists(artistIds);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('ids=artist1,artist2,artist3'),
        expect.any(Object)
      );
    });
  });

  describe('Queue Status Monitoring', () => {
    it('should provide queue status information', () => {
      spotifyApi.setAccessToken('test-token');

      const status = spotifyApi.getQueueStatus();

      expect(status).toHaveProperty('queueLength');
      expect(status).toHaveProperty('pendingRequestsCount');
      expect(status).toHaveProperty('isProcessing');
      expect(status).toHaveProperty('hasToken');
      expect(status.hasToken).toBe(true);
    });

    it('should reflect no token in queue status', () => {
      spotifyApi.resetAccessToken();

      const status = spotifyApi.getQueueStatus();

      expect(status.hasToken).toBe(false);
    });
  });

  describe('Request Priority', () => {
    let mockFetch: any;

    beforeEach(() => {
      mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ items: [], total: 0 }),
      });

      vi.stubGlobal('fetch', mockFetch);
      spotifyApi.setAccessToken('test-token');
    });

    it('should handle requests with different priorities', async () => {
      // These endpoints have different priorities internally
      // Top tracks/artists: priority 1 (highest)
      // Recently played: priority 2
      // Saved tracks: priority 4 (lower)

      const promises = [
        spotifyApi.getMySavedTracks({ limit: 10 }), // Lower priority
        spotifyApi.getMyTopTracks({ limit: 10 }), // Higher priority
        spotifyApi.getMyRecentlyPlayedTracks({ limit: 10 }), // Medium priority
      ];

      await Promise.all(promises);

      // All requests should complete successfully
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('Authentication Headers', () => {
    it('should include Authorization header with Bearer token', async () => {
      const testToken = 'test-access-token-xyz';
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ items: [] }),
      });

      vi.stubGlobal('fetch', mockFetch);
      spotifyApi.setAccessToken(testToken);

      await spotifyApi.getMyTopTracks({ limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${testToken}`,
          }),
        })
      );
    });

    it('should include Content-Type header', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ items: [] }),
      });

      vi.stubGlobal('fetch', mockFetch);
      spotifyApi.setAccessToken('test-token');

      await spotifyApi.getMyTopTracks({ limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });
});
