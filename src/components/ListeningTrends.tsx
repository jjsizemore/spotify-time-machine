'use client';

import { useLikedTracks } from '@/hooks/useLikedTracks';
import React, { useState, useEffect, useRef } from 'react';
import { getCachedData, setCachedData } from '../lib/cacheUtils';
import VisualizationContainer from './VisualizationContainer';

// ADDED: Type for time filter
type TimeFilter = '1year' | '2years' | 'all';

interface MonthlyData {
	month: string;
	count: number;
}

const CHUNK_SIZE = 250; // Process 250 tracks per chunk
const LISTENING_TRENDS_CACHE_KEY = 'listeningTrendsData';
const LISTENING_TRENDS_CACHE_TTL_MINUTES = 60; // 1 hour TTL

export default function ListeningTrends() {
	const { tracks, isLoading, error } = useLikedTracks();
	const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
	const [maxCount, setMaxCount] = useState(0);
	const [processingData, setProcessingData] = useState(false);
	const [timeFilter, setTimeFilter] = useState<TimeFilter>('all'); // ADDED: Time filter state

	const isMountedRef = useRef(true);
	const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
			if (processingTimeoutRef.current) {
				clearTimeout(processingTimeoutRef.current);
			}
		};
	}, []);

	// ADDED: Helper function to filter tracks by time
	const filterTracksByTime = (
		tracksToFilter: typeof tracks,
		filter: TimeFilter
	) => {
		if (filter === 'all') return tracksToFilter;

		const now = new Date();
		const cutoffDate = new Date();

		if (filter === '1year') {
			cutoffDate.setFullYear(now.getFullYear() - 1);
		} else if (filter === '2years') {
			cutoffDate.setFullYear(now.getFullYear() - 2);
		}

		return tracksToFilter.filter(
			(item) => new Date(item.added_at) >= cutoffDate
		);
	};

	// Process data when tracks are loaded or filter changes
	useEffect(() => {
		if (processingTimeoutRef.current) {
			clearTimeout(processingTimeoutRef.current);
		}

		const currentCacheKey = `${LISTENING_TRENDS_CACHE_KEY}_${timeFilter}`; // MODIFIED: Dynamic cache key

		// Attempt to load from cache first
		if (!isLoading && monthlyData.length === 0) {
			// Keep this initial condition, or adjust if causing issues with filter changes
			const cachedTrendsData = getCachedData<MonthlyData[]>(currentCacheKey);
			if (cachedTrendsData && cachedTrendsData.length > 0) {
				if (isMountedRef.current) {
					setMonthlyData(cachedTrendsData);
					setMaxCount(
						Math.max(
							0,
							...cachedTrendsData.map((item: MonthlyData) => item.count)
						)
					);
					setProcessingData(false);
					console.log(
						`ListeningTrends: Loaded data from cache for ${timeFilter}`
					);
					return;
				}
			}
		}

		// Filter tracks based on the current timeFilter
		const filteredTracks = filterTracksByTime(tracks, timeFilter);

		if (isLoading && !filteredTracks.length) {
			// MODIFIED: Use filteredTracks
			setMonthlyData([]);
			setMaxCount(0);
			setProcessingData(false);
			return;
		}

		if (!isLoading && filteredTracks.length === 0) {
			// MODIFIED: Use filteredTracks
			setMonthlyData([]);
			setMaxCount(0);
			setProcessingData(false);
			return;
		}

		if (filteredTracks.length > 0) {
			// MODIFIED: Use filteredTracks
			setProcessingData(true);

			let currentTracksByMonth: Record<string, number> = {};
			let currentMaxVal = 0;

			const processChunk = (startIndex: number) => {
				if (!isMountedRef.current) return;

				const endIndex = Math.min(
					startIndex + CHUNK_SIZE,
					filteredTracks.length
				); // MODIFIED: Use filteredTracks
				for (let i = startIndex; i < endIndex; i++) {
					const item = filteredTracks[i]; // MODIFIED: Use filteredTracks
					const date = new Date(item.added_at);
					const month = (date.getMonth() + 1).toString().padStart(2, '0');
					const monthYear = `${date.getFullYear()}-${month}`;

					if (!currentTracksByMonth[monthYear]) {
						currentTracksByMonth[monthYear] = 0;
					}
					currentTracksByMonth[monthYear]++;
				}

				// Convert to array and sort chronologically for current state
				const monthlyDataArray: MonthlyData[] = Object.entries(
					currentTracksByMonth
				)
					.map(([month, count]) => ({
						month,
						count,
					}))
					.sort((a, b) => a.month.localeCompare(b.month));

				currentMaxVal = Math.max(
					0,
					...monthlyDataArray.map((item) => item.count)
				);

				if (isMountedRef.current) {
					setMonthlyData(monthlyDataArray);
					setMaxCount(currentMaxVal);
				}

				if (endIndex < filteredTracks.length) {
					// MODIFIED: Use filteredTracks
					processingTimeoutRef.current = setTimeout(
						() => processChunk(endIndex),
						0
					);
				} else {
					if (isMountedRef.current) {
						setProcessingData(false);
						setCachedData(
							currentCacheKey,
							monthlyDataArray,
							LISTENING_TRENDS_CACHE_TTL_MINUTES
						); // MODIFIED: Dynamic cache key
						console.log(
							`ListeningTrends: Saved processed data to cache for ${timeFilter}`
						);
					}
				}
			};
			processChunk(0);
		} else if (!isLoading) {
			// Handle case where filtered tracks are empty but not loading
			setMonthlyData([]);
			setMaxCount(0);
			setProcessingData(false);
		}

		return () => {
			if (processingTimeoutRef.current) {
				clearTimeout(processingTimeoutRef.current);
			}
		};
	}, [tracks, isLoading, timeFilter]); // MODIFIED: Add timeFilter to dependencies

	// Determine overall loading state for the container
	const isOverallLoading = isLoading && monthlyData.length === 0 && !error;

	// Determine if the container should show the processing overlay
	// True if tracks are being processed in chunks AND it's not the initial full load
	const isIncrementallyProcessing = processingData && !isOverallLoading;

	const formatMonthLabel = (monthStr: string) => {
		const [year, month] = monthStr.split('-');
		return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' })} ${year}`;
	};

	return (
		<VisualizationContainer
			title="Your Listening Trends"
			isLoading={isOverallLoading}
			isProcessing={isIncrementallyProcessing} // Pass the new processing state
			error={error}
			isEmpty={
				!isOverallLoading &&
				!error &&
				tracks.length > 0 &&
				monthlyData.length === 0 &&
				!processingData
			}
			emptyDataMessage="No listening data available to visualize after processing."
		>
			{/* ADDED: Time filter buttons */}
			<div className="flex justify-end mb-4 space-x-2 text-sm">
				{(['1year', '2years', 'all'] as TimeFilter[]).map((filter) => (
					<button
						key={filter}
						onClick={() => {
							setMonthlyData([]); // Clear current data to allow cache or new data to load
							setMaxCount(0); // Reset max count
							setTimeFilter(filter);
						}}
						className={`px-3 py-1 rounded-full ${
							timeFilter === filter
								? 'bg-spotify-green text-black'
								: 'bg-spotify-light-black text-spotify-light-gray'
						}`}
					>
						{filter === '1year' && 'Past Year'}
						{filter === '2years' && 'Past 2 Years'}
						{filter === 'all' && 'All Time'}
					</button>
				))}
			</div>

			{/* Log a few values for debugging the bar heights */}
			{(() => {
				console.log('ListeningTrends Debug:', {
					tracksCount: tracks.length,
					isLoading,
					processingData,
					error,
					maxCount,
					// monthlyDataSample: monthlyData.slice(0, 5), // Reduced verbosity
					// fullMonthlyData: monthlyData // Reduced verbosity
				});
				return null; // Prevent rendering issue
			})()}
			{/* NEW: Flex container for legend and chart */}
			<div className="flex h-64">
				{' '}
				{/* h-64 sets the overall height for this section */}
				{/* Legend */}
				<div className="flex items-center justify-center w-10 text-xs text-spotify-light-gray shrink-0 mr-2">
					<span className="transform -rotate-90 whitespace-nowrap">
						Tracks / Month
					</span>
				</div>
				{/* Chart Content (Original container, now with flex-grow and h-full) */}
				<div className="flex-grow h-full flex items-end space-x-2 overflow-x-auto pb-4">
					{monthlyData.map((data) => {
						// const barHeightPercentage = maxCount > 0 ? (data.count / maxCount) * 100 : 0; // Original debug line
						// console.log(`Month: ${data.month}, Count: ${data.count}, Max: ${maxCount}, Height%: ${barHeightPercentage}`);
						return (
							<div
								key={data.month}
								className="flex flex-col items-center min-w-[50px] h-full"
							>
								<div className="flex flex-col justify-end h-full w-full items-center">
									<div
										className="w-8 bg-spotify-green rounded-t-md"
										style={{
											height: `${maxCount > 0 ? (data.count / maxCount) * 100 : 0}%`,
											minHeight: '4px',
										}}
									/>
								</div>
								<div className="text-xs text-spotify-light-gray mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">
									{formatMonthLabel(data.month)}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<div className="flex justify-between text-sm text-spotify-light-gray mt-8">
				<div>Timeline of songs you've liked</div>
				<div>
					Total: {monthlyData.reduce((sum, data) => sum + data.count, 0)} tracks
				</div>
			</div>
		</VisualizationContainer>
	);
}
