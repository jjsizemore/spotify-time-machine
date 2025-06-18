import {
	getCachedData,
	getCachedDataCompressed,
	setCachedData,
	setCachedDataCompressed,
} from '@/lib/cacheUtils';
import { SpotifyApiError } from '@/lib/spotify';
import {
	InternalTimeRange,
	SpotifyTimeRange,
	mapToInternalTimeRange,
} from '@/lib/timeRanges';
import { useCallback, useEffect, useState } from 'react';
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

// Compact track representation for trends (minimal data)
export interface CompactTrack {
	id: string;
	added_at: string;
	artist_ids: string[];
}

// Efficient normalized storage structures
interface NormalizedTrack {
	id: string;
	added_at: string;
	name: string;
	album_id: string;
	artist_ids: string[];
	duration_ms: number;
	preview_url: string | null;
}

interface AlbumData {
	id: string;
	name: string;
	images: Array<{
		url: string;
		height?: number;
		width?: number;
	}>;
}

interface ArtistData {
	id: string;
	name: string;
}

interface NormalizedCache {
	tracks: NormalizedTrack[];
	albums: Record<string, AlbumData>;
	artists: Record<string, ArtistData>;
	lastUpdated: number;
}

// Time ranges supported
export type TimeRange = InternalTimeRange | SpotifyTimeRange;

// More efficient cache keys - single normalized cache per time range
const CACHE_KEYS = {
	PAST_YEAR: 'normalizedTracks_pastYear',
	PAST_TWO_YEARS: 'normalizedTracks_pastTwoYears',
	ALL_TIME: 'normalizedTracks_allTime',
};

// Cache TTL (24 hours in milliseconds)
const CACHE_TTL = 24 * 60 * 60 * 1000;

// Maximum cache size (in number of tracks) - increased since data is more compact
const MAX_CACHE_SIZE = 25000;

// In-memory normalized cache for each time range
const normalizedCache: Record<InternalTimeRange, NormalizedCache | null> = {
	PAST_YEAR: null,
	PAST_TWO_YEARS: null,
	ALL_TIME: null,
};

// For deduplicating fetch requests
const ongoingFetches = {
	PAST_YEAR: null as Promise<NormalizedCache> | null,
	PAST_TWO_YEARS: null as Promise<NormalizedCache> | null,
	ALL_TIME: null as Promise<NormalizedCache> | null,
};

// Helper to convert SavedTrack to normalized format
const normalizeTrack = (track: SavedTrack): NormalizedTrack => {
	// Generate album ID from album name (simple hash alternative)
	const albumId = track.track.album.name.toLowerCase().replace(/\s+/g, '_');

	return {
		id: track.track.id,
		added_at: track.added_at,
		name: track.track.name,
		album_id: albumId,
		artist_ids: track.track.artists.map((a) => a.id),
		duration_ms: track.track.duration_ms,
		preview_url: track.track.preview_url,
	};
};

// Helper to extract album data
const extractAlbumData = (track: SavedTrack): AlbumData => {
	const albumId = track.track.album.name.toLowerCase().replace(/\s+/g, '_');
	return {
		id: albumId,
		name: track.track.album.name,
		images: track.track.album.images,
	};
};

// Helper to extract artist data
const extractArtistData = (artist: {
	id: string;
	name: string;
}): ArtistData => ({
	id: artist.id,
	name: artist.name,
});

// Helper to convert normalized data back to SavedTrack format
const denormalizeTrack = (
	track: NormalizedTrack,
	albums: Record<string, AlbumData>,
	artists: Record<string, ArtistData>
): SavedTrack => ({
	added_at: track.added_at,
	track: {
		id: track.id,
		name: track.name,
		album: albums[track.album_id] || {
			name: 'Unknown Album',
			images: [],
		},
		artists: track.artist_ids.map(
			(id) => artists[id] || { id, name: 'Unknown Artist' }
		),
		duration_ms: track.duration_ms,
		preview_url: track.preview_url,
	},
});

// Helper to convert to compact format
const toCompactTrack = (track: NormalizedTrack): CompactTrack => ({
	id: track.id,
	added_at: track.added_at,
	artist_ids: track.artist_ids,
});

