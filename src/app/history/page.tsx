'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSpotify } from '@/hooks/useSpotify';
import ErrorDisplay from '@/components/ErrorDisplay';
import PageContainer from '@/components/PageContainer';
import MonthlyTrackList from '@/components/MonthlyTrackList';
import TrackItem from '@/components/TrackItem';
import ActionButton from '@/components/ActionButton';
import { processAndGroupTracks, createPlaylist, MonthlyTracks, SavedTrack } from '@/lib/spotifyTrackUtils';
import { format } from 'date-fns';

export default function HistoryPage() {
  const { status } = useSession();
  const { spotifyApi, isReady } = useSpotify();
  const [monthlyTracks, setMonthlyTracks] = useState<MonthlyTracks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextOffset, setNextOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Initial load of saved tracks
  useEffect(() => {
    const fetchSavedTracks = async () => {
      if (!isReady) return;

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
  }, [spotifyApi, isReady]);

  // Function to load more tracks
  const loadMoreTracks = async () => {
    if (!hasMore || loadingMore || !isReady) return;

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
    if (!isReady) {
      alert('Cannot create playlist. Spotify API is not ready.');
      return;
    }

    try {
      // First create a new playlist
      const formattedDate = format(new Date(month), 'MMMM yyyy');
      const playlistName = `${formattedDate} Time Machine`;
      const description = `Songs I liked during ${formattedDate}. Created with Spotify Time Machine.`;
      const trackUris = tracks.map(t => `spotify:track:${t.track.id}`);

      await createPlaylist(
        spotifyApi,
        playlistName,
        description,
        trackUris
      );

      alert(`Playlist "${playlistName}" created successfully!`);
    } catch (err) {
      console.error('Error creating playlist:', err);
      alert('Failed to create playlist. Please try again later.');
    }
  };

  // Render a track item
  const renderTrackItem = (track: SavedTrack) => {
    return (
      <TrackItem
        key={track.track.id}
        track={track.track}
        addedAt={track.added_at}
        showAddedDate={true}
      />
    );
  };

  if (error) {
    return (
      <PageContainer>
        <ErrorDisplay message={error} retry={() => window.location.reload()} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Your Monthly Listening History"
      isLoading={status === 'loading' || isLoading}
      maxWidth="6xl"
    >
      {/* Timeline */}
      <div className="space-y-6">
        {monthlyTracks.map((month) => (
          <MonthlyTrackList
            key={month.month}
            month={month.month}
            tracks={month.tracks}
            expanded={month.expanded}
            onToggle={toggleMonth}
            onCreatePlaylist={createMonthlyPlaylist}
            renderTrackItem={renderTrackItem}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-8 text-center">
          <ActionButton
            onClick={loadMoreTracks}
            disabled={loadingMore}
            variant="secondary"
          >
            {loadingMore ? 'Loading...' : 'Load More Tracks'}
          </ActionButton>
        </div>
      )}
    </PageContainer>
  );
}