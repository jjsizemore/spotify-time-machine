import React from 'react';

interface ActionButtonProps {
	children: React.ReactNode;
	onClick?: () => void;
	type?: 'button' | 'submit' | 'reset';
	disabled?: boolean;
	className?: string;
	variant?: 'primary' | 'secondary';
}

export default function ActionButton({
	children,
	onClick,
	type = 'button',
	disabled = false,
	className = '',
	variant = 'primary',
}: ActionButtonProps) {
	const baseStyles =
		'px-6 py-3 rounded-full font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

	const variantStyles =
		variant === 'primary'
			? 'bg-spotify-green text-spotify-black hover:bg-spotify-green/90'
			: 'bg-spotify-medium-gray text-spotify-white hover:bg-spotify-medium-gray-hover';

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={`${baseStyles} ${variantStyles} ${className}`}
		>
			{children}
		</button>
	);
}
