import { Track } from '@/hooks/useUserStats';
import React from 'react';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';
import TrackItem from './TrackItem';

interface TopTracksProps {
	tracks: Track[];
	isLoading: boolean;
	error: string | null;
	onRetry?: () => void;
}

export default function TopTracks({
	tracks,
	isLoading,
	error,
	onRetry,
}: TopTracksProps) {
	if (isLoading) {
		return (
			<div className="py-8">
				<LoadingSpinner />
			</div>
		);
	}

	if (error) {
		return <ErrorDisplay message={error} retry={onRetry} />;
	}

	if (tracks.length === 0) {
		return (
			<div className="text-center py-8 text-spotify-medium-gray">
				No top tracks found. Try listening to more music!
			</div>
		);
	}

	// Format milliseconds to minutes:seconds
	const formatDuration = (ms: number) => {
		const minutes = Math.floor(ms / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	};

	return (
		<div className="space-y-3">
			{tracks.map((track) => (
				<TrackItem
					key={track.id}
					track={track}
					rightContent={formatDuration(track.duration_ms)}
					onClick={() =>
						window.open(`https://open.spotify.com/track/${track.id}`, '_blank')
					}
				/>
			))}
		</div>
	);
}
