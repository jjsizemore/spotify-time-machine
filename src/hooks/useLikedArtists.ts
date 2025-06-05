import { getCachedData, setCachedData } from '@/lib/cacheUtils';
import { SpotifyApiError } from '@/lib/spotify';
import { useCallback, useEffect, useState } from 'react';
import { SavedTrack, TimeRange, useLikedTracks } from './useLikedTracks';
import { useSpotify } from './useSpotify';

// Interface for cached artist data
export interface ArtistDetail {
	id: string;
	name: string;
	genres: string[];
	popularity: number;
	images: Array<{
		url: string;
		height?: number;
		width?: number;
	}>;
}

// Compact artist representation for genre trends
export interface CompactArtist {
	id: string;
	name: string;
	genres: string[];
}

// Maximum cache size for artists
const MAX_ARTISTS_CACHE_SIZE = 1500;

// Global artists cache - shared across all hook instances
const artistsCache = new Map<string, ArtistDetail>();
const compactArtistsCache = new Map<string, CompactArtist>();

// Cache keys
const ARTISTS_CACHE_KEY = 'likedArtists_details';
const COMPACT_ARTISTS_CACHE_KEY = 'likedArtists_compact';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 3 days

// Track which artists we've already fetched details for
const processedArtistIds = new Set<string>();

// Helper to convert to compact format
const toCompactArtist = (artist: ArtistDetail): CompactArtist => ({
	id: artist.id,
	name: artist.name,
	genres: artist.genres,
});

// Helper to check and cleanup cache
const checkAndCleanupCache = () => {
	if (artistsCache.size > MAX_ARTISTS_CACHE_SIZE) {
		console.log(
			`Cleaning up artist cache (${artistsCache.size} > ${MAX_ARTISTS_CACHE_SIZE})`
		);

		// Keep only the most recently added artists
		const entries = Array.from(artistsCache.entries());
		const trimmedEntries = entries.slice(-MAX_ARTISTS_CACHE_SIZE);

		// Clear and rebuild caches
		artistsCache.clear();
		compactArtistsCache.clear();
		processedArtistIds.clear();

		trimmedEntries.forEach(([id, artist]) => {
			artistsCache.set(id, artist);
			compactArtistsCache.set(id, toCompactArtist(artist));
			processedArtistIds.add(id);
		});

		// Update persistent caches
		const artistsObject = Object.fromEntries(artistsCache);
		const compactArtistsObject = Object.fromEntries(compactArtistsCache);
		setCachedData(ARTISTS_CACHE_KEY, artistsObject, CACHE_TTL);
		setCachedData(COMPACT_ARTISTS_CACHE_KEY, compactArtistsObject, CACHE_TTL);

		console.log(`Cache cleaned up. Now contains ${artistsCache.size} artists`);
	}
};

