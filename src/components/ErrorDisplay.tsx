import React from 'react';
import ActionButton from './ActionButton';

interface ErrorDisplayProps {
	message: string;
	retry?: () => void;
}

export default function ErrorDisplay({ message, retry }: ErrorDisplayProps) {
	return (
		<div className="rounded-lg bg-red-900/30 border border-red-500 p-4 text-center">
			<p className="text-red-300 mb-2">{message}</p>
			{retry && (
				<ActionButton onClick={retry} variant="primary">
					Try Again
				</ActionButton>
			)}
		</div>
	);
}
