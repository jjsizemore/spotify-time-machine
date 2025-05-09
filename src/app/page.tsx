'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import SpotifySignInButton from '@/components/SpotifySignInButton';

export default function Home() {
	const { status } = useSession();
	const router = useRouter();

	// Redirect to dashboard if already authenticated
	useEffect(() => {
		if (status === 'authenticated') {
			router.push('/dashboard');
		}
	}, [status, router]);

	// Show loading spinner while checking auth status
	if (status === 'loading') {
		return (
			<div className="min-h-screen bg-spotify-black flex items-center justify-center">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	return (
		<main className="flex flex-col min-h-screen items-center justify-center bg-spotify-black text-spotify-light-gray px-4">
			<div className="flex flex-col items-center max-w-xl w-full py-12">
				<Image
					src="/spotify-icon.png"
					alt="Spotify Logo"
					width={72}
					height={72}
					className="mb-6 drop-shadow-lg"
				/>
				<h1 className="text-4xl md:text-5xl font-extrabold text-spotify-green mb-4 text-center">
					Spotify Time Machine
				</h1>
				<p className="text-lg md:text-xl text-center mb-8 text-spotify-light-gray">
					Relive your Spotify listening history, generate playlists by month or custom range, and explore your music journey.
				</p>

				<SpotifySignInButton
					size="lg"
					className="spotify-button"
					callbackUrl="/dashboard"
				/>

				{/* <div className="mt-10 w-full border-t border-spotify-medium-gray pt-8 text-center text-spotify-medium-gray text-sm">
					<span>Built with Next.js, Tailwind CSS, and the Spotify Web API</span>
				</div> */}
			</div>
		</main>
	);
}
