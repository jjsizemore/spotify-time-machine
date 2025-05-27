'use client';

import DataFetcherAndControlsWrapper from '@/components/DataFetcherAndControlsWrapper';
import FeatureCard from '@/components/FeatureCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageContainer from '@/components/PageContainer';
import RecentlyPlayed from '@/components/RecentlyPlayed';
import StatsTabs from '@/components/StatsTabs';
import TimeRangeSelector from '@/components/TimeRangeSelector';
import TopArtists from '@/components/TopArtists';
import TopGenres from '@/components/TopGenres';
import TopTracks from '@/components/TopTracks';
import { TimeRange, useUserStats } from '@/hooks/useUserStats';
import { useSession } from 'next-auth/react';
import Script from 'next/script';
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { generateStructuredData } from './metadata';

// Lazy load the visualization components
const ListeningTrends = lazy(() => import('@/components/ListeningTrends'));
const GenreTrendsVisualization = lazy(
	() => import('@/components/GenreTrendsVisualization')
);

type Tab = 'artists' | 'tracks' | 'recent' | 'genres';

// Map Spotify API time ranges to our internal time ranges
const mapTimeRange = (
	range: TimeRange
): 'PAST_YEAR' | 'PAST_TWO_YEARS' | 'ALL_TIME' => {
	switch (range) {
		case 'short_term':
			return 'PAST_YEAR';
		case 'medium_term':
			return 'PAST_TWO_YEARS';
		case 'long_term':
			return 'ALL_TIME';
	}
};

export default function Dashboard() {
	const { status } = useSession();
	const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
	const [activeTab, setActiveTab] = useState<Tab>('artists');

	const { topArtists, topTracks, recentlyPlayed, isLoading, error, refresh } =
		useUserStats(timeRange);

	// Force a refresh when the component mounts
	useEffect(() => {
		if (status === 'authenticated') {
			refresh();
		}
	}, [status, refresh]);

	return (
		<PageContainer
			isLoading={status === 'loading'}
			maxWidth="7xl"
			className="min-h-screen pb-20"
		>
			{/* Structured Data */}
			<Script
				id="structured-data"
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(generateStructuredData()),
				}}
			/>

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
			<section aria-label="Visualizations" className="space-y-8 mb-10">
				<ListeningTrends />
				<GenreTrendsVisualization />
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
				currentTimeRange={mapTimeRange(timeRange)}
				setTimeRange={(range) =>
					setTimeRange(
						range === 'PAST_YEAR'
							? 'short_term'
							: range === 'PAST_TWO_YEARS'
								? 'medium_term'
								: 'long_term'
					)
				}
				isLoadingRange={{
					PAST_YEAR: false,
					PAST_TWO_YEARS: false,
					ALL_TIME: false,
				}}
			>
				<div className="flex flex-col min-h-[400px]">
					<StatsTabs activeTab={activeTab} onChange={setActiveTab} />

					<div className="flex-1 space-y-6 mt-6">
						{activeTab === 'artists' && (
							<article aria-label="Top artists">
								<TopArtists
									artists={topArtists}
									isLoading={false}
									error={error}
									onRetry={refresh}
								/>
							</article>
						)}

						{activeTab === 'tracks' && (
							<article aria-label="Top tracks">
								<TopTracks
									tracks={topTracks}
									isLoading={false}
									error={error}
									onRetry={refresh}
								/>
							</article>
						)}

						{activeTab === 'genres' && (
							<article aria-label="Top genres">
								<TopGenres
									artists={topArtists}
									isLoading={false}
									error={error}
									onRetry={refresh}
								/>
							</article>
						)}

						{activeTab === 'recent' && (
							<article aria-label="Recently played">
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
