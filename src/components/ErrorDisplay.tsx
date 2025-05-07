import React from 'react';

interface ErrorDisplayProps {
  message: string;
  retry?: () => void;
}

export default function ErrorDisplay({ message, retry }: ErrorDisplayProps) {
  return (
    <div className="rounded-lg bg-red-900/30 border border-red-500 p-4 text-center">
      <p className="text-red-300 mb-2">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-md text-sm transition"
        >
          Try Again
        </button>
      )}
    </div>
  );
}