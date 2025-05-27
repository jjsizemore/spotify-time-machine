import React, { Suspense, useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

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
	const [showLoading, setShowLoading] = useState(true);
	const [showProcessing, setShowProcessing] = useState(false);
	const [isInitialMount, setIsInitialMount] = useState(true);

	// Handle initial mount
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsInitialMount(false);
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	// Handle loading state
	useEffect(() => {
		let loadingTimer: NodeJS.Timeout;
		if (isLoading || isInitialMount) {
			setShowLoading(true);
		} else {
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

			{showLoading && (
				<div
					className="h-64 flex flex-col justify-center items-center"
					role="status"
				>
					<LoadingSpinner size="lg" />
					<p className="text-spotify-light-gray mt-2 text-sm">
						Loading data...
					</p>
				</div>
			)}

			{!showLoading && error && <ErrorDisplay message={error} />}

			{!showLoading && !error && isEmpty && (
				<EmptyDataDisplay message={emptyDataMessage} />
			)}

			{!showLoading && !error && !isEmpty && (
				<Suspense
					fallback={
						<div
							className="h-64 flex flex-col justify-center items-center"
							role="status"
						>
							<LoadingSpinner size="lg" />
						</div>
					}
				>
					{children}
					{showProcessing && (
						<div
							className="absolute inset-0 bg-spotify-dark-gray/90 flex flex-col justify-center items-center rounded-lg z-50"
							role="status"
						>
							<LoadingSpinner size="lg" />
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
