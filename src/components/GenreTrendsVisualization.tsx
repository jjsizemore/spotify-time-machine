'use client';

import { useLikedTracks } from '@/hooks/useLikedTracks';
import React, { useState, useEffect } from 'react';
import { getCachedData, setCachedData } from '../lib/cacheUtils';
import VisualizationContainer from './VisualizationContainer';

interface GenreTimeData {
	genre: string;
	period: string; // Format: 'YYYY-Q1', 'YYYY-Q2', etc.
	count: number;
}

// ADDED: Structure for cached data
interface CachedGenreData {
	genreData: GenreTimeData[];
	topGenres: string[];
	periods: string[];
}

// ADDED: Cache constants
const GENRE_TRENDS_CACHE_KEY_PREFIX = 'genreTrendsData';
const GENRE_TRENDS_CACHE_TTL_MINUTES = 60; // 1 hour TTL

type TimeFilter = '1year' | '2years' | 'all';

export default function GenreTrendsVisualization() {
	const { tracks, isLoading, isLoadingArtists, error, artistsDetails } =
		useLikedTracks();
	const [genreData, setGenreData] = useState<GenreTimeData[]>([]);
	const [topGenres, setTopGenres] = useState<string[]>([]);
	const [periods, setPeriods] = useState<string[]>([]);
	const [processingData, setProcessingData] = useState(false);
	const [timeFilter, setTimeFilter] = useState<TimeFilter>('1year');
	const [granularity, setGranularity] = useState<'quarterly' | 'yearly'>(
		'quarterly'
	);

	// Color palette for genres
	const colorPalette = [
		'bg-blue-500',
		'bg-green-500',
		'bg-yellow-500',
		'bg-red-500',
		'bg-purple-500',
		'bg-pink-500',
		'bg-indigo-500',
		'bg-teal-500',
		'bg-orange-500',
		'bg-cyan-500',
		'bg-emerald-500',
		'bg-violet-500',
		'bg-fuchsia-500',
		'bg-rose-500',
		'bg-sky-500',
		'bg-lime-500',
		'bg-amber-500',
		'bg-blue-400',
		'bg-green-400',
		'bg-purple-400',
	];

	// Process the genre data once we have tracks and artist details
	useEffect(() => {
		// ADDED: Dynamic cache key based on current filters - MOVED UP
		const currentCacheKey = `${GENRE_TRENDS_CACHE_KEY_PREFIX}_${timeFilter}_${granularity}`;

		// ADDED: Attempt to load from cache - MOVED UP & MODIFIED
		const cachedData = getCachedData<CachedGenreData>(currentCacheKey);
		if (cachedData) {
			console.log(
				`GenreTrends: Cache HIT for ${timeFilter} - ${granularity}. Using cached data.`
			);
			setGenreData(cachedData.genreData);
			setTopGenres(cachedData.topGenres);
			setPeriods(cachedData.periods);
			setProcessingData(false); // Ensure processing is false if loaded from cache
			return; // Return early if cache is successfully loaded
		}

		// If cache miss, proceed with checks and processing logic
		console.log(
			`GenreTrends: Cache MISS for ${timeFilter} - ${granularity}. Checking dependencies.`
		);

		// Skip if still loading initial data or if artist details aren't ready yet
		if (
			isLoading ||
			isLoadingArtists ||
			tracks.length === 0 ||
			artistsDetails.size === 0
		) {
			console.log(
				'GenreTrends: Dependencies not ready, clearing component state.'
			);
			setGenreData([]);
			setTopGenres([]);
			setPeriods([]);
			setProcessingData(false); // Ensure processing is false if dependencies not met
			return;
		}

		console.log(
			`GenreTrends: Dependencies READY for ${timeFilter} - ${granularity}. Processing data.`
		);
		setProcessingData(true);

		try {
			// Filter tracks based on timeFilter
			const filteredTracks = filterTracksByTime(tracks, timeFilter);

			// Group tracks by quarter
			const genresByQuarter: Record<string, Record<string, number>> = {};

			filteredTracks.forEach((item) => {
				const date = new Date(item.added_at);
				const year = date.getFullYear();
				let periodKey: string;

				if (timeFilter === 'all' && granularity === 'yearly') {
					periodKey = String(year);
				} else {
					const quarter = Math.floor(date.getMonth() / 3) + 1;
					periodKey = `${year}-Q${quarter}`;
				}

				if (!genresByQuarter[periodKey]) {
					genresByQuarter[periodKey] = {};
				}

				// Count genres for each track's artists
				item.track.artists.forEach((artist: { id: string }) => {
					const artistDetail = artistsDetails.get(artist.id);
					if (!artistDetail) return;

					const genres: string[] = artistDetail.genres || [];
					genres.forEach((genre: string) => {
						if (!genresByQuarter[periodKey][genre]) {
							genresByQuarter[periodKey][genre] = 0;
						}
						genresByQuarter[periodKey][genre]++;
					});
				});
			});

			// Convert to array format
			const genreTimeData: GenreTimeData[] = [];
			for (const period in genresByQuarter) {
				for (const genre in genresByQuarter[period]) {
					genreTimeData.push({
						period,
						genre,
						count: genresByQuarter[period][genre],
					});
				}
			}

			// Get top genres overall
			const genreCounts: Record<string, number> = {};
			genreTimeData.forEach((item) => {
				if (!genreCounts[item.genre]) {
					genreCounts[item.genre] = 0;
				}
				genreCounts[item.genre] += item.count;
			});

			const sortedGenres = Object.entries(genreCounts)
				.sort((a, b) => b[1] - a[1])
				.map((entry) => entry[0])
				.slice(0, 20); // Take top 12 genres

			// Get unique periods and sort them chronologically
			const uniquePeriods = [
				...new Set(genreTimeData.map((item) => item.period)),
			].sort();

			setTopGenres(sortedGenres);
			setPeriods(uniquePeriods);
			setGenreData(genreTimeData);

			// ADDED: Save processed data to cache
			setCachedData(
				currentCacheKey,
				{
					genreData: genreTimeData,
					topGenres: sortedGenres,
					periods: uniquePeriods,
				},
				GENRE_TRENDS_CACHE_TTL_MINUTES
			);
			console.log(
				`GenreTrends: Saved processed data to cache for ${timeFilter} - ${granularity}`
			);
		} catch (err) {
			console.error('Error processing genre trends data:', err);
		} finally {
			setProcessingData(false);
		}
	}, [
		tracks,
		artistsDetails,
		isLoading,
		isLoadingArtists,
		timeFilter,
		granularity,
	]);

	// Reset granularity when time filter changes away from 'all'
	useEffect(() => {
		if (timeFilter !== 'all') {
			setGranularity('quarterly');
		}
	}, [timeFilter]);

	// Filter tracks based on time selection
	const filterTracksByTime = (tracks: any[], filter: TimeFilter) => {
		if (filter === 'all') return tracks;

		const now = new Date();
		const cutoffDate = new Date();

		if (filter === '1year') {
			cutoffDate.setFullYear(now.getFullYear() - 1);
		} else if (filter === '2years') {
			cutoffDate.setFullYear(now.getFullYear() - 2);
		}

		return tracks.filter((item) => new Date(item.added_at) >= cutoffDate);
	};

	const isOverallLoading = isLoading; // Primary data fetch
	const isArtistDataLoading = isLoadingArtists && !isLoading; // Secondary fetch, after primary is done
	const isDataProcessing = processingData && !isLoading && !isLoadingArtists; // Client-side processing after all fetches

	const combinedProcessingState = isArtistDataLoading || isDataProcessing;
	const noDataToShow =
		!isOverallLoading &&
		!combinedProcessingState &&
		!error &&
		(genreData.length === 0 || topGenres.length === 0);

	return (
		<VisualizationContainer
			title="Your Genre Evolution"
			isLoading={isOverallLoading}
			isProcessing={combinedProcessingState} // Covers artist loading and data processing phases
			error={error}
			isEmpty={noDataToShow}
			emptyDataMessage="Not enough listening data to visualize genre trends."
		>
			{/* {console.log('GenreTrends - isLoading:', isLoading, 'isProcessing:', combinedProcessingState, 'error:', error, 'isEmpty:', noDataToShow)} */}
			{/* {console.log('GenreTrends - Data State: topGenres', topGenres.slice(0,3), 'periods', periods.slice(0,3), 'sample genreData', genreData.slice(0,3))} */}
			<div className="flex flex-col">
				{/* Filter buttons will be part of the children, so they are interactive during processing */}
				<div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-end mb-4 sm:mb-6 space-y-2 sm:space-y-0 sm:space-x-2">
					{timeFilter === 'all' && (
						<div className="flex items-center space-x-2 text-sm self-end sm:self-center">
							<span className="text-spotify-light-gray text-xs">
								Granularity:
							</span>
							<button
								onClick={() => setGranularity('quarterly')}
								className={`px-2 py-0.5 rounded-full text-xs ${
									granularity === 'quarterly'
										? 'bg-spotify-green text-black'
										: 'bg-spotify-light-black text-spotify-light-gray'
								}`}
							>
								Quarterly
							</button>
							<button
								onClick={() => setGranularity('yearly')}
								className={`px-2 py-0.5 rounded-full text-xs ${
									granularity === 'yearly'
										? 'bg-spotify-green text-black'
										: 'bg-spotify-light-black text-spotify-light-gray'
								}`}
							>
								Yearly
							</button>
						</div>
					)}
					<div className="flex space-x-2 text-sm self-end sm:self-center">
						{' '}
						{/* Time filter buttons */}
						<button
							onClick={() => setTimeFilter('1year')}
							className={`px-3 py-1 rounded-full ${
								timeFilter === '1year'
									? 'bg-spotify-green text-black'
									: 'bg-spotify-light-black text-spotify-light-gray'
							}`}
						>
							Past Year
						</button>
						<button
							onClick={() => setTimeFilter('2years')}
							className={`px-3 py-1 rounded-full ${
								timeFilter === '2years'
									? 'bg-spotify-green text-black'
									: 'bg-spotify-light-black text-spotify-light-gray'
							}`}
						>
							Past 2 Years
						</button>
						<button
							onClick={() => setTimeFilter('all')}
							className={`px-3 py-1 rounded-full ${
								timeFilter === 'all'
									? 'bg-spotify-green text-black'
									: 'bg-spotify-light-black text-spotify-light-gray'
							}`}
						>
							All Time
						</button>
					</div>
				</div>

				<div className="overflow-x-auto pb-4">
					<div className="min-w-[600px]">
						{/* Legend */}
						<div className="flex flex-wrap gap-2 mb-6">
							{topGenres.map((genre, index) => (
								<div key={genre} className="flex items-center gap-1.5">
									<div
										className={`w-3 h-3 rounded-full ${colorPalette[index % colorPalette.length]}`}
									></div>
									<span className="text-xs text-spotify-light-gray capitalize">
										{genre}
									</span>
								</div>
							))}
						</div>

						{/* Chart */}
						<div className="space-y-4">
							{periods.map((period) => {
								// console.log(`GenreTrends - Processing period: ${period}`);
								// Calculate total count for this period to determine percentages
								const periodTotal = topGenres.reduce((sum, genre) => {
									const entry = genreData.find(
										(d) => d.period === period && d.genre === genre
									);
									return sum + (entry?.count || 0);
								}, 0);
								// console.log(`GenreTrends - Period: ${period}, periodTotal: ${periodTotal}`);

								// If periodTotal is 0, it means none of the topGenres appear in this period, so we can skip rendering it or render an empty state for it.
								// However, the current logic will just render an empty bar if all percentages are 0.

								return (
									<div key={period} className="flex items-center">
										<div className="w-16 flex-shrink-0 text-xs text-spotify-light-gray">
											{period}
										</div>
										<div className="flex-grow h-8 flex rounded-full overflow-hidden">
											{topGenres.map((genre, index) => {
												const entry = genreData.find(
													(d) => d.period === period && d.genre === genre
												);
												const count = entry?.count || 0;
												const percentage =
													periodTotal > 0 ? (count / periodTotal) * 100 : 0;
												// console.log(`GenreTrends - Period: ${period}, Genre: ${genre}, Count: ${count}, Percentage: ${percentage}`);

												return percentage > 0 ? (
													<div
														key={genre}
														className={`h-full ${colorPalette[index % colorPalette.length]}`}
														style={{ width: `${percentage}%` }}
														title={`${genre}: ${Math.round(percentage)}%`}
													></div>
												) : null;
											})}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>

				<p className="text-sm text-spotify-light-gray mt-6">
					This visualization shows how your genre preferences have changed over
					time by quarter.
					{timeFilter !== 'all' && ' Adjust the time range to see more data.'}
				</p>
			</div>
		</VisualizationContainer>
	);
}
