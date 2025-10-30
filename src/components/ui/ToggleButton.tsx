'use client';

import React from 'react';

type ToggleButtonProps = {
  id: string; // Or a more generic 'value: string | number' if preferred
  label: string;
  isSelected: boolean;
  onClick: (id: string) => void; // Callback when the button is clicked
  className?: string; // Optional additional classes
};

const ToggleButton: React.FC<ToggleButtonProps> = ({
  id,
  label,
  isSelected,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-full text-sm transition-colors duration-150 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-spotify-green/50 cursor-pointer ${className} ${
        isSelected
          ? 'bg-spotify-green text-spotify-black hover:bg-spotify-green-darker'
          : 'bg-spotify-medium-gray text-spotify-white hover:bg-spotify-light-gray'
      }`}
    >
      {label}
    </button>
  );
};

export default ToggleButton;