// Helper to map any TimeRange to InternalTimeRange
const toInternalRange = (range: TimeRange): InternalTimeRange => {
	if (['PAST_YEAR', 'PAST_TWO_YEARS', 'ALL_TIME'].includes(range)) {
		return range as InternalTimeRange;
	}
	return mapToInternalTimeRange(range as SpotifyTimeRange);
};

// Helper to check cache size and cleanup if needed
const checkAndCleanupCache = (range: TimeRange) => {
	const internalRange = toInternalRange(range);
	const cacheKey = CACHE_KEYS[internalRange];
	const cache = normalizedCache[internalRange];

	if (cache && cache.tracks.length > MAX_CACHE_SIZE) {
		// Keep only the most recent tracks
		const trimmedTracks = cache.tracks
			.sort(
				(a, b) =>
					new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
			)
			.slice(0, MAX_CACHE_SIZE);

		// Remove unused albums and artists
		const usedAlbumIds = new Set(trimmedTracks.map((t) => t.album_id));
		const usedArtistIds = new Set(trimmedTracks.flatMap((t) => t.artist_ids));

		const trimmedAlbums: Record<string, AlbumData> = {};
		const trimmedArtists: Record<string, ArtistData> = {};

		Object.entries(cache.albums).forEach(([id, album]) => {
			if (usedAlbumIds.has(id)) {
				trimmedAlbums[id] = album;
			}
		});

		Object.entries(cache.artists).forEach(([id, artist]) => {
			if (usedArtistIds.has(id)) {
				trimmedArtists[id] = artist;
			}
		});

		const trimmedCache: NormalizedCache = {
			tracks: trimmedTracks,
			albums: trimmedAlbums,
			artists: trimmedArtists,
			lastUpdated: cache.lastUpdated,
		};

		normalizedCache[internalRange] = trimmedCache;
		setCachedDataCompressed(cacheKey, trimmedCache, CACHE_TTL);

		console.log(
			`Cache cleaned up for ${range}: ${trimmedTracks.length} tracks, ${Object.keys(trimmedAlbums).length} albums, ${Object.keys(trimmedArtists).length} artists`
		);
	}
};

