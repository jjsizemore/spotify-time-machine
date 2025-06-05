import { getCachedData, setCachedData } from '@/lib/cacheUtils';
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

// Compact track representation for trends
export interface CompactTrack {
	id: string;
	added_at: string;
	artist_ids: string[];
}

// Time ranges supported
export type TimeRange = InternalTimeRange | SpotifyTimeRange;

// Multiple cache keys for progressive loading
const CACHE_KEYS = {
	PAST_YEAR: 'likedTracks_pastYear',
	PAST_TWO_YEARS: 'likedTracks_pastTwoYears',
	ALL_TIME: 'likedTracks_allTime',
	COMPACT_PAST_YEAR: 'compactTracks_pastYear',
	COMPACT_PAST_TWO_YEARS: 'compactTracks_pastTwoYears',
	COMPACT_ALL_TIME: 'compactTracks_allTime',
};

// Cache TTL (24 hours in milliseconds)
const CACHE_TTL = 24 * 60 * 60 * 1000;

// Maximum cache size (in number of tracks)
const MAX_CACHE_SIZE = 15000;

// In-memory cache for each time range
const tracksCache = {
	PAST_YEAR: null as SavedTrack[] | null,
	PAST_TWO_YEARS: null as SavedTrack[] | null,
	ALL_TIME: null as SavedTrack[] | null,
};

// Compact cache for trends
const compactCache = {
	PAST_YEAR: null as CompactTrack[] | null,
	PAST_TWO_YEARS: null as CompactTrack[] | null,
	ALL_TIME: null as CompactTrack[] | null,
};

// For deduplicating fetch requests
const ongoingFetches = {
	PAST_YEAR: null as Promise<SavedTrack[]> | null,
	PAST_TWO_YEARS: null as Promise<SavedTrack[]> | null,
	ALL_TIME: null as Promise<SavedTrack[]> | null,
};

// Helper to convert to compact format
const toCompactTrack = (track: SavedTrack): CompactTrack => ({
	id: track.track.id,
	added_at: track.added_at,
	artist_ids: track.track.artists.map((a) => a.id),
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
	const compactCacheKey = CACHE_KEYS[`COMPACT_${internalRange}`];

	const cachedData = getCachedData<SavedTrack[]>(cacheKey);
	if (cachedData && cachedData.length > MAX_CACHE_SIZE) {
		// Keep only the most recent tracks
		const trimmedData = cachedData.slice(0, MAX_CACHE_SIZE);
		setCachedData(cacheKey, trimmedData, CACHE_TTL);

		// Update compact cache
		const compactData = trimmedData.map(toCompactTrack);
		setCachedData(compactCacheKey, compactData, CACHE_TTL);
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
			if (tracksCache[internalRange]) {
				console.log(`Using in-memory cache for ${range}`);
				return tracksCache[internalRange]!;
			}

			// Then check persistent cache
			const cacheKey = CACHE_KEYS[internalRange];
			const cachedData = getCachedData<SavedTrack[]>(cacheKey);

			if (cachedData) {
				console.log(`Using persistent cache for ${range}`);
				tracksCache[internalRange] = cachedData;

				// Update compact cache
				const compactData = cachedData.map(toCompactTrack);
				compactCache[internalRange] = compactData;
				setCachedData(
					CACHE_KEYS[`COMPACT_${internalRange}`],
					compactData,
					CACHE_TTL
				);

				return cachedData;
			}

			// Check if fetch is already in progress
			if (ongoingFetches[internalRange]) {
				console.log(`Waiting for ongoing fetch for ${range}`);
				return ongoingFetches[internalRange]!;
			}

			// Prepare to fetch from API
			const cutoffDate = getCutoffDate(range);
			console.log(`Fetching ${range} tracks from API`);

			const fetchPromise = (async (): Promise<SavedTrack[]> => {
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

					// Cache the results
					tracksCache[internalRange] = allTracks;
					setCachedData(cacheKey, allTracks, CACHE_TTL);
					console.log(`Cached ${allTracks.length} tracks for ${range}`);

					// After fetching, check and cleanup cache
					checkAndCleanupCache(range);

					return allTracks;
				} catch (err) {
					console.error(`Error fetching tracks for ${range}:`, err);
					throw err;
				} finally {
					ongoingFetches[internalRange] = null;
				}
			})();

			ongoingFetches[internalRange] = fetchPromise;
			return fetchPromise;
		},
		[isReady, spotifyApi, getCutoffDate]
	);

	// Get compact tracks for trends
	const getCompactTracks = useCallback((range: TimeRange): CompactTrack[] => {
		const internalRange = toInternalRange(range);
		if (compactCache[internalRange]) {
			return compactCache[internalRange]!;
		}

		const compactCacheKey = CACHE_KEYS[`COMPACT_${internalRange}`];
		const cachedData = getCachedData<CompactTrack[]>(compactCacheKey);

		if (cachedData) {
			compactCache[internalRange] = cachedData;
			return cachedData;
		}

		// If no compact cache, convert from full tracks
		if (tracksCache[internalRange]) {
			const compactData = tracksCache[internalRange]!.map(toCompactTrack);
			compactCache[internalRange] = compactData;
			setCachedData(compactCacheKey, compactData, CACHE_TTL);
			return compactData;
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
		if (tracksCache[internalRange]) {
			setTracks(tracksCache[internalRange]!);
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
		getCompactTracks, // Expose compact tracks for trends
	};
}
