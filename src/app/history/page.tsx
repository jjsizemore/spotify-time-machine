'use client';

import ActionButton from '@/components/ActionButton';
import ErrorDisplay from '@/components/ErrorDisplay';
import MonthlyTrackList from '@/components/MonthlyTrackList';
import PageContainer from '@/components/PageContainer';
import TrackItem from '@/components/TrackItem';
import { useLikedTracks } from '@/hooks/useLikedTracks';
import { useSpotify } from '@/hooks/useSpotify';
import {
	MonthlyTracks,
	SavedTrack,
	createPlaylist,
	processAndGroupTracks,
} from '@/lib/spotifyTrackUtils';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';

export default function HistoryPage() {
	const { status } = useSession();
	const { spotifyApi, isReady } = useSpotify();
	const {
		tracks,
		isLoading: isLoadingTracks,
		error: tracksError,
		currentTimeRange,
		setTimeRange,
	} = useLikedTracks();
	const [monthlyTracks, setMonthlyTracks] = useState<MonthlyTracks[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Process tracks into monthly groups whenever tracks change
	useEffect(() => {
		if (tracks.length > 0) {
			const groupedTracks = processAndGroupTracks(tracks);
			setMonthlyTracks(groupedTracks);
			setIsLoading(false);
		} else if (!isLoadingTracks) {
			setIsLoading(false);
		}
	}, [tracks, isLoadingTracks]);

	// Toggle expanded state for a month
	const toggleMonth = (month: string) => {
		setMonthlyTracks((prevMonths) =>
			prevMonths.map((m) =>
				m.month === month ? { ...m, expanded: !m.expanded } : m
			)
		);
	};

	// Create a playlist for a specific month
	const createMonthlyPlaylist = async (month: string, tracks: SavedTrack[]) => {
		if (!isReady) {
			alert('Cannot create playlist. Spotify API is not ready.');
			return;
		}

		try {
			// First create a new playlist
			const formattedDate = format(new Date(month), 'MMMM yyyy');
			const playlistName = `${formattedDate} Time Machine`;
			const description = `Songs I liked during ${formattedDate}. Created with Jermaine's Spotify Time Machine.`;
			const trackUris = tracks.map((t) => `spotify:track:${t.track.id}`);

			await createPlaylist(spotifyApi, playlistName, description, trackUris);

			alert(`Playlist "${playlistName}" created successfully!`);
		} catch (err) {
			console.error('Error creating playlist:', err);
			alert('Failed to create playlist. Please try again later.');
		}
	};

	// Render a track item
	const renderTrackItem = (track: SavedTrack) => {
		return (
			<TrackItem
				key={track.track.id}
				track={track.track}
				addedAt={track.added_at}
				showAddedDate={true}
			/>
		);
	};

	if (error || tracksError) {
		return (
			<PageContainer>
				<ErrorDisplay
					message={
						error || tracksError || 'Failed to load your listening history'
					}
					retry={() => window.location.reload()}
				/>
			</PageContainer>
		);
	}

	return (
		<PageContainer
			title="Your Monthly Listening History"
			isLoading={status === 'loading' || isLoading || isLoadingTracks}
			maxWidth="6xl"
		>
			{/* Time range selector */}
			<div className="flex justify-end mb-6 space-x-2 text-sm">
				<button
					onClick={() => setTimeRange('PAST_YEAR')}
					className={`px-3 py-1 rounded-full ${
						currentTimeRange === 'PAST_YEAR'
							? 'bg-spotify-green text-black'
							: 'bg-spotify-light-black text-spotify-light-gray'
					}`}
				>
					Past Year
				</button>
				<button
					onClick={() => setTimeRange('PAST_TWO_YEARS')}
					className={`px-3 py-1 rounded-full ${
						currentTimeRange === 'PAST_TWO_YEARS'
							? 'bg-spotify-green text-black'
							: 'bg-spotify-light-black text-spotify-light-gray'
					}`}
				>
					Past 2 Years
				</button>
				<button
					onClick={() => setTimeRange('ALL_TIME')}
					className={`px-3 py-1 rounded-full ${
						currentTimeRange === 'ALL_TIME'
							? 'bg-spotify-green text-black'
							: 'bg-spotify-light-black text-spotify-light-gray'
					}`}
				>
					All Time
				</button>
			</div>

			{/* Timeline */}
			<div className="space-y-6">
				{monthlyTracks.map((month) => (
					<MonthlyTrackList
						key={month.month}
						month={month.month}
						tracks={month.tracks}
						expanded={month.expanded}
						onToggle={toggleMonth}
						onCreatePlaylist={createMonthlyPlaylist}
						renderTrackItem={renderTrackItem}
					/>
				))}
			</div>

			{/* Loading indicator */}
			{isLoadingTracks && (
				<div className="mt-8 text-center text-spotify-light-gray">
					Loading your listening history...
				</div>
			)}
		</PageContainer>
	);
}
