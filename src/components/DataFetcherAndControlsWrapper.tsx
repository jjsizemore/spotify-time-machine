'use client';

import { Toast } from 'flowbite-react';
import React, { useState } from 'react';
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
	const [toast, setToast] = useState<string | null>(null);

	const handleTimeRangeClick = (
		range: 'PAST_YEAR' | 'PAST_TWO_YEARS' | 'ALL_TIME'
	) => {
		if (isLoadingRange[range]) {
			setToast('Data for this period is still loading…');
			setTimeout(() => setToast(null), 2500);
			return;
		}
		setTimeRange(range);
	};

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

			{/* Toast notification */}
			{toast && (
				<div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
					<Toast className="flex items-center w-full max-w-xs p-4 bg-spotify-dark-gray text-spotify-yellow rounded-lg shadow-sm pointer-events-auto relative">
						{/* Icon */}
						<div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-spotify-green bg-spotify-black rounded-lg">
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
								/>
							</svg>
						</div>
						{/* Message */}
						<div className="ml-3 text-sm font-normal">{toast}</div>
						{/* Dismiss Button */}
						<button
							type="button"
							onClick={() => setToast(null)}
							className="ms-auto -mx-1.5 -my-1.5 bg-spotify-dark-gray text-spotify-yellow hover:text-spotify-green rounded-lg focus:ring-2 focus:ring-spotify-green p-1.5 hover:bg-spotify-medium-gray/40 inline-flex items-center justify-center h-8 w-8 absolute top-2 right-2"
							aria-label="Close"
							style={{ lineHeight: 0 }}
						>
							<span className="sr-only">Close</span>
							<svg
								className="w-3 h-3"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								viewBox="0 0 14 14"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M1 1l12 12M13 1L1 13"
								/>
							</svg>
						</button>
					</Toast>
				</div>
			)}

			<div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-end mb-4 sm:mb-6 space-y-2 sm:space-y-0 sm:space-x-2">
				{granularityControls}
				<div className="flex space-x-2 text-sm self-end sm:self-center">
					<button
						onClick={() => handleTimeRangeClick('PAST_YEAR')}
						className={`px-3 py-1 rounded-full transition font-medium ${currentTimeRange === 'PAST_YEAR' ? 'bg-spotify-green text-black' : 'bg-spotify-light-black text-spotify-light-gray hover:bg-spotify-medium-gray/50'}${isLoadingRange['PAST_YEAR'] ? ' opacity-60 grayscale cursor-not-allowed' : ' cursor-pointer'}`}
					>
						Past Year
					</button>
					<button
						onClick={() => handleTimeRangeClick('PAST_TWO_YEARS')}
						className={`px-3 py-1 rounded-full transition font-medium ${currentTimeRange === 'PAST_TWO_YEARS' ? 'bg-spotify-green text-black' : 'bg-spotify-light-black text-spotify-light-gray hover:bg-spotify-medium-gray/50'}${isLoadingRange['PAST_TWO_YEARS'] ? ' opacity-60 grayscale cursor-not-allowed' : ' cursor-pointer'}`}
					>
						Past 2 Years
					</button>
					<button
						onClick={() => handleTimeRangeClick('ALL_TIME')}
						className={`px-3 py-1 rounded-full transition font-medium ${currentTimeRange === 'ALL_TIME' ? 'bg-spotify-green text-black' : 'bg-spotify-light-black text-spotify-light-gray hover:bg-spotify-medium-gray/50'}${isLoadingRange['ALL_TIME'] ? ' opacity-60 grayscale cursor-not-allowed' : ' cursor-pointer'}`}
					>
						All Time
					</button>
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
