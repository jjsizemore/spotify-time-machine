'use client';

import { useLikedArtists } from '@/hooks/useLikedArtists';
import { timeRangeDisplays } from '@/lib/timeRanges';
import { useEffect, useRef, useState } from 'react';
import DataFetcherAndControlsWrapper from '../controls/DataFetcherAndControlsWrapper';
import GranularitySelector, {
	GranularityOption,
} from '../controls/GranularitySelector';

interface GenreTimeData {
	genre: string;
	period: string; // Format: 'YYYY-Q1', 'YYYY-Q2', etc.
	count: number;
}

const CHUNK_SIZE = 250; // Process 250 tracks per chunk

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
		getCompactArtists,
	} = useLikedArtists();
	const [genreData, setGenreData] = useState<GenreTimeData[]>([]);
	const [topGenres, setTopGenres] = useState<string[]>([]);
	const [periods, setPeriods] = useState<string[]>([]);
	const [processingData, setProcessingData] = useState(false);
	const [granularity, setGranularity] = useState<'quarterly' | 'yearly'>(
		'quarterly'
	);
	const [hoveredGranularity, setHoveredGranularity] = useState<string | null>(
		null
	);
	const isMountedRef = useRef(true);
	const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
			if (processingTimeoutRef.current) {
				clearTimeout(processingTimeoutRef.current);
			}
		};
	}, []);

	// Process the genre data whenever we get new tracks or artist details
	useEffect(() => {
		// Skip if we don't have the minimum data needed
		if (isLoading || tracks.length === 0 || artistsDetails.size === 0) {
			setProcessingData(false);
			return;
		}

		setProcessingData(true);

		try {
			// Get compact artists for better performance
			const compactArtists = getCompactArtists();

			// Group tracks by period
			const genresByPeriod: Record<string, Record<string, number>> = {};
			let currentGenreTimeData: GenreTimeData[] = [];
			let currentTopGenres: string[] = [];
			let currentPeriods: string[] = [];

			const processChunk = (startIndex: number) => {
				if (!isMountedRef.current) return;

				const endIndex = Math.min(startIndex + CHUNK_SIZE, tracks.length);

				// Process current chunk
				for (let i = startIndex; i < endIndex; i++) {
					const item = tracks[i];
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

					// Count genres for each track's artists using compact data
					item.track.artists.forEach((artist: { id: string }) => {
						const artistDetail = compactArtists.get(artist.id);
						if (!artistDetail) return;

						const genres: string[] = artistDetail.genres || [];
						genres.forEach((genre: string) => {
							if (!genresByPeriod[periodKey][genre]) {
								genresByPeriod[periodKey][genre] = 0;
							}
							genresByPeriod[periodKey][genre]++;
						});
					});
				}

				// Convert to array format for current state
				currentGenreTimeData = [];
				for (const period in genresByPeriod) {
					for (const genre in genresByPeriod[period]) {
						currentGenreTimeData.push({
							period,
							genre,
							count: genresByPeriod[period][genre],
						});
					}
				}

				// Get top genres overall for current state
				const genreCounts: Record<string, number> = {};
				currentGenreTimeData.forEach((item) => {
					if (!genreCounts[item.genre]) {
						genreCounts[item.genre] = 0;
					}
					genreCounts[item.genre] += item.count;
				});

				currentTopGenres = Object.entries(genreCounts)
					.sort((a, b) => b[1] - a[1])
					.map((entry) => entry[0])
					.slice(0, 20); // Take top 20 genres

				// Get unique periods and sort them chronologically
				currentPeriods = [
					...new Set(currentGenreTimeData.map((item) => item.period)),
				].sort();

				if (isMountedRef.current) {
					setTopGenres(currentTopGenres);
					setPeriods(currentPeriods);
					setGenreData(currentGenreTimeData);
				}

				if (endIndex < tracks.length) {
					processingTimeoutRef.current = setTimeout(
						() => processChunk(endIndex),
						0
					);
				} else {
					if (isMountedRef.current) {
						setProcessingData(false);
					}
				}
			};

			// Start processing immediately
			processChunk(0);
		} catch (err) {
			console.error('Error processing genre trends data:', err);
			setProcessingData(false);
		}
	}, [
		tracks,
		artistsDetails,
		currentTimeRange,
		granularity,
		getCompactArtists,
	]);

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

	const granularityOptions: GranularityOption[] = [
		{ value: 'quarterly', label: 'Quarterly' },
		{ value: 'yearly', label: 'Yearly' },
	];

	const granularityControls = currentTimeRange === 'ALL_TIME' && (
		<GranularitySelector
			options={granularityOptions}
			selectedValue={granularity}
			hoveredValue={hoveredGranularity}
			isDisabled={isLoading || isLoadingArtists || processingData}
			onSelect={(value) => setGranularity(value as 'quarterly' | 'yearly')}
			onHover={setHoveredGranularity}
		/>
	);

	return (
		<DataFetcherAndControlsWrapper
			title="Your Genre Evolution"
			isLoading={isOverallLoading}
			isProcessing={isDataProcessing}
			error={
				error ? (typeof error === 'string' ? new Error(error) : error) : null
			}
			isEmpty={noDataToShow}
			emptyDataMessage="Not enough listening data to visualize genre trends."
			currentTimeRange={currentTimeRange}
			setTimeRange={setTimeRange}
			isLoadingRange={isLoadingRange}
			granularityControls={granularityControls}
			timeRangeDisplay={timeRangeDisplays.visualization}
		>
			{hasPartialData && (
				<div className="flex flex-col">
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
											<div className="w-16 shrink-0 text-xs text-spotify-light-gray">
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
															title={`${genre.toUpperCase()}: ${Math.round(percentage)}%`}
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
		</DataFetcherAndControlsWrapper>
	);
}
