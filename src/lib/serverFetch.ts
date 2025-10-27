import { cache } from 'react';
import { unstable_cache as nextCache } from 'next/cache';
import { cookies, headers } from 'next/headers';

// Enhanced server-side fetch with Next.js v16 optimizations
export const serverFetch = cache(
  async (
    url: string,
    options: RequestInit = {},
    cacheOptions?: {
      revalidate?: number | false;
      tags?: string[];
    }
  ) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        cache: cacheOptions?.revalidate === false ? 'force-cache' : 'no-store',
        next: {
          revalidate: cacheOptions?.revalidate,
          tags: cacheOptions?.tags,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
);

// Server-side user data fetching with proper caching
export const getUserData = nextCache(
  async (accessToken: string) => {
    if (!accessToken) {
      throw new Error('No access token provided');
    }

    const response = await serverFetch(
      'https://api.spotify.com/v1/me',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        revalidate: 300, // Cache for 5 minutes
        tags: ['user-profile'],
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return response.json();
  },
  ['user-data'],
  {
    revalidate: 300,
    tags: ['user-profile'],
  }
);

// Server-side top artists fetching
export const getTopArtists = nextCache(
  async (accessToken: string, timeRange: string = 'medium_term') => {
    if (!accessToken) {
      throw new Error('No access token provided');
    }

    const response = await serverFetch(
      `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${timeRange}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        revalidate: 600, // Cache for 10 minutes
        tags: ['top-artists', `time-range-${timeRange}`],
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return response.json();
  },
  ['top-artists'],
  {
    revalidate: 600,
    tags: ['top-artists'],
  }
);

// Server-side top tracks fetching
export const getTopTracks = nextCache(
  async (accessToken: string, timeRange: string = 'medium_term') => {
    if (!accessToken) {
      throw new Error('No access token provided');
    }

    const response = await serverFetch(
      `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        revalidate: 600, // Cache for 10 minutes
        tags: ['top-tracks', `time-range-${timeRange}`],
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return response.json();
  },
  ['top-tracks'],
  {
    revalidate: 600,
    tags: ['top-tracks'],
  }
);

// Server-side recently played tracks fetching
export const getRecentlyPlayed = nextCache(
  async (accessToken: string) => {
    if (!accessToken) {
      throw new Error('No access token provided');
    }

    const response = await serverFetch(
      'https://api.spotify.com/v1/me/player/recently-played?limit=50',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
      {
        revalidate: 180, // Cache for 3 minutes (more frequent updates for recent activity)
        tags: ['recently-played'],
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return response.json();
  },
  ['recently-played'],
  {
    revalidate: 180,
    tags: ['recently-played'],
  }
);

// Enhanced error handling for Spotify API
export class SpotifyServerError extends Error {
  readonly status: number;
  readonly retryAfter?: number;

  constructor(message: string, status: number, retryAfter?: number) {
    super(message);
    this.name = 'SpotifyServerError';
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

// Request context utilities for server components
export async function getRequestContext() {
  const headersList = await headers();
  const cookieStore = await cookies();

  return {
    userAgent: headersList.get('user-agent'),
    origin: headersList.get('origin'),
    referer: headersList.get('referer'),
    sessionToken:
      cookieStore.get('next-auth.session-token')?.value ||
      cookieStore.get('__Secure-next-auth.session-token')?.value,
  };
}

// Cache revalidation helper for manual cache busting
export const SPOTIFY_CACHE_TAGS = {
  USER_PROFILE: 'user-profile',
  TOP_ARTISTS: 'top-artists',
  TOP_TRACKS: 'top-tracks',
  RECENTLY_PLAYED: 'recently-played',
} as const;
