import React from 'react';
import Image from 'next/image';
import { Track } from '@/hooks/useUserStats';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

interface TopTracksProps {
  tracks: Track[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function TopTracks({ tracks, isLoading, error, onRetry }: TopTracksProps) {
  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} retry={onRetry} />;
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center py-8 text-spotify-medium-gray">
        No top tracks found. Try listening to more music!
      </div>
    );
  }

  // Format milliseconds to minutes:seconds
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      {tracks.map((track) => (
        <div
          key={track.id}
          className="flex items-center p-2 rounded-md hover:bg-spotify-medium-gray/20 transition cursor-pointer"
        >
          <div className="w-12 h-12 shrink-0 relative mr-3 rounded overflow-hidden">
            <Image
              src={track.album.images[0]?.url || '/default-album.png'}
              alt={track.album.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="font-medium text-white truncate">{track.name}</h3>
            <p className="text-xs text-spotify-light-gray truncate">
              {track.artists.map(artist => artist.name).join(', ')}
            </p>
          </div>
          <div className="text-xs text-spotify-light-gray shrink-0 ml-2">
            {formatDuration(track.duration_ms)}
          </div>
        </div>
      ))}
    </div>
  );
}