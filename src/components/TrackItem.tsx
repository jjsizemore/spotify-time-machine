import { format } from 'date-fns';
import Image from 'next/image';
import React, { useState } from 'react';

interface Track {
	id: string;
	name: string;
	album: {
		name: string;
		images: Array<{
			url: string;
			height?: number;
			width?: number;
		}>;
	};
	artists: Array<{ id: string; name: string }>;
	duration_ms: number;
	preview_url: string | null;
}

interface TrackItemProps {
	track: Track;
	addedAt?: string;
	showAddedDate?: boolean;
}

export default function TrackItem({
	track,
	addedAt,
	showAddedDate = false,
}: TrackItemProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

	const albumImage =
		track.album.images.find((img) => img.height === 64) ||
		track.album.images.find((img) => img.height === 300) ||
		track.album.images[0];

	const artistNames = track.artists.map((a) => a.name).join(', ');
	const duration = new Date(track.duration_ms).toISOString().substring(14, 19);

	const togglePlay = () => {
		if (!track.preview_url) return;

		if (isPlaying) {
			audio?.pause();
			setIsPlaying(false);
		} else {
			if (!audio) {
				const newAudio = new Audio(track.preview_url);
				newAudio.addEventListener('ended', () => setIsPlaying(false));
				setAudio(newAudio);
				newAudio.play();
			} else {
				audio.play();
			}
			setIsPlaying(true);
		}
	};

	return (
		<div className="flex items-center bg-spotify-black/30 p-4 rounded-md hover:bg-spotify-medium-gray/30 transition">
			{/* Album Image */}
			<div className="mr-4 flex-shrink-0">
				<Image
					src={albumImage.url}
					alt={track.album.name}
					width={50}
					height={50}
					className="rounded"
				/>
			</div>

			{/* Track Info */}
			<div className="flex-grow min-w-0">
				<h3 className="text-spotify-white text-md font-medium truncate">
					{track.name}
				</h3>
				<p className="text-spotify-light-gray text-sm truncate">
					{artistNames}
				</p>
				{showAddedDate && addedAt && (
					<p className="text-spotify-light-gray text-xs">
						Added {format(new Date(addedAt), 'MMM d, yyyy')}
					</p>
				)}
			</div>

			{/* Album Name - Hides on small screens */}
			<div className="hidden md:block text-right mr-4 flex-shrink-0 w-40">
				<p className="text-spotify-light-gray text-sm truncate">
					{track.album.name}
				</p>
			</div>

			{/* Duration */}
			<div className="text-spotify-light-gray text-sm mr-4 flex-shrink-0">
				{duration}
			</div>

			{/* Play Button */}
			{track.preview_url ? (
				<button
					onClick={togglePlay}
					className="text-spotify-white hover:text-spotify-green transition"
				>
					{isPlaying ? (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<rect x="6" y="4" width="4" height="16" rx="1" />
							<rect x="14" y="4" width="4" height="16" rx="1" />
						</svg>
					) : (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M8 5v14l11-7z" />
						</svg>
					)}
				</button>
			) : (
				<span className="text-spotify-medium-gray text-xs">No preview</span>
			)}
		</div>
	);
}
