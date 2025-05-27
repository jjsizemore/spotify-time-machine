'use client';

import FeatureShowcaseItem from '@/components/FeatureShowcaseItem';
import LoadingSpinner from '@/components/LoadingSpinner';
import SpotifySignInButton from '@/components/SpotifySignInButton';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
		<main
			className="flex flex-col min-h-screen items-center justify-center bg-spotify-black text-spotify-light-gray px-4"
			role="main"
		>
			<div className="flex flex-col items-center w-full max-w-4xl xl:max-w-6xl py-12">
				{/* Data Usage & Privacy Card */}
				<section
					aria-labelledby="privacy-heading"
					className="w-full md:w-1/2 max-w-lg mx-auto mb-8 bg-spotify-dark-gray rounded-lg p-4 shadow-lg"
				>
					<div className="flex flex-col">
						<h2
							id="privacy-heading"
							className="text-xl font-bold text-spotify-white mb-3"
						>
							Your Data & Privacy
						</h2>
						<div className="space-y-3 text-sm text-spotify-light-gray">
							<div>
								<strong className="text-spotify-white">What we access:</strong>
								<ul className="list-disc list-inside mt-1 space-y-1">
									<li>Your liked tracks and when you liked them</li>
									<li>Your top artists and genres</li>
									<li>Your recently played tracks</li>
									<li>Ability to create playlists in your Spotify account</li>
								</ul>
							</div>
							<div>
								<strong className="text-spotify-white">
									What we don't access:
								</strong>
								<ul className="list-disc list-inside mt-1 space-y-1">
									<li>Your personal information (email, name, etc.)</li>
									<li>
										Your playlists (unless you create them through our app)
									</li>
									<li>Your listening activity outside of liked tracks</li>
									<li>Your payment information or account settings</li>
								</ul>
							</div>
							<p className="mt-3 text-xs">
								We only use your Spotify data to provide you with insights and
								create playlists. Your data is never shared with third parties
								or used for any other purpose.
							</p>
						</div>
					</div>
				</section>

				<header className="flex flex-col items-center justify-center mb-12">
					<span className="text-4xl md:text-5xl font-extrabold text-spotify-green mb-4 text-center">
						<div className="flex items-center justify-center order-1 md:order-2">
							<h1 className="mr-4">Jermaine's</h1>
							<Image
								src="/spotify-icon.png"
								alt="Spotify Logo"
								width={128}
								height={128}
								className="drop-shadow-lg mx-4"
							/>
							<h1 className="ml-4">Time Machine</h1>
						</div>
					</span>
					<p className="text-lg md:text-xl text-center mb-8 text-spotify-light-gray">
						Relive your Spotify listening history, generate playlists by month
						or custom range, and explore your music journey.
					</p>

					<SpotifySignInButton
						size="lg"
						className="spotify-button mb-12"
						callbackUrl="/dashboard"
					/>
				</header>

				{/* Feature Showcase */}
				<section
					aria-labelledby="features-heading"
					className="w-full space-y-16"
				>
					<FeatureShowcaseItem
						title="Interactive Dashboard"
						description="Get insights into your listening habits with an interactive dashboard. Track your top artists, genres, and tracks over time."
						imageUrl="/previews/dashboard-preview.jpeg"
						imageAlt="Dashboard Preview"
						previewUrl="/previews/dashboard-preview.jpeg"
						imageWidth={400}
						imageHeight={450}
					/>

					<FeatureShowcaseItem
						title="Monthly History"
						description="Travel back in time and explore your liked tracks month by month. Create playlists instantly from any time period with a single click."
						imageUrl="/previews/history-preview.jpeg"
						imageAlt="History Preview"
						previewUrl="/previews/history-preview.jpeg"
						imageWidth={400}
						imageHeight={450}
					/>

					<FeatureShowcaseItem
						title="Custom Playlist Generator"
						description="Create personalized playlists by selecting custom date ranges and filtering by your favorite genres and artists. Share your playlists with friends instantly."
						imageUrl="/previews/playlist-generator-preview.jpeg"
						imageAlt="Playlist Generator Preview"
						previewUrl="/previews/playlist-generator-preview.jpeg"
						imageWidth={400}
						imageHeight={450}
					/>
				</section>
			</div>
		</main>
	);
}
