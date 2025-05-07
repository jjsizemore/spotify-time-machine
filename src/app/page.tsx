'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function Home() {
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
				<button
					onClick={() => signIn('spotify', { callbackUrl: '/dashboard' })}
					className="flex items-center gap-2 bg-spotify-green text-spotify-black font-bold px-6 py-3 rounded-full shadow-lg hover:bg-spotify-green/90 transition text-lg"
				>
					<Image src="/spotify-icon.png" alt="Spotify" width={28} height={28} />
					Sign in with Spotify
				</button>
				<div className="mt-10 w-full border-t border-spotify-medium-gray pt-8 text-center text-spotify-medium-gray text-sm">
					<span>Built with Next.js, Tailwind CSS, and the Spotify Web API</span>
				</div>
			</div>
		</main>
	);
}