export function useLikedTracks() {
	const { spotifyApi, isReady } = useSpotify();
	const [tracks, setTracks] = useState<SavedTrack[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadingState, setLoadingState] = useState<
		Record<InternalTimeRange, boolean>
	>({
		PAST_YEAR: true,
		PAST_TWO_YEARS: true,
		ALL_TIME: true,
	});
	const [error, setError] = useState<string | null>(null);
	const [currentTimeRange, setCurrentTimeRange] =
		useState<TimeRange>('PAST_YEAR');

	// Helper function to get cutoff date for a time range
	const getCutoffDate = useCallback((range: TimeRange) => {
		const now = new Date();
		const cutoffDate = new Date();

		switch (range) {
			case 'PAST_YEAR':
				cutoffDate.setFullYear(now.getFullYear() - 1);
				break;
			case 'PAST_TWO_YEARS':
				cutoffDate.setFullYear(now.getFullYear() - 2);
				break;
			case 'ALL_TIME':
				return new Date(0); // Beginning of time
		}
		return cutoffDate;
	}, []);

	// Fetch tracks for a specific time range
	const fetchTracksForRange = useCallback(
		async (range: TimeRange): Promise<SavedTrack[]> => {
			if (!isReady) return [];

			const internalRange = toInternalRange(range);

			// Check in-memory cache first
			if (normalizedCache[internalRange]) {
				console.log(`Using in-memory normalized cache for ${range}`);
				const cache = normalizedCache[internalRange]!;
				return cache.tracks.map((track) =>
					denormalizeTrack(track, cache.albums, cache.artists)
				);
			}

			// Then check persistent cache
			const cacheKey = CACHE_KEYS[internalRange];
			const cachedData = getCachedDataCompressed<NormalizedCache>(cacheKey);

			if (cachedData) {
				console.log(`Using persistent normalized cache for ${range}`);
				normalizedCache[internalRange] = cachedData;
				return cachedData.tracks.map((track) =>
					denormalizeTrack(track, cachedData.albums, cachedData.artists)
				);
			}

			// Check if fetch is already in progress
			if (ongoingFetches[internalRange]) {
				console.log(`Waiting for ongoing fetch for ${range}`);
				const cache = await ongoingFetches[internalRange]!;
				return cache.tracks.map((track) =>
					denormalizeTrack(track, cache.albums, cache.artists)
				);
			}

			// Prepare to fetch from API
			const cutoffDate = getCutoffDate(range);
			console.log(`Fetching ${range} tracks from API`);

			const fetchPromise = (async (): Promise<NormalizedCache> => {
				try {
					const limit = 50;
					let offset = 0;
					let allTracks: SavedTrack[] = [];
					let total = 0;
					let fetchedItemsCount = 0;
					let reachedCutoff = false;

					do {
						const response = await spotifyApi.getMySavedTracks({
							limit,
							offset,
						});
						const newTracks = response.body.items as SavedTrack[];
						fetchedItemsCount = newTracks.length;

						// Check if we've reached the time cutoff
						if (range !== 'ALL_TIME' && fetchedItemsCount > 0) {
							const oldestTrackDate = new Date(
								newTracks[fetchedItemsCount - 1].added_at
							);
							if (oldestTrackDate < cutoffDate) {
								reachedCutoff = true;

								// Filter out tracks older than cutoff
								const filteredTracks = newTracks.filter(
									(track) => new Date(track.added_at) >= cutoffDate
								);
								allTracks = [...allTracks, ...filteredTracks];
								break;
							}
						}

						allTracks = [...allTracks, ...newTracks];
						total = response.body.total;
						offset += limit;
					} while (offset < total && fetchedItemsCount > 0 && !reachedCutoff);

					// Normalize the data
					const normalizedTracks: NormalizedTrack[] = [];
					const albums: Record<string, AlbumData> = {};
					const artists: Record<string, ArtistData> = {};

					allTracks.forEach((track) => {
						// Add normalized track
						normalizedTracks.push(normalizeTrack(track));

						// Add album data
						const albumData = extractAlbumData(track);
						albums[albumData.id] = albumData;

						// Add artist data
						track.track.artists.forEach((artist) => {
							const artistData = extractArtistData(artist);
							artists[artistData.id] = artistData;
						});
					});

					const normalizedCacheData: NormalizedCache = {
						tracks: normalizedTracks,
						albums,
						artists,
						lastUpdated: Date.now(),
					};

					// Cache the normalized results
					normalizedCache[internalRange] = normalizedCacheData;
					setCachedDataCompressed(cacheKey, normalizedCacheData, CACHE_TTL);

					console.log(
						`Cached ${normalizedTracks.length} normalized tracks for ${range} (${Object.keys(albums).length} albums, ${Object.keys(artists).length} artists)`
					);

					// After fetching, check and cleanup cache
					checkAndCleanupCache(range);

					return normalizedCacheData;
				} catch (err) {
					console.error(`Error fetching tracks for ${range}:`, err);
					throw err;
				} finally {
					ongoingFetches[internalRange] = null;
				}
			})();

			ongoingFetches[internalRange] = fetchPromise;
			const cache = await fetchPromise;
			return cache.tracks.map((track) =>
				denormalizeTrack(track, cache.albums, cache.artists)
			);
		},
		[isReady, spotifyApi, getCutoffDate]
	);

	// Get compact tracks for trends (now more efficient)
	const getCompactTracks = useCallback((range: TimeRange): CompactTrack[] => {
		const internalRange = toInternalRange(range);
		const cache = normalizedCache[internalRange];

		if (cache) {
			return cache.tracks.map(toCompactTrack);
		}

		// Try to get from persistent cache
		const cacheKey = CACHE_KEYS[internalRange];
		const cachedData = getCachedDataCompressed<NormalizedCache>(cacheKey);

		if (cachedData) {
			normalizedCache[internalRange] = cachedData;
			return cachedData.tracks.map(toCompactTrack);
		}

		return [];
	}, []);

	// Load tracks for current time range and start loading other ranges in the background
	useEffect(() => {
		let isMounted = true;

		const loadTrackData = async () => {
			if (!isReady) return;

			try {
				setIsLoading(true);
				setError(null);

				// First, prioritize loading data for current range
				const currentRangeTracks = await fetchTracksForRange(currentTimeRange);

				if (isMounted) {
					setTracks(currentRangeTracks);
					setIsLoading(false);
					setLoadingState((prev) => ({
						...prev,
						[toInternalRange(currentTimeRange)]: false,
					}));
				}

				// Then load other ranges in the background, starting with the closest to current
				if (currentTimeRange === 'PAST_YEAR') {
					// If viewing past year, load past 2 years next, then all time
					fetchTracksForRange('PAST_TWO_YEARS')
						.then(() => {
							if (isMounted)
								setLoadingState((prev) => ({ ...prev, PAST_TWO_YEARS: false }));
							return fetchTracksForRange('ALL_TIME');
						})
						.then(() => {
							if (isMounted)
								setLoadingState((prev) => ({ ...prev, ALL_TIME: false }));
						})
						.catch(console.error);
				} else if (currentTimeRange === 'PAST_TWO_YEARS') {
					// If viewing past 2 years, load past year first (might be faster), then all time
					fetchTracksForRange('PAST_YEAR')
						.then(() => {
							if (isMounted)
								setLoadingState((prev) => ({ ...prev, PAST_YEAR: false }));
							return fetchTracksForRange('ALL_TIME');
						})
						.then(() => {
							if (isMounted)
								setLoadingState((prev) => ({ ...prev, ALL_TIME: false }));
						})
						.catch(console.error);
				} else {
					// If viewing all time, load past year first, then past 2 years
					fetchTracksForRange('PAST_YEAR')
						.then(() => {
							if (isMounted)
								setLoadingState((prev) => ({ ...prev, PAST_YEAR: false }));
							return fetchTracksForRange('PAST_TWO_YEARS');
						})
						.then(() => {
							if (isMounted)
								setLoadingState((prev) => ({ ...prev, PAST_TWO_YEARS: false }));
						})
						.catch(console.error);
				}
			} catch (err) {
				console.error('Error in useLikedTracks:', err);
				if (isMounted) {
					setError('Failed to load your music data. Please try again later.');
					setIsLoading(false);
					setLoadingState({
						PAST_YEAR: false,
						PAST_TWO_YEARS: false,
						ALL_TIME: false,
					});
				}
			}
		};

		loadTrackData();

		return () => {
			isMounted = false;
		};
	}, [isReady, fetchTracksForRange, currentTimeRange]);

	// Handler for changing time range
	const setTimeRange = useCallback((range: TimeRange) => {
		setCurrentTimeRange(range);
		const internalRange = toInternalRange(range);

		// If we already have data for this range, update immediately
		if (normalizedCache[internalRange]) {
			const cache = normalizedCache[internalRange]!;
			const denormalizedTracks = cache.tracks.map((track) =>
				denormalizeTrack(track, cache.albums, cache.artists)
			);
			setTracks(denormalizedTracks);
			setIsLoading(false);
		} else {
			// Otherwise, show loading state
			setIsLoading(true);
		}
	}, []);

	return {
		tracks,
		isLoading,
		isLoadingRange: loadingState,
		error,
		currentTimeRange,
		setTimeRange,
		getTracksForRange: fetchTracksForRange,
		getCompactTracks, // Now more efficient - no separate cache needed
	};
}

// Export function to clear in-memory cache - useful for debugging or cache corruption
export function clearTracksInMemoryCache(): void {
	// Clear in-memory normalized cache
	normalizedCache.PAST_YEAR = null;
	normalizedCache.PAST_TWO_YEARS = null;
	normalizedCache.ALL_TIME = null;

	// Clear ongoing fetches
	ongoingFetches.PAST_YEAR = null;
	ongoingFetches.PAST_TWO_YEARS = null;
	ongoingFetches.ALL_TIME = null;

	console.log('In-memory tracks cache cleared');
}
