import { PlayHistory } from '@/hooks/useUserStats';
import Image from 'next/image';
import React from 'react';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';

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
				<div
					key={`${item.track.id}-${index}`}
					className="flex items-center p-2 rounded-md hover:bg-spotify-medium-gray/20 transition cursor-pointer"
				>
					<div className="w-12 h-12 shrink-0 relative mr-3 rounded overflow-hidden">
						<Image
							src={item.track.album.images[0]?.url || '/default-album.png'}
							alt={item.track.album.name}
							fill
							className="object-cover"
						/>
					</div>
					<div className="flex-grow min-w-0">
						<h3 className="font-medium text-white truncate">
							{item.track.name}
						</h3>
						<p className="text-xs text-spotify-light-gray truncate">
							{item.track.artists.map((artist) => artist.name).join(', ')}
						</p>
					</div>
					<div className="text-xs text-spotify-light-gray shrink-0 ml-2">
						{formatPlayTime(item.played_at)}
					</div>
				</div>
			))}
		</div>
	);
}
