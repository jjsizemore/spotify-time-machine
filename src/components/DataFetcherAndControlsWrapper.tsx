'use client';

import React from 'react';
import VisualizationContainer from './VisualizationContainer';

interface DataFetcherAndControlsWrapperProps {
	title: string;
	isLoading: boolean;
	isProcessing: boolean;
	error: Error | null | undefined;
	isEmpty: boolean;
	emptyDataMessage: string;
	currentTimeRange: 'PAST_YEAR' | 'PAST_TWO_YEARS' | 'ALL_TIME';
	setTimeRange: (range: 'PAST_YEAR' | 'PAST_TWO_YEARS' | 'ALL_TIME') => void;
	isLoadingRange: Record<'PAST_YEAR' | 'PAST_TWO_YEARS' | 'ALL_TIME', boolean>;
	children: React.ReactNode;
	// Optional props for elements specific to certain visualizations, like granularity controls
	granularityControls?: React.ReactNode;
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
}: DataFetcherAndControlsWrapperProps) {
	return (
		<VisualizationContainer
			title={title}
			isLoading={isLoading}
			isProcessing={isProcessing}
			error={error?.message}
			isEmpty={isEmpty}
			emptyDataMessage={emptyDataMessage}
		>
			{isLoadingRange[currentTimeRange] && (
				<div className="mb-2 text-xs text-yellow-400">
					This period is still loading. Data may be incomplete.
				</div>
			)}

			<div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-end mb-4 sm:mb-6 space-y-2 sm:space-y-0 sm:space-x-2">
				{granularityControls}
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

			{children}
		</VisualizationContainer>
	);
}
