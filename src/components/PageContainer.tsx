import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PageContainerProps {
	children: React.ReactNode;
	title?: string;
	description?: string;
	className?: string;
	isLoading?: boolean;
	showLoadingOverlay?: boolean;
	maxWidth?:
		| 'sm'
		| 'md'
		| 'lg'
		| 'xl'
		| '2xl'
		| '3xl'
		| '4xl'
		| '5xl'
		| '6xl'
		| '7xl'
		| 'full';
	isAuthLayout?: boolean;
}

export default function PageContainer({
	children,
	title,
	description,
	className = '',
	isLoading = false,
	showLoadingOverlay = true,
	maxWidth = '7xl',
	isAuthLayout = false,
}: PageContainerProps) {
	// Component-specific loading state only
	if (isLoading && showLoadingOverlay) {
		return (
			<div className="min-h-screen bg-spotify-black flex items-center justify-center">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	const maxWidthClass = maxWidth === 'full' ? 'w-full' : `max-w-${maxWidth}`;

	// Auth layout is simplified with centered content
	if (isAuthLayout) {
		return (
			<div className="min-h-screen bg-spotify-black flex items-center justify-center">
				<main className={`p-6 ${maxWidthClass} mx-auto ${className}`}>
					{children}
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-spotify-black">
			<main className={`p-6 ${maxWidthClass} mx-auto ${className} pb-20`}>
				{title && (
					<h1 className="text-3xl font-bold text-spotify-light-gray mb-2">
						{title}
					</h1>
				)}
				{description && (
					<p className="text-spotify-light-gray mb-8">{description}</p>
				)}
				{children}
			</main>
		</div>
	);
}
