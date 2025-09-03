import '@/lib/init';
import WebVitalsMonitor from '@/analytics/WebVitalsMonitor';
import TokenStatus from '@/auth/TokenStatus';
import { LayoutContent } from '@/layout/LayoutContent';
import { NextAuthProvider } from '@/providers/NextAuthProvider';
import { ReactNode } from 'react';
import './globals.css';
import ClientProviders from '@/components/ClientProviders';
// ConsentAwareAnalytics is loaded dynamically inside ClientProviders to ensure it runs
// only after the ConsentManagerProvider is available on the client.
import {
	ADVANCED_META_TAGS,
	generateEnhancedMetadata,
	generateOrganizationSchema,
	generateWebApplicationSchema,
} from '@/lib/seo';
import IOSInstallPrompt from '@/ui/IOSInstallPrompt';
import OfflineIndicator from '@/ui/OfflineIndicator';
import PWAInstallPrompt from '@/ui/PWAInstallPrompt';
import { GoogleTagManager } from '@next/third-parties/google';
import { ThemeModeScript } from 'flowbite-react';
import Script from 'next/script';

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
	children: ReactNode;
}) {
	const webAppSchema = generateWebApplicationSchema();
	const organizationSchema = generateOrganizationSchema();

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<GoogleTagManager gtmId="GTM-NFTKSSLM" />
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

				{/* iOS Safari PWA Enhancements */}
				<meta name="apple-touch-fullscreen" content="yes" />
				<meta
					name="apple-mobile-web-app-status-bar-style"
					content="black-translucent"
				/>
				<meta name="format-detection" content="telephone=no" />
				<meta name="format-detection" content="email=no" />
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
				<link rel="apple-touch-icon" sizes="180x180" href="/favicon.svg" />
				<link rel="apple-touch-icon" sizes="152x152" href="/favicon.svg" />
				<link rel="apple-touch-icon" sizes="120x120" href="/favicon.svg" />

				{/* iOS Splash Screens */}
				<link
					rel="apple-touch-startup-image"
					href="/favicon.svg"
					media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
				/>
				<link
					rel="apple-touch-startup-image"
					href="/favicon.svg"
					media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
				/>
				<link
					rel="apple-touch-startup-image"
					href="/favicon.svg"
					media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
				/>

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
				<ClientProviders>
					{/* Enhanced Structured Data - These are essential and don't require consent */}
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

					<NextAuthProvider>
						<LayoutContent>{children}</LayoutContent>
						<TokenStatus />
						{/* WebVitalsMonitor - Keep this as it's for performance monitoring, not user tracking */}
						<WebVitalsMonitor />
					</NextAuthProvider>

					{/* Service Worker Registration for PWA - Essential functionality */}
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

					{/* PWA Install Prompt */}
					<PWAInstallPrompt />

					{/* iOS Install Prompt */}
					<IOSInstallPrompt />

					{/* Offline Indicator */}
					<OfflineIndicator />
				</ClientProviders>
			</body>
		</html>
	);
}
