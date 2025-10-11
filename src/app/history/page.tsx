'use client';

import { format, parse } from 'date-fns';
import { useSession } from 'next-auth/react';
import Script from 'next/script';
import React, { useState, useEffect } from 'react';
import DataFetcherAndControlsWrapper from '@/features/controls/DataFetcherAndControlsWrapper';
import TrackItem from '@/features/stats/TrackItem';
import MonthlyTrackList from '@/features/visualization/MonthlyTrackList';
import { useLikedTracks } from '@/hooks/useLikedTracks';
import { useSpotify } from '@/hooks/useSpotify';
import Breadcrumb from '@/layout/Breadcrumb';
import PageContainer from '@/layout/PageContainer';
import { generateWebApplicationSchema } from '@/lib/seo';
import {
  MonthlyTracks,
  SavedTrack,
  createPlaylist,
  processAndGroupTracks,
} from '@/lib/spotifyTrackUtils';
import {
  InternalTimeRange,
  SpotifyTimeRange,
  mapToInternalTimeRange,
  timeRangeDisplays,
} from '@/lib/timeRanges';
import ErrorDisplay from '@/ui/ErrorDisplay';
import Toast from '@/ui/Toast';

// Render a track item
const renderTrackItem = (track: SavedTrack) => {
  return (
    <TrackItem
      key={track.track.id}
      track={track.track}
      addedAt={track.added_at}
      showAddedDate={true}
      onClick={() => window.open(`https://open.spotify.com/track/${track.track.id}`, '_blank')}
    />
  );
};

export default function HistoryPage() {
  const { status } = useSession();
  const { spotifyApi, isReady } = useSpotify();
  const {
    tracks,
    isLoading: isLoadingTracksFromHook,
    error: tracksError,
    currentTimeRange,
    setTimeRange: setInternalTimeRange,
    isLoadingRange,
  } = useLikedTracks();
  const [monthlyTracks, setMonthlyTracks] = useState<MonthlyTracks[]>([]);
  const [isProcessingMonthlyTracks, setIsProcessingMonthlyTracks] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Process tracks into monthly groups whenever tracks change
  useEffect(() => {
    if (tracks.length > 0) {
      setIsProcessingMonthlyTracks(true);
      const groupedTracks = processAndGroupTracks(tracks);
      setMonthlyTracks(groupedTracks);
      setIsProcessingMonthlyTracks(false);
    } else if (!isLoadingTracksFromHook) {
      setMonthlyTracks([]);
      setIsProcessingMonthlyTracks(false);
    }
  }, [tracks, isLoadingTracksFromHook]);

  // Toggle expanded state for a month
  const toggleMonth = (month: string) => {
    setMonthlyTracks((prevMonths) =>
      prevMonths.map((m) => (m.month === month ? { ...m, expanded: !m.expanded } : m))
    );
  };

  // Create a playlist for a specific month
  const createMonthlyPlaylist = async (month: string, tracks: SavedTrack[]) => {
    if (!isReady) {
      setToastMessage('Cannot create playlist. Spotify API is not ready.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    try {
      // Parse the month string using date-fns parse function
      const parsedDate = parse(month, 'MMMM yyyy', new Date());
      const formattedDate = format(parsedDate, 'MMMM yyyy');
      const playlistName = `${formattedDate} Time Machine`;
      const description = `Songs I liked during ${formattedDate}. Created with Jermaine's Spotify Time Machine.`;
      const trackUris = tracks.map((t) => `spotify:track:${t.track.id}`);

      await createPlaylist(spotifyApi, playlistName, description, trackUris);

      setToastMessage(`Playlist "${playlistName}" has been created in your Spotify library!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Error creating playlist:', err);
      setToastMessage('Failed to create playlist. Please try again later.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Combined loading state for the wrapper
  const isOverallLoading = status === 'loading' || (isLoadingTracksFromHook && tracks.length === 0);
  const isProcessingData = isProcessingMonthlyTracks && !isOverallLoading;

  // Determine if the page is empty
  const isEmpty =
    !isOverallLoading && !isProcessingData && !tracksError && monthlyTracks.length === 0;

  const setTimeRange = (range: SpotifyTimeRange | InternalTimeRange) => {
    const internalRange =
      typeof range === 'string' && ['short_term', 'medium_term', 'long_term'].includes(range)
        ? mapToInternalTimeRange(range as SpotifyTimeRange)
        : (range as InternalTimeRange);
    setInternalTimeRange(internalRange);
  };

  if (tracksError) {
    const errorMessage =
      typeof tracksError === 'string' ? tracksError : (tracksError as Error).message;
    return (
      <PageContainer>
        <ErrorDisplay
          message={errorMessage || 'Failed to load your listening history'}
          retry={() => window.location.reload()}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer isLoading={status === 'loading'} maxWidth="7xl" className="min-h-screen pb-20">
      {/* SEO-optimized heading structure */}
      <header className="mb-8">
        <h1 className="sr-only">Music History - Your Monthly Listening Journey</h1>
        <Breadcrumb
          items={[
            { name: 'Home', url: '/dashboard' },
            { name: 'History', url: '/history' },
          ]}
        />
      </header>

      <DataFetcherAndControlsWrapper
        title="Your Monthly Listening History"
        isLoading={isOverallLoading}
        isProcessing={isProcessingData}
        error={
          tracksError
            ? typeof tracksError === 'string'
              ? new Error(tracksError)
              : tracksError
            : null
        }
        isEmpty={isEmpty}
        emptyDataMessage="No listening history found for the selected period."
        currentTimeRange={currentTimeRange}
        setTimeRange={setTimeRange}
        isLoadingRange={isLoadingRange}
        timeRangeDisplay={timeRangeDisplays.visualization}
      >
        {/* Structured Data */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              generateWebApplicationSchema({
                '@type': 'WebPage',
                name: 'Music History - Spotify Time Machine',
                description:
                  'Travel back in time and explore your liked tracks month by month. Create playlists instantly from any time period.',
                featureList: [
                  'Monthly track history view',
                  'One-click playlist creation',
                  'Track added date information',
                  'Expandable monthly sections',
                  'Time range selection',
                ],
              })
            ),
          }}
        />

        {showToast && (
          <Toast
            message={toastMessage}
            onDismiss={() => setShowToast(false)}
            type={
              toastMessage.includes('Failed') || toastMessage.includes('Cannot')
                ? 'error'
                : 'success'
            }
          />
        )}

        {/* Display content only if not in initial overall loading and not empty */}
        {!isOverallLoading && !isEmpty && (
          <main className="space-y-6" role="main">
            {monthlyTracks.map((month) => (
              <article key={month.month} aria-label={`Tracks from ${month.month}`}>
                <MonthlyTrackList
                  month={month.month}
                  tracks={month.tracks}
                  expanded={month.expanded}
                  onToggle={toggleMonth}
                  onCreatePlaylist={createMonthlyPlaylist}
                  renderTrackItem={renderTrackItem}
                />
              </article>
            ))}
          </main>
        )}
        {/* Show a loading text if tracks are still being fetched by the hook but not for the initial load handled by wrapper*/}
        {isLoadingTracksFromHook && tracks.length > 0 && !isOverallLoading && (
          <div className="mt-8 text-center text-spotify-light-gray" role="status">
            Updating your listening history...
          </div>
        )}
      </DataFetcherAndControlsWrapper>
    </PageContainer>
  );
}
