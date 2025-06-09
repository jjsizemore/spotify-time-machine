import { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
	return {
		title: "Monthly History | Jermaine's Spotify Time Machine",
		description:
			'Travel back in time and explore your liked tracks month by month. Create playlists instantly from any time period with a single click.',
		openGraph: {
			title: "Monthly History | Jermaine's Spotify Time Machine",
			description:
				'Travel back in time and explore your liked tracks month by month. Create playlists instantly from any time period with a single click.',
			type: 'website',
			images: [
				{
					url: '/images/optimized/previews/history-preview.webp',
					width: 1200,
					height: 630,
					alt: "Jermaine's Spotify Time Machine History Preview",
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: "Monthly History | Jermaine's Spotify Time Machine",
			description: 'Explore your Spotify listening history month by month',
			images: ['/images/optimized/previews/history-preview.webp'],
		},
	};
};

export const generateStructuredData = () => {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: "Jermaine's Spotify Time Machine History",
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
		screenshot: '/images/optimized/previews/history-preview.webp',
		browserRequirements: 'Requires JavaScript. Requires HTML5.',
		operatingSystem: 'Any',
	};
};
