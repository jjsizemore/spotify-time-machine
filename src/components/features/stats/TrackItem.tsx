import { format } from 'date-fns';
import Image from 'next/image';
import type { ReactNode } from 'react';

interface Artist {
  id: string;
  name: string;
}

interface Album {
  name: string;
  images: Array<{
    url: string;
    height?: number;
    width?: number;
  }>;
}

interface Track {
  id: string;
  name: string;
  album: Album;
  artists: Artist[];
  duration_ms?: number;
  preview_url?: string | null;
}

interface TrackItemProps {
  track: Track;
  addedAt?: string;
  showAddedDate?: boolean;
  rightContent?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function TrackItem({
  track,
  addedAt,
  showAddedDate = false,
  rightContent,
  onClick,
  className = '',
}: TrackItemProps) {
  const artistNames = track.artists.map((a) => a.name).join(', ');

  return (
    <div
      className={`flex items-center p-2 rounded-md hover:bg-spotify-medium-gray/20 transition cursor-pointer ${className}`}
      onClick={onClick}
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
        <p className="text-xs text-spotify-light-gray truncate">{artistNames}</p>
        {showAddedDate && addedAt && (
          <p className="text-spotify-light-gray text-xs">
            Added {format(new Date(addedAt), 'MMM d, yyyy')}
          </p>
        )}
      </div>
      {rightContent && (
        <div className="text-xs text-spotify-light-gray shrink-0 ml-2">{rightContent}</div>
      )}
    </div>
  );
}
