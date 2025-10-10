import React, { useState } from 'react';
import { getTextStyle } from '@/lib/styleUtils';

interface Track {
  id: string;
  name: string;
  album: {
    name: string;
    images: Array<{
      url: string;
      height?: number;
      width?: number;
    }>;
  };
  artists: Array<{ id: string; name: string }>;
  duration_ms: number;
  preview_url: string | null;
}

interface SavedTrack {
  added_at: string;
  track: Track;
}

interface MonthlyTrackListProps {
  month: string;
  tracks: SavedTrack[];
  expanded: boolean;
  onToggle: (month: string) => void;
  onCreatePlaylist: (month: string, tracks: SavedTrack[]) => void;
  renderTrackItem: (track: SavedTrack) => React.ReactNode;
}

export default function MonthlyTrackList({
  month,
  tracks,
  expanded,
  onToggle,
  onCreatePlaylist,
  renderTrackItem,
}: MonthlyTrackListProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="bg-spotify-dark-gray rounded-lg overflow-hidden">
      {/* Month Header */}
      <div
        className="bg-spotify-medium-gray py-4 px-6 flex justify-between items-center cursor-pointer"
        style={getTextStyle(hovered === month, expanded)}
        onMouseOver={() => setHovered(month)}
        onMouseOut={() => setHovered(null)}
        onClick={() => onToggle(month)}
      >
        <h2
          className="text-xl font-bold text-spotify-white"
          style={getTextStyle(hovered === month, expanded)}
        >
          {month} • {tracks.length} tracks
        </h2>
        <div className="flex gap-4 items-center">
          <button
            className="bg-spotify-green text-spotify-black font-medium px-4 py-2 rounded-full hover:bg-spotify-green/90 transition text-sm cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onCreatePlaylist(month, tracks);
            }}
          >
            Create Playlist
          </button>
          <span className="text-white text-2xl" style={getTextStyle(hovered === month, expanded)}>
            {expanded ? '−' : '+'}
          </span>
        </div>
      </div>

      {/* Track List (only show when expanded) */}
      {expanded && (
        <div className="px-6 py-4">
          <div className="space-y-3">{tracks.map((savedTrack) => renderTrackItem(savedTrack))}</div>
        </div>
      )}
    </div>
  );
}
