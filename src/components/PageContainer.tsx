import { useSession } from 'next-auth/react';
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
	maxWidth = '6xl',
	isAuthLayout = false,
}: PageContainerProps) {
	const { status } = useSession();

	// Global loading state based on session status
	if (status === 'loading' && showLoadingOverlay) {
		return (
			<div className="min-h-screen bg-spotify-black flex items-center justify-center">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	// Component-specific loading state
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
			<main className={`p-6 ${maxWidthClass} mx-auto ${className}`}>
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
