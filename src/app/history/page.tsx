'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSpotify } from '@/hooks/useSpotify';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import { format } from 'date-fns';
import Image from 'next/image';
import Navigation from '@/components/Navigation';

interface SavedTrack {
  added_at: string;
  track: {
    id: string;
    name: string;
    album: {
      name: string;
      images: { url: string; height: number; width: number }[];
    };
    artists: { id: string; name: string }[];
    duration_ms: number;
    preview_url: string | null;
  };
}

interface MonthlyTracks {
  month: string;
  tracks: SavedTrack[];
  expanded: boolean;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const spotifyApi = useSpotify();
  const [monthlyTracks, setMonthlyTracks] = useState<MonthlyTracks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextOffset, setNextOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Initial load of saved tracks
  useEffect(() => {
    const fetchSavedTracks = async () => {
      if (!spotifyApi.getAccessToken()) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await spotifyApi.getMySavedTracks({ limit: 50, offset: 0 });

        // Group tracks by month
        const groupedTracks = processAndGroupTracks(response.body.items);

        setMonthlyTracks(groupedTracks);
        setNextOffset(response.body.items.length);
        setHasMore(response.body.items.length < response.body.total);
      } catch (err) {
        console.error('Error fetching saved tracks:', err);
        setError('Failed to load your saved tracks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedTracks();
  }, [spotifyApi]);

  // Function to load more tracks
  const loadMoreTracks = async () => {
    if (!hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      const response = await spotifyApi.getMySavedTracks({ limit: 50, offset: nextOffset });

      // Group new tracks by month
      const newGroupedTracks = processAndGroupTracks(response.body.items);

      // Merge new tracks with existing months or add new months
      setMonthlyTracks(prevMonths => {
        const updatedMonths = [...prevMonths];

        newGroupedTracks.forEach(newMonth => {
          const existingMonthIndex = updatedMonths.findIndex(m => m.month === newMonth.month);

          if (existingMonthIndex >= 0) {
            // Merge tracks into existing month
            updatedMonths[existingMonthIndex].tracks = [
              ...updatedMonths[existingMonthIndex].tracks,
              ...newMonth.tracks
            ];
          } else {
            // Add new month
            updatedMonths.push(newMonth);
          }
        });

        // Sort months chronologically (newest first)
        return updatedMonths.sort((a, b) =>
          new Date(b.month).getTime() - new Date(a.month).getTime()
        );
      });

      setNextOffset(nextOffset + response.body.items.length);
      setHasMore(nextOffset + response.body.items.length < response.body.total);
    } catch (err) {
      console.error('Error loading more tracks:', err);
      setError('Failed to load more tracks. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  };

  // Process and group tracks by month
  const processAndGroupTracks = (items: any[]): MonthlyTracks[] => {
    const processedTracks: SavedTrack[] = items.map(item => ({
      added_at: item.added_at,
      track: {
        id: item.track.id,
        name: item.track.name,
        album: {
          name: item.track.album.name,
          images: item.track.album.images.map((img: any) => ({
            url: img.url,
            height: img.height || 0,
            width: img.width || 0,
          })),
        },
        artists: item.track.artists.map((artist: any) => ({
          id: artist.id,
          name: artist.name,
        })),
        duration_ms: item.track.duration_ms,
        preview_url: item.track.preview_url,
      }
    }));

    return groupTracksByMonth(processedTracks);
  };

  // Helper function to group tracks by month
  const groupTracksByMonth = (tracks: SavedTrack[]): MonthlyTracks[] => {
    const months: { [key: string]: SavedTrack[] } = {};

    tracks.forEach(item => {
      const added_at = new Date(item.added_at);
      const monthName = format(added_at, 'MMMM yyyy');

      if (!months[monthName]) {
        months[monthName] = [];
      }

      months[monthName].push(item);
    });

    // Convert to array and add expanded state
    return Object.entries(months).map(([month, tracks]) => ({
      month,
      tracks,
      expanded: false,
    })).sort((a, b) =>
      new Date(b.month).getTime() - new Date(a.month).getTime()
    );
  };

  // Toggle expanded state for a month
  const toggleMonth = (month: string) => {
    setMonthlyTracks(prevMonths =>
      prevMonths.map(m =>
        m.month === month ? { ...m, expanded: !m.expanded } : m
      )
    );
  };

  // Create a playlist for a specific month
  const createMonthlyPlaylist = async (month: string, tracks: SavedTrack[]) => {
    try {
      // First create a new playlist
      const user = await spotifyApi.getMe();
      const formattedDate = format(new Date(month), 'MMMM yyyy');

      // Create playlist with properly typed options
      const playlist = await spotifyApi.createPlaylist(
        user.body.id,
        {
          description: `Songs I liked during ${formattedDate}. Created with Spotify Time Machine.`,
          public: false
        },
        // Pass the name separately as the first parameter
        `${formattedDate} Time Machine`
      );

      // Then add tracks to the playlist
      const trackUris = tracks.map(t => `spotify:track:${t.track.id}`);
      await spotifyApi.addTracksToPlaylist(playlist.body.id, trackUris);

      alert(`Playlist "${formattedDate} Time Machine" created successfully!`);
    } catch (err) {
      console.error('Error creating playlist:', err);
      alert('Failed to create playlist. Please try again later.');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-spotify-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-spotify-black p-6">
        <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spotify-black">
      {/* Top Navigation Bar */}
      <Navigation user={session?.user} />

      {/* Main Content */}
      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-spotify-light-gray mb-8">
          Your Monthly Listening History
        </h1>

        {/* Timeline */}
        <div className="space-y-6">
          {monthlyTracks.map((month) => (
            <div
              key={month.month}
              className="bg-spotify-dark-gray rounded-lg overflow-hidden"
            >
              {/* Month Header */}
              <div
                className="bg-spotify-medium-gray py-4 px-6 flex justify-between items-center cursor-pointer"
                onClick={() => toggleMonth(month.month)}
              >
                <h2 className="text-xl font-bold text-spotify-white">
                  {month.month} • {month.tracks.length} tracks
                </h2>
                <div className="flex gap-4 items-center">
                  <button
                    className="bg-spotify-green text-spotify-black font-medium px-4 py-2 rounded-full hover:bg-spotify-green/90 transition text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      createMonthlyPlaylist(month.month, month.tracks);
                    }}
                  >
                    Create Playlist
                  </button>
                  <span className="text-2xl text-spotify-light-gray">
                    {month.expanded ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Track List */}
              {month.expanded && (
                <div className="p-4">
                  <div className="space-y-4">
                    {month.tracks.map((item) => (
                      <div
                        key={`${item.track.id}-${item.added_at}`}
                        className="flex items-center gap-4 p-2 hover:bg-spotify-medium-gray/20 rounded-md transition"
                      >
                        {/* Album Art */}
                        <div className="flex-shrink-0 w-16 h-16 relative">
                          <Image
                            src={item.track.album.images[0]?.url || '/default-album.png'}
                            alt={item.track.album.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>

                        {/* Track Info */}
                        <div className="flex-grow min-w-0">
                          <h3 className="text-spotify-white font-medium truncate">
                            {item.track.name}
                          </h3>
                          <p className="text-spotify-light-gray text-sm truncate">
                            {item.track.artists.map(a => a.name).join(', ')}
                          </p>
                          <p className="text-spotify-light-gray text-xs">
                            Added on {format(new Date(item.added_at), 'MMM d, yyyy')}
                          </p>
                        </div>

                        {/* Preview Button */}
                        {item.track.preview_url && (
                          <button
                            className="bg-spotify-green text-spotify-black p-2 rounded-full hover:bg-spotify-green/90 transition"
                            onClick={() => {
                              const audio = new Audio(item.track.preview_url!);
                              audio.play();
                            }}
                          >
                            ▶
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              className="bg-spotify-medium-gray text-spotify-white px-6 py-3 rounded-full hover:bg-spotify-medium-gray/80 transition"
              onClick={loadMoreTracks}
              disabled={loadingMore}
            >
              {loadingMore ? <LoadingSpinner size="sm" /> : 'Load More Months'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}