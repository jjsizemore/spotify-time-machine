import { getTextStyle, getTimeRangeButtonTextStyle } from '@/lib/styleUtils';
import React, { useState } from 'react';

type Tab = 'artists' | 'tracks' | 'recent' | 'genres';

interface StatsTabsProps {
	activeTab: Tab;
	onChange: (tab: Tab) => void;
}

export default function StatsTabs({ activeTab, onChange }: StatsTabsProps) {
	const [hoveredTab, setHoveredTab] = useState<Tab | null>(null);

	const tabs: { id: Tab; label: string }[] = [
		{ id: 'artists', label: 'Top Artists' },
		{ id: 'tracks', label: 'Top Tracks' },
		{ id: 'genres', label: 'Top Genres' },
		{ id: 'recent', label: 'Recently Played' },
	];

	return (
		<div className="border-b border-spotify-medium-gray/30 mb-6">
			<div className="flex overflow-x-auto pb-2 -mb-2 scrollbar-hide">
				<div className="flex space-x-2 md:space-x-4 min-w-max">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => onChange(tab.id)}
							style={getTextStyle(hoveredTab === tab.id)}
							onMouseOver={() => setHoveredTab(tab.id)}
							onMouseOut={() => setHoveredTab(null)}
							className={`px-3 md:px-4 py-2 md:py-3 text-sm font-medium transition-colors relative whitespace-nowrap`}
						>
							{tab.label}
							{activeTab === tab.id && (
								<span className="absolute bottom-0 left-0 right-0 h-1 bg-spotify-green rounded-t-md"></span>
							)}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
