'use client';

import Breadcrumb from '@/components/Breadcrumb';
import DataFetcherAndControlsWrapper from '@/components/DataFetcherAndControlsWrapper';
import FeatureCard from '@/components/FeatureCard';
import PageContainer from '@/components/PageContainer';
import RecentlyPlayed from '@/components/RecentlyPlayed';
import StatsTabs from '@/components/StatsTabs';
import TopArtists from '@/components/TopArtists';
import TopGenres from '@/components/TopGenres';
import TopTracks from '@/components/TopTracks';
import { TimeRange, useUserStats } from '@/hooks/useUserStats';
import { generateWebApplicationSchema } from '@/lib/seo';
import { SpotifyTimeRange, timeRangeDisplays } from '@/lib/timeRanges';
import { useSession } from 'next-auth/react';
import Script from 'next/script';
import React, { useState, useEffect, lazy, Suspense } from 'react';

// Lazy load the visualization components
const ListeningTrends = lazy(() => import('@/components/ListeningTrends'));
const GenreTrendsVisualization = lazy(
	() => import('@/components/GenreTrendsVisualization')
);

type Tab = 'artists' | 'tracks' | 'recent' | 'genres';

export default function Dashboard() {
	const { status } = useSession();
	const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
	const [activeTab, setActiveTab] = useState<Tab>('artists');
	const [showApiNotice, setShowApiNotice] = useState(true);

	const { topArtists, topTracks, recentlyPlayed, isLoading, error, refresh } =
		useUserStats(timeRange);

	// Generate enhanced structured data for dashboard
	const dashboardSchema = generateWebApplicationSchema({
		'@type': 'WebPage',
		name: 'Dashboard - Spotify Time Machine',
		description:
			'View your personalized Spotify listening statistics, including top artists, tracks, and genres. Analyze your music trends and discover insights about your listening habits.',
		mainEntity: {
			'@type': 'DataVisualization',
			name: 'Spotify Listening Statistics',
			description:
				'Interactive dashboard showing personal music listening analytics',
			about: [
				'Top Artists Analysis',
				'Top Tracks Statistics',
				'Genre Distribution',
				'Recently Played Music',
				'Listening Trends Over Time',
			],
		},
	});

	return (
		<PageContainer
			isLoading={status === 'loading'}
			maxWidth="7xl"
			className="min-h-screen pb-20"
		>
			{/* Enhanced Structured Data for 2025 SEO */}
			<Script
				id="dashboard-structured-data"
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(dashboardSchema),
				}}
			/>

			{/* SEO-optimized heading structure */}
			<header className="mb-8">
				<h1 className="sr-only">
					Spotify Music Dashboard - Your Personal Listening Analytics
				</h1>
				<Breadcrumb items={[{ name: 'Home', url: '/dashboard' }]} />
			</header>

			{/* API Restriction Notice for Dashboard */}
			{showApiNotice && (
				<section className="mb-8 bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
					<div className="flex items-start justify-between">
						<div className="flex items-start">
							<div className="text-lg mr-3 mt-0.5">⚠️</div>
							<div>
								<h2 className="text-sm font-semibold text-yellow-400 mb-2">
									Limited functionality: App in development mode
								</h2>
								<p className="text-xs text-yellow-200 mb-3">
									Due to Spotify's new API restrictions requiring 250k MAUs
									(Monthly Active Users) and only accepting organizations (not
									individuals), this app has severe rate limits and you may
									experience slower performance.
								</p>
								<div className="flex flex-wrap gap-2">
									<a
										href="https://community.spotify.com/t5/Spotify-for-Developers/Updating-the-Criteria-for-Web-API-Extended-Access/m-p/6920661/highlight/true#M17569"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-yellow-100 text-xs font-medium rounded transition-colors"
									>
										💬 Join discussion
									</a>
									<a
										href="https://support.spotify.com/us/contact-spotify-support/"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center px-3 py-1 bg-transparent border border-yellow-500/50 hover:bg-yellow-500/10 text-yellow-300 text-xs font-medium rounded transition-colors"
									>
										📧 Contact Spotify
									</a>
								</div>
							</div>
						</div>
						<button
							onClick={() => setShowApiNotice(false)}
							className="text-yellow-400 hover:text-yellow-300 p-1 flex-shrink-0"
							aria-label="Dismiss notice"
						>
							<svg
								className="w-4 h-4"
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

			{/* Feature Cards */}
			<nav
				aria-label="Main features"
				className="flex flex-col md:flex-row gap-6 mb-10 justify-around"
			>
				<FeatureCard
					title="Time Machine"
					description="Look back at your liked songs from any month, and quickly generate playlists from any month you like."
					buttonText="Start Journey"
					href="/history"
					className="md:max-w-xs lg:max-w-sm"
				/>

				<FeatureCard
					title="Playlist Generator"
					description="Easily generate playlists of the songs that you liked during any timeframe you like, with an option to filter by your top genres or artists."
					buttonText="Generate Playlist"
					href="/playlist-generator"
					className="md:max-w-xs lg:max-w-sm"
				/>
			</nav>

			{/* Visualizations */}
			<section
				aria-label="Music Analytics Visualizations"
				className="space-y-8 mb-10"
			>
				<h2 className="text-2xl font-bold text-spotify-white mb-4">
					Your Music Journey
				</h2>
				<Suspense
					fallback={<div className="loading-skeleton h-64 rounded-lg" />}
				>
					<ListeningTrends />
				</Suspense>
				<Suspense
					fallback={<div className="loading-skeleton h-64 rounded-lg" />}
				>
					<GenreTrendsVisualization />
				</Suspense>
			</section>

			{/* Stats Section */}
			<DataFetcherAndControlsWrapper
				title="Your Spotify Stats"
				isLoading={isLoading}
				isProcessing={false}
				error={
					error ? (typeof error === 'string' ? new Error(error) : error) : null
				}
				isEmpty={
					!isLoading &&
					!error &&
					!topArtists?.length &&
					!topTracks?.length &&
					!recentlyPlayed?.length
				}
				emptyDataMessage="No stats available for the selected time period."
				currentTimeRange={timeRange}
				setTimeRange={(range) => setTimeRange(range as SpotifyTimeRange)}
				isLoadingRange={{
					PAST_YEAR: false,
					PAST_TWO_YEARS: false,
					ALL_TIME: false,
				}}
				timeRangeDisplay={timeRangeDisplays.spotify}
			>
				<div className="flex flex-col min-h-[400px]">
					<StatsTabs activeTab={activeTab} onChange={setActiveTab} />

					<div className="flex-1 space-y-6 mt-6">
						{activeTab === 'artists' && (
							<article aria-label="Top artists analysis">
								<h3 className="text-xl font-semibold text-spotify-white mb-4">
									Your Top Artists
								</h3>
								<TopArtists
									artists={topArtists}
									isLoading={false}
									error={error}
									onRetry={refresh}
								/>
							</article>
						)}

						{activeTab === 'tracks' && (
							<article aria-label="Top tracks analysis">
								<h3 className="text-xl font-semibold text-spotify-white mb-4">
									Your Top Tracks
								</h3>
								<TopTracks
									tracks={topTracks}
									isLoading={false}
									error={error}
									onRetry={refresh}
								/>
							</article>
						)}

						{activeTab === 'genres' && (
							<article aria-label="Top genres analysis">
								<h3 className="text-xl font-semibold text-spotify-white mb-4">
									Your Top Genres
								</h3>
								<TopGenres
									artists={topArtists}
									isLoading={false}
									error={error}
									onRetry={refresh}
								/>
							</article>
						)}

						{activeTab === 'recent' && (
							<article aria-label="Recently played music">
								<h3 className="text-xl font-semibold text-spotify-white mb-4">
									Recently Played
								</h3>
								<RecentlyPlayed
									tracks={recentlyPlayed}
									isLoading={false}
									error={error}
									onRetry={refresh}
								/>
							</article>
						)}
					</div>
				</div>
			</DataFetcherAndControlsWrapper>
		</PageContainer>
	);
}
