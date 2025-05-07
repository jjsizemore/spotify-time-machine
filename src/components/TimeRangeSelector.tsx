import React from 'react';
import { TimeRange } from '@/hooks/useUserStats';

interface TimeRangeSelectorProps {
  timeRange: TimeRange;
  onChange: (timeRange: TimeRange) => void;
}

export default function TimeRangeSelector({ timeRange, onChange }: TimeRangeSelectorProps) {
  const options: { value: TimeRange; label: string }[] = [
    { value: 'short_term', label: 'Last 4 Weeks' },
    { value: 'medium_term', label: 'Last 6 Months' },
    { value: 'long_term', label: 'All Time' },
  ];

  return (
    <div className="flex justify-center space-x-2 mb-6">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 text-sm rounded-full transition ${
            timeRange === option.value
              ? 'bg-spotify-green text-spotify-black font-bold'
              : 'bg-spotify-dark-gray text-spotify-light-gray hover:bg-spotify-medium-gray/50'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}