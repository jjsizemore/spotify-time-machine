import React from 'react';
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';
import './globals.css';

export const metadata = {
	title: 'Spotify Time Machine',
	description: 'Your personal Spotify listening history and playlist generator',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className="bg-spotify-black text-spotify-light-gray font-sans min-h-screen">
				<NextAuthProvider>{children}</NextAuthProvider>
			</body>
		</html>
	);
}
