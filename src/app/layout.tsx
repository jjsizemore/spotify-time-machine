import { LayoutContent } from '@/components/LayoutContent';
import React from 'react';
import { NextAuthProvider } from '../components/providers/NextAuthProvider';
import './spotify.css';
import { Analytics } from '@vercel/analytics/react';
// Root layout metadata (must be in server component)
export const metadata = {
	title: "Jermaine's Spotify Time Machine",
	description: 'Your personal Spotify listening history and playlist generator',
	icons: {
		icon: '/favicon.svg',
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
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
