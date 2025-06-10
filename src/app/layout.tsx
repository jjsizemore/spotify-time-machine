import '@/lib/init';
import { LayoutContent } from '@/components/LayoutContent';
import TokenStatus from '@/components/TokenStatus';
import WebVitalsMonitor from '@/components/WebVitalsMonitor';
import React from 'react';
import { NextAuthProvider } from '../components/providers/NextAuthProvider';
import './output.css';
import {
	ADVANCED_META_TAGS,
	generateEnhancedMetadata,
	generateOrganizationSchema,
	generateWebApplicationSchema,
} from '@/lib/seo';
import { Analytics } from '@vercel/analytics/react';
import { ThemeModeScript } from 'flowbite-react';
import Script from 'next/script';
import { PostHogProvider } from './providers';

// Enhanced metadata for 2025 SEO standards
export const metadata = generateEnhancedMetadata({
	title: "Jermaine's Spotify Time Machine",
	description:
		'Your personal Spotify listening history and playlist generator. Relive your music journey, create custom playlists, and explore your listening habits over time with advanced analytics and visualizations.',
	tags: [
		'music analytics',
		'Spotify dashboard',
		'playlist creator',
		'music insights',
		'listening trends',
	],
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const webAppSchema = generateWebApplicationSchema();
	const organizationSchema = generateOrganizationSchema();

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<ThemeModeScript />

				{/* Enhanced Meta Tags for 2025 */}
				<meta name="viewport" content={ADVANCED_META_TAGS.viewport} />
				<meta
					name="color-scheme"
					content={ADVANCED_META_TAGS['color-scheme']}
				/>
				<meta
					name="supported-color-schemes"
					content={ADVANCED_META_TAGS['supported-color-schemes']}
				/>
				<meta
					name="apple-mobile-web-app-capable"
					content={ADVANCED_META_TAGS['apple-mobile-web-app-capable']}
				/>
				<meta
					name="apple-mobile-web-app-status-bar-style"
					content={ADVANCED_META_TAGS['apple-mobile-web-app-status-bar-style']}
				/>
				<meta
					name="apple-mobile-web-app-title"
					content={ADVANCED_META_TAGS['apple-mobile-web-app-title']}
				/>
				<meta
					name="mobile-web-app-capable"
					content={ADVANCED_META_TAGS['mobile-web-app-capable']}
				/>
				<meta
					name="msapplication-TileColor"
					content={ADVANCED_META_TAGS['msapplication-TileColor']}
				/>
				<meta
					name="format-detection"
					content={ADVANCED_META_TAGS['format-detection']}
				/>
				<meta name="referrer" content={ADVANCED_META_TAGS['referrer']} />

				{/* PWA and Performance */}
				<link rel="manifest" href="/manifest.webmanifest" />
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
				<link rel="apple-touch-icon" href="/favicon.svg" />

				{/* DNS Prefetch for Performance */}
				<link rel="dns-prefetch" href="//i.scdn.co" />
				<link rel="dns-prefetch" href="//accounts.spotify.com" />
				<link rel="dns-prefetch" href="//api.spotify.com" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
			</head>
			<body className="bg-spotify-black text-spotify-light-gray font-sans min-h-screen flex flex-col layout-content">
				{/* Core Web Vitals monitoring is handled by WebVitalsMonitor component */}

				{/* Enhanced Structured Data */}
				<Script
					id="web-application-schema"
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(webAppSchema),
					}}
				/>

				<Script
					id="organization-schema"
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(organizationSchema),
					}}
				/>

				{/* Google Analytics 4 for Core Web Vitals */}
				<Script
					src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
					strategy="afterInteractive"
				/>
				<Script
					id="google-analytics"
					strategy="afterInteractive"
					dangerouslySetInnerHTML={{
						__html: `
							window.dataLayer = window.dataLayer || [];
							function gtag(){dataLayer.push(arguments);}
							gtag('js', new Date());
							gtag('config', 'G-XXXXXXXXXX', {
								page_title: document.title,
								page_location: window.location.href,
								custom_map: {
									'custom_parameter_1': 'core_web_vitals'
								}
							});
						`,
					}}
				/>

				<NextAuthProvider>
					<PostHogProvider>
						<LayoutContent>{children}</LayoutContent>
						<TokenStatus />
						<WebVitalsMonitor />
					</PostHogProvider>
				</NextAuthProvider>

				{/* Vercel Analytics */}
				<Analytics />

				{/* Service Worker Registration for PWA */}
				<Script
					id="service-worker"
					strategy="afterInteractive"
					dangerouslySetInnerHTML={{
						__html: `
							if ('serviceWorker' in navigator) {
								window.addEventListener('load', function() {
									navigator.serviceWorker.register('/sw.js')
										.then(function(registration) {
											console.log('SW registered: ', registration);
										})
										.catch(function(registrationError) {
											console.log('SW registration failed: ', registrationError);
										});
								});
							}
						`,
					}}
				/>
			</body>
		</html>
	);
}