export function useLikedArtists() {
	// Leverage the base tracks hook - with progressive loading
	const {
		tracks,
		isLoading,
		isLoadingRange,
		error,
		currentTimeRange,
		setTimeRange,
		getTracksForRange,
	} = useLikedTracks();

	// Additional state for artist details
	const [artistsDetails, setArtistsDetails] = useState<
		Map<string, ArtistDetail>
	>(new Map());
	const [isLoadingArtists, setIsLoadingArtists] = useState(false);
	const { spotifyApi, isReady } = useSpotify();

	// Fetch artist details for a specific set of tracks
	const fetchArtistDetailsForTracks = useCallback(
		async (
			tracksToProcess: SavedTrack[]
		): Promise<Map<string, ArtistDetail>> => {
			if (!isReady || tracksToProcess.length === 0) {
				return new Map(artistsCache);
			}

			setIsLoadingArtists(true);

			try {
				// Check if we have cached artist data
				if (artistsCache.size === 0) {
					const cachedArtistData =
						getCachedData<Record<string, ArtistDetail>>(ARTISTS_CACHE_KEY);
					const cachedCompactData = getCachedData<
						Record<string, CompactArtist>
					>(COMPACT_ARTISTS_CACHE_KEY);

					if (cachedArtistData) {
						// Restore full cache
						Object.entries(cachedArtistData).forEach(([id, artist]) => {
							artistsCache.set(id, artist);
							processedArtistIds.add(id);
						});
					}

					if (cachedCompactData) {
						// Restore compact cache
						Object.entries(cachedCompactData).forEach(([id, artist]) => {
							compactArtistsCache.set(id, artist);
						});
					}

					console.log(`Restored ${artistsCache.size} artists from cache`);

					// Clean up cache after restoration if needed
					checkAndCleanupCache();
				}

				// Collect artist IDs from these tracks that we haven't processed yet
				const artistIds = new Set<string>();
				tracksToProcess.forEach((item) => {
					item.track.artists.forEach((artist) => {
						if (!processedArtistIds.has(artist.id)) {
							artistIds.add(artist.id);
						}
					});
				});

				// Skip API call if all needed artists are already cached
				if (artistIds.size === 0) {
					console.log('All required artists already in cache');
					setIsLoadingArtists(false);
					return new Map(artistsCache);
				}

				console.log(`Fetching details for ${artistIds.size} new artists`);

				// Fetch artists details in batches (Spotify API limits to 50 per request)
				const batchSize = 50;
				const artistIdArray = Array.from(artistIds);

				for (let i = 0; i < artistIdArray.length; i += batchSize) {
					const batch = artistIdArray.slice(i, i + batchSize);

					const response = await spotifyApi.getArtists(batch);

					// Add to both caches and mark as processed
					response.body.artists.forEach((artist: ArtistDetail) => {
						artistsCache.set(artist.id, artist);
						compactArtistsCache.set(artist.id, toCompactArtist(artist));
						processedArtistIds.add(artist.id);
					});
				}

				// Check and cleanup cache after fetching new artists
				checkAndCleanupCache();

				return new Map(artistsCache);
			} catch (err) {
				console.error('Error fetching artists details:', err);
				return new Map(artistsCache);
			} finally {
				setIsLoadingArtists(false);
			}
		},
		[isReady, spotifyApi]
	);

	// Get compact artists for genre trends
	const getCompactArtists = useCallback((): Map<string, CompactArtist> => {
		return new Map(compactArtistsCache);
	}, []);

	// Progressive loading effect - process artists as tracks become available
	useEffect(() => {
		let isMounted = true;

		// Process available tracks immediately
		const processCurrentTracks = async () => {
			if (tracks.length === 0 || !isReady) return;

			try {
				const updatedArtistDetails = await fetchArtistDetailsForTracks(tracks);

				if (isMounted) {
					setArtistsDetails(updatedArtistDetails);
				}
			} catch (err) {
				console.error('Error processing current tracks:', err);
			}
		};

		processCurrentTracks();

		// Function to fetch and process artists for additional time ranges in the background
		const loadArtistsForAdditionalRanges = async () => {
			if (!isReady) return;

			try {
				// Process past year if we're not currently on it
				if (
					currentTimeRange !== 'PAST_YEAR' &&
					isLoadingRange.PAST_YEAR === false
				) {
					const pastYearTracks = await getTracksForRange('PAST_YEAR');
					if (isMounted) {
						await fetchArtistDetailsForTracks(pastYearTracks);
					}
				}

				// Process past two years if we're not currently on it
				if (
					currentTimeRange !== 'PAST_TWO_YEARS' &&
					isLoadingRange.PAST_TWO_YEARS === false
				) {
					const pastTwoYearsTracks = await getTracksForRange('PAST_TWO_YEARS');
					if (isMounted) {
						await fetchArtistDetailsForTracks(pastTwoYearsTracks);
					}
				}

				// Process all time if we're not currently on it
				if (
					currentTimeRange !== 'ALL_TIME' &&
					isLoadingRange.ALL_TIME === false
				) {
					const allTimeTracks = await getTracksForRange('ALL_TIME');
					if (isMounted) {
						await fetchArtistDetailsForTracks(allTimeTracks);
					}
				}
			} catch (err) {
				console.error('Error loading additional artist ranges:', err);
			}
		};

		// Start background loading after a delay
		const backgroundLoadTimeout = setTimeout(
			loadArtistsForAdditionalRanges,
			2000
		);

		return () => {
			isMounted = false;
			clearTimeout(backgroundLoadTimeout);
		};
	}, [
		isReady,
		tracks,
		fetchArtistDetailsForTracks,
		getTracksForRange,
		currentTimeRange,
		isLoadingRange,
	]);

	return {
		tracks,
		isLoading,
		isLoadingArtists,
		error,
		artistsDetails,
		currentTimeRange,
		setTimeRange,
		isLoadingRange,
		getCompactArtists,
	};
}
