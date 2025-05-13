import { getCachedData, setCachedData } from '@/lib/cacheUtils';
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
	// Additional artist properties as needed
}

// Global artists cache - shared across all hook instances
const artistsCache = new Map<string, ArtistDetail>();

// Single cache key for artist data
const ARTISTS_CACHE_KEY = 'likedArtists_details';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Track which artists we've already fetched details for
const processedArtistIds = new Set<string>();

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
					if (cachedArtistData) {
						// Restore cache from structured object
						Object.entries(cachedArtistData).forEach(([id, artist]) => {
							artistsCache.set(id, artist);
							processedArtistIds.add(id);
						});
						console.log(`Restored ${artistsCache.size} artists from cache`);
					}
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

					// Add to cache and mark as processed
					response.body.artists.forEach((artist: ArtistDetail) => {
						artistsCache.set(artist.id, artist);
						processedArtistIds.add(artist.id);
					});
				}

				// Update the persistent cache
				const artistsObject = Object.fromEntries(artistsCache);
				setCachedData(ARTISTS_CACHE_KEY, artistsObject, CACHE_TTL);
				console.log(`Updated cache with ${artistsCache.size} total artists`);

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
	};
}
