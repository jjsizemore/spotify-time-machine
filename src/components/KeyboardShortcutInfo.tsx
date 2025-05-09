import React from 'react';

interface KeyboardKey {
	key: string;
}

interface KeyboardShortcutInfoProps {
	description: string;
	keys: KeyboardKey[];
	className?: string;
	align?: 'left' | 'center' | 'right';
}

export default function KeyboardShortcutInfo({
	description,
	keys,
	className = '',
	align = 'right',
}: KeyboardShortcutInfoProps) {
	const textAlign =
		align === 'left'
			? 'text-left'
			: align === 'center'
				? 'text-center'
				: 'text-right';

	return (
		<p className={`text-xs text-spotify-light-gray ${textAlign} ${className}`}>
			{description}{' '}
			{keys.map((keyItem, index) => (
				<React.Fragment key={index}>
					<kbd className="bg-spotify-medium-gray px-1.5 py-0.5 rounded text-xxs">
						{keyItem.key}
					</kbd>
					{index < keys.length - 1 && ' + '}
				</React.Fragment>
			))}
		</p>
	);
}
