'use client';

import FeatureShowcaseItem from '@/components/FeatureShowcaseItem';
import LoadingSpinner from '@/components/LoadingSpinner';
import SpotifySignInButton from '@/components/SpotifySignInButton';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
	const { status } = useSession();
	const router = useRouter();
	const [showApiRestrictionNotice, setShowApiRestrictionNotice] =
		useState(true);

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
				{/* Spotify API Restriction Notice */}
				{showApiRestrictionNotice && (
					<section
						aria-labelledby="api-restriction-heading"
						className="w-full max-w-4xl mx-auto mb-8 bg-red-900/20 border border-red-500/50 rounded-lg p-6 shadow-lg"
					>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<div className="flex items-center mb-4">
									<div className="text-2xl mr-3">⚠️</div>
									<h2
										id="api-restriction-heading"
										className="text-xl font-bold text-red-400"
									>
										Important Notice: App in Development Mode
									</h2>
								</div>

								<div className="space-y-4 text-sm text-spotify-light-gray">
									<div className="bg-red-900/30 p-4 rounded-md">
										<p className="text-red-300 font-semibold mb-2">
											🚨 This app is currently stuck in development mode due to
											Spotify's new API restrictions.
										</p>
										<ul className="list-disc list-inside space-y-1 text-red-200">
											<li>
												Only users manually added to an allowlist can use this
												app (max 25 users)
											</li>
											<li>
												Severely restricted rate limits compared to extended
												quota mode
											</li>
											<li>
												Spotify now requires 250k MAUs (Monthly Active Users) to
												enable extended access
											</li>
											<li>
												Only organizations (not individuals) can apply for
												extended access as of May 15, 2025
											</li>
											<li>
												This makes it impossible for independent developers to
												launch new public apps
											</li>
										</ul>
									</div>

									<div>
										<p className="font-semibold text-spotify-white mb-2">
											📢 Help us fight these restrictions:
										</p>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
											<a
												href="https://community.spotify.com/t5/Spotify-for-Developers/Updating-the-Criteria-for-Web-API-Extended-Access/m-p/6920661/highlight/true#M17569"
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center px-4 py-2 bg-spotify-green hover:bg-spotify-green/80 text-spotify-black font-medium rounded-lg transition-colors"
											>
												<span className="mr-2">💬</span>
												Join Developer Discussion
											</a>
											<a
												href="https://support.spotify.com/us/contact-spotify-support/"
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center px-4 py-2 bg-spotify-dark-gray hover:bg-spotify-medium-gray text-spotify-white font-medium rounded-lg transition-colors border border-spotify-light-gray/30"
											>
												<span className="mr-2">📧</span>
												Contact Spotify Support
											</a>
										</div>
									</div>

									<div className="text-xs opacity-80">
										<p>
											<strong>More info:</strong>{' '}
											<a
												href="https://developer.spotify.com/blog/2025-04-15-updating-the-criteria-for-web-api-extended-access"
												target="_blank"
												rel="noopener noreferrer"
												className="text-spotify-green hover:text-spotify-green/80 underline"
											>
												Spotify's API Change Announcement
											</a>
											{' | '}
											<a
												href="https://developer.spotify.com/terms"
												target="_blank"
												rel="noopener noreferrer"
												className="text-spotify-green hover:text-spotify-green/80 underline"
											>
												Updated Developer Terms
											</a>
										</p>
									</div>
								</div>
							</div>

							<button
								onClick={() => setShowApiRestrictionNotice(false)}
								className="ml-4 text-red-400 hover:text-red-300 p-1"
								aria-label="Dismiss notice"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					</section>
				)}

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
						<div className="flex flex-col md:flex-row items-center justify-center">
							<h1 className="mb-4 md:mb-0 md:mr-4">Jermaine's</h1>
							<Image
								src="/images/optimized/root/spotify-icon.webp"
								alt="Spotify Logo"
								width={128}
								height={128}
								className="drop-shadow-lg my-4 md:my-0 md:mx-4"
							/>
							<h1 className="mt-4 md:mt-0 md:ml-4">Time Machine</h1>
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
						imageUrl="/images/optimized/previews/dashboard-preview.webp"
						imageAlt="Dashboard Preview"
						previewUrl="/images/optimized/previews/dashboard-preview.webp"
						imageWidth={400}
						imageHeight={450}
					/>

					<FeatureShowcaseItem
						title="Monthly History"
						description="Travel back in time and explore your liked tracks month by month. Create playlists instantly from any time period with a single click."
						imageUrl="/images/optimized/previews/history-preview.webp"
						imageAlt="History Preview"
						previewUrl="/images/optimized/previews/history-preview.webp"
						imageWidth={400}
						imageHeight={450}
					/>

					<FeatureShowcaseItem
						title="Custom Playlist Generator"
						description="Create personalized playlists by selecting custom date ranges and filtering by your favorite genres and artists. Share your playlists with friends instantly."
						imageUrl="/images/optimized/previews/playlist-generator-preview.webp"
						imageAlt="Playlist Generator Preview"
						previewUrl="/images/optimized/previews/playlist-generator-preview.webp"
						imageWidth={400}
						imageHeight={450}
					/>
				</section>
			</div>
		</main>
	);
}
