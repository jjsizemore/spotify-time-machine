import { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
	return {
		title: 'Playlist Generator | Spotify Time Machine',
		description:
			'Create personalized playlists by selecting custom date ranges and filtering by your favorite genres and artists. Share your playlists with friends instantly.',
		openGraph: {
			title: 'Playlist Generator | Spotify Time Machine',
			description:
				'Create personalized playlists by selecting custom date ranges and filtering by your favorite genres and artists. Share your playlists with friends instantly.',
			type: 'website',
			images: [
				{
					url: '/previews/playlist-generator-preview.jpeg',
					width: 1200,
					height: 630,
					alt: 'Spotify Time Machine Playlist Generator Preview',
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: 'Playlist Generator | Spotify Time Machine',
			description: 'Create custom playlists from your liked songs',
			images: ['/previews/playlist-generator-preview.jpeg'],
		},
	};
};

export const generateStructuredData = () => {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: 'Spotify Time Machine Playlist Generator',
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
		screenshot: '/previews/playlist-generator-preview.jpeg',
		browserRequirements: 'Requires JavaScript. Requires HTML5.',
		operatingSystem: 'Any',
	};
};
