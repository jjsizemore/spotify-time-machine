'use client';

import {
	InternalTimeRange,
	SpotifyTimeRange,
	TimeRangeDisplay,
	mapToInternalTimeRange,
	mapToSpotifyTimeRange,
} from '@/lib/timeRanges';
import React, { useState } from 'react';
import Toast from './Toast';
import VisualizationContainer from './VisualizationContainer';

interface DataFetcherAndControlsWrapperProps {
	title: string;
	isLoading: boolean;
	isProcessing: boolean;
	error: Error | null | undefined;
	isEmpty: boolean;
	emptyDataMessage: string;
	currentTimeRange: SpotifyTimeRange | InternalTimeRange;
	setTimeRange: (range: SpotifyTimeRange | InternalTimeRange) => void;
	isLoadingRange: Record<InternalTimeRange, boolean>;
	children: React.ReactNode;
	// Optional props for elements specific to certain visualizations, like granularity controls
	granularityControls?: React.ReactNode;
	// Time range display configuration
	timeRangeDisplay?: TimeRangeDisplay[];
}

export default function DataFetcherAndControlsWrapper({
	title,
	isLoading,
	isProcessing,
	error,
	isEmpty,
	emptyDataMessage,
	currentTimeRange,
	setTimeRange,
	isLoadingRange,
	children,
	granularityControls,
	timeRangeDisplay,
}: DataFetcherAndControlsWrapperProps) {
	const [toast, setToast] = useState<string | null>(null);

	const handleTimeRangeClick = (spotifyRange: SpotifyTimeRange) => {
		// Determine if we should use internal or Spotify ranges based on current time range
		const isUsingInternalRange =
			typeof currentTimeRange === 'string' &&
			['PAST_YEAR', 'PAST_TWO_YEARS', 'ALL_TIME'].includes(currentTimeRange);

		// Convert to internal range for checking loading state
		const internalRange = mapToInternalTimeRange(spotifyRange);

		if (isLoadingRange[internalRange]) {
			setToast('Data for this period is still loading…');
			setTimeout(() => setToast(null), 2500);
			return;
		}

		// Set the appropriate range type based on what the component is using
		setTimeRange(isUsingInternalRange ? internalRange : spotifyRange);
	};

	// Use provided display configuration or default to Spotify's time ranges
	const displayConfig = timeRangeDisplay || [
		{ value: 'short_term', label: 'Last 4 Weeks' },
		{ value: 'medium_term', label: 'Last 6 Months' },
		{ value: 'long_term', label: 'All Time' },
	];

	// Convert current time range to Spotify range for display comparison
	const currentSpotifyRange =
		typeof currentTimeRange === 'string' &&
		['PAST_YEAR', 'PAST_TWO_YEARS', 'ALL_TIME'].includes(currentTimeRange)
			? mapToSpotifyTimeRange(currentTimeRange as InternalTimeRange)
			: (currentTimeRange as SpotifyTimeRange);

	return (
		<VisualizationContainer
			title={title}
			isLoading={isLoading}
			isProcessing={isProcessing}
			error={error?.message}
			isEmpty={isEmpty}
			emptyDataMessage={emptyDataMessage}
		>
			{isLoadingRange[mapToInternalTimeRange(currentSpotifyRange)] && (
				<div className="mb-2 text-xs text-yellow-400">
					This period is still loading. Data may be incomplete.
				</div>
			)}

			{/* Toast notification */}
			{toast && (
				<div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
					<Toast
						message={toast}
						onDismiss={() => setToast(null)}
						type="warning"
					/>
				</div>
			)}

			<div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-end mb-4 sm:mb-6 space-y-2 sm:space-y-0 sm:space-x-2">
				{granularityControls}
				<div className="flex space-x-2 text-sm self-end sm:self-center">
					{displayConfig.map(({ value, label }) => (
						<button
							key={value}
							onClick={() => handleTimeRangeClick(value)}
							className={`px-3 py-1 rounded-full transition font-medium ${
								currentSpotifyRange === value
									? 'bg-spotify-green text-black'
									: 'bg-spotify-light-black text-spotify-light-gray hover:bg-spotify-medium-gray/50'
							}${
								isLoadingRange[mapToInternalTimeRange(value)]
									? ' opacity-60 grayscale cursor-not-allowed'
									: ' cursor-pointer'
							}`}
						>
							{label}
						</button>
					))}
				</div>
			</div>

			<div className="relative">
				{/* Content */}
				<div className={`${isLoading || isProcessing ? 'opacity-50' : ''}`}>
					{children}
				</div>
			</div>
		</VisualizationContainer>
	);
}
