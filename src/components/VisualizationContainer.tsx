import React, { Suspense, useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner'; // Assuming LoadingSpinner is available

type VisualizationContainerProps = {
	title: string;
	children: React.ReactNode;
	className?: string;
	isLoading?: boolean;
	isProcessing?: boolean;
	error?: string | null;
	isEmpty?: boolean;
	emptyDataMessage?: string;
};

function VisualizationSkeleton() {
	return (
		<div className="bg-spotify-dark-gray rounded-lg p-6 animate-pulse w-full">
			<div className="h-7 w-3/4 sm:w-1/2 bg-spotify-medium-gray/50 rounded mb-6"></div>{' '}
			{/* Adjusted for title */}
			<div className="h-64 bg-spotify-medium-gray/30 rounded"></div>{' '}
			{/* Placeholder for chart area */}
		</div>
	);
}

function ErrorDisplay({ message }: { message: string }) {
	return (
		<div className="text-center p-6 text-spotify-red">
			<p>{message}</p>
		</div>
	);
}

function EmptyDataDisplay({ message }: { message: string }) {
	return (
		<div className="text-center p-12 text-spotify-light-gray">
			<p>{message}</p>
		</div>
	);
}

export default function VisualizationContainer({
	title,
	children,
	className = 'mb-8',
	isLoading = false,
	isProcessing = false,
	error = null,
	isEmpty = false,
	emptyDataMessage = 'No data available to display.',
}: VisualizationContainerProps) {
	// Add state to track minimum loading time and initial mount
	const [showLoading, setShowLoading] = useState(true); // Start with loading true
	const [showProcessing, setShowProcessing] = useState(false);
	const [isInitialMount, setIsInitialMount] = useState(true);

	// Handle initial mount
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsInitialMount(false);
		}, 1000); // Keep initial loading state for 1 second
		return () => clearTimeout(timer);
	}, []);

	// Handle loading state
	useEffect(() => {
		let loadingTimer: NodeJS.Timeout;
		if (isLoading || isInitialMount) {
			setShowLoading(true);
		} else {
			// Keep loading visible for at least 500ms after initial mount
			loadingTimer = setTimeout(() => {
				setShowLoading(false);
			}, 500);
		}
		return () => clearTimeout(loadingTimer);
	}, [isLoading, isInitialMount]);

	// Handle processing state
	useEffect(() => {
		let processingTimer: NodeJS.Timeout;
		if (isProcessing) {
			setShowProcessing(true);
		} else {
			// Keep processing visible for at least 300ms
			processingTimer = setTimeout(() => {
				setShowProcessing(false);
			}, 300);
		}
		return () => clearTimeout(processingTimer);
	}, [isProcessing]);

	return (
		<div
			className={`${className} bg-spotify-dark-gray rounded-lg p-6 w-full relative`}
		>
			<h3 className="text-xl font-bold text-spotify-white mb-6">{title}</h3>

			{showLoading && <VisualizationSkeleton />}

			{!showLoading && error && <ErrorDisplay message={error} />}

			{!showLoading && !error && isEmpty && (
				<EmptyDataDisplay message={emptyDataMessage} />
			)}

			{!showLoading && !error && !isEmpty && (
				<Suspense
					fallback={
						<div className="h-64 flex justify-center items-center">
							<LoadingSpinner size="lg" />
						</div>
					}
				>
					{children}
					{showProcessing && (
						<div className="absolute inset-0 bg-spotify-dark-gray/80 flex flex-col justify-center items-center rounded-lg z-50">
							<LoadingSpinner size="md" />
							<p className="text-spotify-light-gray mt-2 text-sm">
								Processing data...
							</p>
						</div>
					)}
				</Suspense>
			)}
		</div>
	);
}
