import { useState, useEffect, useCallback } from 'react';
import { useSpotify } from './useSpotify';
import SpotifyWebApi from 'spotify-web-api-node';

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export interface Artist {
  id: string;
  name: string;
  images: { url: string; height: number; width: number }[];
  genres: string[];
  popularity: number;
  external_urls: { spotify: string; };
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
  const { spotifyApi, isReady } = useSpotify();
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

    try {
      setIsLoading(true);
      setError(null);

      // Fetch data in parallel
      const [topArtistsRes, topTracksRes, recentlyPlayedRes] = await Promise.all([
        spotifyApi.getMyTopArtists({ time_range: timeRange, limit: 10 }),
        spotifyApi.getMyTopTracks({ time_range: timeRange, limit: 10 }),
        spotifyApi.getMyRecentlyPlayedTracks({ limit: 20 }),
      ]);

      // Map Spotify API response to our custom types
      const mappedArtists: Artist[] = topArtistsRes.body.items.map(artist => ({
        id: artist.id,
        name: artist.name,
        images: artist.images.map(img => ({
          url: img.url,
          height: img.height || 0, // Default to 0 if undefined
          width: img.width || 0,   // Default to 0 if undefined
        })),
        genres: artist.genres,
        popularity: artist.popularity,
        external_urls: artist.external_urls,
      }));

      const mappedTracks: Track[] = topTracksRes.body.items.map(track => ({
        id: track.id,
        name: track.name,
        album: {
          name: track.album.name,
          images: track.album.images.map(img => ({
            url: img.url,
            height: img.height || 0,
            width: img.width || 0,
          })),
        },
        artists: track.artists.map(artist => ({
          id: artist.id,
          name: artist.name,
        })),
        duration_ms: track.duration_ms,
        popularity: track.popularity,
      }));

      const mappedRecentlyPlayed: PlayHistory[] = recentlyPlayedRes.body.items.map(item => ({
        played_at: item.played_at,
        track: {
          id: item.track.id,
          name: item.track.name,
          album: {
            name: item.track.album.name,
            images: item.track.album.images.map(img => ({
              url: img.url,
              height: img.height || 0,
              width: img.width || 0,
            })),
          },
          artists: item.track.artists.map(artist => ({
            id: artist.id,
            name: artist.name,
          })),
          duration_ms: item.track.duration_ms,
          popularity: item.track.popularity,
        },
        context: item.context ? {
          type: item.context.type,
          uri: item.context.uri,
        } : null,
      }));

      setTopArtists(mappedArtists);
      setTopTracks(mappedTracks);
      setRecentlyPlayed(mappedRecentlyPlayed);
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setError('Failed to load your stats. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [spotifyApi, timeRange, isReady]);

  useEffect(() => {
    if (isReady) {
      fetchData();
    }
  }, [fetchData, isReady]);

  return {
    topArtists,
    topTracks,
    recentlyPlayed,
    isLoading: isLoading || !isReady, // Consider loading if the API isn't ready
    error,
    refresh: fetchData,
  };
};