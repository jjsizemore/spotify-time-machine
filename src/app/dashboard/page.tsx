'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useUserStats, TimeRange } from '@/hooks/useUserStats';
import TopArtists from '@/components/TopArtists';
import TopTracks from '@/components/TopTracks';
import RecentlyPlayed from '@/components/RecentlyPlayed';
import TopGenres from '@/components/TopGenres';
import TimeRangeSelector from '@/components/TimeRangeSelector';
import StatsTabs from '@/components/StatsTabs';
import LoadingSpinner from '@/components/LoadingSpinner';

type Tab = 'artists' | 'tracks' | 'recent' | 'genres';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [activeTab, setActiveTab] = useState<Tab>('artists');

  const { topArtists, topTracks, recentlyPlayed, isLoading, error, refresh } = useUserStats(timeRange);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-spotify-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spotify-black">
      {/* Top Navigation Bar */}
      <nav className="bg-spotify-dark-gray px-6 py-4 flex items-center justify-between border-b border-spotify-medium-gray">
        <div className="flex items-center gap-4">
          <Image
            src="/spotify-icon.png"
            alt="Spotify Logo"
            width={32}
            height={32}
            className="drop-shadow-lg"
          />
          <h1 className="text-xl font-bold text-spotify-green">Time Machine</h1>
        </div>
        <div className="flex items-center gap-4">
          {session?.user?.image && (
            <Image
              src={session.user.image}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <span className="text-spotify-light-gray">{session?.user?.name}</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {/* Time Machine Card */}
          <div className="bg-spotify-dark-gray p-6 rounded-lg hover:bg-spotify-dark-gray/80 transition cursor-pointer">
            <h2 className="text-2xl font-bold text-spotify-green mb-4">Time Machine</h2>
            <p className="text-spotify-light-gray mb-4">
              Travel back in time and explore your listening history from any month.
            </p>
            <button className="bg-spotify-green text-spotify-black font-bold px-4 py-2 rounded-full hover:bg-spotify-green/90 transition">
              Start Journey
            </button>
          </div>

          {/* Playlist Generator Card */}
          <div className="bg-spotify-dark-gray p-6 rounded-lg hover:bg-spotify-dark-gray/80 transition cursor-pointer">
            <h2 className="text-2xl font-bold text-spotify-green mb-4">Playlist Generator</h2>
            <p className="text-spotify-light-gray mb-4">
              Create custom playlists based on your favorite time periods.
            </p>
            <button className="bg-spotify-green text-spotify-black font-bold px-4 py-2 rounded-full hover:bg-spotify-green/90 transition">
              Generate Playlist
            </button>
          </div>

          {/* Stats Card */}
          <div className="bg-spotify-dark-gray p-6 rounded-lg hover:bg-spotify-dark-gray/80 transition cursor-pointer">
            <h2 className="text-2xl font-bold text-spotify-green mb-4">Your Stats</h2>
            <p className="text-spotify-light-gray mb-4">
              View detailed statistics about your listening habits.
            </p>
            <button className="bg-spotify-green text-spotify-black font-bold px-4 py-2 rounded-full hover:bg-spotify-green/90 transition">
              View Stats
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-spotify-dark-gray rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-spotify-light-gray mb-6">Your Spotify Stats</h2>

          <TimeRangeSelector timeRange={timeRange} onChange={setTimeRange} />
          <StatsTabs activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === 'artists' && (
            <TopArtists
              artists={topArtists}
              isLoading={isLoading}
              error={error}
              onRetry={refresh}
            />
          )}

          {activeTab === 'tracks' && (
            <TopTracks
              tracks={topTracks}
              isLoading={isLoading}
              error={error}
              onRetry={refresh}
            />
          )}

          {activeTab === 'genres' && (
            <TopGenres
              artists={topArtists}
              isLoading={isLoading}
              error={error}
              onRetry={refresh}
            />
          )}

          {activeTab === 'recent' && (
            <RecentlyPlayed
              tracks={recentlyPlayed}
              isLoading={isLoading}
              error={error}
              onRetry={refresh}
            />
          )}
        </div>
      </main>
    </div>
  );
}