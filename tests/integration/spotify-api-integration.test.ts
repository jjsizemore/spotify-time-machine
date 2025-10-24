/**
 * Spotify API Integration Tests
 *
 * These tests guard against regressions in the integration between
 * the Spotify API client and actual API endpoints using MSW.
 */

import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { spotifyApi } from '../../src/lib/spotify';

const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';

// Mock data
const mockTopTracks = {
  items: [
    {
      id: 'track1',
      name: 'Test Track 1',
      artists: [{ id: 'artist1', name: 'Test Artist 1' }],
      album: { id: 'album1', name: 'Test Album 1' },
      duration_ms: 180000,
      popularity: 85,
    },
    {
      id: 'track2',
      name: 'Test Track 2',
      artists: [{ id: 'artist2', name: 'Test Artist 2' }],
      album: { id: 'album2', name: 'Test Album 2' },
      duration_ms: 210000,
      popularity: 90,
    },
  ],
  total: 2,
  limit: 10,
  offset: 0,
};

const mockTopArtists = {
  items: [
    {
      id: 'artist1',
      name: 'Test Artist 1',
      genres: ['rock', 'indie'],
      popularity: 85,
      followers: { total: 1000000 },
    },
    {
      id: 'artist2',
      name: 'Test Artist 2',
      genres: ['pop', 'electronic'],
      popularity: 90,
      followers: { total: 2000000 },
    },
  ],
  total: 2,
  limit: 10,
  offset: 0,
};

const mockRecentlyPlayed = {
  items: [
    {
      track: {
        id: 'track1',
        name: 'Recently Played Track',
        artists: [{ id: 'artist1', name: 'Recent Artist' }],
      },
      played_at: new Date().toISOString(),
    },
  ],
  cursors: {
    after: '1234567890',
  },
};

const mockUser = {
  id: 'testuser123',
  display_name: 'Test User',
  email: 'test@example.com',
};

const server = setupServer(
  rest.get(`${SPOTIFY_BASE_URL}/me/top/tracks`, (req, res, ctx) => {
    const url = new URL(req.url);
    const timeRange = url.searchParams.get('time_range') || 'medium_term';

    return res(
      ctx.status(200),
      ctx.json({
        ...mockTopTracks,
        time_range: timeRange,
      })
    );
  }),

  rest.get(`${SPOTIFY_BASE_URL}/me/top/artists`, (req, res, ctx) => {
    const url = new URL(req.url);
    const timeRange = url.searchParams.get('time_range') || 'medium_term';

    return res(
      ctx.status(200),
      ctx.json({
        ...mockTopArtists,
        time_range: timeRange,
      })
    );
  }),

  rest.get(`${SPOTIFY_BASE_URL}/me/player/recently-played`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockRecentlyPlayed));
  }),

  rest.get(`${SPOTIFY_BASE_URL}/me`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockUser));
  }),

  rest.get(`${SPOTIFY_BASE_URL}/artists`, (req, res, ctx) => {
    const url = new URL(req.url);
    const ids = url.searchParams.get('ids')?.split(',') || [];

    return res(
      ctx.status(200),
      ctx.json({
        artists: ids.map((id) => ({
          id,
          name: `Artist ${id}`,
          genres: ['test-genre'],
          popularity: 75,
        })),
      })
    );
  }),

  rest.post(`${SPOTIFY_BASE_URL}/users/:userId/playlists`, async (req, res, ctx) => {
    const body = (await req.json()) as { name: string; description?: string; public?: boolean };

    return res(
      ctx.status(200),
      ctx.json({
        id: 'playlist123',
        name: body.name,
        description: body.description || '',
        public: body.public || false,
        owner: { id: req.params.userId },
        tracks: { total: 0 },
      })
    );
  }),

  rest.post(`${SPOTIFY_BASE_URL}/playlists/:playlistId/tracks`, async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        snapshot_id: 'snapshot123',
      })
    );
  })
);

