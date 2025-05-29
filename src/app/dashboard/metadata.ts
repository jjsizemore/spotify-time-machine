import { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
	return {
		title: "Dashboard | Jermaine's Spotify Time Machine",
		description:
			'View your personalized Spotify listening statistics, including top artists, tracks, and genres. Analyze your music trends and discover insights about your listening habits.',
		openGraph: {
			title: "Dashboard | Jermaine's Spotify Time Machine",
			description:
				'View your personalized Spotify listening statistics, including top artists, tracks, and genres. Analyze your music trends and discover insights about your listening habits.',
			type: 'website',
			images: [
				{
					url: '/previews/dashboard-preview.jpeg',
					width: 1200,
					height: 630,
					alt: "Jermaine's Spotify Time Machine Dashboard Preview",
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: "Dashboard | Jermaine's Spotify Time Machine",
			description:
				'View your personalized Spotify listening statistics and music trends',
			images: ['/previews/dashboard-preview.jpeg'],
		},
	};
};

export const generateStructuredData = () => {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: "Jermaine's Spotify Time Machine Dashboard",
		applicationCategory: 'MusicApplication',
		description:
			'View your personalized Spotify listening statistics, including top artists, tracks, and genres. Analyze your music trends and discover insights about your listening habits.',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD',
		},
		featureList: [
			'Personalized listening statistics',
			'Top artists and tracks analysis',
			'Genre trends visualization',
			'Recently played tracks',
			'Time range selection for stats',
		],
		screenshot: '/previews/dashboard-preview.jpeg',
		browserRequirements: 'Requires JavaScript. Requires HTML5.',
		operatingSystem: 'Any',
	};
};
