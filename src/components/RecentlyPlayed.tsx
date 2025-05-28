import { PlayHistory } from '@/hooks/useUserStats';
import React from 'react';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';
import TrackItem from './TrackItem';

interface RecentlyPlayedProps {
	tracks: PlayHistory[];
	isLoading: boolean;
	error: string | null;
	onRetry?: () => void;
}

export default function RecentlyPlayed({
	tracks,
	isLoading,
	error,
	onRetry,
}: RecentlyPlayedProps) {
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
				No recently played tracks found.
			</div>
		);
	}

	// Format timestamp to a human-readable format
	const formatPlayTime = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffMins < 60) {
			return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
		} else if (diffHours < 24) {
			return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
		} else {
			return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
		}
	};

	return (
		<div className="space-y-3">
			{tracks.map((item, index) => (
				<TrackItem
					key={`${item.track.id}-${index}`}
					track={item.track}
					rightContent={formatPlayTime(item.played_at)}
					onClick={() =>
						window.open(
							`https://open.spotify.com/track/${item.track.id}`,
							'_blank'
						)
					}
				/>
			))}
		</div>
	);
}
