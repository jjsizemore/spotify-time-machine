'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import React from 'react';

export default function SignIn() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-900">
			<div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-lg">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-bold text-white">
						Welcome to Spotify Time Machine
					</h2>
					<p className="mt-2 text-sm text-gray-400">
						Connect your Spotify account to get started
					</p>
				</div>
				<div className="mt-8">
					<button
						onClick={() => signIn('spotify', { callbackUrl: '/' })}
						className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
					>
						<span className="absolute left-0 inset-y-0 flex items-center pl-3">
							<Image
								src="/spotify-icon.png"
								alt="Spotify"
								width={24}
								height={24}
								className="h-5 w-5"
							/>
						</span>
						Sign in with Spotify
					</button>
				</div>
			</div>
		</div>
	);
}
