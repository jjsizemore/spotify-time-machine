'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useUserStats, TimeRange } from '@/hooks/useUserStats';
import TopArtists from '@/components/TopArtists';
import TopTracks from '@/components/TopTracks';
import RecentlyPlayed from '@/components/RecentlyPlayed';
import TopGenres from '@/components/TopGenres';
import TimeRangeSelector from '@/components/TimeRangeSelector';
import StatsTabs from '@/components/StatsTabs';
import PageContainer from '@/components/PageContainer';
import FeatureCard from '@/components/FeatureCard';
import LoadingSpinner from '@/components/LoadingSpinner';

// Lazy load the visualization components
const ListeningTrends = lazy(() => import('@/components/ListeningTrends'));
const GenreTrendsVisualization = lazy(() => import('@/components/GenreTrendsVisualization'));

type Tab = 'artists' | 'tracks' | 'recent' | 'genres';

export default function Dashboard() {
  const { status } = useSession();
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [activeTab, setActiveTab] = useState<Tab>('artists');
  const [showVisualizations, setShowVisualizations] = useState(false);

  const { topArtists, topTracks, recentlyPlayed, isLoading, error, refresh } = useUserStats(timeRange);

  // Force a refresh when the component mounts
  useEffect(() => {
    if (status === 'authenticated') {
      refresh();
    }
  }, [status, refresh]);

  // Delay loading visualizations for better initial page performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowVisualizations(true);
    }, 1000); // Load visualizations after 1 second

    return () => clearTimeout(timer);
  }, []);

  return (
    <PageContainer isLoading={status === 'loading'} maxWidth="7xl">
      {/* Feature Cards */}
      <div className="flex flex-col md:flex-row gap-6 mb-10 justify-around">
        <FeatureCard
          title="Time Machine"
          description="Travel back in time and explore your listening history from any month."
          buttonText="Start Journey"
          href="/history"
          className="md:max-w-xs lg:max-w-sm"
        />

        <FeatureCard
          title="Playlist Generator"
          description="Create custom playlists based on your favorite time periods."
          buttonText="Generate Playlist"
          href="/playlist-generator"
          className="md:max-w-xs lg:max-w-sm"
        />
      </div>

      {/* Visualizations - Only show if set to true & using Suspense for lazy loading */}
      {showVisualizations && (
        <div className="space-y-8 mb-10">
          <Suspense fallback={<div className="bg-spotify-dark-gray rounded-lg p-6 min-h-[200px] flex justify-center items-center"><LoadingSpinner size="lg" /></div>}>
            <ListeningTrends />
          </Suspense>

          <Suspense fallback={<div className="bg-spotify-dark-gray rounded-lg p-6 min-h-[200px] flex justify-center items-center"><LoadingSpinner size="lg" /></div>}>
            <GenreTrendsVisualization />
          </Suspense>
        </div>
      )}

      {/* Stats Section */}
      <div id="stats" className="bg-spotify-dark-gray rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-spotify-light-gray mb-6">Your Spotify Stats</h2>

        <TimeRangeSelector onChange={setTimeRange} initialTimeRange={timeRange} />
        <StatsTabs activeTab={activeTab} onChange={setActiveTab} />

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {activeTab === 'artists' && (
              <TopArtists
                artists={topArtists}
                isLoading={false}
                error={error}
                onRetry={refresh}
              />
            )}

            {activeTab === 'tracks' && (
              <TopTracks
                tracks={topTracks}
                isLoading={false}
                error={error}
                onRetry={refresh}
              />
            )}

            {activeTab === 'genres' && (
              <TopGenres
                artists={topArtists}
                isLoading={false}
                error={error}
                onRetry={refresh}
              />
            )}

            {activeTab === 'recent' && (
              <RecentlyPlayed
                tracks={recentlyPlayed}
                isLoading={false}
                error={error}
                onRetry={refresh}
              />
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}