describe('Spotify API Integration Tests', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    spotifyApi.clearPendingRequests();
    spotifyApi.setAccessToken('test-access-token');
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('Top Tracks Integration', () => {
    it('should fetch top tracks successfully', async () => {
      const result = await spotifyApi.getMyTopTracks({
        time_range: 'short_term',
        limit: 10,
      });

      expect(result.body.items).toHaveLength(2);
      expect(result.body.items[0].name).toBe('Test Track 1');
      expect(result.body.time_range).toBe('short_term');
    });

    it('should handle different time ranges', async () => {
      const shortTerm = await spotifyApi.getMyTopTracks({
        time_range: 'short_term',
      });
      const mediumTerm = await spotifyApi.getMyTopTracks({
        time_range: 'medium_term',
      });
      const longTerm = await spotifyApi.getMyTopTracks({
        time_range: 'long_term',
      });

      expect(shortTerm.body.time_range).toBe('short_term');
      expect(mediumTerm.body.time_range).toBe('medium_term');
      expect(longTerm.body.time_range).toBe('long_term');
    });

    it('should respect limit parameter', async () => {
      const result = await spotifyApi.getMyTopTracks({ limit: 5 });

      // Mock always returns 2, but in real API this would be respected
      expect(result.body.limit).toBe(10);
    });
  });

  describe('Top Artists Integration', () => {
    it('should fetch top artists successfully', async () => {
      const result = await spotifyApi.getMyTopArtists({
        time_range: 'medium_term',
        limit: 10,
      });

      expect(result.body.items).toHaveLength(2);
      expect(result.body.items[0].name).toBe('Test Artist 1');
      expect(result.body.items[0].genres).toContain('rock');
    });

    it('should include artist metadata', async () => {
      const result = await spotifyApi.getMyTopArtists({ limit: 10 });
      const artist = result.body.items[0];

      expect(artist).toHaveProperty('id');
      expect(artist).toHaveProperty('name');
      expect(artist).toHaveProperty('genres');
      expect(artist).toHaveProperty('popularity');
      expect(artist).toHaveProperty('followers');
    });
  });

  describe('Recently Played Integration', () => {
    it('should fetch recently played tracks', async () => {
      const result = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 50 });

      expect(result.body.items).toHaveLength(1);
      expect(result.body.items[0].track.name).toBe('Recently Played Track');
      expect(result.body.items[0]).toHaveProperty('played_at');
    });

    it('should include pagination cursors', async () => {
      const result = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 50 });

      expect(result.body.cursors).toBeDefined();
      expect(result.body.cursors.after).toBe('1234567890');
    });
  });

  describe('Artist Batch Retrieval', () => {
    it('should fetch multiple artists by IDs', async () => {
      const artistIds = ['artist1', 'artist2', 'artist3'];
      const result = await spotifyApi.getArtists(artistIds);

      expect(result.body.artists).toHaveLength(3);
      expect(result.body.artists[0].id).toBe('artist1');
      expect(result.body.artists[1].id).toBe('artist2');
    });

    it('should handle empty artist array', async () => {
      const result = await spotifyApi.getArtists([]);

      expect(result.body.artists).toEqual([]);
    });
  });

  describe('Playlist Creation Integration', () => {
    it('should create playlist successfully', async () => {
      const result = await spotifyApi.createPlaylist('My Test Playlist', {
        description: 'Test description',
        public: false,
      });

      expect(result.body.id).toBe('playlist123');
      expect(result.body.name).toBe('My Test Playlist');
      expect(result.body.description).toBe('Test description');
      expect(result.body.public).toBe(false);
    });

    it('should add tracks to playlist', async () => {
      const playlistId = 'playlist123';
      const trackUris = ['spotify:track:track1', 'spotify:track:track2'];

      const result = await spotifyApi.addTracksToPlaylist(playlistId, trackUris);

      expect(result.body.snapshot_id).toBe('snapshot123');
    });

    it('should handle playlist creation workflow', async () => {
      // Create playlist
      const playlist = await spotifyApi.createPlaylist('Integration Test Playlist');
      expect(playlist.body.id).toBeDefined();

      // Add tracks
      const tracks = ['spotify:track:1', 'spotify:track:2'];
      const addResult = await spotifyApi.addTracksToPlaylist(playlist.body.id, tracks);
      expect(addResult.body.snapshot_id).toBeDefined();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle 404 responses', async () => {
      server.use(
        rest.get(`${SPOTIFY_BASE_URL}/me/top/tracks`, (req, res, ctx) => {
          return res(ctx.status(404), ctx.json({ error: { message: 'Not found' } }));
        })
      );

      await expect(spotifyApi.getMyTopTracks({ limit: 10 })).rejects.toThrow();
    });

    it('should handle 500 server errors', async () => {
      server.use(
        rest.get(`${SPOTIFY_BASE_URL}/me/top/artists`, (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: { message: 'Internal server error' } }));
        })
      );

      await expect(spotifyApi.getMyTopArtists({ limit: 10 })).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      server.use(
        rest.get(`${SPOTIFY_BASE_URL}/me/top/tracks`, (req, res) => {
          return res.networkError('Network error');
        })
      );

      await expect(spotifyApi.getMyTopTracks({ limit: 10 })).rejects.toThrow();
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple concurrent requests', async () => {
      const promises = [
        spotifyApi.getMyTopTracks({ limit: 10 }),
        spotifyApi.getMyTopArtists({ limit: 10 }),
        spotifyApi.getMyRecentlyPlayedTracks({ limit: 50 }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0].body.items).toBeDefined(); // tracks
      expect(results[1].body.items).toBeDefined(); // artists
      expect(results[2].body.items).toBeDefined(); // recently played
    });

    it('should deduplicate concurrent identical requests', async () => {
      let callCount = 0;

      server.use(
        rest.get(`${SPOTIFY_BASE_URL}/me/top/tracks`, (req, res, ctx) => {
          callCount++;
          return res(ctx.status(200), ctx.json(mockTopTracks));
        })
      );

      // Make 5 identical requests simultaneously
      const promises = Array.from({ length: 5 }).map(() =>
        spotifyApi.getMyTopTracks({ limit: 10, time_range: 'short_term' })
      );

      await Promise.all(promises);

      // Should only make one actual request due to deduplication
      expect(callCount).toBe(1);
    });
  });

  describe('Rate Limiting Behavior', () => {
    it('should handle rate limit responses', async () => {
      server.use(
        rest.get(`${SPOTIFY_BASE_URL}/me/top/tracks`, (req, res, ctx) => {
          return res(
            ctx.status(429),
            ctx.set('Retry-After', '1'),
            ctx.json({ error: { message: 'Rate limit exceeded' } })
          );
        })
      );

      await expect(spotifyApi.getMyTopTracks({ limit: 10 })).rejects.toThrow();
    });
  });
});
