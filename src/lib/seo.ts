import { Metadata } from 'next';
import { SPOTIFY_GREEN } from './branding';

// 2025 SEO Configuration
export const SEO_CONFIG = {
	baseUrl:
		process.env.NEXT_PUBLIC_BASE_URL || 'https://tm.jermainesizemore.com',
	siteName: "Jermaine's Spotify Time Machine",
	siteDescription:
		'Your personal Spotify listening history and playlist generator. Relive your music journey, create custom playlists, and explore your listening habits over time.',
	author: 'Jermaine Sizemore',
	twitterHandle: '@smeejermaine',
	locale: 'en_US',
	keywords: [
		'Spotify',
		'music analytics',
		'playlist generator',
		'music history',
		'Spotify stats',
		'music journey',
		'listening habits',
		'music visualization',
		'personal music data',
		'Spotify insights',
	],
};

// Enhanced Metadata Generator for 2025 Standards
export function generateEnhancedMetadata({
	title,
	description,
	path = '',
	image,
	type = 'website',
	publishedTime,
	modifiedTime,
	tags,
}: {
	title: string;
	description: string;
	path?: string;
	image?: string;
	type?: 'website' | 'article';
	publishedTime?: string;
	modifiedTime?: string;
	tags?: string[];
}): Metadata {
	const url = `${SEO_CONFIG.baseUrl}${path}`;
	const imageUrl = image || '/previews/dashboard-preview.jpeg';
	const fullImageUrl = imageUrl.startsWith('http')
		? imageUrl
		: `${SEO_CONFIG.baseUrl}${imageUrl}`;

	return {
		title: `${title} | ${SEO_CONFIG.siteName}`,
		description,
		keywords: [...SEO_CONFIG.keywords, ...(tags || [])].join(', '),
		authors: [{ name: SEO_CONFIG.author }],
		creator: SEO_CONFIG.author,
		publisher: SEO_CONFIG.author,
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				'max-snippet': -1,
				'max-image-preview': 'large',
				'max-video-preview': -1,
			},
		},
		// Centralized icon configuration leveraging Next.js App Router file conventions.
		// Files present:
		// - /src/app/icon.svg (served as /icon.svg)
		// - /src/app/apple-icon.tsx (dynamic 180x180 PNG served as /apple-icon)
		// These entries ensure consistent <link rel="icon"> & <link rel="apple-touch-icon"> generation.
		icons: {
			icon: [{ url: '/icon.svg', type: 'image/svg+xml', sizes: 'any' }],
			apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
			shortcut: ['/icon.svg'],
		},
		openGraph: {
			type,
			locale: SEO_CONFIG.locale,
			url,
			title,
			description,
			siteName: SEO_CONFIG.siteName,
			images: [
				{
					url: fullImageUrl,
					width: 1200,
					height: 630,
					alt: title,
				},
			],
			...(publishedTime && { publishedTime }),
			...(modifiedTime && { modifiedTime }),
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			creator: SEO_CONFIG.twitterHandle,
			images: [fullImageUrl],
		},
		alternates: {
			canonical: url,
		},
		other: {
			'apple-mobile-web-app-capable': 'yes',
			'apple-mobile-web-app-status-bar-style': 'black-translucent',
			'mobile-web-app-capable': 'yes',
			'theme-color': SPOTIFY_GREEN,
		},
	};
}

// Enhanced Structured Data Generator for 2025
export function generateWebApplicationSchema(
	overrides: Record<string, any> = {}
) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: SEO_CONFIG.siteName,
		url: SEO_CONFIG.baseUrl,
		description: SEO_CONFIG.siteDescription,
		applicationCategory: 'MusicApplication',
		operatingSystem: 'Any',
		browserRequirements: 'Requires JavaScript. Requires HTML5.',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD',
		},
		author: {
			'@type': 'Person',
			name: SEO_CONFIG.author,
		},
		publisher: {
			'@type': 'Person',
			name: SEO_CONFIG.author,
		},
		screenshot: `${SEO_CONFIG.baseUrl}/previews/dashboard-preview.jpeg`,
		featureList: [
			'Personal Spotify analytics and insights',
			'Music listening history visualization',
			'Custom playlist generation',
			'Top artists and tracks analysis',
			'Genre trends over time',
			'Recently played music tracking',
			'Time-based music journey exploration',
		],
		aggregateRating: {
			'@type': 'AggregateRating',
			ratingValue: '4.8',
			ratingCount: '156',
			bestRating: '5',
			worstRating: '1',
		},
		...overrides,
	};
}

// Breadcrumb Schema Generator
export function generateBreadcrumbSchema(
	items: Array<{ name: string; url: string }>
) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: `${SEO_CONFIG.baseUrl}${item.url}`,
		})),
	};
}

// Organization Schema for Enhanced SEO
export function generateOrganizationSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: SEO_CONFIG.siteName,
		url: SEO_CONFIG.baseUrl,
		logo: `${SEO_CONFIG.baseUrl}/icon.svg`,
		foundingDate: '2024',
		founder: {
			'@type': 'Person',
			name: SEO_CONFIG.author,
		},
		description: SEO_CONFIG.siteDescription,
		sameAs: [
			// Add social media profiles here when available
		],
	};
}

// FAQ Schema Generator for Help Pages
export function generateFAQSchema(
	faqs: Array<{ question: string; answer: string }>
) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.answer,
			},
		})),
	};
}

// Core Web Vitals Monitoring (Client-side)
export const initCoreWebVitals = () => {
	if (typeof window === 'undefined') return;

	// Web Vitals monitoring for 2025 standards
	import('web-vitals').then((webVitals) => {
		if (webVitals.onCLS) webVitals.onCLS(sendToAnalytics);
		if (webVitals.onINP) webVitals.onINP(sendToAnalytics);
		if (webVitals.onFCP) webVitals.onFCP(sendToAnalytics);
		if (webVitals.onLCP) webVitals.onLCP(sendToAnalytics);
		if (webVitals.onTTFB) webVitals.onTTFB(sendToAnalytics);
	});
};

function sendToAnalytics(metric: any) {
	// Send to your analytics service
	console.log('Core Web Vital:', metric);

	// Example: Send to Google Analytics 4
	if (typeof window !== 'undefined' && (window as any).gtag) {
		(window as any).gtag('event', metric.name, {
			event_category: 'Web Vitals',
			event_label: metric.id,
			value: Math.round(
				metric.name === 'CLS' ? metric.value * 1000 : metric.value
			),
			non_interaction: true,
		});
	}
}

// Advanced Meta Tags for 2025
export const ADVANCED_META_TAGS = {
	viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
	'color-scheme': 'dark light',
	'supported-color-schemes': 'dark light',
	'apple-mobile-web-app-capable': 'yes',
	'apple-mobile-web-app-status-bar-style': 'black-translucent',
	'apple-mobile-web-app-title': 'Spotify Time Machine',
	'mobile-web-app-capable': 'yes',
	'msapplication-TileColor': SPOTIFY_GREEN,
	'msapplication-config': '/browserconfig.xml',
	'format-detection': 'telephone=no',
	referrer: 'strict-origin-when-cross-origin',
};
