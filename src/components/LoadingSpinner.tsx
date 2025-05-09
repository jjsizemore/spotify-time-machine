import React from 'react';

interface LoadingSpinnerProps {
	size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
	const sizeClass = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12',
	};

	return (
		<div className="flex justify-center items-center">
			<div
				className={`${sizeClass[size]} border-4 border-spotify-medium-gray border-t-spotify-green rounded-full animate-spin`}
			></div>
		</div>
	);
}
