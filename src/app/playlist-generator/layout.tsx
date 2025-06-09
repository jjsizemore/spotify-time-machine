import { generateEnhancedMetadata } from '@/lib/seo';
import { Metadata } from 'next';

export const metadata: Metadata = generateEnhancedMetadata({
	title: 'Playlist Generator',
	description:
		'Create custom Spotify playlists from your listening history. Generate playlists based on specific time periods, filter by your favorite genres and artists, and rediscover your musical past.',
	path: '/playlist-generator',
	image: '/images/optimized/previews/playlist-generator-preview.webp',
	tags: [
		'playlist generator',
		'Spotify playlists',
		'custom playlists',
		'music curation',
		'playlist creation',
		'music filtering',
	],
});

export default function PlaylistGeneratorLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
