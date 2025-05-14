'use client';

import ActionButton from '@/components/ActionButton';
import FilterSelector from '@/components/FilterSelector';
import FormField from '@/components/FormField';
import PageContainer from '@/components/PageContainer';
import SharePlaylistButton from '@/components/SharePlaylistButton';
import { useLikedTracks } from '@/hooks/useLikedTracks';
import { useSpotify } from '@/hooks/useSpotify';
import { Artist } from '@/hooks/useUserStats';
import { GenreCount, extractTopGenres } from '@/lib/genreUtils';
import { createPlaylist } from '@/lib/spotifyTrackUtils';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';

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

	// Filter-related state
	const [topGenres, setTopGenres] = useState<GenreCount[]>([]);
	const [topArtists, setTopArtists] = useState<Artist[]>([]);
	const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
	const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
	const [loadingFilters, setLoadingFilters] = useState(false);

	// Fetch user's top artists and extract genres when the component mounts
	useEffect(() => {
		const fetchTopArtistsAndGenres = async () => {
			if (!isReady) return;

			try {
				setLoadingFilters(true);

				// Fetch user's top artists
				const response = await spotifyApi.getMyTopArtists({ limit: 50 });
				const artists = response.body.items as Artist[];
				setTopArtists(artists);

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

			// 3. Apply genre filters if any are selected
			if (selectedGenres.length > 0) {
				// We need to get the full track details to access artist genres
				const trackDetails = await Promise.all(
					filteredTracks.map(async (track) => {
						try {
							const artistIds = track.track.artists.map((artist) => artist.id);
							const artistsResponse = await spotifyApi.getArtists(artistIds);
							return {
								...track,
								artists: artistsResponse.body.artists,
							};
						} catch (error) {
							console.error('Error fetching artist details:', error);
							return null;
						}
					})
				);

				// Filter tracks by genre
				filteredTracks = filteredTracks.filter((_, index) => {
					const trackWithArtists = trackDetails[index];
					if (!trackWithArtists) return false;

					const trackGenres = trackWithArtists.artists.flatMap(
						(artist) => artist.genres || []
					);
					return selectedGenres.some((genre) => trackGenres.includes(genre));
				});
			}

			// 4. Apply artist filters if any are selected
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
			<div className="bg-spotify-dark-gray rounded-lg p-4 md:p-6">
				{!success ? (
					<form
						id="playlist-generator-form"
						onSubmit={generatePlaylist}
						className="space-y-4 md:space-y-6"
					>
						<FormField
							id="playlistName"
							label="Playlist Name"
							type="text"
							value={playlistName}
							onChange={(e) => setPlaylistName(e.target.value)}
							placeholder="My Awesome Playlist"
							required
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

						{/* Genre Filter */}
						<FilterSelector
							title="Filter by Genre (Optional)"
							items={topGenres}
							selectedItems={selectedGenres}
							isLoading={loadingFilters}
							getItemId={(genre) => genre.name}
							getItemName={(genre) => genre.name}
							onToggleItem={toggleGenre}
							emptyMessage="No genres found"
						/>

						{/* Artist Filter */}
						<FilterSelector
							title="Filter by Artist (Optional)"
							items={topArtists}
							selectedItems={selectedArtists}
							isLoading={loadingFilters}
							getItemId={(artist) => artist.id}
							getItemName={(artist) => artist.name}
							onToggleItem={toggleArtist}
							emptyMessage="No artists found"
							maxItems={20}
						/>
						<div className="flex justify-end">
							<ActionButton
								type="submit"
								disabled={isLoading || isLoadingTracks}
								variant="primary"
							>
								{isLoading
									? 'Generating...'
									: isLoadingTracks
										? 'Loading Tracks...'
										: 'Generate Playlist'}
							</ActionButton>
						</div>
					</form>
				) : (
					<div className="text-center space-y-6 py-4">
						<div className="bg-spotify-green/20 border border-spotify-green text-spotify-green p-4 rounded-md">
							<h3 className="font-bold text-xl mb-2">
								Playlist Created Successfully!
							</h3>
							<p>Added {trackCount} tracks from your saved songs.</p>
						</div>

						<div className="flex flex-col md:flex-row items-center justify-center gap-4">
							<ActionButton
								onClick={() => window.open(playlistUrl, '_blank')}
								variant="primary"
							>
								Open Playlist in Spotify
							</ActionButton>
							<SharePlaylistButton
								playlistUrl={playlistUrl}
								playlistName={playlistName}
							/>
						</div>

						<div className="mt-6">
							<ActionButton
								onClick={() => {
									setSuccess(false);
									setPlaylistUrl('');
									setPlaylistName('');
									setTrackCount(0);
								}}
								variant="secondary"
							>
								Generate Another Playlist
							</ActionButton>
						</div>
					</div>
				)}

				{(error || tracksError) && (
					<div className="bg-spotify-red text-spotify-white p-4 rounded-lg mt-4">
						<p>{error || tracksError}</p>
					</div>
				)}
			</div>
		</PageContainer>
	);
}
