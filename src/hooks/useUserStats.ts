import { SpotifyApiError } from '@/lib/spotify';
import { SpotifyTimeRange } from '@/lib/timeRanges';
import { useCallback, useEffect, useState } from 'react';
import { useSpotify } from './useSpotify';

export type TimeRange = SpotifyTimeRange;

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

			// Fetch data in parallel with proper error handling
			const [topArtistsRes, topTracksRes, recentlyPlayedRes] =
				await Promise.allSettled([
					spotifyApi.getMyTopArtists({ time_range: timeRange, limit: 10 }),
					spotifyApi.getMyTopTracks({ time_range: timeRange, limit: 10 }),
					spotifyApi.getMyRecentlyPlayedTracks({ limit: 20 }),
				]);

			// Process top artists
			if (topArtistsRes.status === 'fulfilled') {
				const mappedArtists: Artist[] = topArtistsRes.value.body.items.map(
					(artist: any) => ({
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
					})
				);
				setTopArtists(mappedArtists);
			} else {
				console.error('Failed to fetch top artists:', topArtistsRes.reason);
			}

			// Process top tracks
			if (topTracksRes.status === 'fulfilled') {
				const mappedTracks: Track[] = topTracksRes.value.body.items.map(
					(track: any) => ({
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
					})
				);
				setTopTracks(mappedTracks);
			} else {
				console.error('Failed to fetch top tracks:', topTracksRes.reason);
			}

			// Process recently played
			if (recentlyPlayedRes.status === 'fulfilled') {
				const mappedRecentlyPlayed: PlayHistory[] =
					recentlyPlayedRes.value.body.items.map((item: any) => ({
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
						},
						played_at: item.played_at,
					}));
				setRecentlyPlayed(mappedRecentlyPlayed);
			} else {
				console.error(
					'Failed to fetch recently played:',
					recentlyPlayedRes.reason
				);
			}

			// Only set error if all requests failed
			const allFailed = [topArtistsRes, topTracksRes, recentlyPlayedRes].every(
				(result) => result.status === 'rejected'
			);

			if (allFailed) {
				const firstError = [
					topArtistsRes,
					topTracksRes,
					recentlyPlayedRes,
				].find((result) => result.status === 'rejected')?.reason;

				if (firstError instanceof SpotifyApiError) {
					if (firstError.status === 401) {
						setError('Authentication expired. Please sign in again.');
					} else if (firstError.status === 403) {
						setError(
							'Access forbidden. Please check your Spotify permissions.'
						);
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

	return {
		topArtists,
		topTracks,
		recentlyPlayed,
		isLoading: isLoading || !isReady, // Consider loading if the API isn't ready
		error: error || spotifyError,
		refresh: handleRefresh,
	};
};
