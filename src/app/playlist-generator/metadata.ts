import { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
	return {
		title: "Playlist Generator | Jermaine's Spotify Time Machine",
		description:
			'Create personalized playlists by selecting custom date ranges and filtering by your favorite genres and artists. Share your playlists with friends instantly.',
		openGraph: {
			title: "Playlist Generator | Jermaine's Spotify Time Machine",
			description:
				'Create personalized playlists by selecting custom date ranges and filtering by your favorite genres and artists. Share your playlists with friends instantly.',
			type: 'website',
			images: [
				{
					url: '/images/optimized/previews/playlist-generator-preview.webp',
					width: 1200,
					height: 630,
					alt: "Jermaine's Spotify Time Machine Playlist Generator Preview",
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: "Playlist Generator | Jermaine's Spotify Time Machine",
			description: 'Create custom playlists from your liked songs',
			images: ['/images/optimized/previews/playlist-generator-preview.webp'],
		},
	};
};

export const generateStructuredData = () => {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: "Jermaine's Spotify Time Machine Playlist Generator",
		applicationCategory: 'MusicApplication',
		description:
			'Create personalized playlists by selecting custom date ranges and filtering by your favorite genres and artists. Share your playlists with friends instantly.',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD',
		},
		featureList: [
			'Custom date range selection',
			'Genre-based filtering',
			'Artist-based filtering',
			'One-click playlist creation',
			'Instant playlist sharing',
			'Keyboard shortcuts support',
		],
		screenshot: '/images/optimized/previews/playlist-generator-preview.webp',
		browserRequirements: 'Requires JavaScript. Requires HTML5.',
		operatingSystem: 'Any',
	};
};
