'use client';

import ActionButton from '@/components/ActionButton';
import DataFetcherAndControlsWrapper from '@/components/DataFetcherAndControlsWrapper';
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
		isLoading: isLoadingTracksFromHook,
		error: tracksError,
		currentTimeRange,
		setTimeRange,
		isLoadingRange,
	} = useLikedTracks();
	const [monthlyTracks, setMonthlyTracks] = useState<MonthlyTracks[]>([]);
	const [isProcessingMonthlyTracks, setIsProcessingMonthlyTracks] =
		useState(true);

	// Process tracks into monthly groups whenever tracks change
	useEffect(() => {
		if (tracks.length > 0) {
			setIsProcessingMonthlyTracks(true);
			const groupedTracks = processAndGroupTracks(tracks);
			setMonthlyTracks(groupedTracks);
			setIsProcessingMonthlyTracks(false);
		} else if (!isLoadingTracksFromHook) {
			setMonthlyTracks([]);
			setIsProcessingMonthlyTracks(false);
		}
	}, [tracks, isLoadingTracksFromHook]);

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

	// Combined loading state for the wrapper
	const isOverallLoading =
		status === 'loading' || (isLoadingTracksFromHook && tracks.length === 0);
	const isProcessingData = isProcessingMonthlyTracks && !isOverallLoading;

	// Determine if the page is empty
	const isEmpty =
		!isOverallLoading &&
		!isProcessingData &&
		!tracksError &&
		monthlyTracks.length === 0;

	if (tracksError) {
		const errorMessage =
			typeof tracksError === 'string'
				? tracksError
				: (tracksError as Error).message;
		return (
			<PageContainer>
				<ErrorDisplay
					message={errorMessage || 'Failed to load your listening history'}
					retry={() => window.location.reload()}
				/>
			</PageContainer>
		);
	}

	return (
		<DataFetcherAndControlsWrapper
			title="Your Monthly Listening History"
			isLoading={isOverallLoading}
			isProcessing={isProcessingData}
			error={
				tracksError
					? typeof tracksError === 'string'
						? new Error(tracksError)
						: tracksError
					: null
			}
			isEmpty={isEmpty}
			emptyDataMessage="No listening history found for the selected period."
			currentTimeRange={currentTimeRange}
			setTimeRange={setTimeRange}
			isLoadingRange={isLoadingRange}
		>
			{/* Display content only if not in initial overall loading and not empty */}
			{!isOverallLoading && !isEmpty && (
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
			)}
			{/* Show a loading text if tracks are still being fetched by the hook but not for the initial load handled by wrapper*/}
			{isLoadingTracksFromHook && tracks.length > 0 && !isOverallLoading && (
				<div className="mt-8 text-center text-spotify-light-gray">
					Updating your listening history...
				</div>
			)}
		</DataFetcherAndControlsWrapper>
	);
}
