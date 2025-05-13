'use client';

import { useLikedTracks } from '@/hooks/useLikedTracks';
import React, { useState, useEffect, useRef } from 'react';
import VisualizationContainer from './VisualizationContainer';

interface MonthlyData {
	month: string;
	count: number;
}

const CHUNK_SIZE = 250; // Process 250 tracks per chunk

export default function ListeningTrends() {
	const {
		tracks,
		isLoading,
		isLoadingRange,
		error,
		currentTimeRange,
		setTimeRange,
	} = useLikedTracks();
	const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
	const [maxCount, setMaxCount] = useState(0);
	const [processingData, setProcessingData] = useState(false);

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

	// Process data when tracks are loaded
	useEffect(() => {
		if (processingTimeoutRef.current) {
			clearTimeout(processingTimeoutRef.current);
		}

		// Only set to empty state if we have no data yet
		if (isLoading && tracks.length === 0) {
			setMonthlyData([]);
			setMaxCount(0);
			setProcessingData(false);
			return;
		}

		// If we have tracks, process them incrementally
		if (tracks.length > 0) {
			setProcessingData(true);

			let currentTracksByMonth: Record<string, number> = {};
			let currentMaxVal = 0;

			const processChunk = (startIndex: number) => {
				if (!isMountedRef.current) return;

				const endIndex = Math.min(startIndex + CHUNK_SIZE, tracks.length);
				for (let i = startIndex; i < endIndex; i++) {
					const item = tracks[i];
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
		}
	}, [tracks, isLoading]);

	// Determine UI states
	const isOverallLoading = isLoading && tracks.length === 0;
	const isIncrementallyProcessing = processingData && !isOverallLoading;
	const hasData = monthlyData.length > 0;

	const formatMonthLabel = (monthStr: string) => {
		const [year, month] = monthStr.split('-');
		return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' })} ${year}`;
	};

	return (
		<VisualizationContainer
			title="Your Listening Trends"
			isLoading={isOverallLoading}
			isProcessing={isIncrementallyProcessing}
			error={error}
			isEmpty={!isOverallLoading && !error && !hasData && !processingData}
			emptyDataMessage="No listening data available to visualize after processing."
		>
			{isLoadingRange[currentTimeRange] && (
				<div className="mb-2 text-xs text-yellow-400">
					This period is still loading. Data may be incomplete.
				</div>
			)}
			{hasData && (
				<>
					{/* Time filter buttons */}
					<div className="flex justify-end mb-4 space-x-2 text-sm">
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

					{/* Chart Content */}
					<div className="flex h-64">
						<div className="flex items-center justify-center w-10 text-xs text-spotify-light-gray shrink-0 mr-2">
							<span className="transform -rotate-90 whitespace-nowrap">
								Tracks / Month
							</span>
						</div>
						<div className="flex-grow h-full flex items-end space-x-2 overflow-x-auto pb-4">
							{monthlyData.map((data) => (
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
							))}
						</div>
					</div>

					<div className="flex justify-between text-sm text-spotify-light-gray mt-8">
						<div>Timeline of songs you've liked</div>
						<div>
							Total: {monthlyData.reduce((sum, data) => sum + data.count, 0)}{' '}
							tracks
						</div>
					</div>
				</>
			)}
		</VisualizationContainer>
	);
}
