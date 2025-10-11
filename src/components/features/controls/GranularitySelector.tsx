import React from 'react';
import { getTimeRangeButtonTextStyle } from '@/lib/styleUtils';

export interface GranularityOption {
  value: string;
  label: string;
}

interface GranularitySelectorProps {
  options: GranularityOption[];
  selectedValue: string;
  hoveredValue: string | null;
  isDisabled: boolean;
  onSelect: (value: string) => void;
  onHover: (value: string | null) => void;
}

export default function GranularitySelector({
  options,
  selectedValue,
  hoveredValue,
  isDisabled,
  onSelect,
  onHover,
}: GranularitySelectorProps) {
  return (
    <div className="flex items-center space-x-2 text-sm self-end sm:self-center">
      <span className="text-spotify-light-gray text-xs">Granularity:</span>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          disabled={isDisabled}
          style={getTimeRangeButtonTextStyle(
            hoveredValue === option.value,
            selectedValue === option.value
          )}
          onMouseOver={() => onHover(option.value)}
          onFocus={() => onHover(option.value)}
          onMouseOut={() => onHover(null)}
          onBlur={() => onHover(null)}
          className={`px-2 py-0.5 rounded-full text-xs ${
            selectedValue === option.value
              ? 'bg-spotify-green'
              : 'bg-spotify-light-black hover:bg-spotify-medium-gray/50'
          }${isDisabled ? ' opacity-50 cursor-not-allowed' : ' cursor-pointer'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
