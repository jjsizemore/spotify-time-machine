import { useState, useEffect, useCallback } from 'react';
import { useSpotify } from './useSpotify';

// Type for a single saved track
export interface SavedTrack {
  added_at: string;
  track: {
    id: string;
    name: string;
    album: {
      name: string;
      images: Array<{
        url: string;
        height?: number;
        width?: number;
      }>;
    };
    artists: Array<{ id: string; name: string }>;
    duration_ms: number;
    preview_url: string | null;
  };
}

// Cache for artists data to prevent redundant API calls
const artistsCache = new Map<string, any>();
// Cache for liked tracks to prevent redundant API calls
let likedTracksCache: SavedTrack[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache lifetime

export function useLikedTracks() {
  const { spotifyApi, isReady } = useSpotify();
  const [tracks, setTracks] = useState<SavedTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artistsDetails, setArtistsDetails] = useState<Map<string, any>>(new Map());
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);

  // Fetch all liked tracks from the Spotify API
  const fetchLikedTracks = useCallback(async (forceRefresh = false) => {
    if (!isReady) {
      return [];
    }

    // Check if data is in cache and still fresh
    const now = Date.now();
    if (!forceRefresh && likedTracksCache && (now - lastFetchTime < CACHE_TTL)) {
      return likedTracksCache;
    }

    try {
      setIsLoading(true);
      setError(null);

      const limit = 50;
      let offset = 0;
      let allTracks: SavedTrack[] = [];
      let total = 0;

      // Fetch all tracks with pagination
      do {
        const response = await spotifyApi.getMySavedTracks({ limit, offset });
        allTracks = [...allTracks, ...response.body.items as SavedTrack[]];
        total = response.body.total;
        offset += limit;
      } while (offset < total);

      // Update cache
      likedTracksCache = allTracks;
      lastFetchTime = now;
      return allTracks;
    } catch (err) {
      console.error('Error fetching liked tracks:', err);
      setError('Failed to load your liked tracks. Please try again later.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isReady, spotifyApi]);

  // Fetch detailed information about artists
  const fetchArtistsDetails = useCallback(async (tracks: SavedTrack[]) => {
    if (!isReady || tracks.length === 0) {
      return;
    }

    try {
      setIsLoadingArtists(true);

      // Collect unique artist IDs from all tracks
      const artistIds = new Set<string>();
      tracks.forEach(item => {
        item.track.artists.forEach(artist => {
          // Only fetch if not already in cache
          if (!artistsCache.has(artist.id)) {
            artistIds.add(artist.id);
          }
        });
      });

      // Skip if all artists are already cached
      if (artistIds.size === 0) {
        setArtistsDetails(new Map(artistsCache));
        return;
      }

      // Fetch artists details in batches (Spotify API limits to 50 per request)
      const batchSize = 50;
      const artistIdArray = Array.from(artistIds);

      for (let i = 0; i < artistIdArray.length; i += batchSize) {
        const batch = artistIdArray.slice(i, i + batchSize);
        const response = await spotifyApi.getArtists(batch);

        // Add to cache
        response.body.artists.forEach(artist => {
          artistsCache.set(artist.id, artist);
        });
      }

      // Update state with full cache
      setArtistsDetails(new Map(artistsCache));
    } catch (err) {
      console.error('Error fetching artists details:', err);
      // Not setting an error as this is secondary data
    } finally {
      setIsLoadingArtists(false);
    }
  }, [isReady, spotifyApi]);

  // Main effect to load data
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isReady) return;

      try {
        // First load tracks (either from cache or API)
        const loadedTracks = await fetchLikedTracks();

        if (isMounted) {
          setTracks(loadedTracks);

          // Then load artists details (staggered loading)
          fetchArtistsDetails(loadedTracks);
        }
      } catch (err) {
        console.error('Error in useLikedTracks hook:', err);
        if (isMounted) {
          setError('Failed to load your music data. Please try again later.');
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isReady, fetchLikedTracks, fetchArtistsDetails]);

  // Function to refresh data
  const refresh = useCallback(() => {
    return fetchLikedTracks(true);
  }, [fetchLikedTracks]);

  return {
    tracks,
    isLoading,
    isLoadingArtists,
    error,
    artistsDetails,
    refresh
  };
}