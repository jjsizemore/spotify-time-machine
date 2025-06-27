import { Artist } from '@/hooks/useUserStats';
import Image from 'next/image';
import ErrorDisplay from '../../ui/ErrorDisplay';
import LoadingSpinner from '../../ui/LoadingSpinner';

interface TopArtistsProps {
	artists: Artist[];
	isLoading: boolean;
	error: string | null;
	onRetry?: () => void;
}

export default function TopArtists({
	artists,
	isLoading,
	error,
	onRetry,
}: TopArtistsProps) {
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

	if (artists.length === 0) {
		return (
			<div className="text-center py-8 text-spotify-medium-gray">
				No top artists found. Try listening to more music!
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
			{artists.map((artist) => (
				<a
					key={artist.id}
					href={artist.external_urls.spotify}
					target="_blank"
					rel="noopener noreferrer"
					className="bg-spotify-dark-gray p-3 rounded-md hover:bg-spotify-medium-gray/20 transition cursor-pointer block"
				>
					<div className="aspect-square relative mb-2 rounded-md overflow-hidden">
						<Image
							src={artist.images[0]?.url || '/default-artist.png'}
							alt={artist.name}
							fill
							className="object-cover"
						/>
					</div>
					<h3 className="font-medium text-white truncate">{artist.name}</h3>
					<p className="text-xs text-spotify-light-gray">
						{artist.genres.slice(0, 2).join(', ')}
					</p>
				</a>
			))}
		</div>
	);
}
