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

// Reinstate in-memory cache for liked tracks
let likedTracksCache: SavedTrack[] | null = null;
let lastFetchTime = 0;
const LIKED_TRACKS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache lifetime

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

    const now = Date.now();
    // Check if data is in in-memory cache and still fresh
    if (!forceRefresh && likedTracksCache && (now - lastFetchTime < LIKED_TRACKS_CACHE_TTL)) {
      // Simulate API loading states briefly if cache is hit immediately
      setIsLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 50)); // Ensure loading state is visible
      setTracks(likedTracksCache); // Set tracks from in-memory cache
      setIsLoading(false);
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

      // Update in-memory cache
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
  const fetchArtistsDetails = useCallback(async (tracksToProcess: SavedTrack[]) => {
    if (!isReady || tracksToProcess.length === 0) {
      return;
    }

    try {
      setIsLoadingArtists(true);

      // Collect unique artist IDs from all tracks
      const artistIds = new Set<string>();
      tracksToProcess.forEach(item => {
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
      if (!isReady) {
        // If not ready, try to load from in-memory cache if available
        if (likedTracksCache && isMounted) {
          setTracks(likedTracksCache);
          // Artists details would need to be fetched if not also cached in memory or if dependent on fresh tracks
          // For simplicity, we might re-fetch artists or ensure artistsCache is populated correctly elsewhere
          fetchArtistsDetails(likedTracksCache);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // First load tracks (either from cache or API)
        // fetchLikedTracks will handle cache check internally if forceRefresh is false (default)
        const loadedTracks = await fetchLikedTracks();

        if (isMounted) {
          setTracks(loadedTracks);
          setIsLoading(false); // Set loading to false after tracks are set

          // Then load artists details (staggered loading)
          if (loadedTracks.length > 0) {
            await fetchArtistsDetails(loadedTracks);
          } else {
            setIsLoadingArtists(false); // No artists to load
          }
        }
      } catch (err) {
        console.error('Error in useLikedTracks hook:', err);
        if (isMounted) {
          setError('Failed to load your music data. Please try again later.');
          setIsLoading(false);
          setIsLoadingArtists(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isReady, fetchLikedTracks, fetchArtistsDetails]); // fetchLikedTracks is stable due to useCallback

  // Function to refresh data
  const refresh = useCallback(async () => {
    if (!isReady) return [];
    setIsLoading(true);
    // Clear in-memory cache for refresh
    likedTracksCache = null;
    lastFetchTime = 0;
    const refreshedTracks = await fetchLikedTracks(true);
    if (refreshedTracks) {
        setTracks(refreshedTracks);
        // artistsCache.clear(); // Optionally clear artist cache too for full refresh
        await fetchArtistsDetails(refreshedTracks);
    }
    setIsLoading(false);
    return refreshedTracks;
  }, [isReady, fetchLikedTracks, fetchArtistsDetails]);

  return {
    tracks,
    isLoading,
    isLoadingArtists,
    error,
    artistsDetails,
    refresh
  };
}