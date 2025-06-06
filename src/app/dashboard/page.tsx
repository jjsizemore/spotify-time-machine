'use client';

import DataFetcherAndControlsWrapper from '@/components/DataFetcherAndControlsWrapper';
import FeatureCard from '@/components/FeatureCard';
import PageContainer from '@/components/PageContainer';
import RecentlyPlayed from '@/components/RecentlyPlayed';
import StatsTabs from '@/components/StatsTabs';
import TopArtists from '@/components/TopArtists';
import TopGenres from '@/components/TopGenres';
import TopTracks from '@/components/TopTracks';
import { TimeRange, useUserStats } from '@/hooks/useUserStats';
import {
	generateBreadcrumbSchema,
	generateWebApplicationSchema,
} from '@/lib/seo';
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

	const { topArtists, topTracks, recentlyPlayed, isLoading, error, refresh } =
		useUserStats(timeRange);

	// Generate enhanced structured data for dashboard
	const dashboardSchema = generateWebApplicationSchema({
		'@type': 'WebPage',
		name: 'Dashboard - Spotify Time Machine',
		description:
			'View your personalized Spotify listening statistics, including top artists, tracks, and genres. Analyze your music trends and discover insights about your listening habits.',
		breadcrumb: generateBreadcrumbSchema([
			{ name: 'Home', url: '/' },
			{ name: 'Dashboard', url: '/dashboard' },
		]),
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

			{/* Breadcrumb Schema */}
			<Script
				id="breadcrumb-schema"
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(
						generateBreadcrumbSchema([
							{ name: 'Home', url: '/' },
							{ name: 'Dashboard', url: '/dashboard' },
						])
					),
				}}
			/>

			{/* SEO-optimized heading structure */}
			<header className="mb-8">
				<h1 className="sr-only">
					Spotify Music Dashboard - Your Personal Listening Analytics
				</h1>
				<nav aria-label="Breadcrumb" className="mb-4">
					<ol className="flex items-center space-x-2 text-sm text-spotify-light-gray">
						<li>
							<a href="/" className="hover:text-spotify-green">
								Home
							</a>
						</li>
						<li className="text-spotify-gray">/</li>
						<li className="text-spotify-green" aria-current="page">
							Dashboard
						</li>
					</ol>
				</nav>
			</header>

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
