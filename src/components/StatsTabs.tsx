import React from 'react';

type Tab = 'artists' | 'tracks' | 'recent' | 'genres';

interface StatsTabsProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

export default function StatsTabs({ activeTab, onChange }: StatsTabsProps) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'artists', label: 'Top Artists' },
    { id: 'tracks', label: 'Top Tracks' },
    { id: 'genres', label: 'Top Genres' },
    { id: 'recent', label: 'Recently Played' },
  ];

  return (
    <div className="border-b border-spotify-medium-gray/30 mb-6">
      <div className="flex space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-spotify-green'
                : 'text-spotify-light-gray hover:text-white'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-spotify-green rounded-t-md"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}