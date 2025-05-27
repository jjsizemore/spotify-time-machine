import { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
	return {
		title: 'Monthly History | Spotify Time Machine',
		description:
			'Travel back in time and explore your liked tracks month by month. Create playlists instantly from any time period with a single click.',
		openGraph: {
			title: 'Monthly History | Spotify Time Machine',
			description:
				'Travel back in time and explore your liked tracks month by month. Create playlists instantly from any time period with a single click.',
			type: 'website',
			images: [
				{
					url: '/previews/history-preview.jpeg',
					width: 1200,
					height: 630,
					alt: 'Spotify Time Machine History Preview',
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: 'Monthly History | Spotify Time Machine',
			description: 'Explore your Spotify listening history month by month',
			images: ['/previews/history-preview.jpeg'],
		},
	};
};

export const generateStructuredData = () => {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: 'Spotify Time Machine History',
		applicationCategory: 'MusicApplication',
		description:
			'Travel back in time and explore your liked tracks month by month. Create playlists instantly from any time period with a single click.',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD',
		},
		featureList: [
			'Monthly track history view',
			'One-click playlist creation',
			'Track added date information',
			'Expandable monthly sections',
			'Time range selection',
		],
		screenshot: '/previews/history-preview.jpeg',
		browserRequirements: 'Requires JavaScript. Requires HTML5.',
		operatingSystem: 'Any',
	};
};
