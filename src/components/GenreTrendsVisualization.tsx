'use client';

import { useLikedArtists } from '@/hooks/useLikedArtists';
import React, { useState, useEffect } from 'react';
import VisualizationContainer from './VisualizationContainer';

interface GenreTimeData {
	genre: string;
	period: string; // Format: 'YYYY-Q1', 'YYYY-Q2', etc.
	count: number;
}

export default function GenreTrendsVisualization() {
	const {
		tracks,
		isLoading,
		isLoadingRange,
		isLoadingArtists,
		error,
		artistsDetails,
		currentTimeRange,
		setTimeRange,
	} = useLikedArtists();
	const [genreData, setGenreData] = useState<GenreTimeData[]>([]);
	const [topGenres, setTopGenres] = useState<string[]>([]);
	const [periods, setPeriods] = useState<string[]>([]);
	const [processingData, setProcessingData] = useState(false);
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

	// Process the genre data whenever we get new tracks or artist details
	useEffect(() => {
		// Skip if we don't have the minimum data needed
		if (isLoading || tracks.length === 0 || artistsDetails.size === 0) {
			setProcessingData(false);
			return;
		}

		setProcessingData(true);

		try {
			// Group tracks by period
			const genresByPeriod: Record<string, Record<string, number>> = {};

			tracks.forEach((item) => {
				const date = new Date(item.added_at);
				const year = date.getFullYear();
				let periodKey: string;

				if (currentTimeRange === 'ALL_TIME' && granularity === 'yearly') {
					periodKey = String(year);
				} else {
					const quarter = Math.floor(date.getMonth() / 3) + 1;
					periodKey = `${year}-Q${quarter}`;
				}

				if (!genresByPeriod[periodKey]) {
					genresByPeriod[periodKey] = {};
				}

				// Count genres for each track's artists
				item.track.artists.forEach((artist: { id: string }) => {
					const artistDetail = artistsDetails.get(artist.id);
					if (!artistDetail) return;

					const genres: string[] = artistDetail.genres || [];
					genres.forEach((genre: string) => {
						if (!genresByPeriod[periodKey][genre]) {
							genresByPeriod[periodKey][genre] = 0;
						}
						genresByPeriod[periodKey][genre]++;
					});
				});
			});

			// Convert to array format
			const genreTimeData: GenreTimeData[] = [];
			for (const period in genresByPeriod) {
				for (const genre in genresByPeriod[period]) {
					genreTimeData.push({
						period,
						genre,
						count: genresByPeriod[period][genre],
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
				.slice(0, 20); // Take top 20 genres

			// Get unique periods and sort them chronologically
			const uniquePeriods = [
				...new Set(genreTimeData.map((item) => item.period)),
			].sort();

			setTopGenres(sortedGenres);
			setPeriods(uniquePeriods);
			setGenreData(genreTimeData);
		} catch (err) {
			console.error('Error processing genre trends data:', err);
		} finally {
			setProcessingData(false);
		}
	}, [tracks, artistsDetails, currentTimeRange, granularity]);

	// Reset granularity when time range changes away from 'ALL_TIME'
	useEffect(() => {
		if (currentTimeRange !== 'ALL_TIME') {
			setGranularity('quarterly');
		}
	}, [currentTimeRange]);

	// Combined processing state that includes initial loading and artist loading
	const isOverallLoading = isLoading && tracks.length === 0;
	const isDataProcessing =
		(isLoadingArtists || processingData) && !isOverallLoading;

	// Consider the visualization empty only if we have no data after loading completes
	const noDataToShow =
		!isOverallLoading &&
		!isDataProcessing &&
		!error &&
		(genreData.length === 0 || topGenres.length === 0);

	// Whether we should show partial data during progressive loading
	const hasPartialData =
		!isOverallLoading && genreData.length > 0 && topGenres.length > 0;

	return (
		<VisualizationContainer
			title="Your Genre Evolution"
			isLoading={isOverallLoading}
			isProcessing={isDataProcessing}
			error={error}
			isEmpty={noDataToShow}
			emptyDataMessage="Not enough listening data to visualize genre trends."
		>
			{isLoadingRange[currentTimeRange] && (
				<div className="mb-2 text-xs text-yellow-400">
					This period is still loading. Data may be incomplete.
				</div>
			)}
			{hasPartialData && (
				<div className="flex flex-col">
					<div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-end mb-4 sm:mb-6 space-y-2 sm:space-y-0 sm:space-x-2">
						{currentTimeRange === 'ALL_TIME' && (
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
							<button
								onClick={() => setTimeRange('PAST_YEAR')}
								className={`px-3 py-1 rounded-full ${
									currentTimeRange === 'PAST_YEAR'
										? 'bg-spotify-green text-black'
										: 'bg-spotify-light-black text-spotify-light-gray'
								}`}
							>
								Past Year
							</button>
							<button
								onClick={() => setTimeRange('PAST_TWO_YEARS')}
								className={`px-3 py-1 rounded-full ${
									currentTimeRange === 'PAST_TWO_YEARS'
										? 'bg-spotify-green text-black'
										: 'bg-spotify-light-black text-spotify-light-gray'
								}`}
							>
								Past 2 Years
							</button>
							<button
								onClick={() => setTimeRange('ALL_TIME')}
								className={`px-3 py-1 rounded-full ${
									currentTimeRange === 'ALL_TIME'
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
									const periodTotal = topGenres.reduce((sum, genre) => {
										const entry = genreData.find(
											(d) => d.period === period && d.genre === genre
										);
										return sum + (entry?.count || 0);
									}, 0);

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
						This visualization shows how your genre preferences have changed
						over time by quarter.
						{currentTimeRange !== 'ALL_TIME' &&
							' Adjust the time range to see more data.'}
					</p>
				</div>
			)}
		</VisualizationContainer>
	);
}
