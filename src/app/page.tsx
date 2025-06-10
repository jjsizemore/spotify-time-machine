import { generateEnhancedMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import HomePageClient from './_components/HomePageClient';

// Add metadata export for the home page
export const metadata: Metadata = generateEnhancedMetadata({
	title: 'Home',
	description:
		'Your personal Spotify listening history and playlist generator. Relive your music journey, create custom playlists, and explore your listening habits over time with advanced analytics and visualizations.',
	path: '/',
	image: '/images/optimized/previews/home-preview.webp',
	tags: [
		'Spotify time machine',
		'music discovery',
		'listening history',
		'personal analytics',
		'music insights',
	],
});

export default function Home() {
	return <HomePageClient />;
}
