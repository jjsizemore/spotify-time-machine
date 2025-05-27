'use client';

import ActionButton from '@/components/ActionButton';
import FilterSelector from '@/components/FilterSelector';
import FormField from '@/components/FormField';
import PageContainer from '@/components/PageContainer';
import SharePlaylistButton from '@/components/SharePlaylistButton';
import Toast from '@/components/Toast';
import { useLikedTracks } from '@/hooks/useLikedTracks';
import { useSpotify } from '@/hooks/useSpotify';
import { Artist } from '@/hooks/useUserStats';
import { GenreCount, extractTopGenres } from '@/lib/genreUtils';
import { createPlaylist } from '@/lib/spotifyTrackUtils';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { useSession } from 'next-auth/react';
import Script from 'next/script';
import React, { useState, useEffect } from 'react';
import { generateStructuredData } from './metadata';

export default function PlaylistGeneratorPage() {
	const { status } = useSession();
	const { spotifyApi, isReady } = useSpotify();
	const {
		tracks,
		isLoading: isLoadingTracks,
		error: tracksError,
	} = useLikedTracks();

	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [playlistName, setPlaylistName] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [playlistUrl, setPlaylistUrl] = useState('');
	const [trackCount, setTrackCount] = useState(0);
	const [showToast, setShowToast] = useState(false);

	// Filter-related state
	const [topGenres, setTopGenres] = useState<GenreCount[]>([]);
	const [topArtists, setTopArtists] = useState<Artist[]>([]);
	const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
	const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
	const [loadingFilters, setLoadingFilters] = useState(false);
	const [artistCache, setArtistCache] = useState<Record<string, Artist>>({});

	// Fetch user's top artists and extract genres when the component mounts
	useEffect(() => {
		const fetchTopArtistsAndGenres = async () => {
			if (!isReady) return;

			try {
				setLoadingFilters(true);

				// Fetch user's top artists
				const response = await spotifyApi.getMyTopArtists({ limit: 50 });
				const artists = response.body.items.map((artist) => ({
					id: artist.id,
					name: artist.name,
					images: artist.images.map((img) => ({
						url: img.url,
						height: img.height || 0,
						width: img.width || 0,
					})),
					genres: artist.genres,
					popularity: artist.popularity,
					external_urls: artist.external_urls,
				}));
				setTopArtists(artists);

				// Cache artist data
				const artistCacheMap = artists.reduce(
					(acc, artist) => {
						acc[artist.id] = artist;
						return acc;
					},
					{} as Record<string, Artist>
				);
				setArtistCache(artistCacheMap);

				// Extract genres from top artists
				const genres = extractTopGenres(artists, 20);
				setTopGenres(genres);
			} catch (err) {
				console.error('Error fetching artist/genre data:', err);
			} finally {
				setLoadingFilters(false);
			}
		};

		if (isReady) {
			fetchTopArtistsAndGenres();
		}
	}, [isReady]);

	// Handle genre selection
	const toggleGenre = (genre: string) => {
		setSelectedGenres((prev) =>
			prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
		);
	};

	// Handle artist selection
	const toggleArtist = (artistId: string) => {
		setSelectedArtists((prev) =>
			prev.includes(artistId)
				? prev.filter((id) => id !== artistId)
				: [...prev, artistId]
		);
	};

	// Generate the custom playlist
	const generatePlaylist = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!startDate || !endDate || !playlistName.trim()) {
			setError('Please fill in all required fields');
			return;
		}

		if (!isReady) {
			setError('Spotify API is not ready. Please try again.');
			return;
		}

		if (tracksError) {
			setError('Failed to load your liked tracks. Please try again.');
			return;
		}

		try {
			setIsLoading(true);
			setError(null);
			setSuccess(false);

			// Filter tracks by date range
			const parsedStartDate = parseISO(startDate);
			const parsedEndDate = parseISO(endDate);

			let filteredTracks = tracks.filter((track) => {
				const trackDate = new Date(track.added_at);
				return (
					isAfter(trackDate, parsedStartDate) &&
					isBefore(trackDate, parsedEndDate)
				);
			});

			// Apply genre filters if any are selected
			if (selectedGenres.length > 0) {
				// Get unique artist IDs from filtered tracks
				const artistIds = [
					...new Set(
						filteredTracks.flatMap((track) =>
							track.track.artists.map((artist) => artist.id)
						)
					),
				];

				// Find artists not in cache
				const uncachedArtistIds = artistIds.filter((id) => !artistCache[id]);

				// Fetch uncached artists in batches of 50 (Spotify API limit)
				if (uncachedArtistIds.length > 0) {
					const batchSize = 50;
					for (let i = 0; i < uncachedArtistIds.length; i += batchSize) {
						const batch = uncachedArtistIds.slice(i, i + batchSize);
						try {
							const artistsResponse = await spotifyApi.getArtists(batch);
							const newArtists = artistsResponse.body.artists.map((artist) => ({
								id: artist.id,
								name: artist.name,
								images: artist.images.map((img) => ({
									url: img.url,
									height: img.height || 0,
									width: img.width || 0,
								})),
								genres: artist.genres,
								popularity: artist.popularity,
								external_urls: artist.external_urls,
							}));

							// Update cache with new artists
							setArtistCache((prev) => ({
								...prev,
								...newArtists.reduce(
									(acc, artist) => {
										acc[artist.id] = artist;
										return acc;
									},
									{} as Record<string, Artist>
								),
							}));
						} catch (error) {
							console.error('Error fetching artist batch:', error);
						}
					}
				}

				// Filter tracks by genre using cached artist data
				filteredTracks = filteredTracks.filter((track) => {
					const trackArtists = track.track.artists.map(
						(artist) => artistCache[artist.id]
					);
					const trackGenres = trackArtists.flatMap(
						(artist) => artist?.genres || []
					);
					return selectedGenres.some((genre) => trackGenres.includes(genre));
				});
			}

			// Apply artist filters if any are selected
			if (selectedArtists.length > 0) {
				filteredTracks = filteredTracks.filter((track) => {
					return track.track.artists.some((artist) =>
						selectedArtists.includes(artist.id)
					);
				});
			}

			if (filteredTracks.length === 0) {
				setError('No tracks found with the selected filters and date range');
				setIsLoading(false);
				return;
			}

			setTrackCount(filteredTracks.length);

			// Create a new playlist
			const dateRangeText = `${format(parsedStartDate, 'MMM d, yyyy')} - ${format(parsedEndDate, 'MMM d, yyyy')}`;
			const description = `Custom playlist for ${dateRangeText}. Created with Jermaine's Spotify Time Machine.`;
			const trackUris = filteredTracks.map(
				(track) => `spotify:track:${track.track.id}`
			);

			const playlistUrl = await createPlaylist(
				spotifyApi,
				playlistName,
				description,
				trackUris
			);

			setSuccess(true);
			setPlaylistUrl(playlistUrl);
			setShowToast(true);
			setTimeout(() => setShowToast(false), 3000);
		} catch (err) {
			console.error('Error generating playlist:', err);
			setError('Failed to generate playlist. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	// Add keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Only apply shortcuts when in the playlist generator form
			if (!document.querySelector('#playlist-generator-form')) return;

			// Submit form with Ctrl+Enter or Cmd+Enter
			if (
				(e.ctrlKey || e.metaKey) &&
				e.key === 'Enter' &&
				!isLoading &&
				!success
			) {
				e.preventDefault();
				const form = document.querySelector(
					'#playlist-generator-form'
				) as HTMLFormElement;
				if (form) {
					form.requestSubmit();
				}
			}

			// Reset form with Escape
			if (e.key === 'Escape' && success) {
				e.preventDefault();
				setSuccess(false);
				setPlaylistName('');
				setStartDate('');
				setEndDate('');
				setSelectedGenres([]);
				setSelectedArtists([]);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isLoading, success]);

	return (
		<PageContainer
			title="Custom Playlist Generator"
			description="Create a playlist from your liked songs within a specific date range."
			isLoading={status === 'loading' || isLoadingTracks}
			maxWidth="3xl"
		>
			{/* Structured Data */}
			<Script
				id="structured-data"
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(generateStructuredData()),
				}}
			/>

			<main className="bg-spotify-dark-gray rounded-lg p-4 md:p-6" role="main">
				{showToast && (
					<Toast
						message={`Playlist "${playlistName}" has been created in your Spotify library!`}
						onDismiss={() => setShowToast(false)}
						type="success"
					/>
				)}
				{!success ? (
					<form
						id="playlist-generator-form"
						onSubmit={generatePlaylist}
						className="space-y-4 md:space-y-6"
						aria-label="Playlist generator form"
					>
						<FormField
							id="playlistName"
							label="Playlist Name"
							type="text"
							value={playlistName}
							onChange={(e) => setPlaylistName(e.target.value)}
							required
							placeholder="Enter playlist name"
						/>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								id="startDate"
								label="Start Date"
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								required
							/>

							<FormField
								id="endDate"
								label="End Date"
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								required
							/>
						</div>

						<section aria-label="Filter options" className="space-y-4">
							<h2 className="text-lg font-semibold text-spotify-light-gray">
								Filter Options
							</h2>

							<div className="bg-spotify-black/50 p-4 rounded-md text-sm text-spotify-light-gray">
								<p className="mb-2">
									<strong>How filtering works:</strong>
								</p>
								<ul className="list-disc list-inside space-y-1">
									<li>
										When you select multiple filter types (genres AND artists
										AND dates), tracks must match at least one criterion from
										each selected filter type
									</li>
									<li>
										Due to Spotify API limitations, genre filtering is based on
										artist genres rather than individual track genres
									</li>
									<li>
										A track will be included if any of its artists match any of
										the selected genres
									</li>
									<li>
										Some tracks may be included even if they don't perfectly
										match your genre preferences
									</li>
									<li>
										Some tracks may be excluded if their artists' genres don't
										match exactly
									</li>
								</ul>
							</div>

							<FilterSelector
								title="Genres"
								items={topGenres}
								selectedItems={selectedGenres}
								getItemId={(genre) => genre.name}
								getItemName={(genre) => genre.name}
								onToggleItem={toggleGenre}
								isLoading={loadingFilters}
								emptyMessage="No genres found"
							/>

							<FilterSelector
								title="Artists"
								items={topArtists}
								selectedItems={selectedArtists}
								getItemId={(artist) => artist.id}
								getItemName={(artist) => artist.name}
								onToggleItem={toggleArtist}
								isLoading={loadingFilters}
								emptyMessage="No artists found"
								maxItems={20}
							/>
						</section>

						{error && (
							<Toast
								message={error}
								onDismiss={() => setError(null)}
								type="error"
							/>
						)}

						<ActionButton type="submit" disabled={isLoading} className="w-full">
							{isLoading ? 'Generating...' : 'Generate Playlist'}
						</ActionButton>
					</form>
				) : (
					<article
						className="text-center space-y-4"
						aria-label="Success message"
					>
						<Toast
							message={`Playlist "${playlistName}" has been created with ${trackCount} tracks.`}
							onDismiss={() => setSuccess(false)}
							type="success"
						/>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<SharePlaylistButton
								playlistUrl={playlistUrl}
								playlistName={playlistName}
							/>
							<ActionButton
								onClick={() => {
									setSuccess(false);
									setPlaylistName('');
									setStartDate('');
									setEndDate('');
									setSelectedGenres([]);
									setSelectedArtists([]);
								}}
								variant="secondary"
							>
								Create Another Playlist
							</ActionButton>
						</div>
					</article>
				)}
			</main>
		</PageContainer>
	);
}
