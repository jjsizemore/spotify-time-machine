import { useCallback, useEffect, useState } from 'react';
import { getCachedDataSmart, setCachedDataCompressed } from '@/lib/cacheUtils';
import { SpotifyApiError } from '@/lib/spotify';
import { SpotifyTimeRange } from '@/lib/timeRanges';
import { useSpotify } from './useSpotify';

export type TimeRange = SpotifyTimeRange;

// Cache keys for different data types and time ranges
const CACHE_KEYS = {
  TOP_ARTISTS: (timeRange: TimeRange, limit: number = 10) =>
    `userStats_topArtists_${timeRange}_${limit}`,
  TOP_TRACKS: (timeRange: TimeRange, limit: number = 10) =>
    `userStats_topTracks_${timeRange}_${limit}`,
  RECENTLY_PLAYED: (limit: number = 20) => `userStats_recentlyPlayed_${limit}`,
};

// Cache TTL: 6 hours for stats, 30 minutes for recently played (in minutes)
const CACHE_TTL_STATS = 6 * 60; // 6 hours
const CACHE_TTL_RECENT = 30; // 30 minutes

export interface Artist {
  id: string;
  name: string;
  images: { url: string; height: number; width: number }[];
  genres: string[];
  popularity: number;
  external_urls: { spotify: string };
}

export interface Track {
  id: string;
  name: string;
  album: {
    images: { url: string; height: number; width: number }[];
    name: string;
  };
  artists: { id: string; name: string }[];
  duration_ms: number;
  popularity: number;
  preview_url?: string | null;
  external_urls?: { spotify: string };
}

export interface PlayHistory {
  track: Track;
  played_at: string;
  context: {
    type: string;
    uri: string;
  } | null;
}

