import '@/lib/init';
import { LayoutContent } from '@/components/LayoutContent';
import React from 'react';
import { NextAuthProvider } from '../components/providers/NextAuthProvider';
import './spotify.css';
import { Analytics } from '@vercel/analytics/react';
import { ThemeModeScript } from 'flowbite-react';

// Root layout metadata (must be in server component)
export const metadata = {
	title: "Jermaine's Spotify Time Machine",
	description:
		'Your personal Spotify listening history and playlist generator. Relive your music journey, create custom playlists, and explore your listening habits over time.',
	keywords:
		'Spotify, music history, playlist generator, music analytics, Spotify stats, music journey',
	authors: [{ name: 'Jermaine Sizemore' }],
	openGraph: {
		title: "Jermaine's Spotify Time Machine",
		description:
			'Your personal Spotify listening history and playlist generator. Relive your music journey, create custom playlists, and explore your listening habits over time.',
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
		title: "Jermaine's Spotify Time Machine",
		description:
			'Your personal Spotify listening history and playlist generator',
		images: ['/previews/dashboard-preview.jpeg'],
	},
	icons: {
		icon: '/favicon.svg',
		apple: '/favicon.svg',
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
		},
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<ThemeModeScript />
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
			</head>
			<body className="bg-spotify-black text-spotify-light-gray font-sans min-h-screen flex flex-col">
				<NextAuthProvider>
					<LayoutContent>{children}</LayoutContent>
				</NextAuthProvider>
				<Analytics />
			</body>
		</html>
	);
}
