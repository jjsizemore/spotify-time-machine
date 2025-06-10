import { generateEnhancedMetadata } from '@/lib/seo';
import { Metadata } from 'next';

export const metadata: Metadata = generateEnhancedMetadata({
	title: 'Music History',
	description:
		'Explore your Spotify listening history month by month. Discover your musical journey through time, see what you were listening to in any given month, and create playlists from your past favorites.',
	path: '/history',
	image: '/previews/history-preview.jpeg',
	tags: [
		'music history',
		'Spotify timeline',
		'listening journey',
		'monthly music',
		'music discovery',
		'time machine',
	],
});

export default function HistoryLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