export const useUserStats = (timeRange: TimeRange = 'medium_term') => {
  const { spotifyApi, isReady, error: spotifyError, retry } = useSpotify();
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<PlayHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Don't try to fetch if the API isn't ready yet
    if (!isReady) {
      return;
    }

    // Check for Spotify API errors first
    if (spotifyError) {
      setError(spotifyError);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check for cached data first
      console.debug('🔍 Checking cache for timeRange:', timeRange);
      const [cachedTopArtists, cachedTopTracks, cachedRecentlyPlayed] = await Promise.all([
        getCachedDataSmart<Artist[]>(CACHE_KEYS.TOP_ARTISTS(timeRange, 10)),
        getCachedDataSmart<Track[]>(CACHE_KEYS.TOP_TRACKS(timeRange, 10)),
        getCachedDataSmart<PlayHistory[]>(CACHE_KEYS.RECENTLY_PLAYED(20)),
      ]);

      // Log cache hits/misses
      console.debug('📊 Cache results:', {
        topArtists: cachedTopArtists ? '✅ HIT' : '❌ MISS',
        topTracks: cachedTopTracks ? '✅ HIT' : '❌ MISS',
        recentlyPlayed: cachedRecentlyPlayed ? '✅ HIT' : '❌ MISS',
        timeRange,
      });

      // Use cached data if available
      if (cachedTopArtists) {
        setTopArtists(cachedTopArtists);
      }
      if (cachedTopTracks) {
        setTopTracks(cachedTopTracks);
      }
      if (cachedRecentlyPlayed) {
        setRecentlyPlayed(cachedRecentlyPlayed);
      }

      // If we have all cached data, we can finish early
      if (cachedTopArtists && cachedTopTracks && cachedRecentlyPlayed) {
        console.debug('🚀 All data cached, finishing early');
        setIsLoading(false);
        return;
      }

      // Fetch missing data from API
      const fetchPromises: Promise<any>[] = [];

      if (!cachedTopArtists) {
        fetchPromises.push(spotifyApi.getMyTopArtists({ time_range: timeRange, limit: 10 }));
      } else {
        fetchPromises.push(Promise.resolve({ status: 'cached' }));
      }

      if (!cachedTopTracks) {
        fetchPromises.push(spotifyApi.getMyTopTracks({ time_range: timeRange, limit: 10 }));
      } else {
        fetchPromises.push(Promise.resolve({ status: 'cached' }));
      }

      if (!cachedRecentlyPlayed) {
        fetchPromises.push(spotifyApi.getMyRecentlyPlayedTracks({ limit: 20 }));
      } else {
        fetchPromises.push(Promise.resolve({ status: 'cached' }));
      }

      // Fetch data in parallel with proper error handling and timeout
      const TIMEOUT_MS = 10000; // 10 seconds timeout

      const fetchWithTimeout = (promise: Promise<any>, name: string) => {
        return Promise.race([
          promise,
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error(`${name} timed out after ${TIMEOUT_MS}ms`)),
              TIMEOUT_MS
            )
          ),
        ]);
      };

      const timeoutPromises = fetchPromises.map((promise, index) => {
        const names = ['top artists', 'top tracks', 'recently played'];
        return fetchWithTimeout(promise, names[index]);
      });

      const [topArtistsRes, topTracksRes, recentlyPlayedRes] =
        await Promise.allSettled(timeoutPromises);

      // Log API call results for debugging
      console.debug('API call results:', {
        topArtists: topArtistsRes.status,
        topTracks: topTracksRes.status,
        recentlyPlayed: recentlyPlayedRes.status,
        errors: {
          topArtists: topArtistsRes.status === 'rejected' ? topArtistsRes.reason?.message : null,
          topTracks: topTracksRes.status === 'rejected' ? topTracksRes.reason?.message : null,
          recentlyPlayed:
            recentlyPlayedRes.status === 'rejected' ? recentlyPlayedRes.reason?.message : null,
        },
      });

      console.debug('📊 Starting data processing...');

      // Process top artists
      if (topArtistsRes.status === 'fulfilled' && topArtistsRes.value.status !== 'cached') {
        const mappedArtists: Artist[] = topArtistsRes.value.body.items.map((artist: any) => ({
          id: artist.id,
          name: artist.name,
          images: artist.images.map((img: any) => ({
            url: img.url,
            height: img.height || 0,
            width: img.width || 0,
          })),
          genres: artist.genres,
          popularity: artist.popularity,
          external_urls: artist.external_urls,
        }));
        setTopArtists(mappedArtists);

        // Cache in background with timeout - don't await
        console.debug('💾 Caching top artists in background for', timeRange);
        const cacheKey = CACHE_KEYS.TOP_ARTISTS(timeRange, 10);
        console.debug('🔑 Cache key:', cacheKey);

        // Add timeout to prevent hanging promises - use localStorage directly
        const cachePromise = setCachedDataCompressed(
          cacheKey,
          mappedArtists,
          CACHE_TTL_STATS,
          false // Disable compression to prevent hanging
        );

        Promise.race([
          cachePromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Background cache timeout')), 10000)
          ),
        ])
          .then(() => {
            console.debug('✅ Top artists cached successfully for key:', cacheKey);
          })
          .catch((cacheError) => {
            console.error('❌ Failed to cache top artists:', cacheError);
            console.error('❌ Cache key was:', cacheKey);
            console.error('❌ Data size:', JSON.stringify(mappedArtists).length, 'chars');
          });
      } else if (topArtistsRes.status === 'rejected') {
        console.error('Failed to fetch top artists:', topArtistsRes.reason);
      }

      console.debug('✅ Top artists section completed, moving to top tracks...');

      // Process top tracks
      console.debug('🎵 Processing top tracks...', topTracksRes.status);
      if (topTracksRes.status === 'fulfilled' && topTracksRes.value.status !== 'cached') {
        try {
          console.debug('🎵 Mapping top tracks data...');
          const mappedTracks: Track[] = topTracksRes.value.body.items.map((track: any) => ({
            id: track.id,
            name: track.name,
            album: {
              name: track.album.name,
              images: track.album.images.map((img: any) => ({
                url: img.url,
                height: img.height || 0,
                width: img.width || 0,
              })),
            },
            artists: track.artists.map((artist: any) => ({
              id: artist.id,
              name: artist.name,
            })),
            duration_ms: track.duration_ms,
            preview_url: track.preview_url,
            external_urls: track.external_urls,
          }));
          console.debug('🎵 Setting top tracks state...');
          setTopTracks(mappedTracks);

          // Cache in background with timeout - don't await
          console.debug('💾 Caching top tracks in background for', timeRange);
          const cacheKey = CACHE_KEYS.TOP_TRACKS(timeRange, 10);
          console.debug('🔑 Cache key:', cacheKey);

          // Add timeout to prevent hanging promises - use localStorage directly
          const cachePromise = setCachedDataCompressed(
            cacheKey,
            mappedTracks,
            CACHE_TTL_STATS,
            false // Disable compression to prevent hanging
          );

          Promise.race([
            cachePromise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Background cache timeout')), 10000)
            ),
          ])
            .then(() => {
              console.debug('✅ Top tracks cached successfully for key:', cacheKey);
            })
            .catch((cacheError) => {
              console.error('❌ Failed to cache top tracks:', cacheError);
              console.error('❌ Cache key was:', cacheKey);
              console.error('❌ Data size:', JSON.stringify(mappedTracks).length, 'chars');
            });
        } catch (error) {
          console.error('❌ Error processing top tracks:', error);
        }
      } else if (topTracksRes.status === 'rejected') {
        console.error('Failed to fetch top tracks:', topTracksRes.reason);
      }

      // Process recently played
      console.debug('🎧 Processing recently played...', recentlyPlayedRes.status);
      if (recentlyPlayedRes.status === 'fulfilled' && recentlyPlayedRes.value.status !== 'cached') {
        try {
          console.debug('🎧 Mapping recently played data...');
          const mappedRecentlyPlayed: PlayHistory[] = recentlyPlayedRes.value.body.items.map(
            (item: any) => ({
              track: {
                id: item.track.id,
                name: item.track.name,
                album: {
                  name: item.track.album.name,
                  images: item.track.album.images.map((img: any) => ({
                    url: img.url,
                    height: img.height || 0,
                    width: img.width || 0,
                  })),
                },
                artists: item.track.artists.map((artist: any) => ({
                  id: artist.id,
                  name: artist.name,
                })),
                duration_ms: item.track.duration_ms,
                preview_url: item.track.preview_url,
                external_urls: item.track.external_urls,
                popularity: item.track.popularity || 0,
              },
              played_at: item.played_at,
              context: item.context,
            })
          );
          console.debug('🎧 Setting recently played state...');
          setRecentlyPlayed(mappedRecentlyPlayed);

          // Cache in background - don't await
          console.debug('💾 Caching recently played in background...');
          const cacheKey = CACHE_KEYS.RECENTLY_PLAYED(20);
          console.debug('🔑 Cache key:', cacheKey);

          // Add timeout to prevent hanging promises - use localStorage directly
          const cachePromise = setCachedDataCompressed(
            cacheKey,
            mappedRecentlyPlayed,
            CACHE_TTL_RECENT,
            false // Disable compression to prevent hanging
          );

          Promise.race([
            cachePromise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Background cache timeout')), 10000)
            ),
          ])
            .then(() => {
              console.debug('✅ Recently played cached successfully for key:', cacheKey);
            })
            .catch((cacheError) => {
              console.error('❌ Failed to cache recently played:', cacheError);
              console.error('❌ Cache key was:', cacheKey);
              console.error('❌ Data size:', JSON.stringify(mappedRecentlyPlayed).length, 'chars');
            });
        } catch (error) {
          console.error('❌ Error processing recently played:', error);
        }
      } else if (recentlyPlayedRes.status === 'rejected') {
        console.error('Failed to fetch recently played:', recentlyPlayedRes.reason);
      }

      console.debug('🔍 Checking for partial failures...');

      // Only set error if all requests failed
      const allFailed = [topArtistsRes, topTracksRes, recentlyPlayedRes].every(
        (result) => result.status === 'rejected'
      );

      if (allFailed) {
        const firstError = [topArtistsRes, topTracksRes, recentlyPlayedRes].find(
          (result) => result.status === 'rejected'
        )?.reason;

        if (firstError instanceof SpotifyApiError) {
          if (firstError.status === 401) {
            setError('Authentication expired. Please sign in again.');
          } else if (firstError.status === 403) {
            setError('Access forbidden. Please check your Spotify permissions.');
          } else {
            setError(`Spotify API error: ${firstError.message}`);
          }
        } else {
          setError('Failed to load user statistics. Please try again later.');
        }
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
      if (err instanceof SpotifyApiError) {
        if (err.status === 401) {
          setError('Authentication expired. Please sign in again.');
        } else {
          setError(`Spotify API error: ${err.message}`);
        }
      } else {
        setError('Failed to load user statistics. Please try again later.');
      }
    } finally {
      console.debug('🏁 Finishing fetchData, setting isLoading to false');
      setIsLoading(false);
    }
  }, [spotifyApi, timeRange, isReady, spotifyError]);

  useEffect(() => {
    if (isReady) {
      fetchData();
    }
  }, [fetchData, isReady]);

  const handleRefresh = useCallback(() => {
    if (spotifyError) {
      retry();
    } else {
      fetchData();
    }
  }, [spotifyError, retry, fetchData]);

  // Debug logging for loading state
  console.log('useUserStats debug:', {
    internalIsLoading: isLoading,
    isReady,
    finalIsLoading: isLoading || !isReady,
    hasTopArtists: topArtists.length,
    hasTopTracks: topTracks.length,
    hasRecentlyPlayed: recentlyPlayed.length,
  });

  return {
    topArtists,
    topTracks,
    recentlyPlayed,
    isLoading: isLoading || !isReady, // Restore proper loading logic
    error: error || spotifyError,
    refresh: handleRefresh,
  };
};
