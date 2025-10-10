'use client';

import React, { useState } from 'react';
import { TimeRange } from '@/hooks/useUserStats';

interface TimeRangeSelectorProps {
  onChange: (timeRange: TimeRange) => void;
  initialTimeRange?: TimeRange;
}

export default function TimeRangeSelector({
  onChange,
  initialTimeRange = 'medium_term',
}: TimeRangeSelectorProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);

  const options: { value: TimeRange; label: string }[] = [
    { value: 'short_term', label: 'Last 4 Weeks' },
    { value: 'medium_term', label: 'Last 6 Months' },
    { value: 'long_term', label: 'All Time' },
  ];

  const handleChange = (newTimeRange: TimeRange) => {
    // Update local state
    setTimeRange(newTimeRange);
    // Call the onChange prop to update parent component
    onChange(newTimeRange);
  };

  return (
    <div className="flex justify-center space-x-2 mb-6">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleChange(option.value)}
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
